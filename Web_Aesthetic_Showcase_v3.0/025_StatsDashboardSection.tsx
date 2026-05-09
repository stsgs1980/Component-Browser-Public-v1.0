// Project: Web Aesthetic Showcase v3.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v3.0\src\components
// Lines: 627

'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitCommit,
  Code2,
  Activity,
  Clock,
  TrendingUp,
  Zap,
  Layers,
} from 'lucide-react';

/* ──────────────────────────────────────────────
   SSR-SAFE MOUNTING
   ────────────────────────────────────────────── */

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

/* ──────────────────────────────────────────────
   ANIMATED COUNT-UP HOOK
   ────────────────────────────────────────────── */

function useCountUp(target: number, duration: number = 2000, startOnMount: boolean = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startOnMount) return;
    let start = 0;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    }

    requestAnimationFrame(animate);
  }, [target, duration, startOnMount]);

  return count;
}

/* ──────────────────────────────────────────────
   MINI SPARKLINE COMPONENT
   ────────────────────────────────────────────── */

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 80;
  const h = 24;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-20 h-6 opacity-60" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`spark-grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#spark-grad-${color})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ──────────────────────────────────────────────
   CIRCULAR PROGRESS COMPONENT
   ────────────────────────────────────────────── */

function CircularProgress({ value, size = 40, strokeWidth = 3 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#circ-progress-grad)"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
      <defs>
        <linearGradient id="circ-progress-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ──────────────────────────────────────────────
   STAT CARD DATA
   ────────────────────────────────────────────── */

const STAT_CARDS = [
  {
    id: 'loc',
    label: 'Lines of Code',
    target: 2400000,
    format: (v: number) => {
      if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M+`;
      if (v >= 1000) return `${(v / 1000).toFixed(0)}K+`;
      return Math.floor(v).toLocaleString();
    },
    icon: Code2,
    iconColor: '#10b981',
    trend: '+12.4%',
    trendUp: true,
    sparkData: [30, 45, 35, 60, 50, 70, 55, 80, 65, 90, 75, 95],
  },
  {
    id: 'components',
    label: 'Components Built',
    target: 25,
    format: (v: number) => Math.floor(v).toString(),
    icon: Layers,
    iconColor: '#06b6d4',
    trend: '+3 this week',
    trendUp: true,
    sparkData: [2, 5, 8, 10, 12, 15, 18, 20, 22, 24, 25],
  },
  {
    id: 'commits',
    label: 'Git Commits',
    target: 1847,
    format: (v: number) => Math.floor(v).toLocaleString(),
    icon: GitCommit,
    iconColor: '#10b981',
    trend: '+127 this month',
    trendUp: true,
    sparkData: [120, 150, 140, 180, 170, 200, 190, 220, 210, 250, 230, 260],
  },
  {
    id: 'uptime',
    label: 'Uptime',
    target: 99.97,
    format: (v: number) => `${v.toFixed(2)}%`,
    icon: Clock,
    iconColor: '#06b6d4',
    trend: '0.02% improvement',
    trendUp: true,
    useProgress: true,
    sparkData: [99.5, 99.7, 99.6, 99.8, 99.7, 99.9, 99.8, 99.95, 99.9, 99.97],
  },
] as const;

/* ──────────────────────────────────────────────
   LANGUAGE BREAKDOWN DATA
   ────────────────────────────────────────────── */

const LANGUAGES = [
  { name: 'TypeScript', percent: 65, color: '#10b981', gradientFrom: '#10b981', gradientTo: '#06b6d4' },
  { name: 'CSS', percent: 15, color: '#06b6d4', gradientFrom: '#06b6d4', gradientTo: '#38bdf8' },
  { name: 'JavaScript', percent: 10, color: '#f59e0b', gradientFrom: '#f59e0b', gradientTo: '#fbbf24' },
  { name: 'HTML', percent: 7, color: '#ef4444', gradientFrom: '#ef4444', gradientTo: '#f87171' },
  { name: 'Other', percent: 3, color: '#8b5cf6', gradientFrom: '#8b5cf6', gradientTo: '#a78bfa' },
] as const;

/* ──────────────────────────────────────────────
   RECENT ACTIVITY DATA
   ────────────────────────────────────────────── */

const ACTIVITIES = [
  { id: 'act-1', text: 'Added Diff Viewer section', time: '2 hours ago', icon: Code2, color: '#10b981' },
  { id: 'act-2', text: 'Fixed nested button bug', time: '5 hours ago', icon: Zap, color: '#f59e0b' },
  { id: 'act-3', text: 'Enhanced particle system', time: '1 day ago', icon: Activity, color: '#06b6d4' },
  { id: 'act-4', text: 'Deployed v2.0', time: '2 days ago', icon: TrendingUp, color: '#10b981' },
  { id: 'act-5', text: 'Added mobile navigation', time: '3 days ago', icon: Layers, color: '#8b5cf6' },
  { id: 'act-6', text: 'Created Color Palette Studio', time: '4 days ago', icon: GitCommit, color: '#06b6d4' },
] as const;

/* ──────────────────────────────────────────────
   HEATMAP DATA GENERATION
   ────────────────────────────────────────────── */

function generateHeatmapData(): { contributions: number; date: Date }[][] {
  const weeks: { contributions: number; date: Date }[][] = [];
  const now = new Date();
  // Go back ~20 weeks (140 days)
  const totalDays = 140;
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - totalDays);
  startDate.setDate(startDate.getDate() - startDate.getDay()); // Align to Sunday

  let currentDate = new Date(startDate);
  let week: { contributions: number; date: Date }[] = [];

  for (let i = 0; i < 147; i++) {
    // Seeded pseudo-random based on day index for consistent data
    const dayIndex = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const seed = ((dayIndex * 2654435761) >>> 0) % 100;
    let contributions = 0;
    if (seed > 70) contributions = 4;
    else if (seed > 50) contributions = 3;
    else if (seed > 30) contributions = 2;
    else if (seed > 15) contributions = 1;

    // Reduce contributions for future dates
    if (currentDate > now) contributions = 0;

    week.push({ contributions, date: new Date(currentDate) });
    currentDate.setDate(currentDate.getDate() + 1);

    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) weeks.push(week);
  return weeks;
}

const HEATMAP = generateHeatmapData();

const HEATMAP_COLORS: Record<number, string> = {
  0: 'rgba(255,255,255,0.04)',
  1: 'rgba(16, 185, 129, 0.2)',
  2: 'rgba(16, 185, 129, 0.4)',
  3: 'rgba(16, 185, 129, 0.6)',
  4: 'rgba(16, 185, 129, 0.8)',
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ──────────────────────────────────────────────
   HEATMAP TOOLTIP COMPONENT
   ────────────────────────────────────────────── */

function HeatmapCell({ contributions, date }: { contributions: number; date: Date }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const dayName = DAY_LABELS[date.getDay()];
  const monthName = MONTH_LABELS[date.getMonth()];
  const dayNum = date.getDate();

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className="w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] rounded-sm transition-colors duration-150 hover:ring-1 hover:ring-emerald-400/50 cursor-pointer"
        style={{ backgroundColor: HEATMAP_COLORS[contributions] || HEATMAP_COLORS[0] }}
      />
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-[#1c1c2e] border border-white/10 shadow-xl whitespace-nowrap z-20 pointer-events-none"
          >
            <span className="text-[11px] font-mono text-white/70">
              {contributions > 0 ? (
                <><span className="text-emerald-400 font-semibold">{contributions}</span> contributions on </>
              ) : (
                'No contributions on '
              )}
              <span className="text-white/90">{dayName} {monthName} {dayNum}</span>
            </span>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-[#1c1c2e]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────── */

export function StatsDashboardSection() {
  const mounted = useMounted();
  const [animatedInView, setAnimatedInView] = useState(false);

  // Count-up hooks for stat cards
  const locCount = useCountUp(STAT_CARDS[0].target as number, 2500, mounted && animatedInView);
  const compCount = useCountUp(STAT_CARDS[1].target as number, 1800, mounted && animatedInView);
  const commitCount = useCountUp(STAT_CARDS[2].target as number, 2200, mounted && animatedInView);
  const uptimeCount = useCountUp(STAT_CARDS[3].target as number, 2000, mounted && animatedInView);

  const counts = [locCount, compCount, commitCount, uptimeCount];

  // Animated bar widths for language breakdown
  const [barWidths, setBarWidths] = useState<number[]>(LANGUAGES.map(() => 0));

  const handleInView = useCallback(() => {
    if (!animatedInView) {
      setAnimatedInView(true);
    }
  }, [animatedInView]);

  // Animate bars when in view
  useEffect(() => {
    if (!animatedInView) return;
    const timeouts = LANGUAGES.map((lang, i) =>
      setTimeout(() => {
        setBarWidths((prev) => {
          const next = [...prev];
          next[i] = lang.percent;
          return next;
        });
      }, i * 150)
    );
    return () => timeouts.forEach(clearTimeout);
  }, [animatedInView]);

  if (!mounted) {
    return (
      <div className="w-full px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="h-10 w-64 bg-white/[0.03] rounded-lg animate-pulse" />
          <div className="h-6 w-96 mt-3 bg-white/[0.02] rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  // Calculate month labels for heatmap
  const monthStarts = HEATMAP.reduce<number[]>((acc, week, weekIdx) => {
    if (weekIdx === 0 || week[0].date.getMonth() !== HEATMAP[weekIdx - 1][0].date.getMonth()) {
      acc.push(weekIdx);
    }
    return acc;
  }, []);

  return (
    <motion.div
      onViewportEnter={handleInView}
      viewport={{ once: true, amount: 0.1 }}
      className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
    >
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">

        {/* ─── STAT CARDS GRID ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5"
        >
          {STAT_CARDS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -2, borderColor: 'rgba(16, 185, 129, 0.2)' }}
                className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 sm:p-6 backdrop-blur-sm overflow-hidden group"
              >
                {/* Gradient border glow on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(300px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(16,185,129,0.06), transparent 70%)` }} />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${stat.iconColor}15`, border: `1px solid ${stat.iconColor}25` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: stat.iconColor }} />
                      </div>
                      <span className="text-xs sm:text-sm font-mono text-white/40">{stat.label}</span>
                    </div>
                    {stat.useProgress ? (
                      <CircularProgress value={counts[i] as number} size={42} strokeWidth={3} />
                    ) : (
                      <Sparkline data={stat.sparkData as number[]} color={stat.iconColor as string} />
                    )}
                  </div>

                  <div className="flex items-end justify-between">
                    <span className="text-2xl sm:text-3xl font-bold font-mono bg-gradient-to-r from-white/90 to-white/70 bg-clip-text text-transparent">
                      {stat.format(counts[i] as number)}
                    </span>
                    <div className="flex items-center gap-1">
                      {stat.trendUp && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                      <span className="text-[11px] font-mono text-emerald-400/80">{stat.trend}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ─── ACTIVITY HEATMAP ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 sm:p-6 backdrop-blur-sm overflow-hidden"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white/80">Activity Heatmap</h3>
              <p className="text-[11px] font-mono text-white/30">Contribution activity over the past 20 weeks</p>
            </div>
          </div>

          {/* Month labels */}
          <div className="overflow-x-auto pb-2 custom-scrollbar" style={{ scrollbarWidth: 'thin' }}>
            <div className="min-w-[640px]">
              <div className="flex ml-8 mb-1">
                {monthStarts.map((weekIdx) => (
                  <span
                    key={`month-label-${weekIdx}`}
                    className="text-[10px] font-mono text-white/20 mr-[22px]"
                  >
                    {MONTH_LABELS[HEATMAP[weekIdx]?.[0].date.getMonth() ?? 0]}
                  </span>
                ))}
              </div>

              {/* Day labels + heatmap grid */}
              <div className="flex gap-0.5">
                {/* Day labels column */}
                <div className="flex flex-col gap-[3px] mr-1.5 pt-0">
                  {DAY_LABELS.map((day, i) => (
                    <span key={`day-label-${day}`} className="h-[10px] sm:h-[11px] text-[10px] font-mono text-white/20 flex items-center leading-none">
                      {i % 2 === 1 ? day : ''}
                    </span>
                  ))}
                </div>

                {/* Heatmap grid */}
                <div className="flex gap-[3px]">
                  {HEATMAP.map((week, weekIdx) => (
                    <div key={`heatmap-week-${weekIdx}`} className="flex flex-col gap-[3px]">
                      {week.map((day, dayIdx) => (
                        <HeatmapCell
                          key={`heatmap-cell-${weekIdx}-${dayIdx}`}
                          contributions={day.contributions}
                          date={day.date}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-2 mt-3 ml-8">
                <span className="text-[10px] font-mono text-white/25">Less</span>
                {[0, 1, 2, 3, 4].map((level) => (
                  <div
                    key={`heatmap-legend-${level}`}
                    className="w-[10px] h-[10px] rounded-sm"
                    style={{ backgroundColor: HEATMAP_COLORS[level] }}
                  />
                ))}
                <span className="text-[10px] font-mono text-white/25">More</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── BOTTOM ROW: Language Breakdown + Recent Activity ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

          {/* Language Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 sm:p-6 backdrop-blur-sm overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20">
                <Code2 className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/80">Language Breakdown</h3>
                <p className="text-[11px] font-mono text-white/30">Code distribution by language</p>
              </div>
            </div>

            <div className="space-y-4">
              {LANGUAGES.map((lang, i) => (
                <div key={`lang-${lang.name}`} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: lang.color }} />
                      <span className="text-xs font-mono text-white/60">{lang.name}</span>
                    </div>
                    <span className="text-xs font-mono text-white/40">{lang.percent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        width: `${barWidths[i]}%`,
                        background: `linear-gradient(to right, ${lang.gradientFrom}, ${lang.gradientTo})`,
                      }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 sm:p-6 backdrop-blur-sm overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
                <GitCommit className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/80">Recent Activity</h3>
                <p className="text-[11px] font-mono text-white/30">Latest development updates</p>
              </div>
            </div>

            <div className="space-y-1 max-h-[340px] overflow-y-auto custom-scrollbar pr-1">
              {ACTIVITIES.map((activity, i) => {
                const ActIcon = activity.icon;
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.07 }}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors duration-200 group"
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: `${activity.color}12`, border: `1px solid ${activity.color}20` }}
                    >
                      <ActIcon className="w-3.5 h-3.5" style={{ color: activity.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-white/60 group-hover:text-white/80 transition-colors duration-200 truncate">
                        {activity.text}
                      </p>
                      <span className="text-[10px] font-mono text-white/25 mt-0.5 block">{activity.time}</span>
                    </div>
                    {/* Timeline dot */}
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2" style={{ backgroundColor: `${activity.color}40` }} />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* ─── INFO BAR ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-4 pb-2"
        >
          {[
            { icon: Activity, label: 'Live Metrics', color: '#10b981' },
            { icon: GitCommit, label: 'Contribution Tracking', color: '#06b6d4' },
            { icon: Code2, label: 'Language Analysis', color: '#10b981' },
            { icon: Zap, label: 'Real-time Updates', color: '#f59e0b' },
          ].map((item, i) => (
            <div key={`stats-info-${i}`} className="flex items-center gap-1.5">
              <item.icon className="w-3 h-3" style={{ color: item.color }} />
              <span className="text-[11px] font-mono text-white/25">{item.label}</span>
              {i < 3 && <div className="w-1 h-1 rounded-full bg-white/10 ml-3 sm:ml-6" />}
            </div>
          ))}
        </motion.div>

      </div>
    </motion.div>
  );
}
