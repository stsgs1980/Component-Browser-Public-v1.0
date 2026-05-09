'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, RotateCcw, Trophy, ArrowRight, Sparkles } from 'lucide-react'

export interface Question {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  technique: string
}

interface QuickQuizProps {
  questions?: Question[]
}

function getScoreEmoji(score: number, total: number): { emoji: string; label: string; color: string } {
  const ratio = total > 0 ? score / total : 0
  if (ratio === 1) return { emoji: '', label: 'Отлично! Вы эксперт!', color: 'text-amber-500' }
  if (ratio >= 0.8) return { emoji: '', label: 'Отлично! Почти идеально!', color: 'text-emerald-500' }
  if (ratio >= 0.6) return { emoji: '', label: 'Хорошо! Есть над чем поработать', color: 'text-cyan-500' }
  if (ratio >= 0.4) return { emoji: '', label: 'Неплохо, но стоит повторить', color: 'text-amber-500' }
  return { emoji: '', label: 'Рекомендуем пройти материал заново', color: 'text-rose-500' }
}

export default function QuickQuiz({ questions = [] }: QuickQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null))

  const question = questions[currentQuestion]
  const progress = questions.length > 0
    ? ((currentQuestion + (isAnswered ? 1 : 0)) / questions.length) * 100
    : 0

  const handleAnswer = (index: number) => {
    if (isAnswered) return
    setSelectedAnswer(index)
    setIsAnswered(true)
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = index
    setAnswers(newAnswers)
    if (index === question.correctIndex) {
      setScore(s => s + 1)
    }
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(c => c + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
    } else {
      setIsFinished(true)
    }
  }

  const handleReset = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setIsAnswered(false)
    setScore(0)
    setIsFinished(false)
    setAnswers(Array(questions.length).fill(null))
  }

  const scoreResult = getScoreEmoji(score, questions.length)

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-muted-foreground">No questions provided.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Вопрос {isFinished ? questions.length : currentQuestion + 1} из {questions.length}
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs tabular-nums">
              {score} / {questions.length}
            </Badge>
          </div>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
            animate={{ width: `${isFinished ? 100 : progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        {/* Question dots */}
        <div className="flex gap-1.5">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                i === currentQuestion && !isFinished
                  ? 'bg-primary'
                  : answers[i] !== null
                    ? answers[i] === questions[i].correctIndex
                      ? 'bg-emerald-500'
                      : 'bg-red-500'
                    : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isFinished ? (
          <motion.div
            key={`q-${currentQuestion}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-dashed">
              <CardHeader>
                <CardTitle className="flex items-start gap-3 text-lg leading-snug">
                  <Sparkles className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  {question.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2">
                  {question.options.map((option, i) => {
                    const isSelected = selectedAnswer === i
                    const isCorrect = question.correctIndex === i
                    const showResult = isAnswered

                    return (
                      <motion.button
                        key={i}
                        onClick={() => handleAnswer(i)}
                        whileHover={!isAnswered ? { scale: 1.01, y: -1 } : {}}
                        whileTap={!isAnswered ? { scale: 0.99 } : {}}
                        className={`w-full text-left p-3 rounded-lg border text-sm transition-all duration-200 flex items-start gap-3 ${
                          showResult && isCorrect
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                            : showResult && isSelected && !isCorrect
                              ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                              : isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-muted hover:border-primary/40 hover:bg-muted/30'
                        } ${!isAnswered ? 'cursor-pointer' : 'cursor-default'}`}
                      >
                        <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                          showResult && isCorrect
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : showResult && isSelected && !isCorrect
                              ? 'border-red-500 bg-red-500 text-white'
                              : isSelected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-muted-foreground/30 text-muted-foreground'
                        }`}>
                          {showResult && isCorrect ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : showResult && isSelected && !isCorrect ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            String.fromCharCode(65 + i)
                          )}
                        </div>
                        <span className="flex-1 pt-0.5">{option}</span>
                      </motion.button>
                    )
                  })}
                </div>

                {/* Explanation */}
                <AnimatePresence>
                  {isAnswered && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className={`p-3 rounded-lg text-sm border ${
                        selectedAnswer === question.correctIndex
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          {selectedAnswer === question.correctIndex ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-amber-500" />
                          )}
                          <span className="font-medium text-xs">
                            {selectedAnswer === question.correctIndex ? 'Правильно!' : 'Неверно'}
                          </span>
                          <Badge variant="secondary" className="micro-text ml-auto">{question.technique}</Badge>
                        </div>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                          {question.explanation}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Next button */}
                <AnimatePresence>
                  {isAnswered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-end"
                    >
                      <Button onClick={handleNext} className="gap-2">
                        {currentQuestion < questions.length - 1 ? (
                          <>Следующий вопрос <ArrowRight className="h-4 w-4" /></>
                        ) : (
                          <>Результат <Trophy className="h-4 w-4" /></>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* Final Score */
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-2 border-primary/20 dark:border-primary/10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-amber-500/5 pointer-events-none" />
              <CardContent className="pt-8 pb-8 relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="text-6xl"
                  >
                    {scoreResult.emoji}
                  </motion.div>
                  <h3 className={`text-2xl font-bold ${scoreResult.color}`}>
                    {score} из {questions.length}
                  </h3>
                  <p className="text-muted-foreground text-sm">{scoreResult.label}</p>

                  {/* Score visualization */}
                  <div className="w-full max-w-xs space-y-2 mt-2">
                    <div className="flex gap-2 justify-center">
                      {questions.map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', delay: 0.4 + i * 0.1 }}
                        >
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            answers[i] === questions[i].correctIndex
                              ? 'bg-emerald-500 text-white'
                              : 'bg-red-500 text-white'
                          }`}>
                            {answers[i] === questions[i].correctIndex ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Technique breakdown */}
                  <div className="w-full max-w-md mt-4">
                    <h4 className="text-sm font-medium mb-2">Результаты по темам:</h4>
                    <div className="space-y-1">
                      {questions.map((q, i) => (
                        <div key={i} className="flex items-center justify-between text-xs px-2 py-1 rounded">
                          <span className="text-muted-foreground">{q.technique}</span>
                          {answers[i] === q.correctIndex ? (
                            <Badge variant="secondary" className="micro-text bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0">Верно</Badge>
                          ) : (
                            <Badge variant="secondary" className="micro-text bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-0">Неверно</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleReset} variant="outline" className="gap-2 mt-4">
                    <RotateCcw className="h-4 w-4" />
                    Пройти заново
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
