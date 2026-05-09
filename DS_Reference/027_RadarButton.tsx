// Project: UI RADAR
// Category: ui-radar
// Source: design-systems\UI RADAR\src\components\ui-radar
// Lines: 622

"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  Shield,
  Building2,
  Star,
  Download,
  Users,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UITool, ToolRatings } from "@/types";

// ============================================================================
// Radar Chart
// ============================================================================

export const RadarChart = memo(function RadarChart({ 
  ratings, 
  size = 120 
}: { 
  ratings: ToolRatings; 
  size?: number;
}) {
  const categories = Object.keys(ratings) as (keyof typeof ratings)[];
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 20;
  const angleStep = (2 * Math.PI) / categories.length;

  const dataPoints = categories.map((cat, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const value = ratings[cat];
    const r = (value / 10) * radius;
    return { x: centerX + r * Math.cos(angle), y: centerY + r * Math.sin(angle) };
  });

  const pathData = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="currentColor" className="text-gray-700" strokeWidth="1" />
      {[0.5].map((s) => (
        <circle key={s} cx={centerX} cy={centerY} r={radius * s} fill="none" stroke="currentColor" className="text-gray-800" strokeWidth="0.5" strokeDasharray="2 2" />
      ))}
      <motion.path d={pathData} fill="currentColor" className="text-violet-500/30" stroke="currentColor" strokeWidth="2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} />
      {dataPoints.map((p, i) => (
        <motion.circle key={i} cx={p.x} cy={p.y} r="3" fill="currentColor" className="text-fuchsia-400" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }} />
      ))}
    </svg>
  );
});

// ============================================================================
// Sparkline
// ============================================================================

export const Sparkline = memo(function Sparkline({ 
  data, 
  color = "violet" 
}: { 
  data: number[]; 
  color?: string;
}) {
  const width = 50;
  const height = 16;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(" ");
  const colorClass = color === "green" ? "text-emerald-400" : color === "red" ? "text-red-400" : "text-violet-400";

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline points={points} fill="none" stroke="currentColor" className={colorClass} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
});

// ============================================================================
// Mini Squares Rating
// ============================================================================

export const MiniSquaresRating = memo(function MiniSquaresRating({ 
  ratings 
}: { 
  ratings: ToolRatings;
}) {
  const values = Object.values(ratings);
  const keys = Object.keys(ratings);
  
  return (
    <div className="flex gap-0.5">
      {values.map((v, i) => (
        <Tooltip.Root key={i}>
          <Tooltip.Trigger>
            <div className={cn("w-2.5 h-2.5 rounded-sm", v >= 8 ? "bg-emerald-500" : v >= 6 ? "bg-emerald-600/70" : v >= 4 ? "bg-emerald-700/50" : "bg-emerald-900/30")} />
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="bg-gray-800 text-white text-xs px-2 py-1 rounded z-50">{keys[i]}: {v}/10</Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      ))}
    </div>
  );
});

// ============================================================================
// Difficulty Meter
// ============================================================================

export const DifficultyMeter = memo(function DifficultyMeter({ 
  level 
}: { 
  level: number;
}) {
  const colors = ["bg-emerald-500", "bg-green-500", "bg-yellow-500", "bg-orange-500", "bg-red-500"];
  const labels = ["Легко", "Нормально", "Средне", "Сложно", "Очень сложно"];
  
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={cn("w-1.5 h-3 rounded-sm", i <= level ? colors[level - 1] : "bg-gray-700")} />
        ))}
      </div>
      <span className="text-xs text-gray-400">{labels[level - 1]}</span>
    </div>
  );
});

// ============================================================================
// Bundle Size Bar
// ============================================================================

export const BundleSizeBar = memo(function BundleSizeBar({ 
  bytes 
}: { 
  bytes: number;
}) {
  const maxSize = 500000;
  const width = Math.min((bytes / maxSize) * 100, 100);
  const getColor = () => 
    bytes < 10000 ? "from-emerald-500 to-green-400" : 
    bytes < 50000 ? "from-green-500 to-cyan-400" : 
    bytes < 100000 ? "from-yellow-500 to-orange-400" : 
    bytes < 200000 ? "from-orange-500 to-red-400" : 
    "from-red-500 to-red-600";
  
  return (
    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden w-16">
      <motion.div className={cn("h-full rounded-full bg-gradient-to-r", getColor())} initial={{ width: 0 }} animate={{ width: `${width}%` }} transition={{ duration: 0.5 }} />
    </div>
  );
});

// ============================================================================
// Security Badge
// ============================================================================

export const SecurityBadge = memo(function SecurityBadge({ 
  score 
}: { 
  score: number;
}) {
  const color = score >= 9 ? "text-emerald-400" : score >= 7 ? "text-yellow-400" : "text-red-400";
  
  return (
    <div className={cn("flex items-center gap-1", color)}>
      <Shield className="h-3 w-3" />
      <span className="text-xs font-medium">{score}/10</span>
    </div>
  );
});

// ============================================================================
// Company Logo
// ============================================================================

export const CompanyLogo = memo(function CompanyLogo({ 
  company, 
  size = 16 
}: { 
  company: string; 
  size?: number;
}) {
  const logos: Record<string, React.ReactNode> = {
    "Meta": (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M4 24C4 13 13 4 24 4s20 9 20 20-9 20-20 20S4 35 4 24zm14.5-8c-3.5 0-5.5 3-5.5 6.5 0 5 3.5 11 6.5 11 1.5 0 2.5-1 4-1s2.5 1 4 1c3 0 6.5-6 6.5-11 0-3.5-2-6.5-5.5-6.5-1.5 0-3 1-4 1s-2.5-1-4-1z" fill="#0866FF"/>
        <path d="M24 13c-2 0-4 2-4 4.5s2 4.5 4 4.5 4-2 4-4.5-2-4.5-4-4.5z" fill="#0866FF"/>
      </svg>
    ),
    "Google": (
      <svg width={size} height={size} viewBox="0 0 48 48">
        <path d="M43.6 20H24v8.5h11.1c-1 5.1-5.4 8.8-11.1 8.8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l6.4-6.4C34.5 6.5 29.6 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5c11.3 0 20-8.2 20-20 0-1.2-.1-2.4-.4-3.5z" fill="#FFC107"/>
        <path d="M6.3 14.7l7.4 5.4c1.9-5 6.7-8.6 12.3-8.6 3 0 5.7 1.1 7.8 2.9l6.4-6.4C34.5 6.5 29.6 4.5 24 4.5 16.3 4.5 9.7 8.7 6.3 14.7z" fill="#FF3D00"/>
        <path d="M24 45.5c5.5 0 10.3-1.8 14.1-5l-6.5-5.5c-2 1.5-4.6 2.3-7.6 2.3-5.6 0-10.1-3.7-11.1-8.8l-7.4 5.7c3.3 6.2 9.9 10.3 17.5 10.3z" fill="#4CAF50"/>
        <path d="M43.6 20H24v8.5h11.1c-.5 2.6-1.9 4.8-4 6.3l6.5 5.5c3.8-3.5 6.4-8.7 6.4-15.3 0-1.2-.1-2.4-.4-3.5z" fill="#1976D2"/>
      </svg>
    ),
    "Vercel": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 19.5h20L12 2z"/>
      </svg>
    ),
    "Tailwind Labs": (
      <svg width={size} height={size} viewBox="0 0 54 33" fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M27 0c-7.2 0-11.7 3.6-13.5 10.8 2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C30.744 13.09 33.808 16.2 40.5 16.2c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.514-3.522-2.004-5.147-3.653C36.756 3.11 33.692 0 27 0zM13.5 16.2C6.3 16.2 1.8 19.8 0 27c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C17.244 29.29 20.308 32.4 27 32.4c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.514-3.522-2.004-5.147-3.653C23.256 19.31 20.192 16.2 13.5 16.2z" fill="#38B2AC"/>
      </svg>
    ),
    "WorkOS": (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#6366F1"/>
        <path d="M8 10h6v6H8V10zm10 0h6v6h-6V10zM8 18h6v6H8v-6zm10 0h6v6h-6v-6z" fill="white"/>
      </svg>
    ),
    "Framer": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M4 0h16v8h-8z" fill="#0055FF"/>
        <path d="M4 8h8l8 8H4z" fill="#00AAFF"/>
        <path d="M12 16h8v8h-8v-8z" fill="#0055FF"/>
        <path d="M4 16h8v8l-8-8z" fill="#0055FF" opacity="0.6"/>
      </svg>
    ),
    "NuxtLabs": (
      <svg width={size} height={size} viewBox="0 0 48 32" fill="none">
        <path d="M14.5 26.5L1 26.5L12.5 7.5L18.5 18.5L14.5 26.5Z" fill="#00DC82"/>
        <path d="M14.5 26.5L18.5 18.5L24.5 7.5L30.5 18.5L26.5 26.5L14.5 26.5Z" fill="#00DC82" opacity="0.7"/>
        <path d="M26.5 26.5L30.5 18.5L36.5 7.5L47 26.5L26.5 26.5Z" fill="#00DC82" opacity="0.5"/>
      </svg>
    ),
    "MUI": (
      <svg width={size} height={size} viewBox="0 0 36 32" fill="none">
        <path d="M30.3 0l-12.3 6.8-12.3-6.8 12.3 17.6 12.3-17.6z" fill="#007FFF"/>
        <path d="M18 24.4l-14.3-14.3v8.5l14.3 8.5 14.3-8.5v-8.5l-14.3 14.3z" fill="#007FFF" opacity="0.7"/>
        <path d="M18 32l-16-9.5v-3l16 9.5 16-9.5v3l-16 9.5z" fill="#007FFF" opacity="0.5"/>
      </svg>
    ),
    "GreenSock": (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22" fill="#88CE02"/>
        <path d="M14 16h10c5.5 0 10 4.5 10 10s-4.5 10-10 10h-5v-6h5c2.2 0 4-1.8 4-4s-1.8-4-4-4H14v-6z" fill="white"/>
      </svg>
    ),
  };

  return logos[company] || <Building2 className="text-gray-400" style={{ width: size, height: size }} />;
});

// ============================================================================
// Company Badge
// ============================================================================

export const CompanyBadge = memo(function CompanyBadge({ 
  company 
}: { 
  company: string;
}) {
  const isMajor = ["Meta", "Google", "Vercel", "Tailwind Labs", "WorkOS", "Framer", "NuxtLabs", "MUI", "GreenSock"].includes(company);
  
  return (
    <div className="inline-flex items-center gap-1.5 bg-gray-800/80 rounded-lg px-2 py-1 border border-gray-700/50">
      {isMajor ? (
        <CompanyLogo company={company} size={14} />
      ) : (
        <Building2 className="h-3.5 w-3.5 text-gray-400" />
      )}
      <span className="text-xs text-gray-300">{company}</span>
    </div>
  );
});

// ============================================================================
// Helper: Parse Metric Value
// ============================================================================

export function parseMetricValue(value: string): number {
  const cleaned = value.replace(/[^0-9.KkMm]/g, '').toUpperCase();
  const num = parseFloat(cleaned);
  if (cleaned.includes('M')) return num * 1000; // Convert M to K for percentage
  if (cleaned.includes('K')) return num;
  return isNaN(num) ? 0 : num;
}

// ============================================================================
// Stats Visualization
// ============================================================================

export const StatsVisualization = memo(function StatsVisualization({ 
  tool 
}: { 
  tool: UITool;
}) {
  const starsNum = parseMetricValue(tool.githubStars);
  const npmNum = parseMetricValue(tool.npmDownloads);

  const bundleHeight = Math.min((tool.bundleSizeBytes / 200000) * 100, 100);
  const starsHeight = Math.min((starsNum / 250) * 100, 100);
  const npmHeight = Math.min((npmNum / 250) * 100, 100);
  const securityHeight = tool.securityScore * 10;
  const contributorsHeight = Math.min((tool.contributors / 3000) * 100, 100);

  const getActivityHeight = () => {
    const update = tool.lastUpdate.toLowerCase();
    if (update.includes('день') || update.includes('дня')) return 90;
    if (update.includes('недел')) return 60;
    return 30;
  };

  return (
    <div className="relative bg-gradient-to-b from-gray-800/30 to-gray-900/50 rounded-2xl p-6 mb-4 overflow-hidden">
      <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none">
        <defs>
          <linearGradient id="bgMountain1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="100%" stopColor="#1f2937" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0,200 Q50,150 100,180 Q150,120 200,160 Q250,80 300,140 Q350,60 400,120 L400,200 Z" fill="url(#bgMountain1)" />
      </svg>

      <div className="absolute bottom-16 left-8 right-8 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />

      <div className="relative flex items-end justify-between gap-3 h-44 px-2">
        {/* Bundle Size */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="relative flex flex-col items-center justify-end h-36">
            <motion.div
              className="w-3 rounded-full bg-gradient-to-t from-gray-600 to-gray-500"
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(5, bundleHeight)}%` }}
              transition={{ duration: 0.6, delay: 0.1 }}
            />
            <motion.div
              className={cn(
                "absolute -top-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg",
                tool.bundleSizeBytes < 10000 ? "bg-gradient-to-br from-emerald-400 to-emerald-600" :
                tool.bundleSizeBytes < 50000 ? "bg-gradient-to-br from-green-400 to-green-600" :
                tool.bundleSizeBytes < 100000 ? "bg-gradient-to-br from-yellow-400 to-yellow-600" :
                "bg-gradient-to-br from-orange-400 to-orange-600"
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              {tool.bundleSizeBytes < 10000 ? "1" : tool.bundleSizeBytes < 50000 ? "2" : tool.bundleSizeBytes < 100000 ? "3" : "4"}
            </motion.div>
          </div>
          <div className="text-center">
            <div className="text-white font-semibold text-xs">{tool.bundleSize}</div>
            <div className="text-gray-500 text-[10px]">Bundle</div>
          </div>
        </div>

        {/* GitHub Stars */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="relative flex flex-col items-center justify-end h-36">
            <motion.div
              className="w-3 rounded-full bg-gradient-to-t from-amber-900/50 to-amber-700/30"
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(5, starsHeight)}%` }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />
            <motion.div
              className="absolute -top-2 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Star className="h-3 w-3" />
            </motion.div>
          </div>
          <div className="text-center">
            <div className="text-amber-400 font-semibold text-xs">{tool.githubStars}</div>
            <div className="text-gray-500 text-[10px]">Stars</div>
          </div>
        </div>

        {/* NPM Downloads */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="relative flex flex-col items-center justify-end h-36">
            <motion.div
              className="w-3 rounded-full bg-gradient-to-t from-cyan-900/50 to-cyan-700/30"
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(5, npmHeight)}%` }}
              transition={{ duration: 0.6, delay: 0.3 }}
            />
            <motion.div
              className="absolute -top-2 w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Download className="h-3 w-3" />
            </motion.div>
          </div>
          <div className="text-center">
            <div className="text-cyan-400 font-semibold text-xs">{tool.npmDownloads}</div>
            <div className="text-gray-500 text-[10px]">NPM</div>
          </div>
        </div>

        {/* Security Score */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="relative flex flex-col items-center justify-end h-36">
            <motion.div
              className={cn(
                "w-3 rounded-full",
                tool.securityScore >= 9 ? "bg-gradient-to-t from-emerald-900/50 to-emerald-700/30" :
                tool.securityScore >= 7 ? "bg-gradient-to-t from-yellow-900/50 to-yellow-700/30" :
                "bg-gradient-to-t from-red-900/50 to-red-700/30"
              )}
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(5, securityHeight)}%` }}
              transition={{ duration: 0.6, delay: 0.4 }}
            />
            <motion.div
              className={cn(
                "absolute -top-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg",
                tool.securityScore >= 9 ? "bg-gradient-to-br from-emerald-400 to-emerald-600" :
                tool.securityScore >= 7 ? "bg-gradient-to-br from-yellow-400 to-yellow-600" :
                "bg-gradient-to-br from-red-400 to-red-600"
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7 }}
            >
              {tool.securityScore}
            </motion.div>
          </div>
          <div className="text-center">
            <div className={cn(
              "font-semibold text-xs",
              tool.securityScore >= 9 ? "text-emerald-400" :
              tool.securityScore >= 7 ? "text-yellow-400" : "text-red-400"
            )}>{tool.securityScore}/10</div>
            <div className="text-gray-500 text-[10px]">Security</div>
          </div>
        </div>

        {/* Contributors */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="relative flex flex-col items-center justify-end h-36">
            <motion.div
              className="w-3 rounded-full bg-gradient-to-t from-violet-900/50 to-violet-700/30"
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(5, contributorsHeight)}%` }}
              transition={{ duration: 0.6, delay: 0.5 }}
            />
            <motion.div
              className="absolute -top-2 w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Users className="h-3 w-3" />
            </motion.div>
          </div>
          <div className="text-center">
            <div className="text-violet-400 font-semibold text-xs">{tool.contributors.toLocaleString()}</div>
            <div className="text-gray-500 text-[10px]">Authors</div>
          </div>
        </div>

        {/* Activity */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="relative flex flex-col items-center justify-end h-36">
            <motion.div
              className={cn(
                "w-3 rounded-full",
                getActivityHeight() >= 80 ? "bg-gradient-to-t from-emerald-900/50 to-emerald-700/30" :
                getActivityHeight() >= 50 ? "bg-gradient-to-t from-yellow-900/50 to-yellow-700/30" :
                "bg-gradient-to-t from-orange-900/50 to-orange-700/30"
              )}
              initial={{ height: 0 }}
              animate={{ height: `${getActivityHeight()}%` }}
              transition={{ duration: 0.6, delay: 0.6 }}
            />
            <motion.div
              className={cn(
                "absolute -top-2 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-lg",
                getActivityHeight() >= 80 ? "bg-gradient-to-br from-emerald-400 to-emerald-600" :
                getActivityHeight() >= 50 ? "bg-gradient-to-br from-yellow-400 to-yellow-600" :
                "bg-gradient-to-br from-orange-400 to-orange-600"
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9 }}
            >
              <Calendar className="h-3 w-3" />
            </motion.div>
          </div>
          <div className="text-center">
            <div className="text-white font-semibold text-xs">{tool.lastUpdate}</div>
            <div className="text-gray-500 text-[10px]">Update</div>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4">
        <CompanyBadge company={tool.company} />
      </div>
    </div>
  );
});

// ============================================================================
// UI Components (Button, Badge, Card)
// ============================================================================

export function Button({ 
  className, 
  variant = "default", 
  size = "default", 
  children, 
  ...props 
}: { 
  className?: string; 
  variant?: "default" | "outline" | "ghost"; 
  size?: "default" | "sm" | "icon"; 
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants = {
    default: "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600",
    outline: "border border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 text-gray-200",
    ghost: "hover:bg-gray-800/50 text-gray-300 hover:text-white",
  };
  const sizes = { default: "h-9 px-4 text-sm", sm: "h-7 px-3 text-xs", icon: "h-9 w-9" };
  
  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:opacity-50", 
        variants[variant], 
        sizes[size], 
        className
      )} 
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({ 
  className, 
  variant = "default", 
  children 
}: { 
  className?: string; 
  variant?: "default" | "secondary" | "success" | "warning" | "info"; 
  children: React.ReactNode;
}) {
  const variants = {
    default: "bg-violet-500/20 text-violet-300",
    secondary: "bg-gray-700/50 text-gray-300",
    success: "bg-emerald-500/20 text-emerald-300",
    warning: "bg-amber-500/20 text-amber-300",
    info: "bg-blue-500/20 text-blue-300",
  };
  
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}

export function Card({ 
  className, 
  children, 
  onClick 
}: { 
  className?: string; 
  children: React.ReactNode; 
  onClick?: () => void;
}) {
  return (
    <div 
      onClick={onClick} 
      className={cn("rounded-xl border border-gray-800 bg-gray-900/60 backdrop-blur-sm shadow-lg", className)}
    >
      {children}
    </div>
  );
}

export function CardHeader({ 
  className, 
  children 
}: { 
  className?: string; 
  children: React.ReactNode;
}) {
  return <div className={cn("p-4", className)}>{children}</div>;
}

export function CardTitle({ 
  className, 
  children 
}: { 
  className?: string; 
  children: React.ReactNode;
}) {
  return <h3 className={cn("text-base font-semibold text-white", className)}>{children}</h3>;
}

export function CardContent({ 
  className, 
  children 
}: { 
  className?: string; 
  children: React.ReactNode;
}) {
  return <div className={cn("p-4 pt-0", className)}>{children}</div>;
}
