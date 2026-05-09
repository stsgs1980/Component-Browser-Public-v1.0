'use client'

import { useMemo } from 'react'

/**
 * useWeightedScorer — multi-question weighted scoring engine for recommendation wizards.
 *
 * Source: LLM-MEM-GUIDE /src/components/tools/Recommender.tsx (scoring logic)
 * De-hardcoded:
 *   - Generic types: Question<Option>, ScoreConfig, ScoredResult
 *   - Configurable scoring matrix via SCORING param
 *   - Percentage normalization algorithm
 *
 * @example
 * const scoring = {
 *   project_type: {
 *     chatbot: { sliding_window: 3, rag: 2 },
 *     assistant: { summarization: 4, rag: 3 },
 *   },
 * }
 * const results = useWeightedScorer(answers, scoring, techniqueIds, techniqueMeta)
 */

export interface OptionDef {
  label: string
  value: string
  description?: string
}

export interface QuestionDef {
  id: string
  title: string
  options: OptionDef[]
}

export interface ScoredResult<T = string> {
  id: T
  /** Display name */
  name: string
  /** Raw accumulated score */
  score: number
  /** Maximum possible score */
  maxScore: number
  /** Percentage match (0-100) */
  percent: number
  /** Optional metadata */
  meta?: Record<string, unknown>
  /** Optional icon */
  icon?: React.ElementType
}

interface UseWeightedScorerOptions<T extends string> {
  /** User answers: { questionId: selectedOptionValue } */
  answers: Record<string, string>
  /** Scoring matrix: scoring[questionId][optionValue][itemId] = score */
  scoring: Record<string, Record<string, Record<T, number>>>
  /** Item IDs to score */
  itemIds: T[]
  /** Metadata per item: { [itemId]: { name, ... } } */
  itemMeta?: Record<T, { name: string; [key: string]: unknown }>
}

export function useWeightedScorer<T extends string>({
  answers,
  scoring,
  itemIds,
  itemMeta,
}: UseWeightedScorerOptions<T>): ScoredResult<T>[] {
  return useMemo(() => {
    if (Object.keys(answers).length === 0) return []

    const scored = itemIds.map((id) => {
      let score = 0
      let maxScore = 0

      Object.entries(answers).forEach(([qId, aValue]) => {
        const questionScores = scoring[qId]?.[aValue]
        if (questionScores) {
          score += questionScores[id] ?? 0
          maxScore += Math.max(...Object.values(questionScores))
        }
      })

      const meta = itemMeta?.[id]

      return {
        id,
        name: (meta as { name?: string })?.name ?? id,
        score,
        maxScore,
        percent: maxScore > 0 ? (score / maxScore) * 100 : 0,
        meta,
        icon: (meta as { icon?: React.ElementType })?.icon,
      }
    })

    return scored.sort((a, b) => b.score - a.score)
  }, [answers, scoring, itemIds, itemMeta])
}
