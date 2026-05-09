// Project: dev.studio 2 portfolio
// Category: Portfolio
// Source: showcases\dev.studio 2 portfolio\src\components\Portfolio
// Lines: 34

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function SectionsTab() {
  return (
    <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
      <CardHeader>
        <CardTitle>CTA Секция с фоном</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative py-20">
          <img 
            src="/api/images/2402a8cb96e3be6ce9667c237352b07a.jpg"
            alt="CTA Background"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-zinc-900/80" />
          <div className="relative z-10 px-4">
            <h2 className="text-3xl font-bold mb-4">Готовы к трансформации?</h2>
            <p className="text-zinc-300 mb-6 max-w-xl">
              Присоединяйтесь к тысячам компаний, которые уже используют наши решения
            </p>
            <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-900 hover:from-amber-600 hover:to-orange-600">
              Начать бесплатно
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
