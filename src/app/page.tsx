'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Search,
  ChevronRight,
  Copy,
  Check,
  Download,
  Star,
  StarOff,
  Package,
  AlertCircle,
  X,
  Info,
  RefreshCw,
  Terminal,
  Shield,
  FileCode2,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────

interface IndexEntry {
  source: string;
  name: string;
  category: string;
  file: string;
  lines: number;
  path: string;
  hasProps: boolean;
  hasJSDoc: boolean;
  hasBrokenImports: boolean;
  externalDeps: string[];
  localImports: string[];
  tags: string[];
  status: 'clean' | 'needs-work' | 'broken';
  missingChecks: string[];
}

interface Stats {
  total: number;
  categories: number;
  categoryCounts: Record<string, number>;
  clean: number;
  needsWork: number;
  broken: number;
  topPackages: { name: string; count: number }[];
}

type DetailTab = 'preview' | 'source' | 'props' | 'deps';

interface ParsedProp {
  name: string;
  type: string;
  optional: boolean;
  description: string;
}

// ─── Category Groups ──────────────────────────────────────────────

const CATEGORY_GROUPS: {
  label: string;
  color: string;
  categories: string[];
}[] = [
  { label: 'Core', color: '#10b981', categories: ['animation', 'cards', 'color', 'content', 'layout'] },
  { label: 'Display', color: '#8b5cf6', categories: ['data-display', 'visualization', 'theme', 'preview'] },
  { label: 'Interactive', color: '#f59e0b', categories: ['interactive', 'navigation', 'forms', 'panels'] },
  { label: 'Tools', color: '#06b6d4', categories: ['dev-tools', 'hooks', 'flow', 'error-handling'] },
  { label: 'Specialized', color: '#f472b6', categories: ['chat', 'i18n', 'feedback'] },
];

function getCategoryGroupColor(category: string): string {
  for (const group of CATEGORY_GROUPS) {
    if (group.categories.includes(category)) return group.color;
  }
  return '#64748b';
}

// ─── Props Parser ─────────────────────────────────────────────────

function parseProps(code: string): { interfaceName: string; props: ParsedProp[] } {
  const result: ParsedProp[] = [];
  let interfaceName = '';

  const propsPattern = /(?:export\s+)?(?:interface|type)\s+(\w*Props\w*)\s*(?:=\s*)?\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
  let match;

  while ((match = propsPattern.exec(code)) !== null) {
    interfaceName = match[1];
    const body = match[2];
    const lines = body.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*')) continue;
      const propMatch = trimmed.match(/(\w+)(\??):\s*([^;]+);(?:\s*\/\/\s*(.*))?$/);
      if (propMatch) {
        result.push({
          name: propMatch[1],
          type: propMatch[3].trim(),
          optional: propMatch[2] === '?',
          description: propMatch[4]?.trim() || '',
        });
      }
    }
    if (result.length > 0) break;
  }

  return { interfaceName, props: result };
}

// ─── Extract Description ──────────────────────────────────────────

function extractDescription(code: string): string {
  const jsdocMatch = code.match(/\/\*\*[\s\S]*?\*\/\s*(?:export\s+)?(?:default\s+)?(?:function|const)/);
  if (jsdocMatch) {
    const comment = jsdocMatch[0];
    const descLines: string[] = [];
    const lines = comment.split('\n');
    for (const line of lines) {
      const trimmed = line.replace(/^\s*\*\s?/, '').trim();
      if (trimmed && !trimmed.startsWith('@')) descLines.push(trimmed);
    }
    if (descLines.length > 0) return descLines.join(' ').substring(0, 200);
  }
  return '';
}

// ─── Known packages (installed in this project) ──────────────────

const KNOWN_INSTALLED = new Set([
  'react', 'react-dom', 'next', 'typescript', 'tailwindcss', 'framer-motion',
  'lucide-react', 'recharts', 'zustand', 'prisma', 'zod', 'next-auth',
  'next-themes', 'react-hook-form', '@hookform/resolvers', 'date-fns',
  'react-markdown', 'react-syntax-highlighter', 'sonner', 'class-variance-authority',
  'clsx', 'tailwind-merge', 'cmdk', 'embla-carousel-react', 'vaul',
  'react-day-picker', 'react-resizable-panels', '@tanstack/react-query',
  '@tanstack/react-table', '@radix-ui/react-accordion', '@radix-ui/react-alert-dialog',
  '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs',
  '@radix-ui/react-tooltip', '@radix-ui/react-select', '@radix-ui/react-checkbox',
  '@radix-ui/react-switch', '@radix-ui/react-scroll-area', '@radix-ui/react-separator',
  '@radix-ui/react-slot', '@radix-ui/react-toggle', '@radix-ui/react-popover',
  '@radix-ui/react-avatar', '@radix-ui/react-label', '@radix-ui/react-progress',
  '@radix-ui/react-radio-group', '@radix-ui/react-menubar', '@radix-ui/react-navigation-menu',
  '@radix-ui/react-hover-card', '@radix-ui/react-collapsible', '@radix-ui/react-context-menu',
  '@radix-ui/react-aspect-ratio', 'input-otp', '@dnd-kit/core', '@dnd-kit/sortable',
  '@dnd-kit/utilities', '@mdxeditor/editor', '@reactuses/core', '@prisma/client',
]);

function isPackageInstalled(pkg: string): boolean {
  const base = pkg.split('/').slice(0, pkg.startsWith('@') ? 2 : 1).join('/');
  return KNOWN_INSTALLED.has(base) || KNOWN_INSTALLED.has(base.toLowerCase());
}

function getBasePackageName(pkg: string): string {
  return pkg.split('/').slice(0, pkg.startsWith('@') ? 2 : 1).join('/');
}

// ─── Complex dependency packages (can't render live) ─────────────

const COMPLEX_DEPS = new Set([
  'framer-motion', 'recharts', 'three', '@react-three/fiber', '@react-three/drei',
  'reactflow', '@xyflow/react', 'd3', 'chart.js', 'react-icons', 'react-syntax-highlighter',
  '@mdxeditor/editor', 'monaco-editor', 'draft-js', 'slate',
]);

function hasComplexDeps(deps: string[]): boolean {
  for (const dep of deps) {
    const base = getBasePackageName(dep);
    if (COMPLEX_DEPS.has(base)) return true;
  }
  return false;
}

// ─── Status Icon ──────────────────────────────────────────────────

function StatusIcon({ status, size = 14 }: { status: string; size?: number }) {
  if (status === 'clean') return <CheckCircle2 className="shrink-0" size={size} style={{ color: '#10b981' }} />;
  if (status === 'needs-work') return <AlertTriangle className="shrink-0" size={size} style={{ color: '#f59e0b' }} />;
  return <XCircle className="shrink-0" size={size} style={{ color: '#ef4444' }} />;
}

// ─── Syntax Highlighting ──────────────────────────────────────────

function highlightSyntax(code: string): string {
  const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escaped.replace(
    /(\/\/.*$|\/\*[\s\S]*?\*\/|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`|(?:export|import|from|default|const|let|var|function|return|if|else|for|while|interface|type|extends|implements|class|new|this|typeof|instanceof|as|async|await|try|catch|throw|switch|case|break|continue|true|false|null|undefined|void|readonly|private|public|protected|static|abstract|enum|declare|namespace|module|require)\b)/gm,
    (match: string) => {
      if (match.startsWith('//')) return `<span class="code-cm">${match}</span>`;
      if (match.startsWith('/*')) return `<span class="code-cm">${match}</span>`;
      if (match.startsWith("'") || match.startsWith('"') || match.startsWith('`'))
        return `<span class="code-str">${match}</span>`;
      return `<span class="code-kw">${match}</span>`;
    }
  );
}

// ─── FAVORITES HOOK ───────────────────────────────────────────────

function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const stored = localStorage.getItem('cb-favorites');
      if (stored) return new Set(JSON.parse(stored) as string[]);
    } catch { /* ignore */ }
    return new Set();
  });

  const toggleFavorite = useCallback((path: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      localStorage.setItem('cb-favorites', JSON.stringify([...next]));
      return next;
    });
  }, []);

  const isFavorite = useCallback((path: string) => favorites.has(path), [favorites]);

  return { favorites, toggleFavorite, isFavorite, favoritePaths: [...favorites].join(',') };
}

// ─── Main Component ───────────────────────────────────────────────

export default function ComponentBrowser() {
  const [allComponents, setAllComponents] = useState<IndexEntry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<IndexEntry | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('preview');
  const [sourceCode, setSourceCode] = useState<string | null>(null);
  const [codeLoading, setCodeLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { favorites, toggleFavorite, isFavorite, favoritePaths } = useFavorites();

  // ─── Fetch all components ─────────────────────────────────────
  const fetchComponents = useCallback(async (showScanStatus = true) => {
    if (showScanStatus) setLoading(true);
    try {
      const res = await fetch('/api/components');
      const data = await res.json();
      setAllComponents(data.components || []);
      setStats(data.stats || null);
      if (data.stats?.categoryCounts) {
        const firstCat = Object.keys(data.stats.categoryCounts)[0];
        if (firstCat && !selectedCategory) setSelectedCategory(firstCat);
      }
    } catch (err) {
      console.error('Failed to fetch components:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchComponents();
  }, []);

  // ─── Rescan ───────────────────────────────────────────────────
  const handleRescan = useCallback(async () => {
    setScanning(true);
    try {
      const res = await fetch('/api/scan', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        // Re-fetch components with updated data
        const compRes = await fetch('/api/components');
        const compData = await compRes.json();
        setAllComponents(compData.components || []);
        setStats(compData.stats || data.stats);
      }
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setScanning(false);
    }
  }, []);

  // ─── Filtered components ─────────────────────────────────────
  const filteredComponents = useMemo(() => {
    let result = allComponents;

    if (showFavoritesOnly) {
      result = result.filter((c) => isFavorite(c.path));
    } else if (selectedCategory) {
      result = result.filter((c) => c.category === selectedCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.file.toLowerCase().includes(q) ||
          c.source.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [allComponents, selectedCategory, search, showFavoritesOnly, favorites]);

  // ─── Parsed props ────────────────────────────────────────────
  const parsedProps = useMemo(() => {
    if (!sourceCode) return { interfaceName: '', props: [] };
    return parseProps(sourceCode);
  }, [sourceCode]);

  // ─── Description ─────────────────────────────────────────────
  const description = useMemo(() => {
    if (!sourceCode) return '';
    return extractDescription(sourceCode);
  }, [sourceCode]);

  // ─── Load source code ────────────────────────────────────────
  const selectComponent = useCallback(async (comp: IndexEntry) => {
    setSelectedComponent(comp);
    setActiveTab('preview');
    setSourceCode(null);
    setCodeLoading(true);
    setCopied(false);

    try {
      const res = await fetch(`/api/components/file/${encodeURIComponent(comp.path)}`);
      if (res.ok) {
        const data = await res.json();
        setSourceCode(data.content);
      }
    } catch { /* ignore */ }
    finally {
      setCodeLoading(false);
    }
  }, []);

  // ─── Copy code ───────────────────────────────────────────────
  const copyCode = useCallback(() => {
    if (sourceCode) {
      navigator.clipboard.writeText(sourceCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [sourceCode]);

  // ─── Copy import ─────────────────────────────────────────────
  const copyImport = useCallback(() => {
    if (selectedComponent) {
      const stmt = `import { ${selectedComponent.name} } from './components/${selectedComponent.path.replace(/\.\w+$/, '')}'`;
      navigator.clipboard.writeText(stmt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [selectedComponent]);

  // ─── Copy CLI command ────────────────────────────────────────
  const copyCliCommand = useCallback(() => {
    if (selectedComponent) {
      const cmd = `npx cb install ${selectedComponent.path}`;
      navigator.clipboard.writeText(cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [selectedComponent]);

  // ─── Download file ───────────────────────────────────────────
  const downloadFile = useCallback(() => {
    if (sourceCode && selectedComponent) {
      const blob = new Blob([sourceCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedComponent.file;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [sourceCode, selectedComponent]);

  // ─── Handle category click ───────────────────────────────────
  const handleCategoryClick = useCallback((cat: string) => {
    setShowFavoritesOnly(false);
    setSelectedCategory(cat);
  }, []);

  const handleFavoritesClick = useCallback(() => {
    setShowFavoritesOnly(true);
    setSelectedCategory(null);
  }, []);

  // ─── Loading state ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-[#10b981]/20 border-t-[#10b981] animate-spin" />
          </div>
          <p className="text-[#6b7280] text-sm">Scanning {stats?.total || '...'} components...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0a0f] text-[#e4e4e7] overflow-hidden flex flex-col">
      <div className="flex flex-1 overflow-hidden">

        {/* ═══ SIDEBAR ═══ */}
        <aside className={`${sidebarCollapsed ? 'w-0 min-w-0' : 'w-[260px] min-w-[260px]'} bg-[#111118] border-r border-[#2a2a3a] flex flex-col overflow-hidden transition-all duration-200`}>
          {/* Header */}
          <div className="p-4 border-b border-[#2a2a3a] flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10b981] to-[#06b6d4] flex items-center justify-center text-white text-xs font-extrabold shrink-0">
              CB
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[#f1f5f9] text-sm font-bold leading-tight truncate">Component Browser</div>
              <div className="text-[10px] text-[#6b7280]">
                {stats?.total || 0} components &middot; v2.1
              </div>
            </div>
            <button onClick={() => setSidebarCollapsed(true)} className="text-[#4b5563] hover:text-[#9ca3af] p-1 rounded">
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-[#2a2a3a] shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#4b5563]" />
              <input
                type="text"
                placeholder="Search components..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-8 py-2 bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg text-[#d1d5db] text-[13px] placeholder:text-[#4b5563] outline-none focus:border-[#10b981]/50 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#4b5563] hover:text-[#9ca3af]">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="px-3 py-2 flex gap-1.5 flex-wrap shrink-0 border-b border-[#2a2a3a]">
            <span className="text-[10px] px-2 py-1 bg-[#0a0a0f] rounded-md text-[#9ca3af] border border-[#2a2a3a]">
              <strong className="text-[#e4e4e7]">{stats?.total || 0}</strong> total
            </span>
            <span className="text-[10px] px-2 py-1 bg-[#0a0a0f] rounded-md border border-[#10b981]/20 text-[#10b981]">
              <strong>{stats?.clean || 0}</strong> clean
            </span>
            <span className="text-[10px] px-2 py-1 bg-[#0a0a0f] rounded-md border border-[#f59e0b]/20 text-[#f59e0b]">
              <strong>{stats?.needsWork || 0}</strong> needs work
            </span>
            <span className="text-[10px] px-2 py-1 bg-[#0a0a0f] rounded-md border border-[#ef4444]/20 text-[#ef4444]">
              <strong>{stats?.broken || 0}</strong> broken
            </span>
          </div>

          {/* Category List */}
          <div className="flex-1 overflow-y-auto py-1 custom-scrollbar">
            {CATEGORY_GROUPS.map((group) => {
              const groupCategories = group.categories.filter((c) => (stats?.categoryCounts[c] || 0) > 0);
              if (groupCategories.length === 0) return null;
              return (
                <div key={group.label}>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-[#4b5563] px-4 pt-3 pb-1">
                    {group.label}
                  </div>
                  {groupCategories.map((cat) => {
                    const count = stats?.categoryCounts[cat] || 0;
                    const isActive = !showFavoritesOnly && selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => handleCategoryClick(cat)}
                        className={`w-full flex items-center gap-2.5 px-4 py-[7px] text-[13px] transition-colors cursor-pointer ${
                          isActive ? 'bg-[#10b981]/10 text-[#f1f5f9]' : 'text-[#9ca3af] hover:bg-[#1a1a24]/60'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'ring-2 ring-offset-1 ring-offset-[#111118]' : ''}`}
                          style={{ backgroundColor: group.color, ringColor: isActive ? group.color : undefined }}
                        />
                        <span className="flex-1 text-left truncate capitalize">{cat.replace(/-/g, ' ')}</span>
                        <span className={`text-[11px] font-semibold min-w-[20px] text-right ${isActive ? 'text-[#6b7280]' : 'text-[#4b5563]'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}

            {/* Top Packages */}
            {stats?.topPackages && stats.topPackages.length > 0 && (
              <div className="mt-4 border-t border-[#2a2a3a] pt-2 px-4">
                <div className="text-[9px] font-bold uppercase tracking-wider text-[#4b5563] pb-1">Top Packages</div>
                {stats.topPackages.slice(0, 5).map((pkg) => (
                  <div key={pkg.name} className="flex items-center justify-between py-1 text-[11px]">
                    <span className="text-[#6b7280] truncate mr-2">{pkg.name}</span>
                    <span className="text-[#4b5563] font-medium">{pkg.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Favorites button */}
          <div className="border-t border-[#2a2a3a] shrink-0">
            <button
              onClick={handleFavoritesClick}
              className={`w-full flex items-center gap-2.5 px-4 py-3 text-[13px] transition-colors cursor-pointer ${
                showFavoritesOnly
                  ? 'bg-[#f59e0b]/10 text-[#f59e0b]'
                  : 'text-[#9ca3af] hover:bg-[#1a1a24]/60'
              }`}
            >
              <Star className={`h-4 w-4 ${showFavoritesOnly ? 'fill-[#f59e0b]' : ''}`} />
              <span className="flex-1 text-left">Favorites</span>
              <span className="text-[11px] font-semibold bg-[#f59e0b]/15 px-2 py-0.5 rounded-full">
                {favorites.size}
              </span>
            </button>
          </div>
        </aside>

        {/* ═══ MAIN AREA ═══ */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Toolbar */}
          <div className="px-4 py-2.5 border-b border-[#2a2a3a] bg-[#111118] flex items-center gap-3 shrink-0">
            {sidebarCollapsed && (
              <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(false)} className="h-7 px-2 text-[#6b7280] hover:text-[#9ca3af] hover:bg-[#1a1a24]">
                <PanelLeftOpen className="h-4 w-4" />
              </Button>
            )}

            <div className="flex items-center gap-1.5 text-[13px] text-[#6b7280]">
              <span>Components</span>
              <ChevronRight className="h-3 w-3" />
              {showFavoritesOnly ? (
                <span className="text-[#f59e0b] font-medium flex items-center gap-1"><Star className="h-3 w-3" /> Favorites</span>
              ) : (
                <span className="text-[#d1d5db] font-medium capitalize">{selectedCategory?.replace(/-/g, ' ') || '—'}</span>
              )}
              {selectedComponent && (
                <>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-[#10b981]">{selectedComponent.name}</span>
                </>
              )}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRescan}
                disabled={scanning}
                className="h-7 px-2.5 text-[11px] font-medium text-[#6b7280] hover:text-[#9ca3af] hover:bg-[#1a1a24] gap-1"
              >
                <RefreshCw className={`h-3 w-3 ${scanning ? 'animate-spin' : ''}`} />
                {scanning ? 'Scanning...' : 'Rescan'}
              </Button>
              {selectedComponent && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(selectedComponent.path)}
                    className={`h-7 px-2.5 text-[11px] font-medium gap-1 ${
                      isFavorite(selectedComponent.path)
                        ? 'text-[#f59e0b] hover:text-[#f59e0b]'
                        : 'text-[#6b7280] hover:text-[#9ca3af]'
                    } hover:bg-[#1a1a24]`}
                  >
                    {isFavorite(selectedComponent.path) ? <Star className="h-3 w-3 fill-[#f59e0b]" /> : <StarOff className="h-3 w-3" />}
                    {isFavorite(selectedComponent.path) ? 'Favorited' : 'Favorite'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyImport}
                    className="h-7 px-3 text-[11px] font-medium bg-[#1a1a24] border border-[#2a2a3a] text-[#9ca3af] hover:bg-[#222230] hover:text-[#e4e4e7] gap-1.5"
                  >
                    {copied ? <Check className="h-3 w-3 text-[#10b981]" /> : <Copy className="h-3 w-3" />}
                    {copied ? 'Copied' : 'Copy Import'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={downloadFile}
                    disabled={!sourceCode}
                    className="h-7 px-3 text-[11px] font-medium bg-[#1a1a24] border border-[#2a2a3a] text-[#9ca3af] hover:bg-[#222230] hover:text-[#e4e4e7] gap-1.5"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Split: List + Detail */}
          <div className="flex flex-1 overflow-hidden">

            {/* ═══ Component List ═══ */}
            <div className={`${selectedComponent ? 'w-[280px] min-w-[280px]' : 'w-full max-w-[600px]'} border-r border-[#1a1a24] overflow-y-auto p-2.5 bg-[#0a0a0f] transition-all duration-200 custom-scrollbar`}>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[11px] font-semibold text-[#4b5563] uppercase tracking-wider">
                  {showFavoritesOnly ? `${filteredComponents.length} favorites` : `${filteredComponents.length} components`}
                </span>
              </div>

              {filteredComponents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Search className="h-8 w-8 text-[#222230] mb-3" />
                  <p className="text-[#6b7280] text-sm">No components found</p>
                  <p className="text-[#4b5563] text-xs mt-1">
                    {showFavoritesOnly ? 'Star components to add them here' : 'Try a different search or category'}
                  </p>
                </div>
              ) : (
                filteredComponents.map((comp) => {
                  const isActive = selectedComponent?.path === comp.path;
                  const isFav = isFavorite(comp.path);
                  return (
                    <div
                      key={comp.path}
                      onClick={() => selectComponent(comp)}
                      className={`group relative w-full text-left p-2.5 rounded-lg border mb-1.5 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#1a1a24] border-[#10b981]/40 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]'
                          : 'border-transparent hover:bg-[#111118] hover:border-[#2a2a3a]'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <StatusIcon status={comp.status} size={12} />
                            <span className="text-[13px] font-medium text-[#e4e4e7] truncate">{comp.name}</span>
                          </div>
                          <div className="flex gap-1.5 items-center flex-wrap">
                            <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#1a1a24] text-[#6b7280] capitalize">
                              {comp.category.replace(/-/g, ' ')}
                            </span>
                            <span className="text-[10px] text-[#4b5563]">{comp.lines}L</span>
                            {comp.missingChecks.length > 0 && comp.status !== 'broken' && (
                              <span className="text-[9px] text-[#f59e0b]/70 truncate max-w-[120px]" title={comp.missingChecks.join(', ')}>
                                {comp.missingChecks.length} missing
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(comp.path); }}
                          className="shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#222230]"
                        >
                          <Star className={`h-3.5 w-3.5 ${isFav ? 'fill-[#f59e0b] text-[#f59e0b] opacity-100' : 'text-[#4b5563]'}`} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ═══ Detail Panel ═══ */}
            {selectedComponent ? (
              <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Detail Tabs */}
                <div className="flex px-4 border-b border-[#1a1a24] bg-[#0a0a0f] shrink-0">
                  {([
                    { id: 'preview' as const, label: 'Preview' },
                    { id: 'source' as const, label: 'Source Code', badge: selectedComponent.lines },
                    { id: 'props' as const, label: 'Props Table', badge: parsedProps.props.length || null },
                    { id: 'deps' as const, label: 'Dependencies', badge: selectedComponent.externalDeps.length || null },
                  ]).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2.5 text-[13px] font-medium transition-colors cursor-pointer border-b-2 ${
                        activeTab === tab.id
                          ? 'text-[#10b981] border-[#10b981]'
                          : 'text-[#6b7280] border-transparent hover:text-[#9ca3af]'
                      }`}
                    >
                      {tab.label}
                      {tab.badge !== null && tab.badge !== undefined && tab.badge > 0 && (
                        <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                          activeTab === tab.id ? 'bg-[#10b981]/15 text-[#10b981]' : 'bg-[#1a1a24] text-[#6b7280]'
                        }`}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-hidden">
                  {activeTab === 'preview' && (
                    <PreviewTab
                      component={selectedComponent}
                      description={description}
                      categoryColor={getCategoryGroupColor(selectedComponent.category)}
                      onCopyCli={copyCliCommand}
                      copied={copied}
                    />
                  )}
                  {activeTab === 'source' && (
                    <SourceTab code={sourceCode} loading={codeLoading} copied={copied} onCopy={copyCode} />
                  )}
                  {activeTab === 'props' && (
                    <PropsTab
                      props={parsedProps}
                      loading={codeLoading}
                      hasCode={!!sourceCode}
                      componentName={selectedComponent.name}
                    />
                  )}
                  {activeTab === 'deps' && (
                    <DepsTab component={selectedComponent} />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-[#0a0a0f]">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#1a1a24] flex items-center justify-center mx-auto mb-4">
                    <Layers className="h-8 w-8 text-[#222230]" />
                  </div>
                  <p className="text-[#6b7280] text-sm font-medium">Select a component</p>
                  <p className="text-[#4b5563] text-xs mt-1 max-w-xs">
                    Choose a category from the sidebar and click a component to view its details
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="h-6 px-4 bg-[#111118] border-t border-[#2a2a3a] flex items-center gap-3 text-[10px] text-[#4b5563] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            <span>TypeScript / React</span>
            <span>&middot;</span>
            <span>{showFavoritesOnly ? 'Favorites' : selectedCategory?.replace(/-/g, ' ') || 'No selection'}</span>
            {selectedComponent && (
              <>
                <span>&middot;</span>
                <span>{selectedComponent.lines} lines</span>
                <span>&middot;</span>
                <StatusIcon status={selectedComponent.status} size={10} />
                <span>{selectedComponent.status.replace('-', ' ')}</span>
              </>
            )}
            <div className="ml-auto flex items-center gap-2">
              {stats?.scannedAt && (
                <span>Scanned: {new Date(stats.scannedAt).toLocaleTimeString()}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Preview Tab ──────────────────────────────────────────────────

function PreviewTab({
  component,
  description,
  categoryColor,
  onCopyCli,
  copied,
}: {
  component: IndexEntry;
  description: string;
  categoryColor: string;
  onCopyCli: () => void;
  copied: boolean;
}) {
  const isComplex = hasComplexDeps(component.externalDeps);

  return (
    <div className="h-full flex flex-col overflow-auto bg-[#0a0a0f] custom-scrollbar">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#1a1a24] shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-lg font-semibold text-[#f1f5f9]">{component.name}</h2>
          <StatusIcon status={component.status} />
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#1a1a24] text-[#6b7280] border border-[#2a2a3a]">{component.source}</span>
        </div>

        {description && (
          <p className="text-[13px] text-[#9ca3af] leading-relaxed mb-3">{description}</p>
        )}

        {/* Quality checks */}
        <div className="flex gap-2 flex-wrap">
          <QualityCheck label="Props" ok={component.hasProps} />
          <QualityCheck label="JSDoc" ok={component.hasJSDoc} />
          <QualityCheck label="No broken imports" ok={!component.hasBrokenImports} />
          <QualityCheck label="<500 lines" ok={component.lines < 500} />
        </div>
      </div>

      <div className="flex-1 p-6">
        {isComplex ? (
          /* Placeholder for complex components */
          <div className="max-w-lg mx-auto">
            <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: categoryColor + '15' }}>
                <Package className="h-6 w-6" style={{ color: categoryColor }} />
              </div>
              <h3 className="text-[#f1f5f9] font-semibold mb-1">Complex Dependencies</h3>
              <p className="text-[#6b7280] text-[13px] mb-4">
                This component requires additional packages for live preview
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-5">
                {component.externalDeps.map((dep) => {
                  const base = getBasePackageName(dep);
                  const installed = isPackageInstalled(base);
                  return (
                    <span key={dep} className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border ${
                      installed ? 'bg-[#10b981]/10 border-[#10b981]/20 text-[#10b981]' : 'bg-[#f59e0b]/10 border-[#f59e0b]/20 text-[#f59e0b]'
                    }`}>
                      {installed ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                      {base}
                    </span>
                  );
                })}
              </div>

              {!isPackageInstalled(getBasePackageName(component.externalDeps[0] || '')) && component.externalDeps.length > 0 && (
                <div className="bg-[#0a0a0f] rounded-lg p-3 border border-[#2a2a3a] text-left">
                  <div className="text-[11px] text-[#6b7280] mb-1">Install dependencies:</div>
                  <code className="text-[12px] text-[#10b981] font-mono">
                    bun add {component.externalDeps.map(getBasePackageName).filter((v, i, a) => a.indexOf(v) === i).join(' ')}
                  </code>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Live preview via iframe */
          <div className="max-w-2xl mx-auto">
            {component.hasBrokenImports && (
              <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/20">
                <AlertTriangle size={14} className="text-[#f59e0b] shrink-0" />
                <span className="text-[12px] text-[#f59e0b]">This component has unresolved imports. Preview may not work correctly.</span>
              </div>
            )}
            <div className="bg-white rounded-xl overflow-hidden shadow-2xl border border-[#e5e7eb]">
              <div className="bg-[#f8f9fa] border-b border-[#e5e7eb] px-4 py-2 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                <span className="text-[11px] text-[#6b7280] ml-2 font-mono">{component.file}</span>
                <div className="ml-auto flex items-center gap-1">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#10b981]/10 text-[#10b981] font-medium">LIVE</span>
                </div>
              </div>
              <iframe
                src={`/api/preview/${component.path}`}
                className="w-full border-0"
                style={{ minHeight: '400px', maxHeight: '600px', height: '50vh' }}
                sandbox="allow-scripts"
                title={`${component.name} preview`}
              />
            </div>
          </div>
        )}

        {/* CLI Install Hint */}
        <div className="max-w-2xl mx-auto mt-6">
          <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-lg p-3 flex items-center gap-3">
            <Terminal className="h-4 w-4 text-[#6b7280] shrink-0" />
            <code className="text-[12px] text-[#10b981] font-mono flex-1 truncate">
              npx cb install {component.path}
            </code>
            <button
              onClick={onCopyCli}
              className="shrink-0 p-1 rounded hover:bg-[#222230] text-[#6b7280] hover:text-[#9ca3af] transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[#10b981]" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Tags */}
        {component.tags.length > 0 && (
          <div className="max-w-2xl mx-auto mt-3 flex gap-1.5 flex-wrap">
            {component.tags.map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a1a24] text-[#6b7280] border border-[#2a2a3a]">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Quality Check Badge ──────────────────────────────────────────

function QualityCheck({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${
      ok
        ? 'bg-[#10b981]/10 border-[#10b981]/20 text-[#10b981]'
        : 'bg-[#ef4444]/10 border-[#ef4444]/20 text-[#ef4444]'
    }`}>
      {ok ? <CheckCircle2 size={9} /> : <XCircle size={9} />}
      {label}
    </span>
  );
}

// ─── Source Tab ───────────────────────────────────────────────────

function SourceTab({
  code,
  loading,
  copied,
  onCopy,
}: {
  code: string | null;
  loading: boolean;
  copied: boolean;
  onCopy: () => void;
}) {
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0a0f]">
        <div className="h-8 w-8 rounded-full border-2 border-[#10b981]/20 border-t-[#10b981] animate-spin" />
      </div>
    );
  }

  if (!code) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-[#222230] mx-auto mb-3" />
          <p className="text-[#6b7280] text-sm">Unable to load source code</p>
        </div>
      </div>
    );
  }

  const highlighted = highlightSyntax(code);
  const highlightedLines = highlighted.split('\n');

  return (
    <div className="h-full bg-[#0a0a0f] relative">
      <div className="absolute top-3 right-3 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCopy}
          className="h-7 px-3 text-[11px] bg-[#1a1a24]/80 backdrop-blur text-[#9ca3af] hover:text-white border border-[#2a2a3a] hover:border-[#4b5563] gap-1.5"
        >
          {copied ? <Check className="h-3 w-3 text-[#10b981]" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy Code'}
        </Button>
      </div>
      <div className="h-full overflow-auto p-4 custom-scrollbar">
        <pre className="font-mono text-[12px] leading-[1.7]">
          {highlightedLines.map((line, i) => (
            <div key={i} className="flex hover:bg-[#111118]">
              <span className="w-10 text-right pr-4 text-[#2a2a3a] select-none shrink-0 text-[11px]">{i + 1}</span>
              <span className="flex-1 min-w-0" dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

// ─── Props Tab ────────────────────────────────────────────────────

function PropsTab({
  props,
  loading,
  hasCode,
  componentName,
}: {
  props: { interfaceName: string; props: ParsedProp[] };
  loading: boolean;
  hasCode: boolean;
  componentName: string;
}) {
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0a0f]">
        <div className="h-8 w-8 rounded-full border-2 border-[#10b981]/20 border-t-[#10b981] animate-spin" />
      </div>
    );
  }

  if (!hasCode) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-[#222230] mx-auto mb-3" />
          <p className="text-[#6b7280] text-sm">Unable to parse props</p>
        </div>
      </div>
    );
  }

  if (props.props.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <Shield className="h-8 w-8 text-[#222230] mx-auto mb-3" />
          <p className="text-[#6b7280] text-sm">No Props interface defined</p>
          <p className="text-[#4b5563] text-xs mt-1 max-w-xs">
            This component may use inline props or have no typed interface
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#0a0a0f] overflow-auto p-6 custom-scrollbar">
      <div className="max-w-3xl">
        <div className="mb-5">
          <h3 className="text-[#f1f5f9] text-[15px] font-semibold mb-1">
            {props.interfaceName || componentName + 'Props'}
          </h3>
          <p className="text-[#6b7280] text-[12px]">
            {props.props.length} prop{props.props.length !== 1 ? 's' : ''} defined
          </p>
        </div>
        <div className="rounded-lg border border-[#2a2a3a] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a3a] bg-[#111118]">
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">Prop</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">Type</th>
                <th className="text-center px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#6b7280] w-24">Status</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">Description</th>
              </tr>
            </thead>
            <tbody>
              {props.props.map((prop, i) => (
                <tr key={prop.name + i} className="border-b border-[#1a1a24] hover:bg-[#111118]/50">
                  <td className="px-4 py-2.5">
                    <code className="text-[#fbbf24] text-[12px] font-mono bg-[#1a1a24] px-1.5 py-0.5 rounded">{prop.name}</code>
                  </td>
                  <td className="px-4 py-2.5">
                    <code className="text-[#f9a8d4] text-[12px] font-mono">{prop.type}</code>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {prop.optional ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] font-medium">optional</span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10b981]/10 text-[#10b981] font-medium">required</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-[12px] text-[#9ca3af]">{prop.description || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Dependencies Tab ─────────────────────────────────────────────

function DepsTab({ component }: { component: IndexEntry }) {
  const [expanded, setExpanded] = useState(true);

  // Group deps by installed vs required
  const installedDeps = component.externalDeps.filter((d) => isPackageInstalled(getBasePackageName(d)));
  const requiredDeps = component.externalDeps.filter((d) => !isPackageInstalled(getBasePackageName(d)));

  // Group by base package name
  const groupedDeps = component.externalDeps.reduce<Record<string, string[]>>((acc, dep) => {
    const base = getBasePackageName(dep);
    if (!acc[base]) acc[base] = [];
    if (!acc[base].includes(dep)) acc[base].push(dep);
    return acc;
  }, {});

  const hasLocalImports = component.localImports.length > 0;

  return (
    <div className="h-full bg-[#0a0a0f] overflow-auto p-6 custom-scrollbar">
      <div className="max-w-3xl">
        <div className="mb-5">
          <h3 className="text-[#f1f5f9] text-[15px] font-semibold mb-1">Dependencies</h3>
          <p className="text-[#6b7280] text-[12px]">
            {component.externalDeps.length} external package{component.externalDeps.length !== 1 ? 's' : ''} detected
          </p>
        </div>

        {component.externalDeps.length === 0 && !hasLocalImports ? (
          <div className="text-center py-12">
            <Shield className="h-8 w-8 text-[#10b981] mx-auto mb-3" />
            <p className="text-[#6b7280] text-sm">No external dependencies</p>
            <p className="text-[#4b5563] text-xs mt-1">This component only uses React and Tailwind CSS</p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="flex gap-3 mb-5">
              <div className="flex items-center gap-2 bg-[#10b981]/10 border border-[#10b981]/20 rounded-lg px-3 py-2">
                <CheckCircle2 size={14} className="text-[#10b981]" />
                <span className="text-[12px] text-[#10b981]">{installedDeps.length} available</span>
              </div>
              {requiredDeps.length > 0 && (
                <div className="flex items-center gap-2 bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-lg px-3 py-2">
                  <AlertTriangle size={14} className="text-[#f59e0b]" />
                  <span className="text-[12px] text-[#f59e0b]">{requiredDeps.length} needs install</span>
                </div>
              )}
            </div>

            {/* External packages */}
            <div className="mb-5">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-[12px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-3 hover:text-[#e4e4e7] transition-colors"
              >
                <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? '' : '-rotate-90'}`} />
                External Packages ({Object.keys(groupedDeps).length})
              </button>

              {expanded && (
                <div className="space-y-2">
                  {Object.entries(groupedDeps).map(([base, imports]) => {
                    const installed = isPackageInstalled(base);
                    return (
                      <div key={base} className={`rounded-lg border p-3 ${installed ? 'bg-[#111118] border-[#2a2a3a]' : 'bg-[#f59e0b]/5 border-[#f59e0b]/20'}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            {installed ? (
                              <CheckCircle2 size={14} className="text-[#10b981]" />
                            ) : (
                              <AlertTriangle size={14} className="text-[#f59e0b]" />
                            )}
                            <code className="text-[13px] font-mono text-[#e4e4e7]">{base}</code>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            installed ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-[#f59e0b]/10 text-[#f59e0b]'
                          }`}>
                            {installed ? 'Available' : 'Required'}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#6b7280] space-y-0.5">
                          {imports.map((imp) => (
                            <div key={imp} className="flex items-center gap-1.5">
                              <span className="text-[#4b5563]">from</span>
                              <code className="text-[#9ca3af]">&quot;{imp}&quot;</code>
                            </div>
                          ))}
                        </div>
                        {!installed && (
                          <div className="mt-2 bg-[#0a0a0f] rounded p-1.5 flex items-center gap-2">
                            <code className="text-[11px] text-[#10b981] font-mono flex-1">bun add {base}</code>
                            <CopyButton text={`bun add ${base}`} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Local imports */}
            {hasLocalImports && (
              <div>
                <div className="text-[12px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-3">
                  Local Imports ({component.localImports.length})
                </div>
                <div className="rounded-lg border border-[#2a2a3a] bg-[#111118] overflow-hidden">
                  {component.localImports.map((imp, i) => (
                    <div key={imp + i} className={`px-3 py-2 text-[12px] flex items-center gap-2 ${i > 0 ? 'border-t border-[#1a1a24]' : ''}`}>
                      <code className="text-[#9ca3af] font-mono">{imp}</code>
                      {component.hasBrokenImports && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ef4444]/10 text-[#ef4444]">broken</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Copy Button (inline) ─────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button onClick={handleCopy} className="shrink-0 p-1 rounded hover:bg-[#222230] text-[#6b7280] hover:text-[#9ca3af] transition-colors">
      {copied ? <Check className="h-3 w-3 text-[#10b981]" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}
