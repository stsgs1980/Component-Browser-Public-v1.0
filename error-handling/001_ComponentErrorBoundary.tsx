'use client'

import { Component, Suspense, type ReactNode, type ErrorInfo } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

/*  Error Boundary for lazy-loaded components (catches ChunkLoadError)  */
interface EBState { hasError: boolean; error: Error | null }
export class ComponentErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, EBState> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, error }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('[ErrorBoundary] Chunk failed to load:', error.message, info.componentStack)
  }
  handleRetry = () => {
    this.setState({ hasError: false, error: null })
    // Force re-render by remounting the lazy component
    window.location.reload()
  }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
          </div>
          <div className="space-y-1">
            <h3 className="heading-card-sm">Компонент не загрузился</h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              Модуль не удалось загрузить. Попробуйте перезагрузить страницу.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={this.handleRetry} className="gap-2 text-xs">
            <RotateCcw className="h-3 w-3" />
            Перезагрузить
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}

export function SafeLazy({ children }: { children: ReactNode }) {
  return (
    <ComponentErrorBoundary>
      <Suspense fallback={<TabFallback />}>
        {children}
      </Suspense>
    </ComponentErrorBoundary>
  )
}

/*  Suspense fallback for lazy-loaded tabs  */
export function TabFallback() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <span className="text-sm text-muted-foreground">Загрузка...</span>
      </div>
    </div>
  )
}
