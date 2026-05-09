// Project: Portfolio-Conversion
// Category: components
// Source: showcases\Portfolio-Conversion\src\components
// Lines: 240

'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Maximize, Minimize, X } from 'lucide-react'

interface PresentationModeProps {
  onExit: () => void
}

export function PresentationMode({ onExit }: PresentationModeProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const sections = ['hero', 'projects', 'experience', 'skills', 'contact']
  const autoScrollInterval = 8000 // 8 seconds per section

  const scrollToSection = useCallback((index: number) => {
    if (index < 0 || index >= sections.length) return

    setIsTransitioning(true)
    const section = document.getElementById(sections[index])
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
    setCurrentSection(index)

    setTimeout(() => {
      setIsTransitioning(false)
    }, 1000)
  }, [])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      scrollToSection(currentSection + 1)
    } else {
      scrollToSection(0) // Loop back to start
    }
  }

  const prevSection = () => {
    if (currentSection > 0) {
      scrollToSection(currentSection - 1)
    } else {
      scrollToSection(sections.length - 1)
    }
  }

  // Auto-scroll effect
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPlaying) {
      interval = setInterval(() => {
        nextSection()
      }, autoScrollInterval)
    }

    return () => clearInterval(interval)
  }, [isPlaying, currentSection, nextSection])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowRight':
          e.preventDefault()
          nextSection()
          break
        case 'ArrowLeft':
          e.preventDefault()
          prevSection()
          break
        case 'Escape':
          if (isFullscreen) {
            toggleFullscreen()
          } else {
            onExit()
          }
          break
        case 'f':
        case 'F':
          e.preventDefault()
          toggleFullscreen()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen, toggleFullscreen, nextSection, prevSection, togglePlay, onExit])

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return (
    <>
      {/* Presentation Controls Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[1000] bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800 p-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          {/* Section Indicators */}
          <div className="flex items-center gap-2">
            {sections.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToSection(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSection
                    ? 'bg-indigo-500 w-8'
                    : 'bg-neutral-700 hover:bg-neutral-600'
                }`}
                aria-label={`Go to section ${index + 1}`}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Previous */}
            <button
              onClick={prevSection}
              className="p-2 text-neutral-400 hover:text-white transition-colors"
              aria-label="Previous section"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>

            {/* Next */}
            <button
              onClick={nextSection}
              className="p-2 text-neutral-400 hover:text-white transition-colors"
              aria-label="Next section"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="w-[1px] h-6 bg-neutral-700" />

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-neutral-400 hover:text-white transition-colors"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>

            {/* Exit */}
            <button
              onClick={onExit}
              className="p-2 text-red-500 hover:text-red-400 transition-colors"
              aria-label="Exit presentation mode"
            >
              <X size={20} />
            </button>
          </div>

          {/* Keyboard Shortcuts Hint */}
          <div className="hidden md:flex items-center gap-4 text-xs font-mono text-neutral-500">
            <span>Space: Play/Pause</span>
            <span>Arrows: Navigate</span>
            <span>F: Fullscreen</span>
            <span>Esc: Exit</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-800">
          <motion.div
            className="h-full bg-indigo-500"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Auto-scroll Progress */}
        {isPlaying && (
          <motion.div
            className="absolute bottom-0 left-0 h-[2px] bg-indigo-400"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: autoScrollInterval / 1000, ease: 'linear' }}
            key={currentSection}
          />
        )}
      </div>

      {/* Section Overlay (shows current section name) */}
      <motion.div
        className="fixed top-4 right-4 z-[1000] bg-neutral-900/95 backdrop-blur-md border border-neutral-800 px-4 py-2 rounded-lg font-mono text-sm text-indigo-500"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {sections[currentSection].toUpperCase()}
      </motion.div>
    </>
  )
}
