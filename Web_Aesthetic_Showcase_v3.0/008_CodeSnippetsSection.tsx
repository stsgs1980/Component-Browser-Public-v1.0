// Project: Web Aesthetic Showcase v3.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v3.0\src\components
// Lines: 1132

'use client';

import { useState, useCallback, useMemo, useRef, useEffect, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  Search,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Tag,
  FolderOpen,
} from 'lucide-react';

/* ──────────────────────────────────────────────
   SSR-SAFE MOUNTING
   ────────────────────────────────────────────── */

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

/* ──────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────── */

type SnippetCategory = 'React' | 'CSS' | 'JavaScript' | 'TypeScript' | 'Git' | 'Terminal' | 'General';

interface CodeSnippet {
  id: string;
  title: string;
  category: SnippetCategory;
  language: string;
  description: string;
  code: string;
  previewLines: number;
}

/* ──────────────────────────────────────────────
   CATEGORY CONFIG
   ────────────────────────────────────────────── */

const CATEGORY_COLORS: Record<SnippetCategory, { bg: string; text: string; border: string; dot: string }> = {
  React: { bg: 'rgba(59,130,246,0.10)', text: '#60a5fa', border: 'rgba(59,130,246,0.25)', dot: '#3b82f6' },
  CSS: { bg: 'rgba(236,72,153,0.10)', text: '#f472b6', border: 'rgba(236,72,153,0.25)', dot: '#ec4899' },
  JavaScript: { bg: 'rgba(250,204,21,0.10)', text: '#facc15', border: 'rgba(250,204,21,0.25)', dot: '#facc15' },
  TypeScript: { bg: 'rgba(56,189,248,0.10)', text: '#38bdf8', border: 'rgba(56,189,248,0.25)', dot: '#38bdf8' },
  Git: { bg: 'rgba(249,115,22,0.10)', text: '#fb923c', border: 'rgba(249,115,22,0.25)', dot: '#f97316' },
  Terminal: { bg: 'rgba(16,185,129,0.10)', text: '#34d399', border: 'rgba(16,185,129,0.25)', dot: '#10b981' },
  General: { bg: 'rgba(148,163,184,0.10)', text: '#94a3b8', border: 'rgba(148,163,184,0.25)', dot: '#94a3b8' },
};

const ALL_CATEGORIES: SnippetCategory[] = ['React', 'CSS', 'JavaScript', 'TypeScript', 'Git', 'Terminal'];

/* ──────────────────────────────────────────────
   SYNTAX HIGHLIGHTING (manual, using .syn-* classes)
   ────────────────────────────────────────────── */

function highlightReact(code: string): string {
  return code
    .replace(/(\/\/.*$)/gm, '<span class="syn-comment">$1</span>')
    .replace(/\b(import|from|export|default|return|const|let|var|function|if|else|typeof|new|throw|as|extends|implements)\b/g, '<span class="syn-keyword">$1</span>')
    .replace(/\b(useState|useEffect|useCallback|useRef|useMemo|useLocalStorage|useDebounce|useClickOutside|useMediaQuery|useStateValue|setValue|setStoredValue|clearTimeout|setTimeout|setInterval|addEventListener|removeEventListener|document|window|localStorage|JSON\.parse|JSON\.stringify|createElement|children|event|el|ref|handler)\b/g, '<span class="syn-function">$1</span>')
    .replace(/(["'`])(.*?)\1/g, '<span class="syn-string">$1$2$1</span>')
    .replace(/\b(\d+)\b/g, '<span class="syn-number">$1</span>')
    .replace(/\b(boolean|string|number|void|null|undefined|T|any|React)\b/g, '<span class="syn-type">$1</span>');
}

function highlightCSS(code: string): string {
  return code
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="syn-comment">$1</span>')
    .replace(/([a-z-]+)\s*:/g, '<span class="syn-property">$1</span>:')
    .replace(/([.#][\w-]+)/g, '<span class="syn-tag">$1</span>')
    .replace(/(["'])(.*?)\1/g, '<span class="syn-string">$1$2$1</span>')
    .replace(/\b(\d+\.?\d*)(px|rem|em|%|vh|vw|deg|ms|s)?\b/g, '<span class="syn-number">$1$2</span>');
}

function highlightJS(code: string): string {
  return code
    .replace(/(\/\/.*$)/gm, '<span class="syn-comment">$1</span>')
    .replace(/\b(const|let|var|function|return|if|else|typeof|new|throw|export|default|import|from|async|await|try|catch|class|extends|static|get|set)\b/g, '<span class="syn-keyword">$1</span>')
    .replace(/\b(debounce|throttle|deepCopy|formatDate|setTimeout|clearTimeout|JSON\.parse|JSON\.stringify|Object\.keys|Object\.assign|Array\.isArray|Date|console\.log|arguments|Math\.min|Math\.max|func|wait|now|options|delay|leading|result|cache|source|target|length|prototype|constructor|toDateString|toISOString|getHours|getMinutes|padStart|slice|call|apply|indexOf)\b/g, '<span class="syn-function">$1</span>')
    .replace(/(["'`])(.*?)\1/g, '<span class="syn-string">$1$2$1</span>')
    .replace(/\b(\d+)\b/g, '<span class="syn-number">$1</span>')
    .replace(/\b(null|undefined|true|false|NaN|Infinity)\b/g, '<span class="syn-keyword">$1</span>');
}

function highlightTS(code: string): string {
  return highlightJS(code)
    .replace(/\b(type|interface|enum|namespace|readonly|implements|extends|keyof|infer|never|unknown|Record|Partial|Required|Pick|Omit|Exclude|Extract|ReturnType|Parameters|is)\b/g, '<span class="syn-keyword">$1</span>')
    .replace(/\b(TypeGuard|NonNullable|HasId|T|U|K|PartialRequired|BaseType|value)\b/g, '<span class="syn-type">$1</span>');
}

function highlightGit(code: string): string {
  return code
    .replace(/(#.*$)/gm, '<span class="syn-comment">$1</span>')
    .replace(/\$(\w+)/g, '<span class="syn-function">$$1</span>')
    .replace(/(["'])(.*?)\1/g, '<span class="syn-string">$1$2$1</span>');
}

function highlightTerminal(code: string): string {
  return code
    .replace(/(#.*$)/gm, '<span class="syn-comment">$1</span>')
    .replace(/(["'])(.*?)\1/g, '<span class="syn-string">$1$2$1</span>')
    .replace(/\b(alias|export|PS1|echo|source|bashrc|zshrc|clear|neofetch|cls|CLS|if|then|fi|which|uname|os)\b/g, '<span class="syn-keyword">$1</span>')
    .replace(/(\$[\w{}]+)/g, '<span class="syn-function">$1</span>');
}

function highlightCode(code: string, category: SnippetCategory): string {
  const lines = code.split('\n');
  return lines
    .map((line) => {
      if (category === 'React') return highlightReact(line);
      if (category === 'CSS') return highlightCSS(line);
      if (category === 'TypeScript') return highlightTS(line);
      if (category === 'Git') return highlightGit(line);
      if (category === 'Terminal') return highlightTerminal(line);
      return highlightJS(line);
    })
    .join('\n');
}

/* ──────────────────────────────────────────────
   SNIPPETS DATA
   ────────────────────────────────────────────── */

const SNIPPETS: CodeSnippet[] = [
  {
    id: 'use-local-storage',
    title: 'useLocalStorage Hook',
    category: 'React',
    language: 'React',
    description: 'Persist state to localStorage with SSR safety',
    code: `import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}`,
    previewLines: 4,
  },
  {
    id: 'use-debounce',
    title: 'useDebounce Hook',
    category: 'React',
    language: 'React',
    description: 'Debounce rapid value changes with configurable delay',
    code: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}`,
    previewLines: 4,
  },
  {
    id: 'use-click-outside',
    title: 'useClickOutside Hook',
    category: 'React',
    language: 'React',
    description: 'Detect clicks outside a DOM element for modals and dropdowns',
    code: `import { useEffect, RefObject } from 'react';

export function useClickOutside(
  ref: RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}`,
    previewLines: 4,
  },
  {
    id: 'use-media-query',
    title: 'useMediaQuery Hook',
    category: 'React',
    language: 'React',
    description: 'Respond to CSS media query changes reactively',
    code: `import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// Usage: const isMobile = useMediaQuery('(max-width: 768px)');`,
    previewLines: 4,
  },
  {
    id: 'css-grid-autofill',
    title: 'CSS Grid Auto-Fill',
    category: 'CSS',
    language: 'CSS',
    description: 'Responsive grid that auto-fills columns without media queries',
    code: `/* Auto-fill responsive grid — no media queries needed */
.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

/* Variant with fixed minimum */
.auto-grid-sm {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

/* Variant: fill as many 200px columns as possible */
.auto-grid-dense {
  display: grid;
  grid-template-columns: repeat(auto-fill, 200px);
  gap: 1rem;
  grid-auto-flow: dense;
}`,
    previewLines: 4,
  },
  {
    id: 'css-smooth-scrollbar',
    title: 'Smooth Scrollbar',
    category: 'CSS',
    language: 'CSS',
    description: 'Custom styled scrollbar for Webkit and Firefox',
    code: `/* Custom thin scrollbar */
.custom-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* Firefox */
.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.15) transparent;
}`,
    previewLines: 4,
  },
  {
    id: 'css-glassmorphism',
    title: 'Glassmorphism Card',
    category: 'CSS',
    language: 'CSS',
    description: 'Frosted glass effect with backdrop blur and subtle borders',
    code: `/* Glassmorphism card */
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  padding: 2rem;
  transition: all 0.3s ease;
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}`,
    previewLines: 4,
  },
  {
    id: 'css-text-truncate',
    title: 'Text Truncate',
    category: 'CSS',
    language: 'CSS',
    description: 'Single and multi-line text truncation with ellipsis',
    code: `/* Single line truncation */
.truncate-single {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}

/* Multi-line truncation (2 lines) */
.truncate-multiline {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Multi-line truncation (3 lines) */
.truncate-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}`,
    previewLines: 4,
  },
  {
    id: 'js-debounce',
    title: 'Debounce Function',
    category: 'JavaScript',
    language: 'JavaScript',
    description: 'Delay execution until after a period of inactivity',
    code: `function debounce(func, delay = 300) {
  let timeoutId;

  const debounced = function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };

  debounced.cancel = () => {
    clearTimeout(timeoutId);
  };

  return debounced;
}

// Usage
const handleSearch = debounce((query) => {
  console.log('Searching for:', query);
}, 500);

handleSearch('hello');    // cancelled
handleSearch('hello wo'); // cancelled
handleSearch('hello world'); // executes after 500ms`,
    previewLines: 4,
  },
  {
    id: 'js-throttle',
    title: 'Throttle Function',
    category: 'JavaScript',
    language: 'JavaScript',
    description: 'Limit execution to at most once per interval',
    code: `function throttle(func, limit = 300) {
  let inThrottle;
  let lastArgs;

  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          func.apply(this, lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  };
}

// Usage: const handleScroll = throttle(onScroll, 100);
// window.addEventListener('scroll', handleScroll);`,
    previewLines: 4,
  },
  {
    id: 'js-deep-copy',
    title: 'Deep Copy',
    category: 'JavaScript',
    language: 'JavaScript',
    description: 'Deep clone objects handling nested structures and edge cases',
    code: `function deepCopy(source, cache = new WeakMap()) {
  if (source === null || typeof source !== 'object') {
    return source;
  }

  if (cache.has(source)) {
    return cache.get(source);
  }

  if (source instanceof Date) {
    return new Date(source.getTime());
  }

  if (Array.isArray(source)) {
    const copy = source.map((item) => deepCopy(item, cache));
    cache.set(source, copy);
    return copy;
  }

  const copy = Object.create(Object.getPrototypeOf(source));
  cache.set(source, copy);

  for (const key of Object.keys(source)) {
    copy[key] = deepCopy(source[key], cache);
  }

  return copy;
}`,
    previewLines: 4,
  },
  {
    id: 'js-format-date',
    title: 'Format Date',
    category: 'JavaScript',
    language: 'JavaScript',
    description: 'Human-readable date formatting with relative time support',
    code: `function formatDate(date, options = {}) {
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (options.relative) {
    if (seconds < 60) return 'just now';
    if (minutes < 60) return minutes + 'm ago';
    if (hours < 24) return hours + 'h ago';
    if (hours < 48) return 'yesterday';
  }

  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}`,
    previewLines: 4,
  },
  {
    id: 'ts-generic-type-guard',
    title: 'Generic Type Guard',
    category: 'TypeScript',
    language: 'TypeScript',
    description: 'Runtime type checking with compile-time type narrowing',
    code: `interface HasId {
  id: string;
  [key: string]: unknown;
}

function isTypeGuard<T>(
  value: unknown,
  check: (v: unknown) => v is T
): value is T {
  return check(value);
}

// Usage example
function hasId(value: unknown): value is HasId {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof (value as HasId).id === 'string'
  );
}

const data: unknown = { id: '123', name: 'test' };
if (isTypeGuard(data, hasId)) {
  console.log(data.id); // TypeScript knows data is HasId
}`,
    previewLines: 4,
  },
  {
    id: 'ts-partial-required',
    title: 'Partial Required',
    category: 'TypeScript',
    language: 'TypeScript',
    description: 'Utility type to make specific properties required in a partial type',
    code: `type PartialRequired<T, K extends keyof T> = Required<Pick<T, K>> &
  Omit<T, K>;

// Make 'id' and 'email' required, keep rest optional
interface User {
  id?: string;
  email?: string;
  name?: string;
  age?: number;
  avatar?: string;
}

type CreateUserInput = PartialRequired<User, 'id' | 'email'>;
// { id: string; email: string; name?: string; age?: number; avatar?: string }

const userInput: CreateUserInput = {
  id: 'abc-123',
  email: 'user@example.com',
  name: 'John',
  // id and email are required, rest optional
};`,
    previewLines: 4,
  },
  {
    id: 'git-undo-last-commit',
    title: 'Undo Last Commit',
    category: 'Git',
    language: 'Git',
    description: 'Safely undo the last commit while preserving changes',
    code: `# Soft reset — keeps changes staged
git reset --soft HEAD~1

# Mixed reset — keeps changes unstaged
git reset HEAD~1

# Hard reset — DISCARDS changes completely
git reset --hard HEAD~1

# Undo commit but create a new commit (safe for shared branches)
git revert HEAD

# Amend last commit (fix message or add forgotten files)
git commit --amend -m "Fixed commit message"

# Unstage a specific file
git restore --staged path/to/file`,
    previewLines: 4,
  },
  {
    id: 'git-squash-commits',
    title: 'Squash Commits',
    category: 'Git',
    language: 'Git',
    description: 'Combine multiple commits into a single clean commit',
    code: `# Interactive rebase — squash last 4 commits
git rebase -i HEAD~4

# In the editor, change 'pick' to 'squash' for commits to merge:
# pick abc1234 First commit
# squash def5678 Second commit
# squash ghi9012 Third commit
# pick jkl3456 Keep this separate

# Squash via reset (non-interactive)
git reset --soft HEAD~3
git commit -m "Squashed: combined 3 commits"

# Squash on a branch before merging
git checkout feature-branch
git rebase -i main`,
    previewLines: 4,
  },
  {
    id: 'terminal-clear-alias',
    title: 'Clear Screen Alias',
    category: 'Terminal',
    language: 'Terminal',
    description: 'Useful terminal aliases for common shell commands',
    code: `# Add to ~/.bashrc or ~/.zshrc

# Clear screen with style
alias cls='clear && echo "\\033[1;32m✓ Screen cleared\\033[0m"'

# Clear and show directory
alias cll='clear && ls -la --color=auto'

# Quick directory navigation
alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'

# Show current Git branch in prompt
alias gp='git pull --rebase'
alias gs='git status --short'
alias gc='git commit -m'

# Quick project navigation
alias proj='cd ~/Projects'`,
    previewLines: 4,
  },
  {
    id: 'terminal-ps1-prompt',
    title: 'PS1 Prompt',
    category: 'Terminal',
    language: 'Terminal',
    description: 'Beautiful bash prompt showing Git branch and directory',
    code: `# Add to ~/.bashrc
# Shows user, directory, git branch, and time

parse_git_branch() {
  git branch 2>/dev/null | sed -e '/^[^*]/d' -e 's/* \\(.*\\)/[\\1]/'
}

export PS1='\\[\\033[0;32m\\]\\u\\[\\033[0m\\] \
\\[\\033[0;34m\\]\\w\\[\\033[0m\\] \
\\[\\033[0;33m\\]$(parse_git_branch)\\[\\033[0m\\] \
\\[\\033[0;36m\\]\\t\\[\\033[0m\\] $ '

# Result: user ~/Projects/my-app [main] 14:30:22 $`,
    previewLines: 4,
  },
];

/* ──────────────────────────────────────────────
   COPY SNIPPET HOOK
   ────────────────────────────────────────────── */

function useCopyToClipboard(timeout = 2000) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = useCallback(async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), timeout);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), timeout);
    }
  }, [timeout]);

  const copyAll = useCallback(async (snippets: CodeSnippet[]) => {
    const allCode = snippets.map((s) => `// ${s.title} (${s.category})\n${s.code}`).join('\n\n---\n\n');
    try {
      await navigator.clipboard.writeText(allCode);
      setCopiedId('all');
      setTimeout(() => setCopiedId(null), timeout);
    } catch {
      // silently fail
    }
  }, [timeout]);

  return { copiedId, copy, copyAll };
}

/* ──────────────────────────────────────────────
   SNIPPET CARD COMPONENT
   ────────────────────────────────────────────── */

function SnippetCard({
  snippet,
  copiedId,
  onCopy,
  index,
}: {
  snippet: CodeSnippet;
  copiedId: string | null;
  onCopy: (id: string, code: string) => void;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const catColors = CATEGORY_COLORS[snippet.category];
  const isCopied = copiedId === snippet.id;
  const lines = snippet.code.split('\n');
  const previewCode = lines.slice(0, snippet.previewLines).join('\n');
  const highlightedPreview = highlightCode(previewCode, snippet.category);
  const highlightedFull = highlightCode(snippet.code, snippet.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -1, borderColor: 'rgba(16, 185, 129, 0.15)' }}
      className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden group"
    >
      {/* Card header */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: catColors.dot }}
            />
            <h3 className="text-sm font-semibold text-white/85 truncate">
              {snippet.title}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Language badge */}
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-medium"
              style={{
                backgroundColor: catColors.bg,
                color: catColors.text,
                border: `1px solid ${catColors.border}`,
              }}
            >
              {snippet.language}
            </span>
            {/* Copy button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onCopy(snippet.id, snippet.code)}
              className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] transition-colors duration-200 cursor-pointer"
              title={isCopied ? 'Copied!' : 'Copy code'}
            >
              <AnimatePresence mode="wait">
                {isCopied ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Copy className="w-3.5 h-3.5 text-white/40 group-hover:text-white/60 transition-colors duration-200" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-white/35 mb-3 leading-relaxed">
          {snippet.description}
        </p>

        {/* Code preview */}
        <div className="rounded-xl bg-black/40 border border-white/[0.04] overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.04]">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500/50" />
              <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
              <div className="w-2 h-2 rounded-full bg-green-500/50" />
            </div>
            <span className="text-[9px] font-mono text-white/20 ml-1">
              {snippet.category.toLowerCase()}-{snippet.id}.{snippet.category === 'CSS' ? 'css' : snippet.category === 'Terminal' ? 'sh' : snippet.category === 'Git' ? 'git' : snippet.category === 'TypeScript' ? 'ts' : snippet.category === 'React' ? 'tsx' : 'js'}
            </span>
          </div>
          <pre className="p-3 overflow-x-auto custom-scrollbar text-[11px] sm:text-xs leading-relaxed">
            <code
              className="font-mono text-white/70"
              dangerouslySetInnerHTML={{ __html: expanded ? highlightedFull : highlightedPreview }}
            />
          </pre>

          {/* Expand/collapse toggle */}
          <AnimatePresence>
            {lines.length > snippet.previewLines && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-center gap-1.5 py-2 border-t border-white/[0.04] text-[11px] font-mono text-white/30 hover:text-white/50 hover:bg-white/[0.02] transition-colors duration-200 cursor-pointer"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    <span>Show less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    <span>{lines.length - snippet.previewLines} more lines</span>
                  </>
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Category tag */}
        <div className="flex items-center gap-1.5 mt-3">
          <Tag className="w-3 h-3 text-white/20" />
          <span className="text-[10px] font-mono text-white/25">{snippet.category}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   EMPTY STATE
   ────────────────────────────────────────────── */

function EmptyState({ query }: { query: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
        <Search className="w-7 h-7 text-white/20" />
      </div>
      <h3 className="text-sm font-semibold text-white/50 mb-1">No snippets found</h3>
      <p className="text-xs text-white/25 text-center max-w-xs">
        No results for &quot;{query}&quot;. Try a different search term or category filter.
      </p>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────── */

export function CodeSnippetsSection() {
  const mounted = useMounted();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SnippetCategory | 'All'>('All');
  const { copiedId, copy, copyAll } = useCopyToClipboard(2000);
  const searchRef = useRef<HTMLInputElement>(null);

  // Filtered snippets
  const filteredSnippets = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return SNIPPETS.filter((snippet) => {
      const matchesCategory = activeCategory === 'All' || snippet.category === activeCategory;
      const matchesSearch =
        !q ||
        snippet.title.toLowerCase().includes(q) ||
        snippet.description.toLowerCase().includes(q) ||
        snippet.code.toLowerCase().includes(q) ||
        snippet.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: SNIPPETS.length };
    for (const snippet of SNIPPETS) {
      counts[snippet.category] = (counts[snippet.category] || 0) + 1;
    }
    return counts;
  }, []);

  // Keyboard shortcut: Cmd/Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="h-10 w-72 bg-white/[0.03] rounded-lg animate-pulse" />
          <div className="h-6 w-96 mt-3 bg-white/[0.02] rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 bg-white/[0.02] rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
    >
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">

        {/* ─── HEADER ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 mb-4">
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-mono text-emerald-400/80">Code Library</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white/90 mb-2">
            Code Snippets
          </h2>
          <p className="text-sm text-white/35 max-w-lg mx-auto">
            A curated collection of reusable code snippets. Search, filter, and copy to clipboard.
          </p>
        </motion.div>

        {/* ─── SEARCH & FILTER BAR ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 sm:p-5 backdrop-blur-sm"
        >
          {/* Search input row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search snippets..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/30 border border-white/[0.06] text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/10 transition-all duration-200 font-mono"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-white/20 bg-white/[0.05] border border-white/[0.06]">
                Ctrl+K
              </kbd>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => copyAll(filteredSnippets)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm font-mono text-emerald-400 hover:bg-emerald-500/15 transition-colors duration-200 cursor-pointer flex-shrink-0"
            >
              <AnimatePresence mode="wait">
                {copiedId === 'all' ? (
                  <motion.span
                    key="check-all"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Copied All!</span>
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy-all"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy All</span>
                  </motion.span>
                )}
              </AnimatePresence>
              <span className="text-[10px] text-emerald-400/60">
                ({filteredSnippets.length})
              </span>
            </motion.button>
          </div>

          {/* Category filter buttons */}
          <div className="flex flex-wrap gap-2">
            {/* All button */}
            <button
              onClick={() => setActiveCategory('All')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer ${
                activeCategory === 'All'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                  : 'bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/60 hover:bg-white/[0.05]'
              }`}
            >
              <FolderOpen className="w-3 h-3" />
              <span>All</span>
              <span className="text-[10px] opacity-60">{categoryCounts['All']}</span>
            </button>
            {/* Category buttons */}
            {ALL_CATEGORIES.map((cat) => {
              const colors = CATEGORY_COLORS[cat];
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(isActive ? 'All' : cat)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer"
                  style={{
                    backgroundColor: isActive ? colors.bg : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isActive ? colors.border : 'rgba(255,255,255,0.06)'}`,
                    color: isActive ? colors.text : 'rgba(255,255,255,0.4)',
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: colors.dot, opacity: isActive ? 1 : 0.5 }}
                  />
                  <span>{cat}</span>
                  <span className="text-[10px] opacity-60">{categoryCounts[cat] || 0}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ─── RESULTS COUNT ─── */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-white/30">
            {filteredSnippets.length} snippet{filteredSnippets.length !== 1 ? 's' : ''} found
          </span>
          {(searchQuery || activeCategory !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
              }}
              className="text-xs font-mono text-white/30 hover:text-white/50 transition-colors duration-200 cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* ─── SNIPPETS GRID ─── */}
        {filteredSnippets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredSnippets.map((snippet, i) => (
              <SnippetCard
                key={snippet.id}
                snippet={snippet}
                copiedId={copiedId}
                onCopy={copy}
                index={i}
              />
            ))}
          </div>
        ) : (
          <EmptyState query={searchQuery} />
        )}

        {/* ─── INFO BAR ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-4 pb-2"
        >
          {[
            { icon: BookOpen, label: `${SNIPPETS.length} Snippets`, color: '#f59e0b' },
            { icon: Tag, label: `${ALL_CATEGORIES.length} Categories`, color: '#10b981' },
            { icon: Copy, label: 'One-Click Copy', color: '#06b6d4' },
            { icon: Search, label: 'Instant Search', color: '#8b5cf6' },
          ].map((item, i) => (
            <div key={`snippet-info-${i}`} className="flex items-center gap-1.5">
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
