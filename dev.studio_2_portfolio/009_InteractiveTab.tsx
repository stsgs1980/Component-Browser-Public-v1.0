// Project: dev.studio 2 portfolio
// Category: Portfolio
// Source: showcases\dev.studio 2 portfolio\src\components\Portfolio
// Lines: 31

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EFFECT_ITEMS } from '@/data/images'

export function InteractiveTab() {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle>Hover Эффекты</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-4">
          {EFFECT_ITEMS.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <p className="text-sm text-zinc-400">{item.label}</p>
              <div className="relative h-48 rounded-lg overflow-hidden group cursor-pointer">
                <img 
                  src={`/api/images/${item.img.filename}`}
                  alt={`Interactive hover effect demonstration: ${item.label} - ${item.img.title}`}
                  className={`w-full h-full object-cover transition-all duration-500 ${item.effect}`}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
