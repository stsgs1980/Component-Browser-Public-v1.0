// Project: Portfolio-Conversion
// Category: components
// Source: showcases\Portfolio-Conversion\src\components
// Lines: 173

'use client'

import { useState, useEffect } from 'react'
import { Menu, X, Play } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

interface NavigationProps {
  onPresentationModeToggle?: () => void
}

export function Navigation({ onPresentationModeToggle }: NavigationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [activeSection, setActiveSection] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    let lastScroll = 0

    const handleScroll = () => {
      const currentScroll = window.pageYOffset

      // Hide nav when scrolling down, show when scrolling up
      if (currentScroll > lastScroll && currentScroll > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }

      lastScroll = currentScroll

      // Update active section
      const sections = document.querySelectorAll('section[id]')
      const scrollY = window.pageYOffset

      sections.forEach((section) => {
        const sectionHeight = section.offsetHeight
        const sectionTop = section.offsetTop - 100
        const sectionId = section.getAttribute('id')

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          setActiveSection(sectionId || '')
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault()
    const target = document.querySelector(sectionId)
    if (target) {
      const navHeight = 80
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight
      window.scrollTo({ top: targetPosition, behavior: 'smooth' })
      setIsMobileMenuOpen(false)
    }
  }

  const navLinks = [
    { href: '#projects', label: 'Проекты' },
    { href: '#experience', label: 'Опыт' },
    { href: '#skills', label: 'Навыки' },
    { href: '#contact', label: 'Контакты' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[1000] bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Brand */}
        <div className="font-mono text-sm font-medium tracking-wider">
          <span className="text-indigo-500">&lt;</span>
          <span className="text-white">PORTFOLIO</span>
          <span className="text-indigo-500">/&gt;</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => scrollToSection(e, link.href)}
              className={`text-sm font-medium uppercase tracking-[0.1em] transition-colors relative ${
                activeSection === link.href.slice(1)
                  ? 'text-indigo-500'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {link.label}
              {activeSection === link.href.slice(1) && (
                <span className="absolute bottom-[-4px] left-0 w-full h-[1px] bg-indigo-500" />
              )}
            </a>
          ))}

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Presentation Mode Button */}
            {onPresentationModeToggle && (
              <button
                onClick={onPresentationModeToggle}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 text-indigo-500 hover:bg-indigo-600 hover:text-white rounded-lg transition-all text-sm font-medium"
                aria-label="Start presentation mode"
              >
                <Play size={14} />
                <span className="hidden lg:inline">Презентация</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-neutral-400 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800">
          <div className="px-4 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className={`text-sm font-medium uppercase tracking-[0.1em] transition-colors py-2 ${
                  activeSection === link.href.slice(1)
                    ? 'text-indigo-500'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {link.label}
              </a>
            ))}
            
            {/* Mobile Right Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-neutral-800">
              <ThemeToggle />
              
              {onPresentationModeToggle && (
                <button
                  onClick={() => {
                    onPresentationModeToggle()
                    setIsMobileMenuOpen(false)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 text-indigo-500 hover:bg-indigo-600 hover:text-white rounded-lg transition-all text-sm font-medium flex-1"
                >
                  <Play size={14} />
                  <span>Презентация</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
