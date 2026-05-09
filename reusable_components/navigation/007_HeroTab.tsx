// Project: dev.studio 2 portfolio
// Category: Portfolio
// Source: showcases\dev.studio 2 portfolio\src\components\Portfolio
// Lines: 91

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowRight } from 'lucide-react'
import { images } from '@/data/images'

// Use constants for image references
const HERO_IMAGE = images[8] // Космическая сеть
const SPLIT_LEFT_IMAGE = images[2] // Неоновая дорожка
const SPLIT_RIGHT_IMAGE = images[8] // Космическая сеть

export function HeroTab() {
  return (
    <div className="space-y-8">
      <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Полноэкранный Hero
          </CardTitle>
          <CardDescription className="text-zinc-400">Фон на весь экран с наложением контента</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative h-[500px]">
            <img 
              src={`/api/images/${HERO_IMAGE.filename}`}
              alt={HERO_IMAGE.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative z-10 h-full flex flex-col justify-center p-8">
              <Badge className="mb-4 bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                Технологии будущего
              </Badge>
              <h2 className="text-4xl md:text-6xl font-bold mb-4">
                Инновации в каждой детали
              </h2>
              <p className="text-xl text-zinc-300 max-w-2xl mb-8">
                Создаем решения, которые меняют мир. Передовые технологии для вашего успеха.
              </p>
              <div className="flex gap-4">
                <Button size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-zinc-900 font-semibold">
                  Начать сейчас <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white hover:text-zinc-900 font-semibold">
                  Узнать больше
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Split Hero - Левая сторона</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative h-[300px]">
              <img 
                src={`/api/images/${SPLIT_LEFT_IMAGE.filename}`}
                alt={SPLIT_LEFT_IMAGE.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-900" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Split Hero - Правая сторона</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative h-[300px]">
              <img 
                src={`/api/images/${SPLIT_RIGHT_IMAGE.filename}`}
                alt={SPLIT_RIGHT_IMAGE.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-zinc-900" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
