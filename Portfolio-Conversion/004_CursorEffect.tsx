// Project: Portfolio-Conversion
// Category: components
// Source: showcases\Portfolio-Conversion\src\components
// Lines: 61

'use client'

import { useEffect, useState, useRef } from 'react'

export function CursorEffect() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const isTouchDevice = useRef(false)

  useEffect(() => {
    // Check for touch devices
    isTouchDevice.current = 'ontouchstart' in window
    setIsVisible(!isTouchDevice.current)

    if (isTouchDevice.current) {
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    // Track cursor position
    document.addEventListener('mousemove', handleMouseMove)

    // Add hover effects to links and cards
    const interactiveElements = document.querySelectorAll('a, button, .project-card, [role="button"]')
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter)
      el.addEventListener('mouseleave', handleMouseLeave)
    })

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter)
        el.removeEventListener('mouseleave', handleMouseLeave)
      })
    }
  }, [])

  if (!isVisible) return null

  return (
    <div
      className="fixed pointer-events-none z-[10000] w-5 h-5 rounded-[50%] border border-indigo-500 opacity-50 transition-all duration-150 ease-in-out"
      style={{
        left: position.x,
        top: position.y,
        transform: `translate(-50%, -50%) ${isHovering ? 'scale-150' : 'scale-100'}`,
        backgroundColor: isHovering ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
        opacity: isHovering ? 0.8 : 0.5
      }}
    />
  )
}
