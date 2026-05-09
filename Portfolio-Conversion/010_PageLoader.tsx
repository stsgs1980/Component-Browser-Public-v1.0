// Project: Portfolio-Conversion
// Category: components
// Source: showcases\Portfolio-Conversion\src\components
// Lines: 96

'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function PageLoader() {
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setLoading(false), 300)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-neutral-950 flex flex-col items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Loading Content */}
          <div className="text-center">
            {/* Brand */}
            <motion.div
              className="font-mono text-2xl mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-indigo-500">&lt;</span>
              <span className="text-white">PORTFOLIO</span>
              <span className="text-indigo-500">/&gt;</span>
            </motion.div>

            {/* Progress Bar */}
            <div className="w-64 h-[2px] bg-neutral-800 mb-4 overflow-hidden">
              <motion.div
                className="h-full bg-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            {/* Percentage */}
            <motion.div
              className="font-mono text-sm text-neutral-500"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {Math.round(progress)}%
            </motion.div>

            {/* Loading Text */}
            <motion.div
              className="font-mono text-xs text-neutral-600 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Loading...
            </motion.div>
          </div>

          {/* Grid Background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              animation: 'gridMove 20s linear infinite'
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
