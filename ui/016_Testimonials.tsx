// Project: Portfolio-Conversion
// Category: components
// Source: showcases\Portfolio-Conversion\src\components
// Lines: 160

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'

interface Testimonial {
  id: string
  name: string
  position: string
  company: string
  content: string
  avatar: string
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Алексей Петров',
    position: 'CTO',
    company: 'Tech Solutions Inc.',
    content: 'Превосходный разработчик с глубоким пониманием современных технологий. Быстро адаптируется к новым задачам и всегда предлагает оптимальные решения.',
    avatar: 'AP'
  },
  {
    id: '2',
    name: 'Мария Иванова',
    position: 'Product Manager',
    company: 'Digital Agency Pro',
    content: 'Работал с нами над несколькими проектами. Всегда delivers на время, код чистый и хорошо документированный. Рекомендую!',
    avatar: 'MI'
  },
  {
    id: '3',
    name: 'Дмитрий Сидоров',
    position: 'Team Lead',
    company: 'Startup Hub',
    content: 'Отличный teammate, умеет работать в команде и менторить младших разработчиков. Код высокого качества, следит за best practices.',
    avatar: 'DS'
  }
]

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const testimonial = testimonials[currentIndex]

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto bg-neutral-900/50">
      {/* Section Header */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span className="font-mono text-sm text-indigo-500 uppercase tracking-wider">
          Отзывы
        </span>
        <h2 className="font-mono text-3xl font-bold text-white mt-2">
          Что говорят коллеги
        </h2>
      </motion.div>

      {/* Testimonials Carousel */}
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          {/* Testimonial Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-8 md:p-12"
            >
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Quote Icon */}
                <div className="hidden md:flex flex-shrink-0">
                  <Quote size={48} className="text-indigo-500/20" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  {/* Quote */}
                  <p className="text-lg text-neutral-300 leading-relaxed mb-6 italic">
                    "{testimonial.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-mono font-bold text-lg">
                      {testimonial.avatar}
                    </div>

                    {/* Info */}
                    <div>
                      <h4 className="font-mono text-white font-semibold">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-neutral-500">
                        {testimonial.position} at {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="p-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextTestimonial}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-indigo-500 w-6'
                    : 'bg-neutral-700 hover:bg-neutral-600'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
