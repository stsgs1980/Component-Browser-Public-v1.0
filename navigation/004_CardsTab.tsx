// Project: dev.studio 2 portfolio
// Category: Portfolio
// Source: showcases\dev.studio 2 portfolio\src\components\Portfolio
// Lines: 34

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { images } from '@/data/images'

export function CardsTab() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.slice(0, 6).map((img) => (
        <Card key={img.id} className="bg-zinc-900 border-zinc-800 overflow-hidden group cursor-pointer hover:border-cyan-500/50 transition-all">
          <div className="relative h-48 overflow-hidden">
            <img 
              src={`/api/images/${img.filename}`}
              alt={img.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent opacity-60" />
          </div>
          <CardContent className="relative -mt-8 pt-8 bg-gradient-to-t from-zinc-900 via-zinc-900 to-transparent">
            <h3 className="font-bold text-lg mb-1">{img.title}</h3>
            <p className="text-sm text-zinc-400">{img.description}</p>
            <div className="flex gap-1 mt-3">
              {img.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} className="bg-zinc-800 text-zinc-300">{tag}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
