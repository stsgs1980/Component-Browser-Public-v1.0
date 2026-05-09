// Project: Portfolio-Conversion
// Category: components
// Source: showcases\Portfolio-Conversion\src\components
// Lines: 414

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'
import { ArrowUpRight, Search, X } from 'lucide-react'
import { ProjectDetailsModal } from './ProjectDetailsModal'

interface Project {
  id: string
  number: string
  tag: string
  title: string
  description: string
  tech: string[]
  link: string
  demo?: string
  repo?: string
  fullDescription: string
  challenge: string
  solution: string
  results: string[]
  images: string[]
}

interface ProjectCategory {
  title: string
  projects: Project[]
}

const projectCategories: ProjectCategory[] = [
  {
    title: 'Design Systems',
    projects: [
      {
        id: '1',
        number: '001',
        tag: 'React',
        title: 'DesignSystems Hub',
        description: 'Индустриальная дизайн-система с компонентами для сложных интерфейсов',
        tech: ['React', 'TypeScript', 'Framer Motion'],
        link: '#',
        demo: 'https://demo.example.com',
        repo: 'https://github.com/Sts8987/designsystems-hub',
        fullDescription: 'Полнофункциональная дизайн-система, созданная для использования в enterprise приложениях. Включает более 50 готовых компонентов, полную документацию и примеры использования. Система поддерживает темизацию и локализацию.',
        challenge: 'Создать масштабируемую дизайн-систему для разных продуктов компании с едиными стандартами',
        solution: 'Разработал модульную архитектуру компонентов с использованием Composition API, создал Storybook для документации, внедрил CI/CD для автоматического тестирования',
        results: ['Уменьшение времени разработки на 40%', 'Единый стиль UI across 5 продуктов', 'Команда из 10+ дизайнеров использует систему']
      },
      {
        id: '2',
        number: '002',
        tag: 'Design',
        title: 'DS Reference',
        description: 'Справочник по дизайн-системам и паттернам UI',
        tech: ['Documentation', 'UI Patterns', 'Markdown'],
        link: '#',
        repo: 'https://github.com/Sts8987/ds-reference'
      },
      {
        id: '3',
        number: '003',
        tag: 'Tool',
        title: 'Color Picker Panel',
        description: 'Панель для выбора и генерации цветовых палитр',
        tech: ['Colors', 'Palette', 'TypeScript'],
        link: '#',
        demo: 'https://demo.example.com',
        repo: 'https://github.com/Sts8987/color-picker'
      }
    ]
  },
  {
    title: 'UI Tools',
    projects: [
      {
        id: '4',
        number: '004',
        tag: 'Comparison',
        title: 'UI Library Compare',
        description: 'Сравнительный обзор UI библиотек для React',
        tech: ['React', 'V0app', 'Comparison'],
        link: '#',
        demo: 'https://demo.example.com',
        repo: 'https://github.com/Sts8987/ui-lib-compare'
      },
      {
        id: '5',
        number: '005',
        tag: 'Matrix',
        title: 'UI Matrix',
        description: 'Матрица UI компонентов и паттернов',
        tech: ['Components', 'Patterns', 'Grid'],
        link: '#',
        repo: 'https://github.com/Sts8987/ui-matrix'
      },
      {
        id: '6',
        number: '006',
        tag: 'Template',
        title: 'Radix Template',
        description: 'Шаблон на базе Radix UI для быстрого старта',
        tech: ['Radix UI', 'Template', 'Next.js'],
        link: '#',
        demo: 'https://demo.example.com',
        repo: 'https://github.com/Sts8987/radix-template'
      }
    ]
  },
  {
    title: 'Applications',
    projects: [
      {
        id: '7',
        number: '007',
        tag: 'App',
        title: 'Notes App',
        description: 'Приложение для заметок с современным интерфейсом',
        tech: ['React', 'State Management', 'LocalStorage'],
        link: '#',
        demo: 'https://demo.example.com',
        repo: 'https://github.com/Sts8987/notes-app'
      },
      {
        id: '8',
        number: '008',
        tag: 'Example',
        title: 'Design System App',
        description: 'Пример приложения с дизайн-системой (Bun + React)',
        tech: ['Bun', 'React', 'TypeScript'],
        link: '#',
        repo: 'https://github.com/Sts8987/ds-app'
      },
      {
        id: '9',
        number: '009',
        tag: 'Portfolio',
        title: 'Dev.Studio Portfolio',
        description: 'Портфолио разработчика с современным дизайном',
        tech: ['Portfolio', 'Showcase', 'Next.js'],
        link: '#',
        demo: 'https://demo.example.com',
        repo: 'https://github.com/Sts8987/portfolio'
      }
    ]
  },
  {
    title: 'Ресурсы',
    projects: [
      {
        id: '10',
        number: '010',
        tag: 'Guide',
        title: 'UI Stack Guide',
        description: 'Руководство по выбору технологического стека для UI',
        tech: ['Guide', 'Documentation', 'Tutorial'],
        link: '#',
        repo: 'https://github.com/Sts8987/ui-stack-guide'
      },
      {
        id: '11',
        number: '011',
        tag: 'Docs',
        title: 'JavaScript/TypeScript',
        description: 'Материалы по JavaScript и TypeScript',
        tech: ['JavaScript', 'TypeScript', 'Learning'],
        link: '#',
        repo: 'https://github.com/Sts8987/js-ts-materials'
      }
    ]
  }
]

export function Projects() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const categories = ['All', ...projectCategories.map(cat => cat.title)]

  const filteredProjects = useMemo(() => {
    let projects: Project[] = []

    if (selectedCategory === 'All') {
      projects = projectCategories.flatMap(cat => cat.projects)
    } else {
      const category = projectCategories.find(cat => cat.title === selectedCategory)
      projects = category ? category.projects : []
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      projects = projects.filter(project =>
        project.title.toLowerCase().includes(query) ||
        project.tech.some(tech => tech.toLowerCase().includes(query))
      )
    }

    return projects
  }, [selectedCategory, searchQuery])

  return (
    <section id="projects" className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
      {/* Section Header */}
      <motion.div
        className="flex items-center gap-8 mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span className="font-mono text-xl text-indigo-500 font-bold">02</span>
        <h2 className="font-mono text-2xl font-bold uppercase tracking-[0.1em]">ПРОЕКТЫ</h2>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-neutral-700 to-transparent" />
      </motion.div>

      {/* Filter Buttons */}
      <motion.div
        className="flex flex-wrap gap-3 mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 font-mono text-sm rounded-lg transition-all ${
              selectedCategory === category
                ? 'bg-indigo-600 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
            }`}
          >
            {category}
          </button>
        ))}
      </motion.div>

      {/* Search Bar */}
      <motion.div
        className="mb-8 relative max-w-md"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Поиск по названию или технологиям..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </motion.div>

      {/* Results Count */}
      <motion.div
        className="mb-6 font-mono text-sm text-neutral-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Найдено: {filteredProjects.length} {filteredProjects.length === 1 ? 'проект' : filteredProjects.length > 1 && filteredProjects.length < 5 ? 'проекта' : 'проектов'}
      </motion.div>

      {/* Projects Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onProjectClick={setSelectedProject}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* No Results */}
      {filteredProjects.length === 0 && (
        <motion.div
          className="text-center py-12 text-neutral-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="font-mono text-lg">Проекты не найдены</p>
          <p className="text-sm mt-2">Попробуйте изменить фильтр или поисковый запрос</p>
        </motion.div>
      )}

      {/* Project Details Modal */}
      <ProjectDetailsModal
        project={selectedProject}
        isOpen={selectedProject !== null}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  )
}

function ProjectCard({ project, onProjectClick }: { project: Project; onProjectClick: (project: Project) => void }) {
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    setRotateX((y - centerY) / 20)
    setRotateY((centerX - x) / 20)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  const handleClick = () => {
    onProjectClick(project)
  }

  return (
    <motion.article
      className="project-card bg-neutral-900 border border-neutral-800 p-6 relative overflow-hidden cursor-pointer group"
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      onClick={handleClick}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`,
        transition: 'transform 0.1s ease-out, box-shadow 0.3s ease, border-color 0.3s ease'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{
        borderColor: 'rgb(51, 51, 51)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* Left Border Accent */}
      <div className="absolute left-0 top-0 w-[3px] h-0 bg-indigo-500 transition-all duration-300 group-hover:h-full" />

      {/* Card Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="font-mono text-xs text-neutral-600">{project.number}</span>
        <span className="font-mono text-[10px] text-indigo-500 bg-indigo-500/10 px-2 py-1 uppercase tracking-[0.1em]">
          {project.tag}
        </span>
      </div>

      {/* Card Title */}
      <h4 className="text-xl font-semibold mb-2 text-white">{project.title}</h4>

      {/* Card Description */}
      <p className="text-neutral-400 text-sm leading-relaxed mb-4">{project.description}</p>

      {/* Tech Stack */}
      <div className="flex flex-wrap gap-2 mb-4">
        {project.tech.map((tech) => (
          <span
            key={tech}
            className="font-mono text-xs text-neutral-500 bg-neutral-800 px-2 py-1 border border-neutral-700"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Links */}
      <div className="flex gap-2 mt-auto">
        {project.demo && (
          <a
            href={project.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 text-indigo-500 font-mono text-sm bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-2 rounded transition-all"
          >
            <span>Demo</span>
            <ArrowUpRight size={16} />
          </a>
        )}
        {project.repo && (
          <a
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 inline-flex items-center justify-center gap-2 text-white font-mono text-sm bg-neutral-700 hover:bg-neutral-600 px-3 py-2 rounded transition-all ${!project.demo ? 'w-full' : ''}`}
          >
            <span>Repo</span>
            <ArrowUpRight size={16} />
          </a>
        )}
      </div>
    </motion.article>
  )
}
