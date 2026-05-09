// Project: Portfolio-Conversion
// Category: components
// Source: showcases\Portfolio-Conversion\src\components
// Lines: 165

'use client'

import { motion } from 'framer-motion'
import { Search, Layout, Code, Rocket, ChevronRight } from 'lucide-react'

interface ProcessStep {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  details: string[]
}

const processSteps: ProcessStep[] = [
  {
    id: 1,
    title: 'Discovery',
    description: 'Анализ и понимание',
    icon: <Search size={32} />,
    details: [
      'Сбор требований и анализ задач',
      'Изучение аудитории и конкурентов',
      'Определение целей и KPI',
      'Создание пользовательских персон'
    ]
  },
  {
    id: 2,
    title: 'Design',
    description: 'Проектирование решений',
    icon: <Layout size={32} />,
    details: [
      'Создание wireframes и прототипов',
      'Разработка дизайн-системы',
      'UI/UX дизайн интерфейсов',
      'Дизайн-ревью и итерации'
    ]
  },
  {
    id: 3,
    title: 'Develop',
    description: 'Разработка и реализация',
    icon: <Code size={32} />,
    details: [
      'Написание чистого и поддерживаемого кода',
      'Интеграция API и бэкенда',
      'Реализация анимаций и взаимодействий',
      'Unit и E2E тестирование'
    ]
  },
  {
    id: 4,
    title: 'Deploy',
    description: 'Запуск и поддержка',
    icon: <Rocket size={32} />,
    details: [
      'CI/CD пайплайны и автоматизация',
      'Производительность и оптимизация',
      'Мониторинг и логирование',
      'Поддержка и улучшения'
    ]
  }
]

export function HowIWork() {
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
          Процесс
        </span>
        <h2 className="font-mono text-3xl font-bold text-white mt-2">
          Как я работаю
        </h2>
        <p className="text-neutral-400 mt-4 max-w-2xl mx-auto">
          От идеи до реализации - мой проверенный подход к созданию качественных продуктов
        </p>
      </motion.div>

      {/* Process Steps */}
      <div className="relative">
        {/* Connecting Line */}
        <div className="hidden lg:block absolute top-24 left-0 right-0 h-[2px] bg-gradient-to-r from-neutral-800 via-indigo-500/50 to-neutral-800" />

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {processSteps.map((step, index) => (
            <motion.div
              key={step.id}
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* Step Number */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-mono font-bold text-lg">
                  0{step.id}
                </div>
              </div>

              {/* Icon */}
              <motion.div
                className="flex justify-center mb-4 text-indigo-500"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                {step.icon}
              </motion.div>

              {/* Title */}
              <h3 className="font-mono text-xl font-bold text-white text-center mb-2">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-neutral-400 text-sm text-center mb-4">
                {step.description}
              </p>

              {/* Details List */}
              <ul className="space-y-2">
                {step.details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-neutral-500">
                    <ChevronRight size={14} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        className="mt-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <p className="text-neutral-400 mb-6">
          Хотите обсудить проект?
        </p>
        <a
          href="#contact"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
        >
          <span>Связаться со мной</span>
          <ChevronRight size={16} />
        </a>
      </motion.div>
    </section>
  )
}
