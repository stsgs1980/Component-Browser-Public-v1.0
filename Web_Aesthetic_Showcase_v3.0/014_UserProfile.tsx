// Project: Web Aesthetic Showcase v3.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v3.0\src\components
// Lines: 1048

'use client';

import { useState, useCallback, useMemo, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitCompare,
  ArrowLeftRight,
  Copy,
  Check,
  FileText,
  Plus,
  Minus,
  Equal,
  Columns2,
  Rows3,
} from 'lucide-react';

/* ──────────────────────────────────────────────
   SSR-SAFE MOUNT HOOK
   ────────────────────────────────────────────── */
const subscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

/* ──────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────── */
type DiffType = 'added' | 'removed' | 'unchanged' | 'changed';

interface DiffLine {
  type: DiffType;
  content: string;
  oldLineNum?: number;
  newLineNum?: number;
}

type ViewMode = 'unified' | 'split';

interface DiffPreset {
  id: string;
  name: string;
  icon: string;
  original: string;
  modified: string;
}

/* ──────────────────────────────────────────────
   LCS-BASED DIFF ALGORITHM
   ────────────────────────────────────────────── */
function computeLCS(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp;
}

function computeDiff(original: string[], modified: string[]): DiffLine[] {
  const dp = computeLCS(original, modified);
  const result: DiffLine[] = [];

  let i = original.length;
  let j = modified.length;
  const rawOps: { type: DiffType; content: string }[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && original[i - 1] === modified[j - 1]) {
      rawOps.unshift({ type: 'unchanged', content: original[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawOps.unshift({ type: 'added', content: modified[j - 1] });
      j--;
    } else if (i > 0) {
      rawOps.unshift({ type: 'removed', content: original[i - 1] });
      i--;
    }
  }

  // Group adjacent removed+added pairs into "changed"
  let skip = false;
  for (let k = 0; k < rawOps.length; k++) {
    if (skip) { skip = false; continue; }
    const op = rawOps[k];
    if (op.type === 'removed' && k + 1 < rawOps.length && rawOps[k + 1].type === 'added') {
      result.push({ type: 'changed', content: op.content, oldLineNum: undefined, newLineNum: undefined });
      result.push({ type: 'changed', content: rawOps[k + 1].content, oldLineNum: undefined, newLineNum: undefined });
      skip = true;
    } else {
      result.push({ ...op, oldLineNum: undefined, newLineNum: undefined });
    }
  }

  // Assign line numbers
  let oldNum = 0;
  let newNum = 0;
  for (const line of result) {
    if (line.type === 'removed' || line.type === 'changed') {
      oldNum++;
      line.oldLineNum = oldNum;
      if (line.type === 'removed') continue;
    }
    if (line.type === 'added' || line.type === 'changed') {
      newNum++;
      line.newLineNum = newNum;
    } else {
      oldNum++;
      newNum++;
      line.oldLineNum = oldNum;
      line.newLineNum = newNum;
    }
  }

  return result;
}

/* ──────────────────────────────────────────────
   SAMPLE PRESETS
   ────────────────────────────────────────────── */
const PRESETS: DiffPreset[] = [
  {
    id: 'css-before-after',
    name: 'CSS Before/After',
    icon: '🎨',
    original: `.container {
  display: block;
  margin: 0 auto;
  padding: 20px;
  width: 960px;
  font-family: Arial, sans-serif;
}

.card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.btn {
  background: #3498db;
  color: white;
  padding: 10px 24px;
  border: none;
  cursor: pointer;
  font-size: 14px;
}`,
    modified: `.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', system-ui, sans-serif;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.btn {
  background: var(--primary);
  color: var(--on-primary);
  padding: 0.625rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.15s;
}

.btn:hover {
  opacity: 0.9;
}`,
  },
  {
    id: 'react-class-hooks',
    name: 'React Class → Hooks',
    icon: '⚛️',
    original: `import React, { Component } from 'react';

class UserProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loading: true,
      error: null,
    };
    this.fetchUser = this.fetchUser.bind(this);
  }

  componentDidMount() {
    this.fetchUser();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId) {
      this.fetchUser();
    }
  }

  async fetchUser() {
    this.setState({ loading: true, error: null });
    try {
      const res = await fetch(\`/api/users/\${this.props.userId}\`);
      if (!res.ok) throw new Error('Failed to fetch');
      const user = await res.json();
      this.setState({ user, loading: false });
    } catch (err) {
      this.setState({ error: err.message, loading: false });
    }
  }

  render() {
    const { user, loading, error } = this.state;
    if (loading) return <Spinner />;
    if (error) return <Error message={error} />;
    return <UserCard user={user} />;
  }
}

export default UserProfile;`,
    modified: `import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

function useUser(userId: number) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(\`/api/users/\${userId}\`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setUser(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [userId]);

  return { user, loading, error };
}

export default function UserProfile({ userId }: { userId: number }) {
  const { user, loading, error } = useUser(userId);
  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;
  return <UserCard user={user!} />;
}`,
  },
  {
    id: 'json-refactor',
    name: 'JSON Refactor',
    icon: '📋',
    original: `{
  "apiVersion": "v1",
  "kind": "Config",
  "metadata": {
    "name": "my-app-config",
    "namespace": "default",
    "labels": {
      "app": "my-app",
      "version": "1.0.0"
    }
  },
  "spec": {
    "replicas": 3,
    "image": "my-registry/my-app:latest",
    "port": 8080,
    "env": [
      { "name": "NODE_ENV", "value": "production" },
      { "name": "LOG_LEVEL", "value": "info" },
      { "name": "DB_HOST", "value": "localhost" }
    ],
    "resources": {
      "cpu": "500m",
      "memory": "512Mi"
    },
    "healthCheck": {
      "enabled": true,
      "path": "/health",
      "interval": 30
    }
  }
}`,
    modified: `{
  "apiVersion": "v2",
  "kind": "Deployment",
  "metadata": {
    "name": "my-app",
    "namespace": "production",
    "labels": {
      "app": "my-app",
      "version": "2.1.0",
      "team": "backend",
      "tier": "web"
    },
    "annotations": {
      "deployment-date": "2024-01-15",
      "changelog": "Migrate to v2 API"
    }
  },
  "spec": {
    "replicas": 5,
    "image": "my-registry/my-app:2.1.0",
    "ports": [
      { "name": "http", "containerPort": 8080, "protocol": "TCP" },
      { "name": "metrics", "containerPort": 9090, "protocol": "TCP" }
    ],
    "env": [
      { "name": "NODE_ENV", "value": "production" },
      { "name": "LOG_LEVEL", "value": "warn" },
      { "name": "DB_HOST", "valueFrom": { "secretRef": "db-credentials" } },
      { "name": "CACHE_URL", "value": "redis://cache:6379" }
    ],
    "resources": {
      "requests": { "cpu": "250m", "memory": "256Mi" },
      "limits": { "cpu": "1000m", "memory": "1Gi" }
    },
    "readinessProbe": {
      "httpGet": { "path": "/health", "port": "http" },
      "initialDelaySeconds": 5,
      "periodSeconds": 10
    },
    "livenessProbe": {
      "httpGet": { "path": "/healthz", "port": "http" },
      "initialDelaySeconds": 15,
      "periodSeconds": 20
    },
    "autoscaling": {
      "enabled": true,
      "minReplicas": 3,
      "maxReplicas": 10,
      "targetCPU": 70
    }
  }
}`,
  },
];

/* ──────────────────────────────────────────────
   FLOATING DECORATIONS
   ────────────────────────────────────────────── */
const FLOAT_SYMBOLS = [
  { text: '+', x: 4, y: 8, delay: 0 },
  { text: '-', x: 92, y: 12, delay: 1.4 },
  { text: '~', x: 88, y: 78, delay: 2.1 },
  { text: 'diff', x: 6, y: 70, delay: 0.7 },
  { text: '>>>', x: 82, y: 42, delay: 1.9 },
  { text: '===', x: 12, y: 45, delay: 2.8 },
];

/* ──────────────────────────────────────────────
   DIFF LINE COLORS
   ────────────────────────────────────────────── */
const DIFF_COLORS: Record<DiffType, { bg: string; border: string; text: string; sign: string }> = {
  added: {
    bg: 'rgba(34, 197, 94, 0.12)',
    border: 'rgba(34, 197, 94, 0.25)',
    text: '#4ade80',
    sign: '+',
  },
  removed: {
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.25)',
    text: '#f87171',
    sign: '-',
  },
  changed: {
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.25)',
    text: '#fbbf24',
    sign: '~',
  },
  unchanged: {
    bg: 'transparent',
    border: 'transparent',
    text: 'rgba(255,255,255,0.55)',
    sign: ' ',
  },
};

/* ──────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────── */
export function DiffViewerSection() {
  const mounted = useIsMounted();

  // ─── State ───
  const [originalText, setOriginalText] = useState('');
  const [modifiedText, setModifiedText] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('unified');
  const [copied, setCopied] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  // ─── Compute diff ───
  const diffLines = useMemo((): DiffLine[] => {
    const origLines = originalText.split('\n');
    const modLines = modifiedText.split('\n');

    if (!originalText && !modifiedText) return [];

    return computeDiff(origLines, modLines);
  }, [originalText, modifiedText]);

  // ─── Stats ───
  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    let unchanged = 0;
    let changed = 0;
    for (const line of diffLines) {
      if (line.type === 'added') added++;
      else if (line.type === 'removed') removed++;
      else if (line.type === 'changed') changed++;
      else unchanged++;
    }
    return { added, removed, unchanged, changed, total: diffLines.length };
  }, [diffLines]);

  // ─── Unified text output for copy ───
  const unifiedOutput = useMemo(() => {
    return diffLines
      .map((line) => {
        const c = DIFF_COLORS[line.type];
        return `${c.sign} ${line.content}`;
      })
      .join('\n');
  }, [diffLines]);

  // ─── Split view data ───
  const splitData = useMemo(() => {
    const left: (DiffLine & { idx: number })[] = [];
    const right: (DiffLine & { idx: number })[] = [];

    diffLines.forEach((line, i) => {
      if (line.type === 'removed') {
        left.push({ ...line, idx: i });
        right.push({ type: 'unchanged', content: '', idx: i } as DiffLine & { idx: number });
      } else if (line.type === 'added') {
        left.push({ type: 'unchanged', content: '', idx: i } as DiffLine & { idx: number });
        right.push({ ...line, idx: i });
      } else if (line.type === 'changed') {
        // Changed lines come in pairs: removed then added
        left.push({ ...line, idx: i });
        // We need to pair with the next line if it's also changed
      } else {
        left.push({ ...line, idx: i });
        right.push({ ...line, idx: i });
      }
    });

    // Better approach: iterate through diffLines and handle changed pairs
    const leftFinal: (DiffLine & { idx: number })[] = [];
    const rightFinal: (DiffLine & { idx: number })[] = [];
    let ci = 0;

    while (ci < diffLines.length) {
      const line = diffLines[ci];

      if (line.type === 'unchanged') {
        leftFinal.push({ ...line, idx: ci });
        rightFinal.push({ ...line, idx: ci });
        ci++;
      } else if (line.type === 'removed') {
        leftFinal.push({ ...line, idx: ci });
        rightFinal.push({ type: 'unchanged', content: '', idx: ci } as DiffLine & { idx: number });
        ci++;
      } else if (line.type === 'added') {
        leftFinal.push({ type: 'unchanged', content: '', idx: ci } as DiffLine & { idx: number });
        rightFinal.push({ ...line, idx: ci });
        ci++;
      } else if (line.type === 'changed') {
        leftFinal.push({ ...line, idx: ci });
        // Check if next line is also changed (the "after" part)
        if (ci + 1 < diffLines.length && diffLines[ci + 1].type === 'changed') {
          rightFinal.push({ ...diffLines[ci + 1], idx: ci + 1 });
          ci += 2;
        } else {
          rightFinal.push({ type: 'unchanged', content: '', idx: ci } as DiffLine & { idx: number });
          ci++;
        }
      }
    }

    return { left: leftFinal, right: rightFinal };
  }, [diffLines]);

  // ─── Handlers ───
  const loadPreset = useCallback((preset: DiffPreset) => {
    setOriginalText(preset.original);
    setModifiedText(preset.modified);
    setActivePresetId(preset.id);
  }, []);

  const copyDiff = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(unifiedOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = unifiedOutput;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [unifiedOutput]);

  const clearAll = useCallback(() => {
    setOriginalText('');
    setModifiedText('');
    setActivePresetId(null);
  }, []);

  if (!mounted) {
    return (
      <section className="relative w-full min-h-[80vh] bg-gradient-to-b from-[#0a0a0a] to-[#0a1018]" />
    );
  }

  return (
    <section className="relative w-full py-20 md:py-28 bg-gradient-to-b from-[#0a0a0a] to-[#0a1018] overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none bg-grid-subtle" />

      {/* Floating decorative symbols */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {FLOAT_SYMBOLS.map((sym, i) => (
          <motion.div
            key={`diff-float-${i}`}
            className="absolute font-mono text-sm whitespace-nowrap select-none"
            style={{
              left: `${sym.x}%`,
              top: `${sym.y}%`,
              color: 'rgba(16, 185, 129, 0.08)',
            }}
            animate={{ y: [0, -10, 0], opacity: [0.05, 0.12, 0.05] }}
            transition={{ duration: 7 + i * 0.9, repeat: Infinity, ease: 'easeInOut', delay: sym.delay }}
          >
            {sym.text}
          </motion.div>
        ))}
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)' }}
      />

      {/* Content */}
      <div className="relative z-10 w-full px-4 md:px-8">
        {/* Section header */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm mb-6">
            <GitCompare className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-white/60 font-mono">Compare Tool</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient-text">
              Diff Viewer
            </span>
          </h2>
          <p className="text-base md:text-lg text-white/40 max-w-xl mx-auto font-mono">
            Compare text side-by-side with real-time line-level diff highlighting
          </p>
        </motion.div>

        {/* Preset buttons */}
        <motion.div
          className="max-w-7xl mx-auto mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-white/30 mr-1">Presets:</span>
            {PRESETS.map((preset) => {
              const isActive = activePresetId === preset.id;
              return (
                <motion.button
                  key={`diff-preset-${preset.id}`}
                  onClick={() => loadPreset(preset)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/[0.12] hover:bg-white/[0.04]'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Load preset: ${preset.name}`}
                >
                  <span>{preset.icon}</span>
                  <span>{preset.name}</span>
                </motion.button>
              );
            })}
            <div className="flex-1" />
            <motion.button
              onClick={clearAll}
              className="px-3 py-1.5 rounded-lg text-xs font-mono text-white/40 border border-white/[0.06] bg-white/[0.02] hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Clear all text"
            >
              Clear
            </motion.button>
          </div>
        </motion.div>

        {/* Text input areas */}
        <motion.div
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Original text area */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs font-mono text-white/30 ml-2">original</span>
              <div className="flex-1" />
              <Minus className="w-3.5 h-3.5 text-red-400/50" />
            </div>
            <div className="px-4 py-3">
              <textarea
                value={originalText}
                onChange={(e) => { setOriginalText(e.target.value); setActivePresetId(null); }}
                className="w-full h-40 sm:h-48 bg-black/30 rounded-lg border border-white/[0.06] focus-within:border-red-500/30 text-white font-mono text-xs p-3 outline-none resize-none placeholder:text-white/20 custom-scrollbar transition-colors"
                placeholder="Paste original text here..."
                spellCheck={false}
                aria-label="Original text input"
              />
            </div>
          </div>

          {/* Modified text area */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs font-mono text-white/30 ml-2">modified</span>
              <div className="flex-1" />
              <Plus className="w-3.5 h-3.5 text-green-400/50" />
            </div>
            <div className="px-4 py-3">
              <textarea
                value={modifiedText}
                onChange={(e) => { setModifiedText(e.target.value); setActivePresetId(null); }}
                className="w-full h-40 sm:h-48 bg-black/30 rounded-lg border border-white/[0.06] focus-within:border-emerald-500/30 text-white font-mono text-xs p-3 outline-none resize-none placeholder:text-white/20 custom-scrollbar transition-colors"
                placeholder="Paste modified text here..."
                spellCheck={false}
                aria-label="Modified text input"
              />
            </div>
          </div>
        </motion.div>

        {/* Toolbar: View mode toggle + Stats + Copy */}
        <motion.div
          className="max-w-7xl mx-auto mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="flex flex-wrap items-center gap-3">
            {/* View mode toggle */}
            <div className="flex items-center rounded-lg border border-white/[0.08] bg-white/[0.02] overflow-hidden">
              <motion.button
                onClick={() => setViewMode('unified')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono transition-all cursor-pointer relative ${
                  viewMode === 'unified' ? 'text-emerald-300' : 'text-white/40 hover:text-white/60'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label="Unified view"
              >
                <Rows3 className="w-3.5 h-3.5" />
                Unified
                {viewMode === 'unified' && (
                  <motion.div
                    className="absolute inset-0 bg-emerald-500/10 border-b-2 border-emerald-500/50"
                    layoutId="diff-view-indicator"
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  />
                )}
              </motion.button>
              <motion.button
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono transition-all cursor-pointer relative ${
                  viewMode === 'split' ? 'text-emerald-300' : 'text-white/40 hover:text-white/60'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label="Split view"
              >
                <Columns2 className="w-3.5 h-3.5" />
                Split
                {viewMode === 'split' && (
                  <motion.div
                    className="absolute inset-0 bg-emerald-500/10 border-b-2 border-emerald-500/50"
                    layoutId="diff-view-indicator"
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  />
                )}
              </motion.button>
            </div>

            {/* Stats */}
            {diffLines.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                  <Plus className="w-3 h-3 text-emerald-400" />
                  <span className="text-xs font-mono text-emerald-300">{stats.added}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20">
                  <Minus className="w-3 h-3 text-red-400" />
                  <span className="text-xs font-mono text-red-300">{stats.removed}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
                  <ArrowLeftRight className="w-3 h-3 text-amber-400" />
                  <span className="text-xs font-mono text-amber-300">{stats.changed}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06]">
                  <Equal className="w-3 h-3 text-white/30" />
                  <span className="text-xs font-mono text-white/40">{stats.unchanged}</span>
                </div>
              </div>
            )}

            <div className="flex-1" />

            {/* Copy button */}
            {diffLines.length > 0 && (
              <motion.button
                onClick={copyDiff}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono text-white/50 border border-white/[0.06] bg-white/[0.02] hover:text-white/80 hover:border-white/[0.12] transition-all cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Copy unified diff"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Diff
                  </>
                )}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Diff output */}
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            {diffLines.length === 0 ? (
              <motion.div
                key="diff-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden"
              >
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs font-mono text-white/30 ml-2">diff-output</span>
                </div>
                <div className="px-4 py-16 text-center">
                  <GitCompare className="w-10 h-10 text-white/10 mx-auto mb-3" />
                  <p className="text-sm font-mono text-white/20">
                    Enter text in both panels or select a preset to see the diff
                  </p>
                </div>
              </motion.div>
            ) : viewMode === 'unified' ? (
              <motion.div
                key="diff-unified"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden"
              >
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs font-mono text-white/30 ml-2">unified-diff</span>
                  <div className="flex-1" />
                  <span className="text-[10px] font-mono text-white/20">{diffLines.length} lines</span>
                </div>
                <div className="max-h-[500px] overflow-y-auto custom-scrollbar scrollbar-track-glass">
                  <table className="w-full text-xs font-mono border-collapse">
                    <tbody>
                      {diffLines.map((line, i) => {
                        const c = DIFF_COLORS[line.type];
                        return (
                          <motion.tr
                            key={`diff-line-${i}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: Math.min(i * 0.008, 0.5) }}
                            className="border-b border-white/[0.02] hover:brightness-110 transition-all"
                            style={{ backgroundColor: c.bg }}
                          >
                            <td className="w-10 text-right px-2 py-0 select-none border-r border-white/[0.04] text-white/15 font-mono text-[10px]">
                              {line.oldLineNum ?? ''}
                            </td>
                            <td className="w-10 text-right px-2 py-0 select-none border-r border-white/[0.04] text-white/15 font-mono text-[10px]">
                              {line.newLineNum ?? ''}
                            </td>
                            <td className="w-6 text-center py-0 select-none font-bold" style={{ color: c.text }}>
                              {c.sign}
                            </td>
                            <td className="px-3 py-[3px] whitespace-pre-wrap break-all" style={{ color: line.type === 'unchanged' ? c.text : c.text }}>
                              {line.content || '\u00A0'}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : (
              /* Split view */
              <motion.div
                key="diff-split"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-0 rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden"
              >
                {/* Left column */}
                <div className="border-b md:border-b-0 md:border-r border-white/[0.06]">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
                    <Minus className="w-3 h-3 text-red-400/50" />
                    <span className="text-xs font-mono text-white/30">original</span>
                  </div>
                  <div className="max-h-[480px] overflow-y-auto custom-scrollbar scrollbar-track-glass">
                    <table className="w-full text-xs font-mono border-collapse">
                      <tbody>
                        {splitData.left.map((line, i) => {
                          const c = DIFF_COLORS[line.type];
                          const isEmpty = line.content === '';
                          return (
                            <tr
                              key={`split-left-${i}`}
                              className="border-b border-white/[0.02] transition-all"
                              style={{ backgroundColor: isEmpty ? 'transparent' : c.bg }}
                            >
                              <td className="w-10 text-right px-2 py-0 select-none border-r border-white/[0.04] text-white/15 font-mono text-[10px]">
                                {line.oldLineNum ?? ''}
                              </td>
                              <td className="w-5 text-center py-0 select-none font-bold" style={{ color: c.text }}>
                                {isEmpty ? '' : c.sign}
                              </td>
                              <td className="px-3 py-[3px] whitespace-pre-wrap break-all" style={{ color: isEmpty ? 'transparent' : c.text }}>
                                {line.content || '\u00A0'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right column */}
                <div>
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
                    <Plus className="w-3 h-3 text-emerald-400/50" />
                    <span className="text-xs font-mono text-white/30">modified</span>
                  </div>
                  <div className="max-h-[480px] overflow-y-auto custom-scrollbar scrollbar-track-glass">
                    <table className="w-full text-xs font-mono border-collapse">
                      <tbody>
                        {splitData.right.map((line, i) => {
                          const c = DIFF_COLORS[line.type];
                          const isEmpty = line.content === '';
                          return (
                            <tr
                              key={`split-right-${i}`}
                              className="border-b border-white/[0.02] transition-all"
                              style={{ backgroundColor: isEmpty ? 'transparent' : c.bg }}
                            >
                              <td className="w-10 text-right px-2 py-0 select-none border-r border-white/[0.04] text-white/15 font-mono text-[10px]">
                                {line.newLineNum ?? ''}
                              </td>
                              <td className="w-5 text-center py-0 select-none font-bold" style={{ color: c.text }}>
                                {isEmpty ? '' : c.sign}
                              </td>
                              <td className="px-3 py-[3px] whitespace-pre-wrap break-all" style={{ color: isEmpty ? 'transparent' : c.text }}>
                                {line.content || '\u00A0'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Legend */}
        <motion.div
          className="max-w-7xl mx-auto mt-4 mb-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex flex-wrap items-center gap-4 justify-center text-[10px] font-mono text-white/30">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(34, 197, 94, 0.25)' }} />
              <span>Added</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(239, 68, 68, 0.25)' }} />
              <span>Removed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(245, 158, 11, 0.25)' }} />
              <span>Changed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm border border-white/10" />
              <span>Unchanged</span>
            </div>
          </div>
        </motion.div>

        {/* Info bar */}
        <motion.div
          className="max-w-7xl mx-auto mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-mono text-white/25"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {[
            { icon: ArrowLeftRight, text: '2 Views' },
            { icon: FileText, text: 'Real-time' },
            { icon: Equal, text: 'Line Numbers' },
            { icon: Copy, text: 'Copy Output' },
          ].map((info, i) => (
            <div key={`diff-info-${i}`} className="flex items-center gap-1.5">
              <info.icon className="w-3.5 h-3.5" />
              <span>{info.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
