import { useState, useRef } from 'react'
import { imgSrc, gifSrc, videoSrc, CDN_IMG_BASE, CDN_GIF_BASE } from '../lib/exercises.js'
import { useStore } from '../store/useStore.js'
import { t, exerciseNameFor } from '../lib/i18n.js'
import Icon from './Icon.jsx'

// Big autoplaying animation; tap toggles to the still frame. `compact` shrinks it (superset cards).
// Demonstration animations are powered by the open-source exercises dataset.
export default function Media({ ex, id, compact, minimizable }) {
  const [playing, setPlaying] = useState(true)
  const [failed, setFailed] = useState(null)
  const [videoFailed, setVideoFailed] = useState(false)
  const [fallbackToCdn, setFallbackToCdn] = useState(false)
  const [lastExId, setLastExId] = useState(ex?.id)
  const videoRef = useRef(null)
  const gifSize = useStore(s => s.S.gifSize)
  const mediaType = useStore(s => s.S.mediaType || 'gif')
  const update = useStore(s => s.update)

  if (ex?.id !== lastExId) {
    setLastExId(ex?.id)
    setFallbackToCdn(false)
    setFailed(null)
    setVideoFailed(false)
    setPlaying(true)
  }

  if (!ex || (!ex.gif && !ex.img)) return null
  if (minimizable && gifSize === 'off') return null
  const mini = minimizable && gifSize === 'mini'
  const toggleSize = e => { e.stopPropagation(); update(s => { s.gifSize = mini ? 'full' : 'mini' }) }
  const showGif = playing && failed == null

  const normalSrc = showGif ? gifSrc(ex) : imgSrc(ex)
  const cdnSrc = showGif ? (CDN_GIF_BASE + (ex.gif || ex.img)) : (CDN_IMG_BASE + (ex.img || ex.gif))
  const currentSrc = fallbackToCdn ? cdnSrc : normalSrc

  const onError = () => {
    if (!fallbackToCdn && currentSrc !== cdnSrc) {
      setFallbackToCdn(true)
    } else {
      setFailed(showGif ? 'gif' : 'all')
    }
  }

  const showVideo = mediaType === 'video' && !videoFailed && failed !== 'all'

  const onTap = () => {
    if (failed) { setFailed(null); setPlaying(true); setFallbackToCdn(false); setVideoFailed(false); return }
    if (showVideo && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {})
        setPlaying(true)
      } else {
        videoRef.current.pause()
        setPlaying(false)
      }
      return
    }
    setPlaying(p => !p)
  }

  return (
    <div className={'exmedia' + (compact ? ' compact' : '') + (mini ? ' mini' : '') + (failed === 'all' ? ' broken' : '')} id={id} onClick={onTap}>
      {failed === 'all'
        ? <div className="exmedia-x"><Icon name="dumbbell" /></div>
        : showVideo
          ? <video
              key={ex?.id}
              ref={videoRef}
              src={videoSrc(ex)}
              autoPlay
              loop
              muted
              playsInline
              onError={() => setVideoFailed(true)}
              draggable={false}
            />
          : <img decoding="async" draggable={false} src={currentSrc} alt={exerciseNameFor(ex)} onError={onError} />}
      {minimizable && (
        <button className="giftoggle" onClick={toggleSize}>
          <Icon name={mini ? 'expand' : 'minimize'} />{mini ? t('Expand') : t('Minimize')}
        </button>
      )}
      {!mini && !failed && (
        <span className="gifhint">
          <Icon name={playing ? 'pause' : 'play'} />{playing ? t('tap to pause') : t('tap to play')}
        </span>
      )}
    </div>
  )
}

export function Thumb({ ex }) {
  const [failed, setFailed] = useState(false)
  const [fallbackToCdn, setFallbackToCdn] = useState(false)
  const [lastExId, setLastExId] = useState(ex?.id)

  if (ex?.id !== lastExId) {
    setLastExId(ex?.id)
    setFallbackToCdn(false)
    setFailed(false)
  }

  if (!ex || (!ex.img && !ex.gif) || failed) return <div className="thumb thumb-x"><Icon name="dumbbell" /></div>

  const normalSrc = imgSrc(ex)
  const cdnSrc = CDN_IMG_BASE + (ex.img || ex.gif)
  const currentSrc = fallbackToCdn ? cdnSrc : normalSrc

  const handleError = () => {
    if (!fallbackToCdn && currentSrc !== cdnSrc) {
      setFallbackToCdn(true)
    } else {
      setFailed(true)
    }
  }

  return <img className="thumb" loading="lazy" decoding="async" draggable={false} src={currentSrc} alt="" onError={handleError} />
}
