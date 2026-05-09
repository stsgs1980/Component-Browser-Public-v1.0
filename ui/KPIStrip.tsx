'use client'

export interface KPIItem {
  color: string
  value: number
  label: string
}

interface KPIStripProps {
  items: KPIItem[]
  height?: number
  backgroundColor?: string
  borderColor?: string
}

export function KPIStrip({ items, height = 32, backgroundColor = '#0A0A0A', borderColor = 'rgba(51,51,51,0.25)' }: KPIStripProps) {
  return (
    <div
      style={{
        background: backgroundColor,
        borderTop: `1px solid ${borderColor}`,
        height,
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 24,
        flexShrink: 0,
      }}
    >
      {items.map(item => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color }} />
          <span style={{ fontSize: 12, fontWeight: 800, color: item.color }}>{item.value}</span>
          <span style={{ fontSize: 9, color: '#555' }}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}
