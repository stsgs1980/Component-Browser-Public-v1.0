'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GitBranch, ArrowRight, RotateCcw, Sparkles, CheckCircle2 } from 'lucide-react'

export interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
  isLeaf?: boolean
  recommendation?: {
    technique: string
    description: string
    color: string
    savings: string
    complexity: string
  }
}

interface DecisionTreeProps {
  tree: TreeNode
}

export default function DecisionTree({ tree }: DecisionTreeProps) {
  const [selectedPath, setSelectedPath] = useState<string[]>([])
  const [currentNode, setCurrentNode] = useState<TreeNode>(tree)

  const isOnPath = (nodeId: string) => selectedPath.includes(nodeId)
  const isCurrent = (nodeId: string) => selectedPath[selectedPath.length - 1] === nodeId

  const handleSelect = (node: TreeNode) => {
    const newPath = [...selectedPath, node.id]
    setSelectedPath(newPath)
    setCurrentNode(node)
  }

  const handleReset = () => {
    setSelectedPath([])
    setCurrentNode(tree)
  }

  const activeRecommendation = currentNode?.recommendation

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <GitBranch className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Дерево решений</h3>
              <p className="text-sm text-muted-foreground">
                Ответьте на несколько вопросов, и мы подберём оптимальный вариант для вашего сценария.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tree Visualization */}
      <Card className="border-2 border-dashed">
        <CardContent className="pt-6">
          {/* Path breadcrumb */}
          {selectedPath.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 flex-wrap text-sm">
                <Badge variant="outline" className="text-xs">Старт</Badge>
                {selectedPath.map((nodeId, i) => {
                  const node = findNodeById(tree, nodeId)
                  return (
                    <div key={nodeId} className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          i === selectedPath.length - 1
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {node?.label}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Current question or result */}
          <AnimateCurrentNode
            key={currentNode.id}
            node={currentNode}
            onSelect={handleSelect}
            isOnPath={isOnPath}
            isCurrent={isCurrent}
          />

          {/* Recommendation Card */}
          {activeRecommendation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-6"
            >
              <Card className={`border-2 ${activeRecommendation.color}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    Рекомендация: {activeRecommendation.technique}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {activeRecommendation.description}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-background/50 rounded-lg p-3 text-center">
                      <div className="text-xs text-muted-foreground mb-1">Экономия</div>
                      <div className="text-lg font-bold text-emerald-600">{activeRecommendation.savings}</div>
                    </div>
                    <div className="bg-background/50 rounded-lg p-3 text-center">
                      <div className="text-xs text-muted-foreground mb-1">Сложность</div>
                      <div className="text-lg">{activeRecommendation.complexity}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center mt-4">
                <Button onClick={handleReset} variant="outline" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Начать заново
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/*  Animated current node renderer  */
function AnimateCurrentNode({
  node,
  onSelect,
  isOnPath,
  isCurrent,
}: {
  node: TreeNode
  onSelect: (node: TreeNode) => void
  isOnPath: (id: string) => boolean
  isCurrent: (id: string) => boolean
}) {
  const isLeaf = node.isLeaf || !!node.recommendation

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Question */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span className="font-medium text-sm">{node.label}</span>
        </div>
      </div>

      {/* Options */}
      {!isLeaf && node.children && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
          {node.children.map((child) => {
            const onPath = isOnPath(child.id)
            const isChildLeaf = child.isLeaf || !!child.recommendation

            return (
              <motion.button
                key={child.id}
                onClick={() => onSelect(child)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`text-left p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                  onPath
                    ? 'border-primary bg-primary/5'
                    : isChildLeaf
                      ? 'border-muted hover:border-primary/40 hover:bg-muted/30'
                      : 'border-muted hover:border-primary/40 hover:bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium flex-1">{child.label}</span>
                  {isChildLeaf && (
                    <Badge variant="secondary" className="micro-text">Результат</Badge>
                  )}
                  {!isChildLeaf && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                {!isChildLeaf && child.children && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {child.children.length} варианта
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

/*  Find node by ID in tree  */
export function findNodeById(node: TreeNode, id: string): TreeNode | undefined {
  if (node.id === id) return node
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, id)
      if (found) return found
    }
  }
  return undefined
}
