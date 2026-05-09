// Project: dev.studio 2 portfolio
// Category: ImageShowcase
// Source: showcases\dev.studio 2 portfolio\src\components\ImageShowcase
// Lines: 114

'use client'

import { skills } from '@/data/skills'

// Constants for SVG dimensions
const SVG_CENTER = 200
const MAX_RADIUS = 100
const LABEL_RADIUS = 130
const POINT_RADIUS = 4

// Validate and sanitize skill name for SVG text
function sanitizeSkillName(name: string): string {
  // Only allow alphanumeric, spaces, slashes, and hyphens
  return name.replace(/[^a-zA-Zа-яА-Я0-9\s\/\-]/g, '').substring(0, 50)
}

// Validate skill level is within bounds
function validateLevel(level: number): number {
  return Math.max(0, Math.min(100, level))
}

export function SkillsRadar() {
  return (
    <svg viewBox="0 0 400 400" className="w-full max-w-sm" role="img" aria-label="Skills radar chart showing expertise levels">
      {/* Background circles */}
      {[100, 80, 60, 40, 20].map((r, idx) => (
        <circle
          key={idx}
          cx={SVG_CENTER}
          cy={SVG_CENTER}
          r={r}
          fill="none"
          stroke="#e4e4e7"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {skills.map((skill, idx) => {
        const angle = (idx * 60 - 90) * (Math.PI / 180)
        const x = SVG_CENTER + MAX_RADIUS * Math.cos(angle)
        const y = SVG_CENTER + MAX_RADIUS * Math.sin(angle)
        return (
          <line
            key={skill.name}
            x1={SVG_CENTER}
            y1={SVG_CENTER}
            x2={x}
            y2={y}
            stroke="#e4e4e7"
            strokeWidth="1"
          />
        )
      })}

      {/* Data polygon */}
      <polygon
        points={skills.map((skill, idx) => {
          const angle = (idx * 60 - 90) * (Math.PI / 180)
          const r = validateLevel(skill.level)
          const x = SVG_CENTER + r * Math.cos(angle)
          const y = SVG_CENTER + r * Math.sin(angle)
          return `${x.toFixed(2)},${y.toFixed(2)}`
        }).join(' ')}
        fill="rgba(24,24,27,0.1)"
        stroke="#18181b"
        strokeWidth="2"
      />

      {/* Data points */}
      {skills.map((skill, idx) => {
        const angle = (idx * 60 - 90) * (Math.PI / 180)
        const r = validateLevel(skill.level)
        const x = SVG_CENTER + r * Math.cos(angle)
        const y = SVG_CENTER + r * Math.sin(angle)
        return (
          <circle
            key={`point-${skill.name}`}
            cx={x.toFixed(2)}
            cy={y.toFixed(2)}
            r={POINT_RADIUS}
            fill="#18181b"
          />
        )
      })}

      {/* Labels */}
      {skills.map((skill, idx) => {
        const angle = (idx * 60 - 90) * (Math.PI / 180)
        const x = SVG_CENTER + LABEL_RADIUS * Math.cos(angle)
        const y = SVG_CENTER + LABEL_RADIUS * Math.sin(angle)

        let anchor = 'middle'
        if (angle > -Math.PI/2 && angle < Math.PI/2) anchor = 'start'
        if (angle > Math.PI/2 || angle < -Math.PI/2) anchor = 'end'

        return (
          <text
            key={`label-${skill.name}`}
            x={x.toFixed(2)}
            y={y.toFixed(2)}
            textAnchor={anchor}
            dominantBaseline="middle"
            className="text-xs fill-zinc-600"
            style={{ fontSize: '11px' }}
          >
            {sanitizeSkillName(skill.name)}
          </text>
        )
      })}
    </svg>
  )
}
