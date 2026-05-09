// Project: Portfolio-Conversion
// Category: components
// Source: showcases\Portfolio-Conversion\src\components
// Lines: 120

'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState } from 'react'

interface Skill {
  name: string
  level: number
}

interface SkillGroup {
  category: string
  skills: Skill[]
}

const skillGroups: SkillGroup[] = [
  {
    category: 'Frontend',
    skills: [
      { name: 'React', level: 90 },
      { name: 'TypeScript', level: 85 },
      { name: 'CSS / SCSS', level: 88 },
      { name: 'JavaScript', level: 92 }
    ]
  },
  {
    category: 'Design Systems',
    skills: [
      { name: 'Radix UI', level: 82 },
      { name: 'Figma', level: 85 },
      { name: 'Component Architecture', level: 88 }
    ]
  },
  {
    category: 'Tools',
    skills: [
      { name: 'Vite', level: 90 },
      { name: 'Bun', level: 75 },
      { name: 'Git', level: 88 }
    ]
  }
]

export function Skills() {
  return (
    <section id="skills" className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
      {/* Section Header */}
      <motion.div
        className="flex items-center gap-8 mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span className="font-mono text-xl text-indigo-500 font-bold">03</span>
        <h2 className="font-mono text-2xl font-bold uppercase tracking-[0.1em]">НАВЫКИ</h2>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-neutral-700 to-transparent" />
      </motion.div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {skillGroups.map((group, groupIndex) => (
          <SkillGroup key={group.category} group={group} index={groupIndex} />
        ))}
      </div>
    </section>
  )
}

function SkillGroup({ group, index }: { group: SkillGroup; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const [hasAnimated, setHasAnimated] = useState(false)

  if (isInView && !hasAnimated) {
    setHasAnimated(true)
  }

  return (
    <motion.div
      ref={ref}
      className="bg-neutral-900 border border-neutral-800 p-6"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
    >
      <h4 className="font-mono text-base text-indigo-500 mb-6 pb-2 border-b border-neutral-800">
        {group.category}
      </h4>
      <div className="flex flex-col gap-4">
        {group.skills.map((skill) => (
          <SkillItem
            key={skill.name}
            skill={skill}
            hasAnimated={hasAnimated}
          />
        ))}
      </div>
    </motion.div>
  )
}

function SkillItem({ skill, hasAnimated }: { skill: Skill; hasAnimated: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-neutral-400 font-medium">{skill.name}</span>
      <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: hasAnimated ? `${skill.level}%` : 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
