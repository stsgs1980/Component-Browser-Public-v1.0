import fs from 'fs';
import path from 'path';

// ─── Types ────────────────────────────────────────────────────────

export interface IndexEntry {
  source: string;
  name: string;
  category: string;
  file: string;
  lines: number;
  path: string;
}

export interface ScannedComponent extends IndexEntry {
  hasProps: boolean;
  hasJSDoc: boolean;
  hasBrokenImports: boolean;
  externalDeps: string[];
  localImports: string[];
  tags: string[];
  status: 'clean' | 'needs-work' | 'broken';
  missingChecks: string[];
}

export interface ScanResult {
  components: ScannedComponent[];
  stats: {
    total: number;
    categories: number;
    categoryCounts: Record<string, number>;
    clean: number;
    needsWork: number;
    broken: number;
    topPackages: { name: string; count: number }[];
  };
  scannedAt: string;
}

// ─── Cache ────────────────────────────────────────────────────────

let scanCache: ScanResult | null = null;

// ─── Project packages ────────────────────────────────────────────

function getInstalledPackages(): Set<string> {
  try {
    const pkgPath = path.join(process.cwd(), 'package.json');
    const raw = fs.readFileSync(pkgPath, 'utf-8');
    const pkg = JSON.parse(raw);
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    return new Set(Object.keys(deps).map((d) => d.toLowerCase()));
  } catch {
    return new Set();
  }
}

// ─── Scanning Logic ──────────────────────────────────────────────

function scanFile(content: string): {
  hasProps: boolean;
  hasJSDoc: boolean;
  hasBrokenImports: boolean;
  externalDeps: string[];
  localImports: string[];
  tags: string[];
} {
  // Import scanning
  const importRegex =
    /import\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
  const externalDeps: string[] = [];
  const localImports: string[] = [];
  const allImports: string[] = [];

  for (const match of content.matchAll(importRegex)) {
    const p = match[1];
    allImports.push(p);
    if (
      p.startsWith('.') ||
      p.startsWith('@/') ||
      p.startsWith('~/') ||
      p.startsWith('#/')
    ) {
      localImports.push(p);
    } else {
      externalDeps.push(p);
    }
  }

  // Also handle require statements
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  for (const match of content.matchAll(requireRegex)) {
    const p = match[1];
    if (!allImports.includes(p)) {
      allImports.push(p);
      if (p.startsWith('.') || p.startsWith('@/') || p.startsWith('~/')) {
        localImports.push(p);
      } else {
        externalDeps.push(p);
      }
    }
  }

  // Props detection
  const hasProps =
    /(?:interface|type)\s+\w*Props\s*[<{]/.test(content) ||
    /export\s+type\s+\w*Props\s*=/.test(content);

  // JSDoc detection
  const hasJSDoc = /\/\*\*[\s\S]*?\*\//.test(content);

  // Broken import detection
  const brokenPatterns = [
    /from\s+['"]@\//,
    /from\s+['"]~\//,
    /from\s+['"]\.\.\/\.\.\/(?:store|hooks|utils|components|lib|types)/,
    /from\s+['"]@components\//,
    /from\s+['"]#(?:\/|\.)/,
  ];
  const hasBrokenImports = brokenPatterns.some((p) => p.test(content));

  // Derive tags from imports
  const tags: string[] = [];
  const depStr = externalDeps.join(' ');
  if (/framer-motion/.test(depStr)) tags.push('framer-motion');
  if (/lucide-react/.test(depStr)) tags.push('lucide');
  if (/recharts/.test(depStr)) tags.push('recharts');
  if (/zustand/.test(depStr)) tags.push('zustand');
  if (/@radix-ui/.test(depStr)) tags.push('radix-ui');
  if (/three/.test(depStr)) tags.push('three.js');
  if (/react-markdown|remark|rehype/.test(depStr)) tags.push('markdown');
  if (/prisma/.test(depStr)) tags.push('prisma');
  if (/next-auth/.test(depStr)) tags.push('auth');
  if (/next-themes/.test(depStr)) tags.push('dark-mode');
  if (/react-syntax-highlighter|prism/.test(depStr)) tags.push('syntax');
  if (/dnd-kit/.test(depStr)) tags.push('drag-drop');
  if (/canvas|@react-three/.test(depStr)) tags.push('canvas');
  if (/@hookform|react-hook-form/.test(depStr)) tags.push('forms');
  if (/date-fns|dayjs|moment/.test(depStr)) tags.push('dates');
  if (/react-icons/.test(depStr)) tags.push('icons');

  return {
    hasProps,
    hasJSDoc,
    hasBrokenImports,
    externalDeps: [...new Set(externalDeps)],
    localImports: [...new Set(localImports)],
    tags,
  };
}

// ─── Full Scan ────────────────────────────────────────────────────

export function performFullScan(): ScanResult {
  const indexPath = path.join(
    process.cwd(),
    'download',
    'reusable_components',
    '_INDEX.json'
  );
  const raw = fs.readFileSync(indexPath, 'utf-8');
  const indexData: IndexEntry[] = JSON.parse(raw);

  const componentsDir = path.join(
    process.cwd(),
    'download',
    'reusable_components'
  );
  const installedPkgs = getInstalledPackages();

  const scanned: ScannedComponent[] = [];
  let cleanCount = 0;
  let needsWorkCount = 0;
  let brokenCount = 0;

  // Track top packages
  const packageUsage: Record<string, number> = {};

  for (const entry of indexData) {
    const fullPath = path.join(componentsDir, entry.path);

    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const result = scanFile(content);

      // Calculate line count from actual file
      const lineCount = content.split('\n').length;

      // Determine missing quality checks
      const missingChecks: string[] = [];
      if (!result.hasProps) missingChecks.push('Props');
      if (!result.hasJSDoc) missingChecks.push('JSDoc');
      if (lineCount > 500) missingChecks.push('>500 lines');

      // Determine status
      let status: 'clean' | 'needs-work' | 'broken';
      if (result.hasBrokenImports) {
        status = 'broken';
        brokenCount++;
      } else if (missingChecks.length === 0) {
        status = 'clean';
        cleanCount++;
      } else {
        status = 'needs-work';
        needsWorkCount++;
      }

      // Track package usage (normalize package names)
      for (const dep of result.externalDeps) {
        // Get base package name (strip sub-paths)
        const basePkg = dep
          .replace(/^@/, '')
          .split('/')[0]
          .replace(/^@/, '@');
        const normalized = basePkg.toLowerCase();
        packageUsage[normalized] = (packageUsage[normalized] || 0) + 1;
      }

      scanned.push({
        ...entry,
        lines: lineCount,
        hasProps: result.hasProps,
        hasJSDoc: result.hasJSDoc,
        hasBrokenImports: result.hasBrokenImports,
        externalDeps: result.externalDeps,
        localImports: result.localImports,
        tags: result.tags,
        status,
        missingChecks,
      });
    } catch {
      // File might not exist or be unreadable
      scanned.push({
        ...entry,
        hasProps: false,
        hasJSDoc: false,
        hasBrokenImports: false,
        externalDeps: [],
        localImports: [],
        tags: [],
        status: 'broken',
        missingChecks: ['File not found'],
      });
      brokenCount++;
    }
  }

  // Calculate top packages
  const topPackages = Object.entries(packageUsage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Category counts
  const categoryCounts: Record<string, number> = {};
  const categories = new Set<string>();
  for (const c of scanned) {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    categories.add(c.category);
  }

  const result: ScanResult = {
    components: scanned,
    stats: {
      total: scanned.length,
      categories: categories.size,
      categoryCounts,
      clean: cleanCount,
      needsWork: needsWorkCount,
      broken: brokenCount,
      topPackages,
    },
    scannedAt: new Date().toISOString(),
  };

  scanCache = result;
  return result;
}

export function getScanResult(): ScanResult | null {
  return scanCache;
}

export function clearCache(): void {
  scanCache = null;
}
