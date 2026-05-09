// Project: dev.studio 2 portfolio
// Category: Portfolio
// Source: showcases\dev.studio 2 portfolio\src\components\Portfolio
// Lines: 33

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GRADIENT_ITEMS } from '@/data/images'

export function GradientsTab() {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle>Градиентные наложения</CardTitle>
        <CardDescription className="text-zinc-400">Различные способы комбинирования изображений с градиентами</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GRADIENT_ITEMS.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <p className="text-sm text-zinc-400">{item.label}</p>
              <div className="relative h-40 rounded-lg overflow-hidden">
                <img 
                  src={`/api/images/${item.img.filename}`}
                  alt={`Gradient effect demonstration: ${item.label} - ${item.img.title}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className={`absolute inset-0 ${item.gradient}`} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
