// Project: dev.studio 2 portfolio
// Category: ImageShowcase
// Source: showcases\dev.studio 2 portfolio\src\components\ImageShowcase
// Lines: 251

'use client'

import { useState, useCallback, useMemo, memo } from 'react'
import { Button } from '@/components/ui/button'
import { Code2, ArrowRight, Paintbrush, Mail, Github, Linkedin, Wand2, LucideIcon } from 'lucide-react'
import { services, skills, capabilities } from '@/data/skills'
import { Sidebar } from './Sidebar'
import { SkillsRadar } from './SkillsRadar'
import { ProcessSection } from './ProcessSection'
import { StatsSection } from './StatsSection'

interface ImageShowcaseProps {
  onSwitchMode: () => void
}

// Move inline objects out of component to prevent recreation on each render
interface CapabilitySection {
  title: string
  icon: LucideIcon
  data: typeof capabilities.webDesign
}

const CAPABILITY_SECTIONS: CapabilitySection[] = [
  { title: 'Web Design', icon: Paintbrush, data: capabilities.webDesign },
  { title: 'Web Coding', icon: Code2, data: capabilities.webCoding },
  { title: 'Vibe Coding', icon: Wand2, data: capabilities.vibeCoding }
]

// Memoized capability item
const CapabilityItem = memo(function CapabilityItem({ 
  section 
}: { 
  section: CapabilitySection 
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3 mb-4">
        <section.icon className="w-5 h-5 text-zinc-500" />
        <h3 className="text-lg font-semibold text-zinc-900">{section.title}</h3>
      </div>
      {section.data.map((cap, capIdx) => (
        <div key={capIdx} className="flex items-center gap-3 py-3 border-b border-zinc-100 last:border-0">
          <cap.icon className="w-4 h-4 text-zinc-400" />
          <span className="text-zinc-600">{cap.title}</span>
        </div>
      ))}
    </div>
  )
})

// Memoized skill item
const SkillItem = memo(function SkillItem({ name, level }: { name: string; level: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 rounded-full bg-zinc-400" />
      <span className="text-zinc-700 text-sm">{name}</span>
      <span className="text-zinc-400 text-sm ml-auto">{level}%</span>
    </div>
  )
})

export function ImageShowcase({ onSwitchMode }: ImageShowcaseProps) {
  const [showAiResponse, setShowAiResponse] = useState(false)

  // Use callback for stable function reference
  const handleWriteClick = useCallback(() => {
    setShowAiResponse(true)
  }, [])

  // Memoize capability sections
  const capabilitySections = useMemo(() => CAPABILITY_SECTIONS, [])

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex">
      <Sidebar />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-zinc-200 lg:hidden">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-lg">dev.studio</span>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section id="hero" className="relative pt-28 pb-16 px-6 overflow-hidden">
          <div className="container mx-auto relative z-10">
            <div className="max-w-4xl">
              <h1 className="text-5xl md:text-7xl font-bold leading-none mb-4 text-zinc-900">
                Создаём цифровые
                <br />
                <span className="text-4xl md:text-5xl text-cyan-400 drop-shadow-[0_0_30px_rgba(34,211,238,0.6)] -mt-2 block">продукты будущего</span>
              </h1>
              <p className="text-lg text-zinc-600 max-w-2xl mb-8 leading-relaxed">
                Превращаем идеи в элегантные веб-решения. Современный дизайн, 
                чистый код, AI-ассистированная разработка.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-zinc-900 text-white hover:bg-zinc-800" onClick={onSwitchMode}>
                  Смотреть проекты <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button size="lg" className="bg-transparent border-2 border-zinc-300 text-zinc-700 hover:bg-cyan-400 hover:text-zinc-900 hover:border-cyan-400 transition-all">
                  Обсудить проект
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="py-16 px-6">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-zinc-900 mb-8">Что мы делаем</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {services.map((service) => (
                <div key={service.id} className="group p-6 rounded-2xl hover:bg-zinc-50 transition-colors">
                  <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-zinc-900 transition-colors">
                    <service.icon className="w-6 h-6 text-zinc-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-2">{service.title}</h3>
                  <p className="text-zinc-500 leading-relaxed">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section id="process" className="py-16 px-6 bg-zinc-50">
          <div className="container mx-auto">
            <ProcessSection />
          </div>
        </section>

        {/* About */}
        <section id="about" className="py-16 px-6">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-3 text-zinc-900">
              Полный цикл разработки
            </h2>
            <p className="text-zinc-500 mb-8 leading-relaxed">
              От концепции до запуска — создаём веб-продукты, которые работают
            </p>
            <StatsSection />
          </div>
        </section>

        {/* Capabilities */}
        <section id="capabilities" className="py-16 px-6">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-zinc-900 mb-8">Технологии</h2>
            <div className="grid lg:grid-cols-3 gap-8">
              {capabilitySections.map((section, idx) => (
                <CapabilityItem key={idx} section={section} />
              ))}
            </div>
          </div>
        </section>

        {/* Skills */}
        <section id="skills" className="py-16 px-6 bg-zinc-50">
          <div className="container mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-3 text-zinc-900">
                  Экспертиза
                </h2>
                <p className="text-zinc-500 mb-8 leading-relaxed">
                  Глубокое понимание современных технологий
                </p>
                <div className="space-y-3">
                  {skills.map((skill, idx) => (
                    <SkillItem key={idx} name={skill.name} level={skill.level} />
                  ))}
                </div>
              </div>
              <div className="flex justify-center">
                <SkillsRadar />
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="py-16 px-6">
          <div className="container mx-auto">
            <div className="max-w-xl">
              <h2 
                className="text-3xl font-bold mb-3 text-zinc-900 cursor-pointer hover:text-zinc-600 transition-colors"
                onClick={onSwitchMode}
              >
                Давайте создадим что-то особенное
              </h2>
              <p className="text-zinc-500 mb-6">
                Готовы обсудить ваш проект?
              </p>
              
              {showAiResponse ? (
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#FF0000] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-zinc-700 font-medium mb-1">Вам ответит наша AI почта....</p>
                      <p className="text-zinc-500 text-sm">Мы свяжемся с вами в ближайшее время для обсуждения деталей проекта.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4">
                  <Button size="lg" className="bg-[#0000FF] text-white hover:bg-[#0000DD]" onClick={handleWriteClick}>
                    <Mail className="mr-2 w-4 h-4" />
                    Написать
                  </Button>
                  <div className="flex gap-3">
                    <a href="#" className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-zinc-900 hover:text-white transition-all" aria-label="Github">
                      <Github className="w-5 h-5" />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-zinc-900 hover:text-white transition-all" aria-label="LinkedIn">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 mt-auto">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">© 2024 dev.studio</span>
              <div className="flex gap-6 text-sm text-zinc-400">
                <span>Design</span>
                <span>Code</span>
                <span>AI</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
