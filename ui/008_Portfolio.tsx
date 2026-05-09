// Project: dev.studio 2 portfolio
// Category: Portfolio
// Source: showcases\dev.studio 2 portfolio\src\components\Portfolio
// Lines: 80

'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Image as ImageIcon } from 'lucide-react'
import { images, usageCategories } from '@/data/images'
import { GalleryTab } from './GalleryTab'
import { HeroTab } from './HeroTab'
import { CardsTab } from './CardsTab'
import { SectionsTab } from './SectionsTab'
import { GradientsTab } from './GradientsTab'
import { InteractiveTab } from './InteractiveTab'

export function Portfolio() {
  const [selectedImage, setSelectedImage] = useState(images[0])
  const [activeTab, setActiveTab] = useState('gallery')

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Так может быть ....</h1>
                <p className="text-xs text-zinc-400">Все способы использования изображений</p>
              </div>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 border">
              9 изображений
            </Badge>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {usageCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === cat.id
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                <span>{cat.title}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col">
        {activeTab === 'gallery' && (
          <GalleryTab selectedImage={selectedImage} onSelectImage={setSelectedImage} />
        )}
        {activeTab === 'hero' && <HeroTab />}
        {activeTab === 'cards' && <CardsTab />}
        {activeTab === 'sections' && <SectionsTab />}
        {activeTab === 'gradients' && <GradientsTab />}
        {activeTab === 'interactive' && <InteractiveTab />}
      </main>

      <footer className="border-t border-zinc-800 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-4">
            <Badge className="bg-zinc-800 text-zinc-300">Next.js 16</Badge>
            <Badge className="bg-zinc-800 text-zinc-300">Tailwind CSS 4</Badge>
            <Badge className="bg-zinc-800 text-zinc-300">shadcn/ui</Badge>
          </div>
        </div>
      </footer>
    </div>
  )
}
