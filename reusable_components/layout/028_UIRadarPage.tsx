// Project: UI RADAR
// Category: app
// Source: design-systems\UI RADAR\src\app
// Lines: 974

"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Tabs from "@radix-ui/react-tabs";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  ChevronDown,
  Check,
  X,
  ExternalLink,
  Star,
  Zap,
  Palette,
  Code2,
  Layers,
  Filter,
  Target,
  Crown,
  Rocket,
  Package,
  Users,
  GraduationCap,
  Blocks,
  Layers2,
  Download,
  Compass,
  ArrowRight,
  Scale,
  Brain,
  Home,
  Sparkles,
  ChevronRight,
  ArrowLeftRight,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import DynamicBackground from "@/components/DynamicBackground";
import { cn } from "@/lib/utils";

// Import modularized data and components
import {
  UI_TOOLS,
  STACK_RECOMMENDATIONS,
  CATEGORY_CONFIG,
  LEARNING_PATH,
  TECH_RADAR_RINGS,
  TECH_RADAR_ITEMS,
  getToolById,
  getToolsByIds,
  getRadarInfo,
} from "@/data/ui-tools";

import {
  RadarChart,
  Sparkline,
  MiniSquaresRating,
  DifficultyMeter,
  BundleSizeBar,
  SecurityBadge,
  CompanyBadge,
  StatsVisualization,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui-radar";

import type { UITool, ToolCategory, StackRecommendation } from "@/types";

// ============================================================================
// Main Component
// ============================================================================

export default function UIRadarPage() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | "all">("all");
  const [selectedTool, setSelectedTool] = useState<UITool | null>(null);
  const [compareTools, setCompareTools] = useState<UITool[]>([]);
  const [showOnlyRecommended, setShowOnlyRecommended] = useState(false);
  const [showOnlyBeginner, setShowOnlyBeginner] = useState(false);
  
  // UI Selector State
  const [selectorProject, setSelectorProject] = useState<string>("");
  const [selectorTeam, setSelectorTeam] = useState<string>("");
  const [selectorExperience, setSelectorExperience] = useState<string>("");
  
  // UI Selector Recommendation Logic
  const getSelectorRecommendation = useMemo(() => {
    if (!selectorProject || !selectorTeam || !selectorExperience) return null;
    
    const recommendations: Record<string, { stack: string; reason: string; tools: string[] }> = {
      "spa-solo-beginner": { stack: "beginner-react", reason: "React + Shadcn — идеальный старт", tools: ["react", "tailwind", "shadcn", "lucide"] },
      "spa-solo-intermediate": { stack: "beginner-vue", reason: "Vue.js — проще для solo разработчика", tools: ["vue", "tailwind", "daisyui", "heroicons"] },
      "spa-small-beginner": { stack: "beginner-react", reason: "React — стандарт индустрии", tools: ["react", "tailwind", "shadcn", "lucide"] },
      "ssr-solo-beginner": { stack: "lightweight-svelte", reason: "SvelteKit — минимум кода", tools: ["sveltekit", "tailwind", "daisyui"] },
      "ssr-small-intermediate": { stack: "nextjs-production", reason: "Next.js — стандарт для SSR", tools: ["nextjs", "tailwind", "shadcn", "lucide"] },
      "ssr-enterprise-advanced": { stack: "nextjs-production", reason: "Next.js — enterprise стандарт", tools: ["nextjs", "tailwind", "shadcn", "framer-motion", "lucide"] },
      "landing-solo-beginner": { stack: "lightweight-svelte", reason: "SvelteKit — минимальный bundle", tools: ["sveltekit", "tailwind", "daisyui"] },
      "landing-solo-intermediate": { stack: "content-blog", reason: "Astro — Zero JS default", tools: ["astro", "tailwind", "lucide"] },
      "blog-solo-beginner": { stack: "content-blog", reason: "Astro — создан для контента", tools: ["astro", "tailwind", "lucide"] },
      "blog-small-intermediate": { stack: "content-blog", reason: "Astro — контент-first", tools: ["astro", "tailwind", "lucide"] },
      "ecommerce-small-intermediate": { stack: "nextjs-production", reason: "Next.js — SEO критично", tools: ["nextjs", "tailwind", "shadcn", "framer-motion", "lucide"] },
      "ecommerce-medium-advanced": { stack: "nextjs-production", reason: "Next.js — масштабируемость", tools: ["nextjs", "tailwind", "shadcn", "framer-motion", "lucide"] },
      "dashboard-solo-intermediate": { stack: "beginner-react", reason: "React + Shadcn — готовые компоненты", tools: ["react", "tailwind", "shadcn", "lucide"] },
      "dashboard-small-intermediate": { stack: "beginner-react", reason: "React + Mantine — 120+ компонентов", tools: ["react", "tailwind", "mantine", "lucide"] },
      "dashboard-enterprise-advanced": { stack: "nextjs-production", reason: "Next.js + Mantine — enterprise", tools: ["nextjs", "tailwind", "mantine", "framer-motion", "lucide"] },
    };
    
    const key = `${selectorProject}-${selectorTeam}-${selectorExperience}`;
    return recommendations[key] || { stack: "beginner-react", reason: "React + Tailwind — универсальный выбор", tools: ["react", "tailwind", "shadcn", "lucide"] };
  }, [selectorProject, selectorTeam, selectorExperience]);

  const filteredTools = useMemo(() => {
    let result = [...UI_TOOLS];
    if (selectedCategory !== "all") result = result.filter((t) => t.category === selectedCategory);
    if (showOnlyRecommended) result = result.filter((t) => t.recommended);
    if (showOnlyBeginner) result = result.filter((t) => t.beginnerFriendly);
    return result;
  }, [selectedCategory, showOnlyRecommended, showOnlyBeginner]);

  const toggleCompare = (tool: UITool) => {
    setCompareTools((prev) => (prev.find((t) => t.id === tool.id) ? prev.filter((t) => t.id !== tool.id) : prev.length < 3 ? [...prev, tool] : prev));
  };

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
  };

  return (
    <DynamicBackground variant="hero" intensity="high">
      <Tooltip.Provider delayDuration={200}>
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="border-b border-gray-800 bg-gray-950/90 backdrop-blur-xl sticky top-0 z-50">
            <div className="container mx-auto px-4">
              <div className="flex h-14 items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-9 h-9">
                    <svg viewBox="0 0 36 36" className="w-full h-full">
                      <defs>
                        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#d946ef" />
                        </linearGradient>
                      </defs>
                      <circle cx="18" cy="18" r="16" fill="none" stroke="url(#logoGrad)" strokeWidth="2" />
                      <circle cx="18" cy="18" r="10" fill="none" stroke="url(#logoGrad)" strokeWidth="1" opacity="0.5" />
                      <circle cx="18" cy="18" r="5" fill="none" stroke="url(#logoGrad)" strokeWidth="1" opacity="0.3" />
                      <path d="M18,18 L18,2 A16,16 0 0,1 32,18 Z" fill="url(#logoGrad)" opacity="0.3" />
                      <circle cx="18" cy="18" r="2" fill="url(#logoGrad)" />
                      <circle cx="24" cy="10" r="2.5" fill="#10b981" />
                    </svg>
                  </div>
                  <span className="font-bold text-white text-lg tracking-tight">UI Radar</span>
                </div>
                {compareTools.length > 0 && (
                  <Badge variant="info" className="cursor-pointer" onClick={() => setActiveTab("compare")}>
                    <ArrowLeftRight className="h-3 w-3 mr-1" />
                    Сравнить ({compareTools.length})
                  </Badge>
                )}
              </div>
            </div>
          </header>

          {/* Tabs Navigation */}
          <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <div className="container mx-auto px-4">
              <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
                <Tabs.List className="flex gap-2 py-3 overflow-x-auto">
                  {[
                    { value: "home", label: "Главная", icon: Home },
                    { value: "radar", label: "Инструменты", icon: Package },
                    { value: "tech-radar", label: "Tech Radar", icon: Target },
                    { value: "stacks", label: "Готовые стеки", icon: Blocks },
                    { value: "guide", label: "Путь обучения", icon: Compass },
                    { value: "compare", label: "Сравнение", icon: Scale },
                  ].map((tab) => (
                    <Tabs.Trigger 
                      key={tab.value} 
                      value={tab.value} 
                      className="px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 whitespace-nowrap text-gray-400 hover:text-white hover:bg-gray-800/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>
              </Tabs.Root>
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 container mx-auto px-4 py-6">
            <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              
              {/* Tab: Home */}
              <Tabs.Content value="home" className="space-y-8">
                {/* Hero Section */}
                <div className="text-center py-8">
                  <motion.div {...fadeInUp}>
                    <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-4">
                      <Sparkles className="h-4 w-4 text-violet-400" />
                      <span className="text-violet-300 text-sm">Выбери свой идеальный стек</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">UI Radar</h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-6">
                      Интерактивный гид по выбору инструментов для веб-разработки. 
                      Сравнивай фреймворки, библиотеки и собирай идеальный стек.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      <Button onClick={() => setActiveTab("radar")} className="gap-2">
                        <Target className="h-4 w-4" />
                        Исследовать инструменты
                      </Button>
                      <Button variant="outline" onClick={() => setActiveTab("guide")} className="gap-2">
                        <Compass className="h-4 w-4" />
                        Путь обучения
                      </Button>
                    </div>
                  </motion.div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Инструментов", value: UI_TOOLS.length, icon: Package, color: "violet" },
                    { label: "Готовых стеков", value: STACK_RECOMMENDATIONS.length, icon: Blocks, color: "fuchsia" },
                    { label: "Для новичков", value: UI_TOOLS.filter(t => t.beginnerFriendly).length, icon: GraduationCap, color: "emerald" },
                    { label: "Рекомендуемых", value: UI_TOOLS.filter(t => t.recommended).length, icon: Crown, color: "amber" },
                  ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                      <Card className="p-4 text-center">
                        <stat.icon className={cn("h-6 w-6 mx-auto mb-2", 
                          stat.color === "violet" ? "text-violet-400" :
                          stat.color === "fuchsia" ? "text-fuchsia-400" :
                          stat.color === "emerald" ? "text-emerald-400" : "text-amber-400"
                        )} />
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-gray-400 text-sm">{stat.label}</div>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Categories Overview */}
                <div className="space-y-4">
                  <motion.h2 
                    className="text-xl font-semibold text-white flex items-center gap-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                  >
                    <Layers2 className="h-5 w-5 text-violet-400" />
                    Категории инструментов
                  </motion.h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(CATEGORY_CONFIG).map(([key, config], i) => {
                      const count = UI_TOOLS.filter(t => t.category === key).length;
                      const Icon = config.icon;
                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + i * 0.05 }}
                        >
                          <Card 
                            className="p-4 cursor-pointer hover:border-violet-500/50 transition-colors"
                            onClick={() => {
                              setSelectedCategory(key as ToolCategory);
                              setActiveTab("radar");
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center", config.color)}>
                                <Icon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <div className="font-medium text-white">{config.label}</div>
                                <div className="text-gray-400 text-sm">{count} инструментов</div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-500 ml-auto" />
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* UI Selector */}
                <div className="space-y-4">
                  <motion.h2 
                    className="text-xl font-semibold text-white flex items-center gap-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.4 }}
                  >
                    <Target className="h-5 w-5 text-cyan-400" />
                    Подбери свой стек
                  </motion.h2>
                  <Card className="p-6">
                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Тип проекта</label>
                        <select 
                          value={selectorProject}
                          onChange={(e) => setSelectorProject(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                          <option value="">Выбери тип...</option>
                          <option value="spa">SPA приложение</option>
                          <option value="ssr">SSR/SSG сайт</option>
                          <option value="landing">Landing Page</option>
                          <option value="blog">Блог/Документация</option>
                          <option value="ecommerce">E-commerce</option>
                          <option value="dashboard">Dashboard/Admin</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Размер команды</label>
                        <select 
                          value={selectorTeam}
                          onChange={(e) => setSelectorTeam(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                          <option value="">Выбери размер...</option>
                          <option value="solo">Solo разработчик</option>
                          <option value="small">Small Team (2-5)</option>
                          <option value="medium">Medium Team (5-20)</option>
                          <option value="enterprise">Enterprise (20+)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Твой опыт</label>
                        <select 
                          value={selectorExperience}
                          onChange={(e) => setSelectorExperience(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                          <option value="">Выбери уровень...</option>
                          <option value="beginner">Beginner (0-1 год)</option>
                          <option value="intermediate">Intermediate (1-3 года)</option>
                          <option value="advanced">Advanced (3+ лет)</option>
                        </select>
                      </div>
                    </div>
                    
                    <AnimatePresence mode="wait">
                      {getSelectorRecommendation && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 rounded-xl p-6 border border-violet-500/20"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
                              <Zap className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white mb-1">
                                {STACK_RECOMMENDATIONS.find(s => s.id === getSelectorRecommendation.stack)?.name || "Рекомендуемый стек"}
                              </h3>
                              <p className="text-gray-400 text-sm mb-4">{getSelectorRecommendation.reason}</p>
                              <div className="flex flex-wrap gap-2">
                                {getSelectorRecommendation.tools.map(toolId => {
                                  const tool = getToolById(toolId);
                                  if (!tool) return null;
                                  return (
                                    <Badge key={toolId} variant="secondary" className="gap-1">
                                      {tool.name}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </div>
              </Tabs.Content>

              {/* Tab: Tools Radar */}
              <Tabs.Content value="radar" className="space-y-6">
                {/* Filters */}
                <Card className="p-4">
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Фильтры:</span>
                    </div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value as ToolCategory | "all")}
                      className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm"
                    >
                      <option value="all">Все категории</option>
                      {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showOnlyRecommended}
                        onChange={(e) => setShowOnlyRecommended(e.target.checked)}
                        className="rounded border-gray-600 bg-gray-800 text-violet-500 focus:ring-violet-500"
                      />
                      Только рекомендуемые
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showOnlyBeginner}
                        onChange={(e) => setShowOnlyBeginner(e.target.checked)}
                        className="rounded border-gray-600 bg-gray-800 text-violet-500 focus:ring-violet-500"
                      />
                      Для новичков
                    </label>
                  </div>
                </Card>

                {/* Tools Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {filteredTools.map((tool, i) => {
                      const radarInfo = getRadarInfo(tool.id);
                      const config = CATEGORY_CONFIG[tool.category];
                      const Icon = config.icon;
                      
                      return (
                        <motion.div
                          key={tool.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: i * 0.02 }}
                        >
                          <Card 
                            className="p-4 cursor-pointer hover:border-violet-500/50 transition-all hover:shadow-lg hover:shadow-violet-500/5"
                            onClick={() => setSelectedTool(tool)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center", config.color)}>
                                  <Icon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-white">{tool.name}</h3>
                                  <p className="text-xs text-gray-400">{tool.description}</p>
                                </div>
                              </div>
                              {radarInfo && (
                                <div 
                                  className={cn(
                                    "w-2 h-2 rounded-full",
                                    radarInfo.ring === "adopt" ? "bg-emerald-500" :
                                    radarInfo.ring === "trial" ? "bg-blue-500" :
                                    radarInfo.ring === "assess" ? "bg-amber-500" : "bg-red-500"
                                  )}
                                  title={radarInfo.ring.toUpperCase()}
                                />
                              )}
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant={tool.recommended ? "success" : "secondary"}>
                                {tool.bundleSize}
                              </Badge>
                              <Badge variant="secondary" className="gap-1">
                                <Star className="h-3 w-3" /> {tool.githubStars}
                              </Badge>
                              <Badge variant="secondary" className="gap-1">
                                <Download className="h-3 w-3" /> {tool.npmDownloads}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <DifficultyMeter level={tool.difficulty} />
                              <div className="flex items-center gap-2">
                                <MiniSquaresRating ratings={tool.ratings} />
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleCompare(tool); }}
                                  className={cn(
                                    "p-1.5 rounded-md transition-colors",
                                    compareTools.find(t => t.id === tool.id)
                                      ? "bg-violet-500 text-white"
                                      : "bg-gray-800 text-gray-400 hover:text-white"
                                  )}
                                >
                                  <ArrowLeftRight className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </Tabs.Content>

              {/* Tab: Tech Radar */}
              <Tabs.Content value="tech-radar" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-6 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Tech Radar</h2>
                    <p className="text-gray-400 text-sm mb-4">
                      Классификация технологий по готовности к использованию. Основано на методологии ThoughtWorks.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {TECH_RADAR_RINGS.map((ring) => (
                        <div key={ring.id} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ring.color }} />
                          <div>
                            <div className="font-medium text-white">{ring.label}</div>
                            <div className="text-xs text-gray-400">{ring.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>

                {TECH_RADAR_RINGS.map((ring) => {
                  const ringTools = TECH_RADAR_ITEMS.filter(item => item.ring === ring.id);
                  if (ringTools.length === 0) return null;
                  
                  return (
                    <motion.div
                      key={ring.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ring.color }} />
                        {ring.label}
                      </h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ringTools.map((item, i) => {
                          const tool = getToolById(item.toolId);
                          if (!tool) return null;
                          const config = CATEGORY_CONFIG[tool.category];
                          
                          return (
                            <motion.div
                              key={item.toolId}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                            >
                              <Card 
                                className="p-4 cursor-pointer hover:border-violet-500/50"
                                onClick={() => setSelectedTool(tool)}
                              >
                                <div className="flex items-start gap-3 mb-2">
                                  <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center", config.color)}>
                                    <config.icon className="h-4 w-4 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-white">{tool.name}</h4>
                                    <p className="text-xs text-gray-400">{tool.description}</p>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-300">{item.reason}</p>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </Tabs.Content>

              {/* Tab: Stacks */}
              <Tabs.Content value="stacks" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-6 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-2">Готовые стеки</h2>
                    <p className="text-gray-400 text-sm">
                      Проверенные комбинации инструментов для разных типов проектов.
                    </p>
                  </Card>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-6">
                  {STACK_RECOMMENDATIONS.map((stack, i) => (
                    <motion.div
                      key={stack.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card className="p-6 h-full">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="text-3xl">{stack.name.split(' ')[0]}</div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white">{stack.name.split(' ').slice(1).join(' ')}</h3>
                            <p className="text-gray-400 text-sm">{stack.description}</p>
                          </div>
                          <Badge variant={
                            stack.difficulty === "easy" ? "success" :
                            stack.difficulty === "medium" ? "warning" : "info"
                          }>
                            {stack.difficulty}
                          </Badge>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm text-gray-400 mb-2">Инструменты:</div>
                            <div className="flex flex-wrap gap-2">
                              {stack.stack.map(toolId => {
                                const tool = getToolById(toolId);
                                if (!tool) return null;
                                return (
                                  <Badge key={toolId} variant="secondary" className="gap-1">
                                    {tool.name}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Use case:</span>
                              <span className="text-white ml-2">{stack.useCase}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Время изучения:</span>
                              <span className="text-white ml-2">{stack.timeToLearn}</span>
                            </div>
                          </div>
                          
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <div className="text-sm text-gray-300">{stack.why.synergy}</div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </Tabs.Content>

              {/* Tab: Learning Guide */}
              <Tabs.Content value="guide" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-6 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-2">Путь обучения</h2>
                    <p className="text-gray-400 text-sm">
                      Рекомендуемый порядок изучения технологий для frontend разработчика.
                    </p>
                  </Card>
                </motion.div>

                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-500 via-fuchsia-500 to-cyan-500" />
                  
                  <div className="space-y-6">
                    {LEARNING_PATH.map((step, i) => (
                      <motion.div
                        key={step.step}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative pl-16"
                      >
                        <div className="absolute left-4 top-4 w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold">
                          {step.step}
                        </div>
                        <Card className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <step.icon className="h-5 w-5 text-violet-400" />
                            <h3 className="font-semibold text-white">{step.title}</h3>
                          </div>
                          <p className="text-gray-400 text-sm mb-3">{step.description}</p>
                          <div className="flex gap-4 text-sm">
                            <span className="text-gray-500">⏱ {step.time}</span>
                            <DifficultyMeter level={step.difficulty} />
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Tabs.Content>

              {/* Tab: Compare */}
              <Tabs.Content value="compare" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-6 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-2">Сравнение инструментов</h2>
                    <p className="text-gray-400 text-sm">
                      Выбери до 3 инструментов для сравнения.
                    </p>
                  </Card>
                </motion.div>

                {compareTools.length === 0 ? (
                  <Card className="p-12 text-center">
                    <ArrowLeftRight className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Нет инструментов для сравнения</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Нажми на кнопку сравнения (⇄) на карточке инструмента, чтобы добавить его сюда.
                    </p>
                    <Button onClick={() => setActiveTab("radar")}>
                      Перейти к инструментам
                    </Button>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">
                    {compareTools.map((tool) => {
                      const config = CATEGORY_CONFIG[tool.category];
                      const radarInfo = getRadarInfo(tool.id);
                      
                      return (
                        <motion.div
                          key={tool.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center", config.color)}>
                                  <config.icon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-white">{tool.name}</h3>
                                  <p className="text-xs text-gray-400">{config.label}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => toggleCompare(tool)}
                                className="p-1 rounded-md bg-gray-800 text-gray-400 hover:text-red-400"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            
                            <StatsVisualization tool={tool} />
                            
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Bundle Size</span>
                                <span className="text-white">{tool.bundleSize}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Difficulty</span>
                                <DifficultyMeter level={tool.difficulty} />
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Security</span>
                                <SecurityBadge score={tool.securityScore} />
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">TypeScript</span>
                                <Badge variant={tool.typescript === "native" ? "success" : "secondary"}>
                                  {tool.typescript}
                                </Badge>
                              </div>
                              {radarInfo && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">Radar</span>
                                  <Badge variant={
                                    radarInfo.ring === "adopt" ? "success" :
                                    radarInfo.ring === "trial" ? "info" :
                                    radarInfo.ring === "assess" ? "warning" : "secondary"
                                  }>
                                    {radarInfo.ring.toUpperCase()}
                                  </Badge>
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-4">
                              <div className="text-sm text-gray-400 mb-2">Ratings</div>
                              <RadarChart ratings={tool.ratings} size={100} />
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </Tabs.Content>
            </Tabs.Root>
          </main>

          {/* Tool Detail Modal */}
          <AnimatePresence>
            {selectedTool && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedTool(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-gray-900 rounded-2xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center", CATEGORY_CONFIG[selectedTool.category].color)}>
                          {(() => { const I = CATEGORY_CONFIG[selectedTool.category].icon; return <I className="h-6 w-6 text-white" />; })()}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">{selectedTool.name}</h2>
                          <p className="text-gray-400">{selectedTool.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedTool(null)}
                        className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <StatsVisualization tool={selectedTool} />

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-gray-400 text-xs mb-1">GitHub Stars</div>
                        <div className="text-white font-semibold">{selectedTool.githubStars}</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-gray-400 text-xs mb-1">NPM Downloads</div>
                        <div className="text-white font-semibold">{selectedTool.npmDownloads}</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-gray-400 text-xs mb-1">TypeScript</div>
                        <div className="text-white font-semibold capitalize">{selectedTool.typescript}</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-gray-400 text-xs mb-1">Dependencies</div>
                        <div className="text-white font-semibold">{selectedTool.dependencies}</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-gray-400 text-xs mb-1">Node Version</div>
                        <div className="text-white font-semibold">{selectedTool.nodeVersion}</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-gray-400 text-xs mb-1">Last Update</div>
                        <div className="text-white font-semibold">{selectedTool.lastUpdate}</div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-white mb-2">Best for</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTool.bestFor.map((use, i) => (
                          <Badge key={i} variant="secondary">{use}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4 text-emerald-400" /> Pros
                        </h3>
                        <ul className="space-y-1">
                          {selectedTool.pros.map((pro, i) => (
                            <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                              <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-1">
                          <ThumbsDown className="h-4 w-4 text-red-400" /> Cons
                        </h3>
                        <ul className="space-y-1">
                          {selectedTool.cons.map((con, i) => (
                            <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                              <X className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button className="flex-1 gap-2" onClick={() => window.open(selectedTool.url, '_blank')}>
                        <ExternalLink className="h-4 w-4" />
                        Открыть сайт
                      </Button>
                      <Button 
                        variant="outline" 
                        className="gap-2"
                        onClick={() => { toggleCompare(selectedTool); setSelectedTool(null); }}
                      >
                        <ArrowLeftRight className="h-4 w-4" />
                        К сравнению
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <footer className="border-t border-gray-800 bg-gray-950/90 backdrop-blur-xl mt-auto">
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6">
                    <svg viewBox="0 0 36 36" className="w-full h-full">
                      <defs>
                        <linearGradient id="footerLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#d946ef" />
                        </linearGradient>
                      </defs>
                      <circle cx="18" cy="18" r="16" fill="none" stroke="url(#footerLogoGrad)" strokeWidth="2" />
                      <circle cx="18" cy="18" r="2" fill="url(#footerLogoGrad)" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-400">UI Radar — Интерактивный гид по инструментам веб-разработки</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{UI_TOOLS.length} инструментов</span>
                  <span>•</span>
                  <span>{STACK_RECOMMENDATIONS.length} готовых стеков</span>
                  <span>•</span>
                  <span>2024</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </Tooltip.Provider>
    </DynamicBackground>
  );
}
