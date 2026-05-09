// Project: Portfolio-Conversion
// Category: components
// Source: showcases\Portfolio-Conversion\src\components
// Lines: 189

'use client'

import { motion } from 'framer-motion'
import { MapPin, Calendar, CheckCircle, ExternalLink } from 'lucide-react'

interface ExperienceItem {
  id: string
  company: string
  position: string
  location: string
  startDate: string
  endDate: string
  description: string
  achievements: string[]
  tech: string[]
  link?: string
}

const experienceData: ExperienceItem[] = [
  {
    id: '1',
    company: 'Tech Solutions Inc.',
    position: 'Senior Frontend Developer',
    location: 'Москва',
    startDate: '2022-03',
    endDate: 'Настоящее время',
    description: 'Разработка и поддержка крупномасштабных веб-приложений для enterprise клиентов',
    achievements: [
      'Разработал дизайн-систему на базе React и TypeScript',
      'Оптимизировал производительность приложения на 40%',
      'Внедрил CI/CD пайплайны и автоматизированное тестирование',
      'Обучил команду из 5 junior разработчиков'
    ],
    tech: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Prisma'],
    link: 'https://techsolutions.example.com'
  },
  {
    id: '2',
    company: 'Digital Agency Pro',
    position: 'Frontend Developer',
    location: 'Санкт-Петербург',
    startDate: '2020-06',
    endDate: '2022-02',
    description: 'Создание интерактивных веб-интерфейсов и лендингов для клиентов',
    achievements: [
      'Реализовал более 30 проектов для различных клиентов',
      'Разработал систему компонентов для повторного использования',
      'Внедрил анимации и микро-взаимодействия для улучшения UX',
      'Получил награду "Лучший разработчик года"'
    ],
    tech: ['Vue.js', 'Nuxt.js', 'SCSS', 'GSAP', 'Webpack']
  },
  {
    id: '3',
    company: 'Startup Hub',
    position: 'Junior Developer',
    location: 'Удаленно',
    startDate: '2019-01',
    endDate: '2020-05',
    description: 'Разработка MVP продуктов для стартапов',
    achievements: [
      'Создал 5 успешных MVP продуктов',
      'Работал в кросс-функциональной команде дизайнеров и бэкенд-разработчиков',
      'Участвовал в технических интервью кандидатов',
      'Изучил и применил современные практики разработки'
    ],
    tech: ['React', 'Node.js', 'MongoDB', 'Docker', 'Git']
  }
]

export function Experience() {
  return (
    <section id="experience" className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
      {/* Section Header */}
      <motion.div
        className="flex items-center gap-8 mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span className="font-mono text-xl text-indigo-500 font-bold">04</span>
        <h2 className="font-mono text-2xl font-bold uppercase tracking-[0.1em]">ОПЫТ РАБОТЫ</h2>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-neutral-700 to-transparent" />
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-[2px] bg-neutral-800 transform md:-translate-x-1/2" />

        {/* Experience Items */}
        <div className="space-y-12">
          {experienceData.map((item, index) => (
            <ExperienceItem key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ExperienceItem({ item, index }: { item: ExperienceItem; index: number }) {
  const isEven = index % 2 === 0

  return (
    <motion.div
      className="relative md:flex items-center"
      initial={{ opacity: 0, x: isEven ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      {/* Timeline Dot */}
      <div className="absolute left-0 md:left-1/2 w-4 h-4 bg-indigo-600 rounded-full border-4 border-neutral-900 transform md:-translate-x-1/2 z-10" />

      {/* Content */}
      <div className={`ml-8 md:ml-0 md:w-1/2 ${isEven ? 'md:pr-12 md:text-right' : 'md:pl-12 md:ml-auto'}`}>
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg hover:border-neutral-700 transition-colors">
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-white mb-1">{item.position}</h3>
            <div className="flex items-center gap-2 text-indigo-500 font-mono text-sm mb-2 md:justify-start md:flex-row-reverse">
              {item.link ? (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-400 transition-colors flex items-center gap-1"
                >
                  {item.company}
                  <ExternalLink size={12} />
                </a>
              ) : (
                <span>{item.company}</span>
              )}
            </div>
            <div className="flex items-center gap-4 text-neutral-500 text-sm">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{item.startDate} - {item.endDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{item.location}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-neutral-400 text-sm mb-4">{item.description}</p>

          {/* Achievements */}
          <div className="mb-4">
            <h4 className="font-mono text-xs text-indigo-500 uppercase tracking-wider mb-2">
              Ключевые достижения
            </h4>
            <ul className="space-y-2">
              {item.achievements.map((achievement, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-neutral-400">
                  <CheckCircle size={14} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="font-mono text-xs text-indigo-500 uppercase tracking-wider mb-2">
              Технологии
            </h4>
            <div className="flex flex-wrap gap-2">
              {item.tech.map((tech) => (
                <span
                  key={tech}
                  className="font-mono text-xs text-neutral-400 bg-neutral-800 px-2 py-1 border border-neutral-700"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
