'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface CollapsibleSectionProps {
  title: string
  icon: React.ReactNode
  count?: number
  accentColor: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export function CollapsibleSection({ title, icon, count, accentColor, children, defaultOpen = true }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between group"
      >
        <h2 className="text-white font-semibold text-sm flex items-center gap-2">
          <span className="w-1 h-4 rounded-full" style={{ background: accentColor }} />
          {icon}
          {title}
          {count !== undefined && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: `${accentColor}15`, color: accentColor }}>
              {count}
            </span>
          )}
        </h2>
        <ChevronDown
          size={16}
          style={{ color: accentColor }}
          className={`transition-transform duration-300 ${open ? 'rotate-180' : 'rotate-0'}`}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{
          maxHeight: open ? '5000px' : '0px',
          opacity: open ? 1 : 0,
        }}
      >
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  )
}
