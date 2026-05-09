// Project: dev.studio 2 portfolio
// Category: app
// Source: showcases\dev.studio 2 portfolio\src\app
// Lines: 48

'use client'

import { useState } from 'react'
import { Image as ImageIcon, Layout } from 'lucide-react'
import { Portfolio } from '@/components/Portfolio'
import { ImageShowcase } from '@/components/ImageShowcase'

export default function Home() {
  const [mode, setMode] = useState<'showcase' | 'portfolio'>('showcase')

  return (
    <div className="relative">
      {/* Mode Switcher */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]">
        <div className="bg-zinc-900/95 backdrop-blur-xl p-1 rounded-full flex gap-1 shadow-2xl border border-zinc-700">
          <button
            type="button"
            onClick={() => setMode('showcase')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              mode === 'showcase' 
                ? 'bg-white text-zinc-900' 
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span className="hidden sm:inline">Главная</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('portfolio')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              mode === 'portfolio' 
                ? 'bg-white text-zinc-900' 
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Portfolio</span>
          </button>
        </div>
      </div>

      {/* Render Active Mode */}
      {mode === 'showcase' ? <ImageShowcase onSwitchMode={() => setMode('portfolio')} /> : <Portfolio />}
    </div>
  )
}
