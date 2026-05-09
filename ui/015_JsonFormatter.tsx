/**
 * JsonFormatter — Reusable JSON formatter, validator, and explorer.
 *
 * Features include: pretty-print / minify, validation with error
 * position, collapsible tree view, syntax-highlighted code output,
 * key sorting, JSON statistics, and sample data presets.
 *
 * @module 015_JsonFormatter
 */

import { useState, useCallback, useMemo } from 'react';
import { useIsMounted, copyToClipboard, IconCopy, IconCheck, IconEye, type GeneratorTheme, DEFAULT_THEME } from './shared';

// ─── Types ────────────────────────────────────────────────────

/** Statistics about a parsed JSON value. */
export interface JsonStats {
  totalKeys: number;
  maxDepth: number;
  objectCount: number;
  arrayCount: number;
  stringCount: number;
  numberCount: number;
  booleanCount: number;
  nullCount: number;
}

/** A sample data entry. */
export interface JsonSample {
  id: string;
  name: string;
  data: unknown;
}

/** Props for the JsonFormatter component. */
export interface JsonFormatterProps {
  /** Sample JSON datasets. */
  samples?: JsonSample[];
  /** Theme overrides. */
  theme?: GeneratorTheme;
  /** Additional className on the root element. */
  className?: string;
}

// ─── Default Data ─────────────────────────────────────────────

const DEFAULT_SAMPLES: JsonSample[] = [
  {
    id: 'api-response',
    name: 'API Response',
    data: {
      status: 200, message: 'Success',
      data: {
        users: [
          { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', active: true },
          { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'editor', active: false },
          { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'viewer', active: true },
        ],
        pagination: { page: 1, perPage: 10, total: 3, hasNext: false, hasPrev: false },
        meta: { requestId: 'req_abc123', timestamp: '2024-01-15T10:30:00Z', version: 'v2.1.0' },
      },
    },
  },
  {
    id: 'package-json',
    name: 'Package.json',
    data: {
      name: 'my-awesome-project', version: '2.4.1',
      description: 'A modern web application built with Next.js and TypeScript',
      main: 'index.js',
      scripts: { dev: 'next dev', build: 'next build', start: 'next start', lint: 'eslint . --fix', test: 'jest --coverage' },
      dependencies: { next: '^14.0.0', react: '^18.2.0', typescript: '^5.3.0', tailwindcss: '^3.4.0' },
      devDependencies: { eslint: '^8.55.0', '@types/react': '^18.2.0', prettier: '^3.1.0' },
      keywords: ['nextjs', 'typescript', 'tailwind', 'react'], license: 'MIT',
    },
  },
  {
    id: 'user-profile',
    name: 'User Profile',
    data: {
      id: 'usr_9f8e7d6c', username: 'johndoe',
      profile: { firstName: 'John', lastName: 'Doe', bio: 'Full-stack developer & open source enthusiast' },
      contact: { email: 'john.doe@example.com', phone: '+1-555-0123', website: 'https://johndoe.dev' },
      preferences: { theme: 'dark', language: 'en-US', notifications: { email: true, push: false, sms: true } },
      stats: { posts: 142, followers: 1283, following: 456, reputation: 8750 },
      verified: true, createdAt: '2022-03-15T08:00:00Z',
    },
  },
  {
    id: 'dashboard-stats',
    name: 'Dashboard Stats',
    data: {
      period: 'January 2024',
      summary: { totalRevenue: 142580.50, totalOrders: 3842, newCustomers: 812, returnRate: 0.034 },
      topProducts: [
        { name: 'Wireless Headphones', sold: 452, revenue: 22600 },
        { name: 'Smart Watch Pro', sold: 328, revenue: 49200 },
        { name: 'USB-C Hub', sold: 287, revenue: 5740 },
      ],
      flags: { betaFeaturesEnabled: true, maintenanceMode: false, cacheHitRate: 0.94 },
    },
  },
];

// ─── JSON Utility Functions ───────────────────────────────────

export function computeStats(data: unknown, depth = 0): JsonStats {
  const base: JsonStats = { totalKeys: 0, maxDepth: depth, objectCount: 0, arrayCount: 0, stringCount: 0, numberCount: 0, booleanCount: 0, nullCount: 0 };
  if (data === null) return { ...base, nullCount: 1 };
  if (Array.isArray(data)) {
    let childMax = depth;
    const res = data.reduce<JsonStats>((acc, item) => {
      const s = computeStats(item, depth + 1);
      if (s.maxDepth > childMax) childMax = s.maxDepth;
      return { ...acc, totalKeys: acc.totalKeys + s.totalKeys, maxDepth: Math.max(acc.maxDepth, s.maxDepth), objectCount: acc.objectCount + s.objectCount, arrayCount: acc.arrayCount + s.arrayCount + 1, stringCount: acc.stringCount + s.stringCount, numberCount: acc.numberCount + s.numberCount, booleanCount: acc.booleanCount + s.booleanCount, nullCount: acc.nullCount + s.nullCount };
    }, { ...base, arrayCount: 1 });
    res.maxDepth = childMax;
    return res;
  }
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const keys = Object.keys(obj);
    let childMax = depth;
    const res = keys.reduce<JsonStats>((acc, key) => {
      const s = computeStats(obj[key], depth + 1);
      if (s.maxDepth > childMax) childMax = s.maxDepth;
      return { ...acc, totalKeys: acc.totalKeys + s.totalKeys + 1, maxDepth: Math.max(acc.maxDepth, s.maxDepth), objectCount: acc.objectCount + s.objectCount + 1, arrayCount: acc.arrayCount + s.arrayCount, stringCount: acc.stringCount + s.stringCount, numberCount: acc.numberCount + s.numberCount, booleanCount: acc.booleanCount + s.booleanCount, nullCount: acc.nullCount + s.nullCount };
    }, { ...base, objectCount: 1, totalKeys: keys.length });
    res.maxDepth = childMax;
    return res;
  }
  if (typeof data === 'string') return { ...base, stringCount: 1 };
  if (typeof data === 'number') return { ...base, numberCount: 1 };
  if (typeof data === 'boolean') return { ...base, booleanCount: 1 };
  return base;
}

function sortKeysDeep(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortKeysDeep);
  if (obj !== null && typeof obj === 'object') {
    const sorted: Record<string, unknown> = {};
    Object.keys(obj as Record<string, unknown>).sort((a, b) => a.localeCompare(b)).forEach((k) => { sorted[k] = sortKeysDeep((obj as Record<string, unknown>)[k]); });
    return sorted;
  }
  return obj;
}

function getJsonPath(segments: (string | number)[]): string {
  return segments.reduce((path, seg, i) => `${path}${i === 0 ? '$' : ''}${typeof seg === 'number' ? `[${seg}]` : `.${seg}`}`, '');
}

function getTypeName(val: unknown): string {
  if (val === null) return 'null';
  if (Array.isArray(val)) return 'array';
  return typeof val;
}

// ─── Inline SVG Icons ─────────────────────────────────────────

function IconBraces({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1" />
      <path d="M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0-2 2v5a2 2 0 0 1-2 2h-1" />
    </svg>
  );
}

function IconChevronDown({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m6 9 6 6 6-6" /></svg>);
}

function IconChevronUp({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m18 15-6-6-6 6" /></svg>);
}

function IconChevronRight({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6" /></svg>);
}

function IconTrash2({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function IconClipboardPaste({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    </svg>
  );
}

function IconMinimize2({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="4,14 10,14 10,20" /><polyline points="20,10 14,10 14,4" />
      <line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

function IconCheckCircle2({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function IconXCircle({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />
    </svg>
  );
}

function IconArrowDownAZ({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 16l4 4 4-4" /><path d="M7 20V4" /><path d="m15 4 4 4 4-4" /><path d="M19 8v12" />
    </svg>
  );
}

function IconBarChart3({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" />
    </svg>
  );
}

function IconDatabase({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}

function IconLayers({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22.4 12.08-8.58 3.91a2 2 0 0 1-1.66 0L3.6 12.08" />
      <path d="m22.4 16.08-8.58 3.91a2 2 0 0 1-1.66 0L3.6 16.08" />
    </svg>
  );
}

function IconHash({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  );
}

function IconType({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="4,7 4,4 20,4 20,7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  );
}

function IconFileJson({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14,2 14,8 20,8" />
      <path d="M9 15l2 2 4-4" />
    </svg>
  );
}

function IconTreePine({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 20v-6" /><path d="M7 14l5-5 5 5" /><path d="M5 18l7-7 7 7" />
      <path d="M3 22l9-9 9 9" />
    </svg>
  );
}

// ─── CSS keyframes ────────────────────────────────────────────

const floatKeyframes = `
@keyframes json-float {
  0%, 100% { transform: translateY(0); opacity: 0.04; }
  50% { transform: translateY(-12px); opacity: 0.1; }
}
`;

// ─── Tree Node ────────────────────────────────────────────────

interface TreeNodeProps {
  keyName: string | null;
  value: unknown;
  path: (string | number)[];
  collapsed: Set<string>;
  toggleCollapse: (pathStr: string) => void;
  selectedPath: string | null;
  selectPath: (path: string) => void;
  isLast: boolean;
  depth: number;
  accent: string;
  accentSecondary: string;
  textMuted: string;
  danger: string;
}

function TreeNode({ keyName, value, path, collapsed, toggleCollapse, selectedPath, selectPath, isLast, depth, accent, accentSecondary, textMuted, danger }: TreeNodeProps) {
  const pathStr = path.join('.');
  const isCollapsed = collapsed.has(pathStr);
  const isObj = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);
  const type = getTypeName(value);
  const comma = !isLast ? ',' : '';
  const indent = depth * 20;

  if (isObj) {
    const entries = isArray ? (value as unknown[]).map((v, i) => [String(i), v] as const) : Object.entries(value as Record<string, unknown>);
    const count = isArray ? (value as unknown[]).length : Object.keys(value as Record<string, unknown>).length;
    const bracket = isArray ? ['[', ']'] : ['{', '}'];

    return (
      <div className="font-mono text-sm leading-relaxed">
        <div className="flex items-center cursor-pointer hover:bg-white/[0.03] rounded px-1 py-0.5 group" style={{ paddingLeft: indent }} onClick={() => toggleCollapse(pathStr)}>
          <span className="mr-1 inline-block w-4 text-center transition-transform duration-150" style={{ color: textMuted, transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)' }}>
            <IconChevronRight className="w-3 h-3" />
          </span>
          {keyName !== null && (<><span className="mr-1.5" style={{ color: accent }}>&quot;{keyName}&quot;</span><span style={{ color: textMuted }}>:</span><span className="ml-1.5" /></>)}
          <span style={{ color: textMuted }}>{bracket[0]}</span>
          {isCollapsed && (<><span className="ml-1.5 text-xs italic" style={{ color: textMuted }}>{count} {isArray ? 'items' : 'keys'}</span><span style={{ color: textMuted }}>{bracket[1]}{comma}</span></>)}
          <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: isArray ? `${accentSecondary}1a` : `${accent}1a`, color: isArray ? `${accentSecondary}B3` : `${accent}B3`, border: `1px solid ${isArray ? `${accentSecondary}33` : `${accent}33}` }}>{isArray ? 'Array' : 'Object'}</span>
        </div>
        {!isCollapsed && (
          <div style={{ transition: 'opacity 0.2s ease' }}>
            {entries.map(([k, v], i) => (
              <TreeNode key={`${pathStr}.${k}`} keyName={isArray ? null : k} value={v} path={[...path, isArray ? Number(k) : k]} collapsed={collapsed} toggleCollapse={toggleCollapse} selectedPath={selectedPath} selectPath={selectPath} isLast={i === entries.length - 1} depth={depth + 1} accent={accent} accentSecondary={accentSecondary} textMuted={textMuted} danger={danger} />
            ))}
          </div>
        )}
        {!isCollapsed && <div style={{ paddingLeft: indent, color: textMuted }}>{bracket[1]}{comma}</div>}
      </div>
    );
  }

  const valColor = type === 'string' ? accentSecondary : type === 'number' ? accentSecondary : type === 'boolean' ? textMuted : danger;
  const displayVal = type === 'string' ? `&quot;${String(value)}&quot;` : String(value);
  const fullJsonPath = getJsonPath(path);
  const isSelected = selectedPath === fullJsonPath;

  return (
    <div className={`flex items-center font-mono text-sm leading-relaxed cursor-pointer hover:bg-white/[0.04] rounded px-1 py-0.5 transition-colors ${isSelected ? 'bg-white/[0.06]' : ''}`} style={{ paddingLeft: indent }} onClick={() => selectPath(fullJsonPath)}>
      <span className="mr-1.5 w-4 inline-block" />
      {keyName !== null && (<><span className="mr-1.5" style={{ color: accent }}>&quot;{keyName}&quot;</span><span style={{ color: textMuted }}>:</span><span className="ml-1.5" /></>)}
      <span style={{ color: valColor }} dangerouslySetInnerHTML={{ __html: displayVal }} />
      <span style={{ color: textMuted }}>{comma}</span>
      <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded" style={{
        background: type === 'string' ? `${accent}1a` : type === 'number' ? `${accentSecondary}1a` : type === 'boolean' ? 'rgba(168,85,247,0.1)' : `${danger}1a`,
        color: type === 'string' ? `${accent}B3` : type === 'number' ? `${accentSecondary}B3` : type === 'boolean' ? `${textMuted}B3` : `${danger}B3`,
        border: `1px solid ${type === 'string' ? `${accent}33` : type === 'number' ? `${accentSecondary}33` : type === 'boolean' ? 'rgba(168,85,247,0.2)' : `${danger}33`}`,
      }}>{type}</span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────

/**
 * JsonFormatter — full-featured JSON editor and explorer.
 *
 * @example
 * ```tsx
 * <JsonFormatter theme={{ accent: '#e04040' }} />
 * ```
 */
export function JsonFormatter({ samples, theme = DEFAULT_THEME, className }: JsonFormatterProps) {
  const mounted = useIsMounted();
  const activeSamples = samples ?? DEFAULT_SAMPLES;

  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [treeView, setTreeView] = useState(true);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [showSamples, setShowSamples] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Parse JSON
  const parsed = useMemo(() => {
    if (!input.trim()) return { data: null as unknown, error: null as { message: string; line?: number; column?: number } | null };
    try {
      const data = JSON.parse(input);
      return { data, error: null };
    } catch (e) {
      const msg = (e as Error).message;
      const posMatch = msg.match(/position\s+(\d+)/i);
      let line: number | undefined, column: number | undefined;
      if (posMatch) { const pos = parseInt(posMatch[1], 10); const lines = input.slice(0, pos).split('\n'); line = lines.length; column = lines[lines.length - 1].length + 1; }
      return { data: null, error: { message: msg, line, column } };
    }
  }, [input]);

  const jsonValid = parsed.data !== null;
  const jsonError = parsed.error;
  const formattedJson = useMemo(() => jsonValid ? JSON.stringify(parsed.data, null, 2) : '', [jsonValid, parsed.data]);
  const minifiedJson = useMemo(() => jsonValid ? JSON.stringify(parsed.data) : '', [jsonValid, parsed.data]);
  const stats = useMemo(() => jsonValid ? computeStats(parsed.data) : null, [jsonValid, parsed.data]);
  const lineCount = input ? input.split('\n').length : 0;
  const charCount = input.length;

  // Syntax highlighting
  const highlightedLines = useMemo(() => {
    if (!formattedJson) return [];
    return formattedJson.split('\n').map((line, idx) => {
      const parts: { text: string; color: string }[] = [];
      let remaining = line;
      const keyMatch = remaining.match(/^(\s*)("[^"]*")(\s*:\s*)/);
      if (keyMatch) { parts.push({ text: keyMatch[1], color: theme.textMuted }); parts.push({ text: keyMatch[2], color: theme.accent }); parts.push({ text: keyMatch[3], color: '#1a1a1a' }); remaining = remaining.slice(keyMatch[0].length); }
      else { const ws = remaining.match(/^(\s*)/); if (ws && ws[1]) { parts.push({ text: ws[1], color: theme.textMuted }); remaining = remaining.slice(ws[1].length); } }
      if (remaining) {
        const strM = remaining.match(/^("[^"]*")/);
        if (strM) { parts.push({ text: strM[0], color: theme.accentSecondary }); remaining = remaining.slice(strM[0].length); }
        else if (/^\s*true/.test(remaining)) { parts.push({ text: 'true', color: theme.textMuted }); remaining = remaining.replace(/^\s*true/, ''); }
        else if (/^\s*false/.test(remaining)) { parts.push({ text: 'false', color: theme.textMuted }); remaining = remaining.replace(/^\s*false/, ''); }
        else if (/^\s*null/.test(remaining)) { parts.push({ text: 'null', color: theme.danger }); remaining = remaining.replace(/^\s*null/, ''); }
        else if (/^-?\d+(\.\d+)?/.test(remaining)) { const m = remaining.match(/^-?\d+(\.\d+)?/)!; parts.push({ text: m[0], color: theme.accentSecondary }); remaining = remaining.slice(m[0].length); }
        else { parts.push({ text: remaining, color: theme.textMuted }); }
        if (remaining) parts.push({ text: remaining, color: '#1a1a1a' });
      }
      return { parts, lineNum: idx + 1 };
    });
  }, [formattedJson, theme]);

  // Handlers
  const handleClear = useCallback(() => { setInput(''); setCollapsed(new Set()); setSelectedPath(null); setValidationResult(null); }, []);
  const handlePaste = useCallback(async () => { try { setInput(await navigator.clipboard.readText()); } catch { /* fallback */ } }, []);
  const handleLoadSample = useCallback((key: string) => {
    const s = activeSamples.find((x) => x.id === key);
    if (s) { setInput(JSON.stringify(s.data, null, 2)); setCollapsed(new Set()); setSelectedPath(null); setValidationResult(null); setShowSamples(false); }
  }, [activeSamples]);
  const handleCopyFormatted = useCallback(async () => {
    const text = treeView ? formattedJson : minifiedJson;
    if (!text) return;
    const ok = await copyToClipboard(text);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }, [treeView, formattedJson, minifiedJson]);
  const handleMinify = useCallback(() => { if (jsonValid) setInput(minifiedJson); }, [jsonValid, minifiedJson]);
  const handleValidate = useCallback(() => {
    if (jsonValid) setValidationResult({ valid: true, message: 'Valid JSON' });
    else if (jsonError) setValidationResult({ valid: false, message: jsonError.message });
    else setValidationResult({ valid: false, message: 'No input to validate' });
    setTimeout(() => setValidationResult(null), 4000);
  }, [jsonValid, jsonError]);
  const handleSortKeys = useCallback(() => { if (jsonValid && parsed.data !== null) setInput(JSON.stringify(sortKeysDeep(parsed.data), null, 2)); }, [jsonValid, parsed.data]);
  const toggleCollapse = useCallback((pathStr: string) => { setCollapsed(prev => { const n = new Set(prev); if (n.has(pathStr)) n.delete(pathStr); else n.add(pathStr); return n; }); }, []);
  const collapseAll = useCallback(() => {
    if (!jsonValid || parsed.data === null) return;
    const all = new Set<string>();
    const collect = (obj: unknown, path: (string | number)[]) => {
      if (obj !== null && typeof obj === 'object') { all.add(path.join('.')); if (Array.isArray(obj)) obj.forEach((item, i) => collect(item, [...path, i])); else Object.entries(obj as Record<string, unknown>).forEach(([k, v]) => collect(v, [...path, k])); }
    };
    collect(parsed.data, []); setCollapsed(all);
  }, [jsonValid, parsed.data]);
  const expandAll = useCallback(() => setCollapsed(new Set()), []);

  if (!mounted) return <div className={className} />;

  const chrome = () => (<><div className="w-3 h-3 rounded-full bg-red-500/80" /><div className="w-3 h-3 rounded-full bg-yellow-500/80" /><div className="w-3 h-3 rounded-full bg-green-500/80" /></>);

  return (
    <div className={`relative w-full py-20 md:py-28 bg-[#f5f0e1] overflow-hidden ${className ?? ''}`}>
      <style>{floatKeyframes}</style>

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { text: '{ }', x: 4, y: 8, delay: 0 }, { text: '[ ]', x: 88, y: 12, delay: 1.4 },
          { text: ':', x: 8, y: 78, delay: 0.7 }, { text: ',', x: 92, y: 82, delay: 2.2 },
          { text: '{', x: 80, y: 40, delay: 1.8 }, { text: '}', x: 2, y: 48, delay: 2.8 },
          { text: 'null', x: 50, y: 5, delay: 0.3 }, { text: 'true', x: 40, y: 90, delay: 1.0 },
        ].map((s, i) => (
          <span key={`fl-${i}`} className="absolute font-mono text-sm whitespace-nowrap select-none pointer-events-none" style={{ left: `${s.x}%`, top: `${s.y}%`, color: 'rgba(180, 128, 23, 0.12)', animation: `json-float ${8 + i * 1.1}s ease-in-out ${s.delay}s infinite` }}>{s.text}</span>
        ))}
      </div>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(180,128,23,0.08) 100%)' }} />

      <div className="relative z-10 w-full px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16" style={{ transition: 'opacity 0.7s ease' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-none border bg-[#ebe5d0] mb-6" style={{ borderColor: theme.border }}>
            <IconBraces className="w-4 h-4" style={{ color: theme.accent }} />
            <span className="text-sm font-mono" style={{ color: theme.textMuted }}>Data Tool</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 bg-clip-text text-transparent bg-[length:200%_100%]">JSON Studio</span>
          </h2>
          <p className="text-base md:text-lg max-w-xl mx-auto font-mono" style={{ color: theme.textMuted }}>Format, validate, explore, and transform JSON data</p>
        </div>

        {/* Two-panel */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Input */}
          <div className="flex flex-col gap-4">
            {/* Input card */}
            <div className="border bg-[#ebe5d0] overflow-hidden" style={{ borderColor: theme.border }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b bg-[#ebe5d0]" style={{ borderColor: theme.border }}>
                <div className="flex gap-1.5">{chrome()}</div>
                <span className="text-xs font-mono ml-2" style={{ color: theme.textMuted }}>json-input</span>
                <div className="flex-1" />
                <span className="text-[10px] font-mono mr-2" style={{ color: theme.textMuted }}>{lineCount} lines · {charCount} chars</span>
              </div>
              <div className="px-4 py-3">
                <textarea value={input} onChange={(e) => { setInput(e.target.value); setValidationResult(null); setSelectedPath(null); }} className="w-full h-56 sm:h-72 bg-black/30 rounded-lg border border-white/[0.06] focus-within:border-amber-500/40 text-white font-mono text-sm p-3 outline-none resize-none transition-colors" placeholder="Paste or type JSON here..." spellCheck={false} autoComplete="off" aria-label="JSON input" />
              </div>

              {/* Parse error */}
              {jsonError && (
                <div className="mx-4 mb-3 px-3 py-2 rounded-lg" style={{ background: `${theme.danger}1a`, border: `1px solid ${theme.danger}33` }}>
                  <div className="flex items-center gap-2 mb-0.5"><IconXCircle className="w-3.5 h-3.5" style={{ color: theme.danger }} /><span className="text-xs font-mono font-semibold" style={{ color: theme.danger }}>Parse Error</span></div>
                  <p className="text-xs font-mono" style={{ color: `${theme.danger}CC` }}>{jsonError.message}{jsonError.line && <span style={{ color: theme.textMuted }}> (line {jsonError.line}, col {jsonError.column})</span>}</p>
                </div>
              )}

              {/* Validation toast */}
              {validationResult && (
                <div className="mx-4 mb-3 px-3 py-2 rounded-lg border" style={{ background: validationResult.valid ? `${theme.accent}1a` : `${theme.danger}1a`, borderColor: validationResult.valid ? `${theme.accent}33` : `${theme.danger}33` }}>
                  <div className="flex items-center gap-2">
                    {validationResult.valid ? <IconCheckCircle2 className="w-3.5 h-3.5" style={{ color: theme.accent }} /> : <IconXCircle className="w-3.5 h-3.5" style={{ color: theme.danger }} />}
                    <span className="text-xs font-mono" style={{ color: validationResult.valid ? theme.accentSecondary : theme.danger }}>
                      {validationResult.message}
                      {validationResult.valid && stats && <span style={{ color: theme.textMuted }}> · {stats.totalKeys} keys · depth {stats.maxDepth}</span>}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Clear', icon: <IconTrash2 className="w-3.5 h-3.5" />, onClick: handleClear, hoverColor: theme.danger },
                { label: 'Paste', icon: <IconClipboardPaste className="w-3.5 h-3.5" />, onClick: handlePaste, hoverColor: theme.accent },
                { label: 'Minify', icon: <IconMinimize2 className="w-3.5 h-3.5" />, onClick: handleMinify, hoverColor: theme.accentSecondary, disabled: !jsonValid },
                { label: 'Validate', icon: <IconCheckCircle2 className="w-3.5 h-3.5" />, onClick: handleValidate, hoverColor: theme.accent, disabled: !input.trim() },
                { label: 'Sort Keys', icon: <IconArrowDownAZ className="w-3.5 h-3.5" />, onClick: handleSortKeys, hoverColor: theme.accent, disabled: !jsonValid },
              ].map((btn) => (
                <button key={btn.label} onClick={btn.onClick} disabled={btn.disabled} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono border bg-white/[0.02] transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none" style={{ color: '#1a1a1a', borderColor: 'rgba(255,255,255,0.06)' }}>
                  {btn.icon}{btn.label}
                </button>
              ))}
            </div>

            {/* Sample Data + Stats toggles */}
            <div className="flex gap-2">
              <button onClick={() => setShowSamples((p) => !p)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-mono border bg-white/[0.03] hover:bg-white/[0.06] transition-all cursor-pointer" style={{ color: '#1a1a1a', borderColor: 'rgba(255,255,255,0.08)' }}>
                <IconFileJson className="w-4 h-4" style={{ color: theme.accent }} />Sample Data
                {showSamples ? <IconChevronUp className="w-3.5 h-3.5" /> : <IconChevronDown className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => setShowStats((p) => !p)} disabled={!jsonValid} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-mono border bg-white/[0.03] hover:bg-white/[0.06] transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none" style={{ color: '#1a1a1a', borderColor: 'rgba(255,255,255,0.08)' }}>
                <IconBarChart3 className="w-4 h-4" style={{ color: theme.accentSecondary }} />Stats
              </button>
            </div>

            {/* Samples grid */}
            {showSamples && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {activeSamples.map((s) => (
                  <button key={`sample-${s.id}`} onClick={() => handleLoadSample(s.id)} className="flex flex-col items-center gap-2 p-3 rounded-xl border bg-white/[0.02] text-center transition-all cursor-pointer hover:bg-white/[0.04]" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <span className="text-xs font-mono" style={{ color: '#1a1a1a' }}>{s.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Statistics Panel */}
            {showStats && stats && (
              <div className="border bg-[#ebe5d0] p-4 pt-1" style={{ borderColor: theme.border, transition: 'opacity 0.3s ease' }}>
                <div className="flex items-center gap-2 mb-3 pt-2"><IconBarChart3 className="w-3.5 h-3.5" style={{ color: theme.accentSecondary }} /><span className="text-xs font-mono" style={{ color: theme.textMuted }}>JSON Statistics</span></div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Total Keys', value: stats.totalKeys, icon: <IconDatabase className="w-4 h-4" />, color: theme.accent },
                    { label: 'Max Depth', value: stats.maxDepth, icon: <IconLayers className="w-4 h-4" />, color: theme.accent },
                    { label: 'Objects', value: stats.objectCount, icon: <IconBraces className="w-4 h-4" />, color: '#fb923c' },
                    { label: 'Arrays', value: stats.arrayCount, icon: <IconEye className="w-4 h-4" />, color: theme.accentSecondary },
                    { label: 'Strings', value: stats.stringCount, icon: <IconType className="w-4 h-4" />, color: theme.accentSecondary },
                    { label: 'Numbers', value: stats.numberCount, icon: <IconHash className="w-4 h-4" />, color: theme.accentSecondary },
                    { label: 'Booleans', value: stats.booleanCount, icon: <IconLayers className="w-4 h-4" />, color: theme.textMuted },
                    { label: 'Nulls', value: stats.nullCount, icon: <IconDatabase className="w-4 h-4" />, color: theme.danger },
                  ].map((s) => (
                    <div key={s.label} className="text-center p-2 rounded-lg bg-white/[0.02]">
                      <div className="mx-auto mb-1 opacity-70" style={{ color: s.color }}>{s.icon}</div>
                      <div className="text-lg font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
                      <div className="text-[10px] font-mono uppercase tracking-wider mt-0.5" style={{ color: theme.textMuted }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <div className="text-[10px] font-mono mb-1.5" style={{ color: theme.textMuted }}>Type Distribution</div>
                  <div className="flex h-2 overflow-hidden" style={{ background: `${theme.border}1a` }}>
                    {(() => {
                      const total = Math.max(1, stats.stringCount + stats.numberCount + stats.booleanCount + stats.nullCount);
                      const segs = [
                        { count: stats.stringCount, color: '#fcd34d' },
                        { count: stats.numberCount, color: '#22d3ee' },
                        { count: stats.booleanCount, color: '#c084fc' },
                        { count: stats.nullCount, color: '#f87171' },
                      ];
                      return segs.filter((s) => s.count > 0).map((s) => (
                        <div key={s.color} className="h-full transition-all duration-500" style={{ width: `${(s.count / total) * 100}%`, backgroundColor: s.color, opacity: 0.7 }} />
                      ));
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Output */}
          <div className="flex flex-col gap-4">
            {/* View toggle + copy */}
            <div className="flex gap-2 items-center">
              <button onClick={() => setTreeView(true)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-mono border transition-all cursor-pointer" style={{ background: treeView ? `${theme.accent}1a` : 'rgba(255,255,255,0.03)', borderColor: treeView ? `${theme.accent}4D` : 'rgba(255,255,255,0.08)', color: treeView ? theme.accent : '#1a1a1a' }}>
                <IconTreePine className="w-4 h-4" />Tree View
              </button>
              <button onClick={() => setTreeView(false)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-mono border transition-all cursor-pointer" style={{ background: !treeView ? `${theme.accent}1a` : 'rgba(255,255,255,0.03)', borderColor: !treeView ? `${theme.accent}4D` : 'rgba(255,255,255,0.08)', color: !treeView ? theme.accent : '#1a1a1a' }}>
                <IconBraces className="w-4 h-4" />Code View
              </button>
              <div className="flex gap-2">
                {jsonValid && (
                  <>
                    <button onClick={collapseAll} className="px-3 py-2.5 rounded-xl text-xs font-mono border bg-white/[0.03] transition-all cursor-pointer hover:bg-white/[0.06]" style={{ color: '#1a1a1a', borderColor: 'rgba(255,255,255,0.08)' }} aria-label="Collapse all">Collapse All</button>
                    <button onClick={expandAll} className="px-3 py-2.5 rounded-xl text-xs font-mono border bg-white/[0.03] transition-all cursor-pointer hover:bg-white/[0.06]" style={{ color: '#1a1a1a', borderColor: 'rgba(255,255,255,0.08)' }} aria-label="Expand all">Expand All</button>
                  </>
                )}
              </div>
            </div>

            {/* Copy output */}
            <button onClick={handleCopyFormatted} disabled={!jsonValid} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-mono border bg-white/[0.03] hover:bg-white/[0.06] transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none" style={{ color: '#1a1a1a', borderColor: 'rgba(255,255,255,0.08)' }}>
              {copied ? <IconCheck className="w-4 h-4" style={{ color: theme.accent }} /> : <IconCopy className="w-4 h-4" />}
              {copied ? 'Copied!' : `Copy ${treeView ? 'Formatted' : 'Minified'}`}
            </button>

            {/* Output card */}
            <div className="border bg-[#ebe5d0] overflow-hidden flex-1" style={{ borderColor: theme.border }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b bg-[#ebe5d0]" style={{ borderColor: theme.border }}>
                <div className="flex gap-1.5">{chrome()}</div>
                <span className="text-xs font-mono ml-2" style={{ color: theme.textMuted }}>{treeView ? 'tree-view' : 'code-view'}</span>
                <div className="flex-1" />
                <span className="text-[10px] font-mono" style={{ color: theme.textMuted }}>{treeView ? formattedJson.split('\n').length : minifiedJson.length} {treeView ? 'lines' : 'chars'}</span>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {treeView ? (
                  <div className="p-3">
                    {jsonValid && parsed.data !== null ? (
                      <TreeNode keyName={null} value={parsed.data} path={[]} collapsed={collapsed} toggleCollapse={toggleCollapse} selectedPath={selectedPath} selectPath={setSelectedPath} isLast={true} depth={0} accent={theme.accent} accentSecondary={theme.accentSecondary} textMuted={theme.textMuted} danger={theme.danger} />
                    ) : (
                      <div className="p-8 text-center text-sm font-mono" style={{ color: theme.textMuted }}>{input.trim() ? 'Invalid JSON — fix errors to see tree view' : 'Enter JSON to see tree view'}</div>
                    )}
                  </div>
                ) : (
                  <div className="p-3">
                    {jsonValid ? (
                      <div className="bg-black/30 rounded-lg p-3 font-mono text-sm whitespace-pre-wrap max-h-[560px] overflow-y-auto">
                        {highlightedLines.map((line, i) => (
                          <div key={i} className="flex leading-[1.625rem]">
                            <span className="select-none w-8 text-right mr-4 shrink-0 text-xs" style={{ color: 'rgba(255,255,255,0.12)' }}>{line.lineNum}</span>
                            <span className="whitespace-pre text-xs">{line.parts.map((p, j) => <span key={j} style={{ color: p.color }}>{p.text}</span>)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-sm font-mono" style={{ color: theme.textMuted }}>{input.trim() ? 'Invalid JSON' : 'Enter JSON to see code view'}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JsonFormatter;
