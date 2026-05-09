// Project: Portfolio-Conversion
// Category: components
// Source: showcases\Portfolio-Conversion\src\components
// Lines: 228

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Github, Code, Rocket, CheckCircle } from 'lucide-react'

interface Project {
  id: number
  title: string
  category: string
  description: string
  technologies: string[]
  image?: string
  demoUrl?: string
  repoUrl?: string
  challenge?: string
  solution?: string
  result?: string
  features?: string[]
}

interface ProjectDetailsModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
}

export function ProjectDetailsModal({ project, isOpen, onClose }: ProjectDetailsModalProps) {
  if (!project) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Content */}
          <motion.div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-neutral-900/95 backdrop-blur border-b border-neutral-800 px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span className="inline-block px-3 py-1 text-xs font-mono font-medium text-indigo-400 bg-indigo-500/10 rounded-full mb-2">
                    {project.category}
                  </span>
                  <h2 className="text-2xl font-mono font-bold text-white">{project.title}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
              {/* Links */}
              <div className="flex gap-4 mb-8">
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                  >
                    <ExternalLink size={16} />
                    Live Demo
                  </a>
                )}
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
                  >
                    <Github size={16} />
                    Repository
                  </a>
                )}
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="font-mono text-lg font-semibold text-white mb-3">Описание</h3>
                <p className="text-neutral-400 leading-relaxed">{project.description}</p>
              </div>

              {/* Challenge / Solution / Result */}
              {(project.challenge || project.solution || project.result) && (
                <div className="grid gap-6 mb-8 md:grid-cols-3">
                  {project.challenge && (
                    <motion.div
                      className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-5"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-amber-500/20 rounded-lg">
                          <Code className="text-amber-500" size={20} />
                        </div>
                        <h4 className="font-mono text-sm font-semibold text-white">Challenge</h4>
                      </div>
                      <p className="text-sm text-neutral-400 leading-relaxed">{project.challenge}</p>
                    </motion.div>
                  )}

                  {project.solution && (
                    <motion.div
                      className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-5"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                          <Rocket className="text-indigo-500" size={20} />
                        </div>
                        <h4 className="font-mono text-sm font-semibold text-white">Solution</h4>
                      </div>
                      <p className="text-sm text-neutral-400 leading-relaxed">{project.solution}</p>
                    </motion.div>
                  )}

                  {project.result && (
                    <motion.div
                      className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-5"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <CheckCircle className="text-green-500" size={20} />
                        </div>
                        <h4 className="font-mono text-sm font-semibold text-white">Result</h4>
                      </div>
                      <p className="text-sm text-neutral-400 leading-relaxed">{project.result}</p>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Features */}
              {project.features && project.features.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-mono text-lg font-semibold text-white mb-4">Ключевые функции</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {project.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-neutral-800/30 border border-neutral-700/50 rounded-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          <CheckCircle className="text-indigo-500" size={16} />
                        </div>
                        <span className="text-sm text-neutral-300">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technologies */}
              <div className="mb-8">
                <h3 className="font-mono text-lg font-semibold text-white mb-4">Технологический стек</h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, index) => (
                    <motion.span
                      key={index}
                      className="px-3 py-1.5 text-sm font-mono text-neutral-300 bg-neutral-800 border border-neutral-700 rounded-lg"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      whileHover={{ scale: 1.05, borderColor: 'rgb(99, 102, 241)' }}
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Screenshot Gallery */}
              {project.image && (
                <div>
                  <h3 className="font-mono text-lg font-semibold text-white mb-4">Галерея</h3>
                  <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg overflow-hidden">
                    <img
                      src={project.image}
                      alt={`${project.title} screenshot`}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
