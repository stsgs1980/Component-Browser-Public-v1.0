// Project: DS Reference
// Category: sections
// Source: design-systems\DS Reference\src\components\sections
// Lines: 150

'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Layers, Puzzle, Package, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigationStore } from '@/store/navigation'

const stats = [
  { icon: Layers, value: '8+', label: 'Дизайн-систем', gradient: 'from-violet-500 to-purple-600' },
  { icon: Puzzle, value: '50+', label: 'Компонентов', gradient: 'from-blue-500 to-cyan-500' },
  { icon: Package, value: '11+', label: 'Библиотек', gradient: 'from-pink-500 to-rose-500' },
  { icon: Shield, value: 'WCAG', label: 'Доступность', gradient: 'from-emerald-500 to-teal-500' }
]

export function HomeSection() {
  const { setActiveSection } = useNavigationStore()

  return (
    <div className="relative min-h-[calc(100vh-10rem)] flex flex-col">
      {/* Background - Light Airy Style */}
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        {/* Soft gradient blobs - very light */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-violet-200/40 via-purple-100/30 to-transparent rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-blue-100/30 via-cyan-50/20 to-transparent rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-gradient-to-r from-pink-100/20 via-violet-50/20 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        
        {/* Subtle dot grid */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <pattern id="dots" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1" fill="#8B5CF6" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        {/* Light floating elements */}
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full bg-gradient-to-br from-violet-200/50 to-purple-100/30 blur-2xl"
        />
        <motion.div
          animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/3 left-1/5 w-40 h-40 rounded-full bg-gradient-to-tr from-blue-100/40 to-cyan-50/30 blur-2xl"
        />
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-2/3 right-1/3 w-24 h-24 rounded-full bg-gradient-to-bl from-pink-100/40 to-rose-50/30 blur-xl"
        />
      </div>

      {/* Hero Section - Centered */}
      <section className="flex-1 flex flex-col justify-center text-center py-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-block mb-6"
        >
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-violet-500/25">
            <svg viewBox="0 0 40 40" className="h-8 w-8 text-white">
              <rect x="4" y="4" width="12" height="12" rx="2" fill="white"/>
              <rect x="8" y="8" width="12" height="12" rx="2" fill="white" opacity="0.7"/>
              <rect x="12" y="12" width="12" height="12" rx="2" fill="white" opacity="0.4"/>
              <rect x="20" y="8" width="8" height="8" rx="1" fill="white" opacity="0.5"/>
              <rect x="28" y="16" width="8" height="8" rx="1" fill="white" opacity="0.3"/>
            </svg>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
        >
          Справочник дизайн-систем
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Комплексное руководство по дизайн-системам, UI-компонентам и лучшим практикам
          для создания последовательных и доступных интерфейсов.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="flex flex-wrap justify-center gap-4 mt-8"
        >
          <Button size="lg" onClick={() => setActiveSection('foundations')}>
            Начать изучение
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => setActiveSection('components')}>
            Смотреть компоненты
          </Button>
        </motion.div>
      </section>

      {/* Stats Infographic - Creative Cards */}
      <section className="pb-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.15, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              {/* Gradient background card */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
              
              {/* Content */}
              <div className="relative p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-white/80 dark:border-white/10 group-hover:border-white dark:group-hover:border-white/20 transition-all duration-300">
                {/* Icon with gradient background */}
                <motion.div 
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  style={{ boxShadow: `0 8px 32px -8px ${stat.gradient.includes('violet') ? 'rgba(139, 92, 246, 0.4)' : stat.gradient.includes('blue') ? 'rgba(59, 130, 246, 0.4)' : stat.gradient.includes('pink') ? 'rgba(236, 72, 153, 0.4)' : 'rgba(16, 185, 129, 0.4)'}` }}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </motion.div>
                
                {/* Value */}
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                
                {/* Label */}
                <div className="text-sm text-muted-foreground">{stat.label}</div>
                
                {/* Decorative corner accent */}
                <div className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10`} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
