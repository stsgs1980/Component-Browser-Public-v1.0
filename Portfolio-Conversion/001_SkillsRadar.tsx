// Project: Portfolio-Conversion
// Category: components
// Source: showcases\Portfolio-Conversion\src\components
// Lines: 119

'use client'

import { motion } from 'framer-motion'
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts'

interface SkillData {
  category: string
  level: number
  fullMark: number
}

const skillsData: SkillData[] = [
  { category: 'Frontend', level: 90, fullMark: 100 },
  { category: 'Backend', level: 65, fullMark: 100 },
  { category: 'Tools', level: 85, fullMark: 100 },
  { category: 'Design', level: 75, fullMark: 100 },
  { category: 'Soft Skills', level: 80, fullMark: 100 },
  { category: 'DevOps', level: 60, fullMark: 100 }
]

export function SkillsRadar() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
      {/* Section Header */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span className="font-mono text-sm text-indigo-500 uppercase tracking-wider">
          Навыки
        </span>
        <h2 className="font-mono text-3xl font-bold text-white mt-2">
          Radar Chart
        </h2>
        <p className="text-neutral-400 mt-4 max-w-2xl mx-auto">
          Визуализация компетенций по категориям
        </p>
      </motion.div>

      {/* Radar Chart */}
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8">
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={skillsData}>
              <PolarGrid stroke="#333" strokeWidth={1} />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fill: '#a0a0a0', fontSize: 12 }}
                className="font-mono"
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: '#666', fontSize: 10 }}
                tickCount={5}
                stroke="#333"
              />
              <Radar
                name="Уровень навыка"
                dataKey="level"
                stroke="#6366f1"
                strokeWidth={2}
                fill="#6366f1"
                fillOpacity={0.2}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px'
                }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#a0a0a0' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Skill Categories Description */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {skillsData.map((skill, index) => (
          <motion.div
            key={skill.category}
            className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-sm text-white">{skill.category}</span>
              <span className="font-mono text-sm text-indigo-500">{skill.level}%</span>
            </div>
            <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-500 rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: `${skill.level}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
