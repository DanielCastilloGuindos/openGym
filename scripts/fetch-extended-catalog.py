"""
Full Extended Catalog Ingestion Script
Fetches all 4,880 exercises from Lyfta with automatic checkpointing and resume support.
Saves normalized catalog into data/exercises_extended.json without affecting existing openGym files.
"""

import urllib.request
import json
import re
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

OUTPUT_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'exercises_extended.json')

def get_build_id():
    req = urllib.request.Request('https://www.lyfta.app/exercises', headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=10) as r:
        html = r.read().decode('utf-8')
    m = re.search(r'"buildId":"([^"]+)"', html)
    if not m:
        raise Exception("buildId not found in HTML")
    return m.group(1)

def get_all_slugs():
    url = 'https://www.lyfta.app/sitemaps/sitemap1.xml'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=15) as r:
        xml = r.read().decode('utf-8')
    slugs = re.findall(r'https://www.lyfta.app/exercise/([a-zA-Z0-9_\-]+)', xml)
    seen = set()
    unique = []
    for s in slugs:
        if s not in seen:
            seen.add(s)
            unique.append(s)
    return unique

def fetch_exercise_detail(build_id, slug):
    url = f"https://www.lyfta.app/_next/data/{build_id}/exercise/{slug}.json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read().decode('utf-8'))
            return slug, data.get('pageProps', {}).get('firstData')
    except Exception as e:
        return slug, None

def normalize_exercise(raw, slug):
    if not raw:
        return None
    
    # Extract GymVisual 4-digit ID from image/video if available
    img_url = raw.get('image_name') or ''
    video_url = raw.get('video_file') or ''
    
    gv_match = re.search(r'/([0-9]{4})[0-9]{4}-', img_url) or re.search(r'/([0-9]{4})[0-9]{4}-', video_url)
    gv_id = gv_match.group(1) if gv_match else None
    
    body_part = raw.get('body_part_id') or []
    bp = body_part[0].lower() if body_part else 'other'
    
    equipment = raw.get('equipment_id') or []
    eq = equipment[0].lower() if equipment else 'body weight'
    
    return {
        "id": f"ext_{raw.get('id')}",
        "gvId": gv_id,
        "slug": slug,
        "n": raw.get('name', '').strip(),
        "bp": bp,
        "eq": eq,
        "st": raw.get('ex_instructions') or [],
        "tips": raw.get('exercise_tips') or [],
        "img": img_url,
        "video": video_url,
        "overview": raw.get('overview') or ''
    }

def main():
    print("=== INICIANDO DESCARGA DEL CATÁLOGO EXTENDIDO (+4.880 EJERCICIOS) ===")
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    # Load existing checkpoint if any
    catalog = {}
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
                existing = json.load(f)
                if isinstance(existing, list):
                    for item in existing:
                        catalog[item['slug']] = item
                elif isinstance(existing, dict):
                    catalog = existing
            print(f"Cargado punto de restauración: {len(catalog)} ejercicios ya descargados.")
        except Exception:
            catalog = {}
            
    build_id = get_build_id()
    print("Next.js buildId activo:", build_id)
    
    all_slugs = get_all_slugs()
    print(f"Total slugs encontrados en el sitemap: {len(all_slugs)}")
    
    pending_slugs = [s for s in all_slugs if s not in catalog]
    print(f"Ejercicios pendientes por descargar: {len(pending_slugs)}")
    
    if not pending_slugs:
        print("¡El catálogo ya está completamente descargado al 100%!")
        return
        
    start_time = time.time()
    batch_size = 50
    completed_count = len(catalog)
    
    # Process with thread pool
    max_workers = 12
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        for i in range(0, len(pending_slugs), batch_size):
            batch = pending_slugs[i:i + batch_size]
            futures = {executor.submit(fetch_exercise_detail, build_id, slug): slug for slug in batch}
            
            for future in as_completed(futures):
                slug, raw_data = future.result()
                if raw_data:
                    norm = normalize_exercise(raw_data, slug)
                    if norm:
                        catalog[slug] = norm
                        completed_count += 1
                        
            # Save checkpoint
            with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
                json.dump(list(catalog.values()), f, ensure_ascii=False)
                
            elapsed = time.time() - start_time
            rate = (completed_count - (len(all_slugs) - len(pending_slugs))) / max(elapsed, 0.001)
            print(f"Progreso: {completed_count}/{len(all_slugs)} ({completed_count*100/len(all_slugs):.1f}%) - {rate:.1f} ej/s")
            
    print(f"\n¡DESCARGA FINALIZADA CON ÉXITO! Total consolidado: {len(catalog)} ejercicios.")
    print("Guardado en:", OUTPUT_FILE)

if __name__ == '__main__':
    main()
