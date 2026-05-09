// Project: dev.studio 2 portfolio
// Category: ImageShowcase
// Source: showcases\dev.studio 2 portfolio\src\components\ImageShowcase
// Lines: 53

'use client'

import { Button } from '@/components/ui/button'
import { Code2 } from 'lucide-react'
import { navItems } from '@/data/skills'

// Static color map for Tailwind JIT compatibility
const hoverColorMap: Record<string, string> = {
  cyan: 'group-hover:bg-cyan-500',
  pink: 'group-hover:bg-pink-500',
  blue: 'group-hover:bg-blue-500',
  emerald: 'group-hover:bg-emerald-500',
  violet: 'group-hover:bg-violet-500',
  rose: 'group-hover:bg-rose-500',
  teal: 'group-hover:bg-teal-500'
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-200 bg-white fixed left-0 top-0 bottom-0 z-40">
      <div className="p-8 pb-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-zinc-900 rounded-lg flex items-center justify-center">
            <Code2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-semibold text-zinc-900">dev.studio</span>
            <p className="text-xs text-zinc-400">Web • Code • AI</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-5">Навигация</p>
        <div className="relative">
          <div className="absolute left-[3px] top-2 bottom-2 w-px bg-zinc-200" />
          <nav className="space-y-0">
            {navItems.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="group relative flex items-start py-2 text-left transition-colors">
                <div className={`w-2 h-2 mt-1.5 rounded-full bg-zinc-300 ${hoverColorMap[item.hoverColor] || 'group-hover:bg-zinc-500'} group-hover:scale-125 transition-all flex-shrink-0`} />
                <div className="flex flex-col items-start pl-3">
                  <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900">{item.label}</span>
                  <span className="text-xs text-zinc-400 group-hover:text-zinc-500">{item.description}</span>
                </div>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  )
}
