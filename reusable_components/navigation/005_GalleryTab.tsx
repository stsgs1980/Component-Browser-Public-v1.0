// Project: dev.studio 2 portfolio
// Category: Portfolio
// Source: showcases\dev.studio 2 portfolio\src\components\Portfolio
// Lines: 98

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { images } from '@/data/images'
import { ImageData } from '@/types'

interface GalleryTabProps {
  selectedImage: ImageData
  onSelectImage: (image: ImageData) => void
}

export function GalleryTab({ selectedImage, onSelectImage }: GalleryTabProps) {
  return (
    <div className="grid lg:grid-cols-4 gap-4 flex-1">
      <div className="lg:col-span-1">
        <Card className="bg-zinc-900 border-zinc-800 h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-300">Выберите изображение</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="relative pr-2">
                <div className="absolute left-[3px] top-1 bottom-1 w-px bg-zinc-700" />
                <div className="space-y-0">
                  {images.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => onSelectImage(img)}
                      className="group relative w-full flex items-start py-2 text-left transition-colors"
                    >
                      <div className={`w-2 h-2 mt-1.5 rounded-full transition-all flex-shrink-0 ${
                        selectedImage.id === img.id
                          ? 'bg-cyan-500 scale-125'
                          : 'bg-zinc-600 group-hover:bg-zinc-400 group-hover:scale-110'
                      }`} />
                      <div className="flex-1 min-w-0 pl-3">
                        <p className={`text-sm font-medium truncate transition-colors ${
                          selectedImage.id === img.id
                            ? 'text-cyan-400'
                            : 'text-zinc-300 group-hover:text-white'
                        }`}>
                          {img.title}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">{img.style}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3 space-y-4">
        <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
          <div className="relative min-h-[400px] bg-zinc-950">
            <img 
              src={`/api/images/${selectedImage.filename}`}
              alt={selectedImage.title}
              className="w-full h-full min-h-[400px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-2xl font-bold">{selectedImage.title}</h2>
              <p className="text-zinc-300">{selectedImage.description}</p>
            </div>
          </div>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedImage.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-zinc-400">Цвета</p>
                <p className="font-medium">{selectedImage.colors.join(', ')}</p>
              </div>
              <div>
                <p className="text-zinc-400">Стиль</p>
                <p className="font-medium">{selectedImage.style}</p>
              </div>
              <div>
                <p className="text-zinc-400">Настроение</p>
                <p className="font-medium">{selectedImage.mood}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
