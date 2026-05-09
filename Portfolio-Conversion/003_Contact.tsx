// Project: Portfolio-Conversion
// Category: components
// Source: showcases\Portfolio-Conversion\src\components
// Lines: 75

'use client'

import { motion } from 'framer-motion'
import { Mail, Github } from 'lucide-react'

export function Contact() {
  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto text-center">
      {/* Section Header */}
      <motion.div
        className="flex items-center gap-8 mb-16 justify-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span className="font-mono text-xl text-indigo-500 font-bold">04</span>
        <h2 className="font-mono text-2xl font-bold uppercase tracking-[0.1em]">КОНТАКТЫ</h2>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-neutral-700 to-transparent max-w-[200px]" />
      </motion.div>

      {/* Contact Content */}
      <motion.div
        className="max-w-[600px] mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <p className="text-xl text-neutral-400 mb-12">
          Открыт для новых проектов и коллабораций
        </p>

        {/* Contact Links */}
        <div className="flex justify-center gap-6 flex-wrap">
          <ContactLink
            href="mailto:hello@portfolio.com"
            icon={<Mail size={20} />}
            label="Email"
          />
          <ContactLink
            href="https://github.com"
            icon={<Github size={20} />}
            label="GitHub"
          />
        </div>
      </motion.div>
    </section>
  )
}

function ContactLink({
  href,
  icon,
  label
}: {
  href: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <motion.a
      href={href}
      className="flex items-center gap-2 px-6 py-4 bg-neutral-900 border border-neutral-800 text-white text-sm transition-all hover:border-indigo-500 hover:text-indigo-500"
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {icon}
      <span>{label}</span>
    </motion.a>
  )
}
