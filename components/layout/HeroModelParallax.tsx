'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface Props {
  imageUrl?: string
  bgColor?: string
  // Position & size from admin (% of viewport)
  x?: number       // left %
  y?: number       // top % (0 = top of section)
  width?: number   // width as % of viewport width
  height?: number  // height as % of section height
  zoom?: number    // scale factor, default 1.0 (100%)
  objectPosition?: string // e.g. 'top center', 'center', '50% 20%'
}

export default function HeroModelParallax({
  imageUrl,
  bgColor = '#e2e2de',
  x = 33,
  y = 0,
  width = 34,
  height = 100,
  zoom = 1,
  objectPosition = 'top center',
}: Props) {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const parallaxY = (scrollY * 0.15).toFixed(1)

  return (
    <div style={{
      position: 'absolute',
      left: `${x}%`,
      top: `${y}%`,
      width: `${width}%`,
      height: `${height}%`,
      zIndex: 1,
      overflow: 'hidden',
      background: imageUrl ? 'transparent' : bgColor,
    }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '115%',
        transform: `translateY(${parallaxY}px)`,
        transition: 'transform 0.1s linear',
        willChange: 'transform',
      }}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Hero model"
            fill
            priority
            style={{
              objectFit: 'cover',
              objectPosition,
              // zoom is applied as a CSS scale — values > 1 zoom in, < 1 zoom out
              transform: zoom !== 1 ? `scale(${zoom})` : undefined,
              transformOrigin: 'center top',
            }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: bgColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 8,
          }}>
            <span style={{
              fontSize: 10, color: '#aaa', letterSpacing: '2px',
              textTransform: 'uppercase', textAlign: 'center', lineHeight: 2.5,
              fontFamily: 'Barlow, sans-serif',
            }}>
              UPLOAD HERO IMAGE<br />VIA ADMIN → SETTINGS
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
