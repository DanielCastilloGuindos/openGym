"""
OpenGym Exercise Ingestion & Expansion Tool
Connects to exercise APIs and sitemaps to fetch, analyze, normalize, and catalog exercises
with complete metadata, step-by-step instructions, technique tips, and HD MP4 video guides.
"""

import urllib.request
import json
import re
import os
import sys
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def fetch_json(url, post_data=None, timeout=10):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Type': 'application/json'
    }
    data = json.dumps(post_data).encode('utf-8') if post_data is not None else None
    req = urllib.request.Request(url, data=data, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return json.loads(res.read().decode('utf-8'))

def analyze_exercise_catalog():
    print("=== PASO 1: Analizando fuentes de datos y endpoints de catálogo ===")
    
    # 1. Body parts exploration via API
    body_parts = [
        'Chest', 'Back', 'Biceps', 'Triceps', 'Quadriceps', 'Hamstrings', 
        'Shoulders', 'Calves', 'Waist', 'Forearms', 'Hips', 'Cardio', 'Neck'
    ]
    
    print(f"Consultando catálogo por grupos musculares ({len(body_parts)} categorías)...")
    found_by_id = {}
    
    for bp in body_parts:
        try:
            res = fetch_json('https://www.lyfta.app/api/search', {'query': '', 'bodyPart': bp})
            items = res.get('matchedExercises', [])
            print(f"  ✓ {bp:14}: {len(items):3} ejercicios obtenidos")
            for item in items:
                eid = item.get('id')
                if eid:
                    found_by_id[eid] = item
            time.sleep(0.15)
        except Exception as e:
            print(f"  ✗ {bp:14}: Error {e}")
            
    print(f"\nTotal preliminar de ejercicios únicos obtenidos directamente: {len(found_by_id)}")
    
    # 2. Inspecting detailed schema
    if found_by_id:
        sample = next(iter(found_by_id.values()))
        print("\nEsquema de campos disponibles en cada ejercicio:")
        for k, v in sample.items():
            print(f" - {k:22}: {str(v)[:70]}")
            
    return found_by_id

if __name__ == '__main__':
    catalog = analyze_exercise_catalog()
