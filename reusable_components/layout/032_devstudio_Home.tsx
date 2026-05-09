// Project: DS Reference
// Category: app
// Source: design-systems\DS Reference\src\app
// Lines: 48

'use client'

import { AppLayout } from '@/components/layout'
import { PageTransition } from '@/components/common/AnimatedComponents'
import {
  HomeSection,
  AcademySection,
  SystemsSection,
  FoundationsSection,
  ComponentsSection,
  PatternsSection,
  PrinciplesSection,
  TechnologiesSection,
  LibrariesSection,
  ComparisonSection,
  DeveloperGuideSection,
  ResourcesSection
} from '@/components/sections'
import { useNavigationStore } from '@/store/navigation'

const sectionComponents: Record<string, React.ComponentType> = {
  home: HomeSection,
  academy: AcademySection,
  systems: SystemsSection,
  foundations: FoundationsSection,
  components: ComponentsSection,
  patterns: PatternsSection,
  principles: PrinciplesSection,
  technologies: TechnologiesSection,
  libraries: LibrariesSection,
  comparison: ComparisonSection,
  'developer-guide': DeveloperGuideSection,
  resources: ResourcesSection
}

export default function Home() {
  const { activeSection } = useNavigationStore()
  const SectionComponent = sectionComponents[activeSection] || HomeSection

  return (
    <AppLayout>
      <PageTransition key={activeSection}>
        <SectionComponent />
      </PageTransition>
    </AppLayout>
  )
}
