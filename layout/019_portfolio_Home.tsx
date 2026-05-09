// Project: Portfolio-Conversion
// Category: app
// Source: showcases\Portfolio-Conversion\src\app
// Lines: 53

'use client'

import { useState } from 'react'
import { CursorEffect } from '@/components/CursorEffect'
import { Navigation } from '@/components/Navigation'
import { Hero } from '@/components/Hero'
import { PageLoader } from '@/components/PageLoader'
import { Statistics } from '@/components/Statistics'
import { Projects } from '@/components/Projects'
import { HowIWork } from '@/components/HowIWork'
import { Experience } from '@/components/Experience'
import { Testimonials } from '@/components/Testimonials'
import { Skills } from '@/components/Skills'
import { SkillsRadar } from '@/components/SkillsRadar'
import { GitHubActivityGraph } from '@/components/GitHubActivityGraph'
import { Contact } from '@/components/Contact'
import { Footer } from '@/components/Footer'
import { BackToTop } from '@/components/BackToTop'
import { PresentationMode } from '@/components/PresentationMode'

export default function Home() {
  const [isPresentationMode, setIsPresentationMode] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-white">
      <PageLoader />
      <CursorEffect />
      <Navigation onPresentationModeToggle={() => setIsPresentationMode(true)} />

      <main className="flex-1">
        <Hero />
        <Statistics />
        <HowIWork />
        <Projects />
        <Experience />
        <Testimonials />
        <SkillsRadar />
        <Skills />
        <GitHubActivityGraph />
        <Contact />
      </main>

      <Footer />
      <BackToTop />

      {/* Presentation Mode Overlay */}
      {isPresentationMode && (
        <PresentationMode onExit={() => setIsPresentationMode(false)} />
      )}
    </div>
  )
}
