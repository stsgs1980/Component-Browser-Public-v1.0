// Project: Portfolio-Conversion
// Category: components
// Source: showcases\Portfolio-Conversion\src\components
// Lines: 179

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export function Hero() {
  const [scrolled, setScrolled] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.pageYOffset)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="min-h-screen flex items-center justify-center relative px-4 sm:px-6 lg:px-8 py-16 overflow-hidden">
      {/* Grid Background Animation */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(51, 51, 51, 1) 1px, transparent 1px),
            linear-gradient(rgba(51, 51, 51, 1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }}
      />

      <style jsx>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>

      {/* Floating Visual Element */}
      <motion.div
        className="absolute right-[10%] top-1/2 opacity-10 hidden lg:block"
        style={{
          transform: `translateY(calc(-50% + ${scrolled * 0.3}px)) rotate(${scrolled * 0.05}deg)`
        }}
        animate={{
          y: ['-50%', 'calc(-50% - 20px)', '-50%'],
          rotate: [0, 5, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-[300px] h-[300px] text-indigo-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
        >
          <rect x="10" y="10" width="80" height="80" />
          <rect x="20" y="20" width="60" height="60" strokeWidth="0.3" />
          <rect x="30" y="30" width="40" height="40" strokeWidth="0.2" />
        </svg>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Title Line */}
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-8 mb-12">
          <span className="font-mono text-xl sm:text-2xl text-indigo-500 font-bold">01</span>
          <div className="flex-1">
            <motion.h1
              className="font-mono text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight uppercase tracking-[0.05em] flex flex-wrap gap-2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                DESIGN
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-indigo-500"
              >
                &
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                DEVELOPMENT
              </motion.span>
            </motion.h1>
          </div>
        </div>

        {/* Typing Effect Subtitle */}
        <div className="mb-8">
          <TypingText />
        </div>

        {/* Meta Information */}
        <div className="flex flex-wrap gap-8">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs text-neutral-500 uppercase tracking-widest">Стек</span>
            <span className="font-mono text-sm text-neutral-400">
              React • TypeScript • Design Systems
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

function TypingText() {
  const texts = [
    'Создаю интерфейсы для цифрового будущего',
    'Разрабатываю дизайн-системы',
    'Строю компонентные архитектуры',
    'Преображаю идеи в код'
  ]
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    let textIndex = 0
    let charIndex = 0
    let isDeleting = false

    const typeEffect = () => {
      const currentText = texts[textIndex]

      if (isDeleting) {
        setDisplayedText(currentText.substring(0, charIndex - 1))
        charIndex--
      } else {
        setDisplayedText(currentText.substring(0, charIndex + 1))
        charIndex++
      }

      let typeSpeed = isDeleting ? 50 : 100

      if (!isDeleting && charIndex === currentText.length) {
        typeSpeed = 2000 // Pause at end
        isDeleting = true
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false
        textIndex = (textIndex + 1) % texts.length
        typeSpeed = 500 // Pause before typing new text
      }

      setTimeout(typeEffect, typeSpeed)
    }

    // Start typing effect after a delay
    const startDelay = setTimeout(typeEffect, 1000)

    return () => {
      clearTimeout(startDelay)
    }
  }, [texts])

  return (
    <p className="font-mono text-lg text-neutral-400 inline-block">
      {displayedText}
      <span className="animate-pulse border-r-2 border-indigo-500 ml-1 h-6 inline-block" />
    </p>
  )
}
