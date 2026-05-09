// Project: Web Aesthetic Showcase v3.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v3.0\src\components
// Lines: 1570

'use client';

import { useState, useCallback, useMemo, useRef, useEffect, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Check,
  FileText,
  Bold,
  Italic,
  Strikethrough,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Link,
  Image,
  Quote,
  List,
  ListOrdered,
  Table,
  Minus,
  ClipboardPaste,
  Trash2,
  Download,
  FileCode,
  AlignLeft,
  Eye,
  Clock,
  Hash,
  Type,
} from 'lucide-react';

/* ──────────────────────────────────────────────
   SSR-SAFE MOUNT HOOK
   ────────────────────────────────────────────── */
const subscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

/* ──────────────────────────────────────────────
   MARKDOWN PARSER (from scratch, no libraries)
   ────────────────────────────────────────────── */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inlineFormat(text: string): string {
  let result = escapeHtml(text);

  // Inline code (must come first to protect content inside backticks)
  result = result.replace(/`([^`\n]+)`/g, '<code class="md-inline-code">$1</code>');

  // Images: ![alt](url)
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="md-img" />');

  // Links: [text](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>');

  // Bold+Italic: ***text*** or ___text___
  result = result.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  result = result.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');

  // Bold: **text** or __text__
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');
  result = result.replace(/(?<!\w)_(.+?)_(?!\w)/g, '<em>$1</em>');

  // Strikethrough: ~~text~~
  result = result.replace(/~~(.+?)~~/g, '<del>$1</del>');

  return result;
}

function highlightCode(code: string, _lang: string): string {
  const escaped = escapeHtml(code);

  // Simple syntax highlighting via regex (no external lib)
  let highlighted = escaped;

  // Comments
  highlighted = highlighted.replace(/(\/\/.*$|#.*$)/gm, '<span class="syn-comment">$1</span>');

  // Strings (double and single quotes)
  highlighted = highlighted.replace(/(&quot;[^&]*?&quot;|&#039;[^&]*?&#039;)/g, '<span class="syn-string">$1</span>');
  highlighted = highlighted.replace(/(&apos;[^&]*?&apos;)/g, '<span class="syn-string">$1</span>');

  // Keywords
  const keywords = /\b(function|const|let|var|if|else|for|while|return|import|export|from|class|extends|new|this|async|await|try|catch|throw|typeof|instanceof|switch|case|break|continue|default|interface|type|enum|implements|public|private|protected|static|void|null|undefined|true|false|def|print|self|lambda|elif|pass|raise|with|as|yield|in|not|and|or|is)\b/g;
  highlighted = highlighted.replace(keywords, '<span class="syn-keyword">$1</span>');

  // Numbers
  highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span class="syn-number">$1</span>');

  // Functions
  highlighted = highlighted.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, '<span class="syn-function">$1</span>');

  return highlighted;
}

interface TableState {
  inTable: boolean;
  headerDone: boolean;
}

function parseMarkdown(markdown: string): string {
  const lines = markdown.split('\n');
  const htmlParts: string[] = [];
  let inCodeBlock = false;
  let codeContent = '';
  let codeLang = '';
  let inList = false;
  let listType: 'ul' | 'ol' | 'task' | '' = '';
  let inBlockquote = false;
  const tableState: TableState = { inTable: false, headerDone: false };

  function closeList() {
    if (inList) {
      if (listType === 'task') htmlParts.push('</ul>');
      else htmlParts.push(listType === 'ol' ? '</ol>' : '</ul>');
      inList = false;
      listType = '';
    }
  }

  function closeBlockquote() {
    if (inBlockquote) {
      htmlParts.push('</blockquote>');
      inBlockquote = false;
    }
  }

  function closeTable() {
    if (tableState.inTable) {
      htmlParts.push('</tbody></table></div>');
      tableState.inTable = false;
      tableState.headerDone = false;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Fenced code blocks
    if (line.trimStart().startsWith('```')) {
      if (inCodeBlock) {
        const highlighted = highlightCode(codeContent.trimEnd(), codeLang);
        htmlParts.push(`<div class="md-code-block"><div class="md-code-header"><span>${escapeHtml(codeLang || 'code')}</span></div><pre><code>${highlighted}</code></pre></div>`);
        inCodeBlock = false;
        codeContent = '';
        codeLang = '';
      } else {
        closeList();
        closeBlockquote();
        closeTable();
        inCodeBlock = true;
        codeLang = line.trimStart().slice(3).trim();
        codeContent = '';
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += line + '\n';
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      closeList();
      closeBlockquote();
      closeTable();
      continue;
    }

    // Horizontal rule
    if (/^(\s*)([-*_])\s*\2\s*\2[\s\2]*$/.test(line.trim())) {
      closeList();
      closeBlockquote();
      closeTable();
      htmlParts.push('<hr class="md-hr" />');
      continue;
    }

    // Table detection
    const isTableLine = line.includes('|') && line.trim().startsWith('|');
    const isSeparator = /^\|[\s:|-]+\|$/.test(line.trim());
    if (isTableLine || (tableState.inTable && isSeparator)) {
      closeList();
      closeBlockquote();

      if (!tableState.inTable) {
        htmlParts.push('<div class="md-table-wrap"><table class="md-table"><thead>');
        tableState.inTable = true;
      }

      if (isSeparator) {
        htmlParts.push('</thead><tbody>');
        tableState.headerDone = true;
        continue;
      }

      const cells = line.split('|').filter((c, idx, arr) => !(idx === 0 && c === '') && !(idx === arr.length - 1 && c === ''));
      const tag = !tableState.headerDone ? 'th' : 'td';
      htmlParts.push('<tr>');
      for (const cell of cells) {
        htmlParts.push(`<${tag}>${inlineFormat(cell.trim())}</${tag}>`);
      }
      htmlParts.push('</tr>');
      continue;
    }

    if (tableState.inTable) {
      closeTable();
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      closeList();
      closeBlockquote();
      const level = headingMatch[1].length;
      htmlParts.push(`<h${level} class="md-h${level}">${inlineFormat(headingMatch[2])}</h${level}>`);
      continue;
    }

    // Blockquote
    if (line.trimStart().startsWith('>')) {
      closeList();
      if (!inBlockquote) {
        htmlParts.push('<blockquote class="md-blockquote">');
        inBlockquote = true;
      }
      const content = line.trimStart().replace(/^>\s?/, '');
      htmlParts.push(`<p>${inlineFormat(content)}</p>`);
      continue;
    } else if (inBlockquote) {
      closeBlockquote();
    }

    // Task list
    const taskMatch = line.trimStart().match(/^[-*+]\s+\[([ xX])\]\s+(.+)$/);
    if (taskMatch) {
      if (!inList || listType !== 'task') {
        closeList();
        htmlParts.push('<ul class="md-task-list">');
        inList = true;
        listType = 'task';
      }
      const checked = taskMatch[1] !== ' ' ? ' checked' : '';
      htmlParts.push(`<li class="md-task-item"><input type="checkbox" disabled${checked} /><span>${inlineFormat(taskMatch[2])}</span></li>`);
      continue;
    }

    // Unordered list
    const ulMatch = line.trimStart().match(/^[-*+]\s+(.+)$/);
    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        closeList();
        htmlParts.push('<ul class="md-ul">');
        inList = true;
        listType = 'ul';
      }
      htmlParts.push(`<li>${inlineFormat(ulMatch[1])}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = line.trimStart().match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      if (!inList || listType !== 'ol') {
        closeList();
        htmlParts.push('<ol class="md-ol">');
        inList = true;
        listType = 'ol';
      }
      htmlParts.push(`<li>${inlineFormat(olMatch[1])}</li>`);
      continue;
    }

    // Regular paragraph
    closeList();
    closeBlockquote();
    htmlParts.push(`<p>${inlineFormat(line)}</p>`);
  }

  // Close any remaining blocks
  if (inCodeBlock) {
    const highlighted = highlightCode(codeContent.trimEnd(), codeLang);
    htmlParts.push(`<div class="md-code-block"><div class="md-code-header"><span>${escapeHtml(codeLang || 'code')}</span></div><pre><code>${highlighted}</code></pre></div>`);
  }
  closeList();
  closeBlockquote();
  closeTable();

  return htmlParts.join('\n');
}

/* ──────────────────────────────────────────────
   SAMPLE DATA
   ────────────────────────────────────────────── */
interface SampleTemplate {
  id: string;
  name: string;
  icon: React.ElementType;
  content: string;
}

const SAMPLE_TEMPLATES: SampleTemplate[] = [
  {
    id: 'readme',
    name: 'README',
    icon: FileCode,
    content: `# My Awesome Project

![Status](https://img.shields.io/badge/status-active-brightgreen) ![Version](https://img.shields.io/badge/version-2.0.0-blue) ![License](https://img.shields.io/badge/license-MIT-orange)

> A blazing-fast, type-safe toolkit for building modern web applications.

## Features

- **Lightning Fast** — Built with performance in mind, sub-millisecond response times
- **Type Safe** — Full TypeScript support with auto-generated types
- **Plugin System** — Extensible architecture with first-class plugin support
- **Developer Experience** — Hot reload, error overlays, and detailed logging

## Installation

\`\`\`bash
# Using npm
npm install my-awesome-project

# Using yarn
yarn add my-awesome-project

# Using pnpm
pnpm add my-awesome-project
\`\`\`

## Quick Start

\`\`\`typescript
import { createApp } from 'my-awesome-project';

const app = createApp({
  port: 3000,
  plugins: [logger(), cors()],
});

app.get('/api/hello', (ctx) => {
  return { message: 'Hello, World!' };
});

app.start();
\`\`\`

## Usage

### Basic Routing

\`\`\`typescript
// Define routes with type-safe handlers
app.route('/users')
  .get(listUsers)
  .post(createUser)
  .put(updateUser);
\`\`\`

### Middleware

1. **Authentication** — JWT-based auth middleware
2. **Logging** — Request/response logging
3. **Rate Limiting** — Protect against abuse
4. **CORS** — Cross-origin support

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| \`port\` | \`number\` | \`3000\` | Server port |
| \`host\` | \`string\` | \`localhost\` | Server host |
| \`debug\` | \`boolean\` | \`false\` | Enable debug mode |
| \`workers\` | \`number\` | \`4\` | Worker threads |

## Contributing

Contributions are welcome! Please read our contributing guidelines:

- [ ] Fork the repository
- [ ] Create a feature branch
- [x] Write tests for new features
- [x] Ensure all tests pass
- [x] Submit a pull request

## License

This project is licensed under the MIT License — see the [LICENSE](https://opensource.org/licenses/MIT) file for details.`,
  },
  {
    id: 'blog',
    name: 'Blog Post',
    icon: FileText,
    content: `# Building Scalable APIs with Modern Architecture

*Published on December 15, 2024 • 8 min read*

---

## Introduction

In today's fast-paced development world, building APIs that scale is **critical**. Whether you're serving thousands or millions of requests, your architecture matters.

> "Make it work, make it right, make it fast." — Kent Beck

## The Problem with Monoliths

Traditional monolithic architectures face several challenges:

1. **Single point of failure** — one bug can bring down the entire system
2. **Difficult to scale** — you must scale the whole application
3. **Slow deployments** — any change requires redeploying everything
4. **Tight coupling** — components are hard to change independently

## Enter Microservices

Microservices solve these problems by decomposing your application into small, independent services.

### Key Principles

- Each service owns its **data**
- Services communicate via **well-defined APIs**
- Services are **independently deployable**
- **Failures are isolated**

## Implementation Example

Here's a simple user service implementation:

\`\`\`typescript
class UserService {
  private repository: UserRepository;
  private cache: RedisClient;
  
  constructor(config: ServiceConfig) {
    this.repository = new UserRepository(config.db);
    this.cache = new RedisClient(config.redis);
  }

  async getUser(id: string): Promise<User> {
    // Check cache first
    const cached = await this.cache.get(\`user:\${id}\`);
    if (cached) return JSON.parse(cached);

    // Fetch from database
    const user = await this.repository.findById(id);
    
    // Cache for 5 minutes
    await this.cache.set(\`user:\${id}\`, JSON.stringify(user), {
      ttl: 300,
    });

    return user;
  }

  async createUser(data: CreateUserDTO): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await this.repository.create({
      ...data,
      password: hashedPassword,
    });
    
    // Invalidate relevant caches
    await this.cache.del('users:list');
    return user;
  }
}
\`\`\`

## Performance Benchmarks

| Architecture | Req/sec | P50 Latency | P99 Latency | Memory |
|-------------|---------|-------------|-------------|--------|
| Monolith | 2,400 | 42ms | 380ms | 512MB |
| Microservices | 8,500 | 12ms | 95ms | 256MB |
| Serverless | 12,000 | 8ms | 120ms | 128MB |

## Best Practices

### Error Handling

Always implement **graceful error handling** with proper status codes:

\`\`\`typescript
try {
  const result = await service.process(order);
  return { success: true, data: result };
} catch (error) {
  if (error instanceof NotFoundError) {
    return { success: false, error: 'Resource not found' };
  }
  logger.error('Processing failed', { error, orderId });
  throw error;
}
\`\`\`

> **Pro tip:** Use structured logging from day one. You'll thank yourself during debugging.

## Conclusion

Building scalable APIs requires careful planning and the right architecture. Microservices offer a powerful approach, but they come with their own complexity. Start simple, measure everything, and evolve your architecture based on **real needs**.

---

*Thanks for reading! If you found this helpful, share it with your team.*`,
  },
  {
    id: 'docs',
    name: 'Documentation',
    icon: FileText,
    content: `# API Reference

*Version 3.2.0 • Last updated: December 2024*

---

## Overview

This API follows **RESTful conventions** and returns JSON responses. All endpoints require authentication via Bearer tokens.

> ⚠️ **Warning:** API keys should never be exposed in client-side code. Always use server-side proxies for authentication.

## Authentication

Include your API key in the \`Authorization\` header:

\`\`\`bash
curl -X GET https://api.example.com/v3/users \\
  -H "Authorization: Bearer sk_live_abc123" \\
  -H "Content-Type: application/json"
\`\`\`

## Base URL

| Environment | URL |
|-------------|-----|
| Production | \`https://api.example.com/v3\` |
| Staging | \`https://staging-api.example.com/v3\` |
| Development | \`http://localhost:3000/v3\` |

---

## Endpoints

### Users

#### List Users

\`\`\`
GET /v3/users
\`\`\`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| \`limit\` | integer | No | 25 | Max results per page |
| \`offset\` | integer | No | 0 | Number of results to skip |
| \`sort\` | string | No | \`created_at\` | Field to sort by |
| \`order\` | string | No | \`desc\` | Sort direction (asc/desc) |
| \`role\` | string | No | — | Filter by role |

**Response (200 OK):**

\`\`\`json
{
  "data": [
    {
      "id": "usr_abc123",
      "name": "Jane Cooper",
      "email": "jane@example.com",
      "role": "admin",
      "created_at": "2024-01-15T08:30:00Z",
      "metadata": {
        "login_count": 42,
        "last_ip": "192.168.1.1"
      }
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 25,
    "offset": 0,
    "has_more": true
  }
}
\`\`\`

#### Create User

\`\`\`
POST /v3/users
\`\`\`

**Request Body:**

\`\`\`json
{
  "name": "Jane Cooper",
  "email": "jane@example.com",
  "role": "member",
  "send_welcome": true
}
\`\`\`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| \`name\` | string | **Yes** | Full name (2-100 chars) |
| \`email\` | string | **Yes** | Valid email address |
| \`role\` | string | No | One of: \`member\`, \`admin\`, \`viewer\` |
| \`send_welcome\` | boolean | No | Send welcome email |

#### Delete User

\`\`\`
DELETE /v3/users/:id
\`\`\`

> **Caution:** This action is **irreversible**. All associated data will be permanently deleted.

**Response (204 No Content):** No response body.

---

## Error Codes

| Code | Meaning | Resolution |
|------|---------|------------|
| 400 | Bad Request | Check request body format |
| 401 | Unauthorized | Verify API key is valid |
| 403 | Forbidden | Check permissions for resource |
| 404 | Not Found | Verify resource ID exists |
| 409 | Conflict | Resource already exists |
| 429 | Rate Limited | Retry after \`Retry-After\` header |
| 500 | Server Error | Contact support with request ID |

## Rate Limits

| Plan | Requests/min | Burst | Daily |
|------|-------------|-------|-------|
| Free | 60 | 10 | 10,000 |
| Pro | 600 | 100 | 100,000 |
| Enterprise | 6,000 | 500 | Unlimited |

## SDK Examples

### JavaScript / TypeScript

\`\`\`typescript
import { Client } from '@example/sdk';

const client = new Client({
  apiKey: process.env.API_KEY,
  baseURL: 'https://api.example.com/v3',
});

// List users with filtering
const users = await client.users.list({
  limit: 50,
  role: 'admin',
  sort: 'created_at',
  order: 'desc',
});

// Create a new user
const user = await client.users.create({
  name: 'Jane Cooper',
  email: 'jane@example.com',
  role: 'admin',
});
\`\`\`

### Python

\`\`\`python
from example_sdk import Client

client = Client(api_key="sk_live_abc123")

# List users
users = client.users.list(limit=50, role="admin")

# Create user
user = client.users.create(
    name="Jane Cooper",
    email="jane@example.com",
    role="admin"
)
\`\`\`

## Changelog

### v3.2.0 (December 2024)

- [x] Added batch user creation endpoint
- [x] Improved rate limit headers
- [x] Fixed pagination edge cases
- [ ] GraphQL support (coming soon)
- [ ] WebSocket real-time events`,
  },
];

/* ──────────────────────────────────────────────
   FLOATING DECORATIONS
   ────────────────────────────────────────────── */
const FLOAT_SYMBOLS = [
  { text: '#', x: 5, y: 12, delay: 0 },
  { text: '*', x: 88, y: 18, delay: 1.4 },
  { text: '>', x: 8, y: 72, delay: 0.8 },
  { text: '-', x: 92, y: 78, delay: 2.2 },
  { text: '`', x: 82, y: 42, delay: 1.8 },
  { text: '##', x: 4, y: 48, delay: 2.6 },
  { text: '**', x: 75, y: 88, delay: 0.4 },
  { text: '[]', x: 15, y: 88, delay: 1.0 },
];

/* ──────────────────────────────────────────────
   TOOLBAR BUTTONS
   ────────────────────────────────────────────── */
interface ToolbarAction {
  icon: React.ElementType;
  label: string;
  action: 'bold' | 'italic' | 'strikethrough' | 'code' | 'heading' | 'link' | 'image' | 'codeblock' | 'quote' | 'ul' | 'ol' | 'table' | 'hr';
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { icon: Bold, label: 'Bold', action: 'bold' },
  { icon: Italic, label: 'Italic', action: 'italic' },
  { icon: Strikethrough, label: 'Strikethrough', action: 'strikethrough' },
  { icon: Code2, label: 'Inline Code', action: 'code' },
  { icon: Heading1, label: 'Heading', action: 'heading' },
  { icon: Link, label: 'Link', action: 'link' },
  { icon: Image, label: 'Image', action: 'image' },
  { icon: Code2, label: 'Code Block', action: 'codeblock' },
  { icon: Quote, label: 'Quote', action: 'quote' },
  { icon: List, label: 'Unordered List', action: 'ul' },
  { icon: ListOrdered, label: 'Ordered List', action: 'ol' },
  { icon: Table, label: 'Table', action: 'table' },
  { icon: Minus, label: 'Horizontal Rule', action: 'hr' },
];

/* ──────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────── */
export function MarkdownPreviewSection() {
  const mounted = useIsMounted();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ─── State ───
  const [markdown, setMarkdown] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      return localStorage.getItem('md-editor-content') || '';
    } catch {
      return '';
    }
  });
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [headingLevel, setHeadingLevel] = useState(1);
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const debouncedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Auto-save to localStorage (debounced) ───
  useEffect(() => {
    if (debouncedTimer.current) {
      clearTimeout(debouncedTimer.current);
    }
    debouncedTimer.current = setTimeout(() => {
      try {
        localStorage.setItem('md-editor-content', markdown);
      } catch {
        // localStorage not available
      }
    }, 500);
    return () => {
      if (debouncedTimer.current) {
        clearTimeout(debouncedTimer.current);
      }
    };
  }, [markdown]);

  // ─── Computed stats ───
  const stats = useMemo(() => {
    const chars = markdown.length;
    const lines = markdown.split('\n').length;
    const words = markdown.trim() === '' ? 0 : markdown.trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    return { chars, lines, words, readingTime };
  }, [markdown]);

  // ─── Parse markdown to HTML ───
  const htmlOutput = useMemo(() => parseMarkdown(markdown), [markdown]);

  // ─── Insert text at cursor ───
  const insertAtCursor = useCallback((before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = markdown.slice(start, end);
    const insert = selected || placeholder;
    const newMarkdown = markdown.slice(0, start) + before + insert + after + markdown.slice(end);
    setMarkdown(newMarkdown);
    setTimeout(() => {
      textarea.focus();
      const cursorPos = start + before.length + insert.length;
      textarea.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  }, [markdown]);

  // ─── Toolbar actions ───
  const handleToolbarAction = useCallback((action: ToolbarAction['action']) => {
    switch (action) {
      case 'bold': insertAtCursor('**', '**', 'bold text'); break;
      case 'italic': insertAtCursor('*', '*', 'italic text'); break;
      case 'strikethrough': insertAtCursor('~~', '~~', 'strikethrough'); break;
      case 'code': insertAtCursor('`', '`', 'code'); break;
      case 'heading': insertAtCursor('#'.repeat(headingLevel) + ' ', '', 'Heading'); break;
      case 'link': insertAtCursor('[', '](url)', 'link text'); break;
      case 'image': insertAtCursor('![', '](url)', 'alt text'); break;
      case 'codeblock': insertAtCursor('```\n', '\n```', 'code here'); break;
      case 'quote': insertAtCursor('> ', '', 'quote'); break;
      case 'ul': insertAtCursor('- ', '', 'list item'); break;
      case 'ol': insertAtCursor('1. ', '', 'list item'); break;
      case 'table': insertAtCursor('\n| Header | Header |\n|--------|--------|\n| Cell | Cell |\n| Cell | Cell |\n', '', ''); break;
      case 'hr': insertAtCursor('\n---\n', '', ''); break;
    }
  }, [insertAtCursor, headingLevel]);

  // ─── Copy HTML output ───
  const copyHtml = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(htmlOutput);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    } catch {
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    }
  }, [htmlOutput]);

  // ─── Copy markdown source ───
  const copyMarkdown = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  }, [markdown]);

  // ─── Export as HTML file ───
  const exportHtml = useCallback(() => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Markdown Export</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; background: #1a1a2e; color: #e0e0e0; line-height: 1.7; }
h1 { color: #c084fc; font-size: 2rem; border-bottom: 1px solid #333; padding-bottom: 0.5rem; }
h2 { color: #a78bfa; font-size: 1.5rem; }
h3 { color: #8b5cf6; font-size: 1.25rem; }
code { background: #2d2d44; padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.9em; color: #c084fc; }
pre { background: #0d0d1a; border: 1px solid #333; border-radius: 8px; padding: 1rem; overflow-x: auto; }
pre code { background: none; padding: 0; }
blockquote { border-left: 4px solid #10b981; margin: 1rem 0; padding: 0.5rem 1rem; background: rgba(16,185,129,0.05); }
table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
th, td { border: 1px solid #333; padding: 0.5rem 0.75rem; text-align: left; }
th { background: #2d2d44; }
tr:nth-child(even) { background: rgba(255,255,255,0.02); }
hr { border: none; border-top: 1px solid #333; margin: 2rem 0; }
a { color: #c084fc; text-decoration: none; }
a:hover { text-decoration: underline; }
img { max-width: 100%; border-radius: 8px; }
ul, ol { padding-left: 1.5rem; }
li { margin: 0.25rem 0; }
del { color: #888; }
strong { color: #fff; }
</style>
</head>
<body>
${htmlOutput}
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'markdown-export.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [htmlOutput]);

  // ─── Load template ───
  const loadTemplate = useCallback((template: SampleTemplate) => {
    setMarkdown(template.content);
    setShowTemplates(false);
  }, []);

  // ─── Clear ───
  const clearEditor = useCallback(() => {
    setMarkdown('');
  }, []);

  // ─── Paste from clipboard ───
  const pasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setMarkdown(prev => prev + text);
    } catch {
      // Clipboard access denied
    }
  }, []);

  if (!mounted) {
    return (
      <section className="relative w-full min-h-[80vh] bg-gradient-to-b from-[#0a0a0a] to-[#0d0d18]" />
    );
  }

  return (
    <section className="relative w-full py-20 md:py-28 bg-gradient-to-b from-[#0a0a0a] to-[#0d0d18] overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none bg-grid-subtle" />

      {/* Floating decorative symbols */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {FLOAT_SYMBOLS.map((sym, i) => (
          <motion.div
            key={`md-float-${i}`}
            className="absolute font-mono text-lg whitespace-nowrap select-none"
            style={{
              left: `${sym.x}%`,
              top: `${sym.y}%`,
              color: 'rgba(139, 92, 246, 0.08)',
            }}
            animate={{ y: [0, -12, 0], opacity: [0.05, 0.14, 0.05] }}
            transition={{ duration: 7 + i * 0.8, repeat: Infinity, ease: 'easeInOut', delay: sym.delay }}
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
            <FileText className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-white/60 font-mono">Content Tool</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-purple-400 bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient-text">
              Markdown Lab
            </span>
          </h2>
          <p className="text-base md:text-lg text-white/40 max-w-xl mx-auto font-mono">
            Write, preview, and export markdown in real-time
          </p>
        </motion.div>

        {/* Main container */}
        <div className="max-w-7xl mx-auto">
          {/* Toolbar */}
          <motion.div
            className="rounded-t-xl border border-white/[0.08] border-b-0 bg-white/[0.02] backdrop-blur-sm overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Top bar with VS Code chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs font-mono text-white/30 ml-2">markdown-lab</span>
              <div className="flex-1" />

              {/* Mobile tab toggle */}
              <div className="flex lg:hidden items-center gap-1 mr-3">
                <motion.button
                  onClick={() => setMobileTab('editor')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all cursor-pointer ${
                    mobileTab === 'editor'
                      ? 'bg-violet-500/15 border border-violet-500/30 text-violet-300'
                      : 'text-white/40 border border-transparent hover:text-white/60'
                  }`}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Show editor"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </motion.button>
                <motion.button
                  onClick={() => setMobileTab('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all cursor-pointer ${
                    mobileTab === 'preview'
                      ? 'bg-violet-500/15 border border-violet-500/30 text-violet-300'
                      : 'text-white/40 border border-transparent hover:text-white/60'
                  }`}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Show preview"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Preview</span>
                </motion.button>
              </div>

              {/* Stats */}
              <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono text-white/25">
                <span>{stats.chars} chars</span>
                <span>{stats.lines} lines</span>
                <span>{stats.words} words</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {stats.readingTime} min read
                </span>
              </div>
            </div>

            {/* Toolbar buttons */}
            <div className="flex items-center gap-1 px-3 py-2 border-b border-white/[0.06] flex-wrap">
              {TOOLBAR_ACTIONS.map((btn) => {
                // Use heading selector for heading action
                if (btn.action === 'heading') {
                  return (
                    <div key="heading-select" className="relative">
                      <motion.button
                        onClick={() => setShowHeadingMenu(prev => !prev)}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-mono text-white/40 border border-white/[0.06] bg-white/[0.02] hover:text-violet-300 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title={`H${headingLevel}`}
                        aria-label={`Heading level ${headingLevel}`}
                      >
                        <span className="font-bold text-violet-400">H</span>
                        <span>{headingLevel}</span>
                      </motion.button>
                      <AnimatePresence>
                        {showHeadingMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: -5, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -5, scale: 0.95 }}
                            className="absolute top-full left-0 mt-1 bg-[#1a1a2e] border border-white/[0.1] rounded-lg shadow-xl z-50 overflow-hidden py-1"
                          >
                            {[1, 2, 3, 4, 5, 6].map((level) => (
                              <button
                                key={`h${level}`}
                                onClick={() => { setHeadingLevel(level); setShowHeadingMenu(false); handleToolbarAction('heading'); }}
                                className={`block w-full text-left px-4 py-1.5 text-xs font-mono hover:bg-violet-500/10 transition-colors cursor-pointer ${
                                  level === headingLevel ? 'text-violet-300 bg-violet-500/5' : 'text-white/60'
                                }`}
                              >
                                <span className={`font-bold`} style={{ fontSize: `${18 - level * 2}px` }}>
                                  H{level}
                                </span>
                                {' '}Heading {level}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                const IconComp = btn.icon;
                return (
                  <motion.button
                    key={btn.action}
                    onClick={() => handleToolbarAction(btn.action)}
                    className="p-1.5 rounded-md text-white/40 border border-transparent hover:text-violet-300 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all cursor-pointer"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    title={btn.label}
                    aria-label={btn.label}
                  >
                    <IconComp className="w-4 h-4" />
                  </motion.button>
                );
              })}

              {/* Separator */}
              <div className="w-px h-5 bg-white/[0.08] mx-1" />

              {/* Template toggle */}
              <motion.button
                onClick={() => setShowTemplates(prev => !prev)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-mono text-white/40 border border-white/[0.06] bg-white/[0.02] hover:text-violet-300 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Load sample"
                aria-label="Load sample template"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Samples</span>
              </motion.button>

              {/* Paste button */}
              <motion.button
                onClick={pasteFromClipboard}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-mono text-white/40 border border-white/[0.06] bg-white/[0.02] hover:text-violet-300 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Paste from clipboard"
                aria-label="Paste from clipboard"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Paste</span>
              </motion.button>

              {/* Clear button */}
              <motion.button
                onClick={clearEditor}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-mono text-white/40 border border-white/[0.06] bg-white/[0.02] hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Clear editor"
                aria-label="Clear editor"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </motion.button>
            </div>

            {/* Template selector dropdown */}
            <AnimatePresence>
              {showTemplates && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-b border-white/[0.06]"
                >
                  <div className="flex flex-wrap gap-2 px-3 py-3 bg-white/[0.01]">
                    {SAMPLE_TEMPLATES.map((template) => {
                      const TemplateIcon = template.icon;
                      return (
                        <motion.button
                          key={template.id}
                          onClick={() => loadTemplate(template)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-violet-500/10 hover:border-violet-500/30 transition-all cursor-pointer"
                          whileHover={{ scale: 1.03, y: -1 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <TemplateIcon className="w-4 h-4 text-violet-400" />
                          <span className="text-xs font-mono text-white/60">{template.name}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Editor + Preview Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
            {/* ─── LEFT: Editor ─── */}
            <motion.div
              className={`lg:border-r border-white/[0.08] border-b lg:border-b-0 bg-black/20 ${mobileTab !== 'editor' ? 'hidden lg:block' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.06] bg-white/[0.01]">
                <Type className="w-3.5 h-3.5 text-white/30" />
                <span className="text-xs font-mono text-white/30">EDITOR</span>
                <div className="flex-1" />
                <motion.button
                  onClick={copyMarkdown}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                  whileTap={{ scale: 0.95 }}
                  aria-label="Copy markdown"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-violet-400" /> : <Copy className="w-3 h-3" />}
                  {copiedCode ? 'Copied!' : 'Copy MD'}
                </motion.button>
              </div>
              <textarea
                ref={textareaRef}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="w-full h-[400px] lg:h-[500px] bg-transparent text-white font-mono text-sm p-4 outline-none resize-none placeholder:text-white/15 custom-scrollbar leading-relaxed"
                placeholder="Start writing markdown here...&#10;&#10;Try loading a sample template to get started!"
                spellCheck={false}
                aria-label="Markdown editor"
              />
              {/* Mobile stats bar */}
              <div className="flex items-center gap-3 px-4 py-2 border-t border-white/[0.06] text-[10px] font-mono text-white/25 lg:hidden">
                <span>{stats.chars} chars</span>
                <span>{stats.lines} lines</span>
                <span>{stats.words} words</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {stats.readingTime} min
                </span>
              </div>
            </motion.div>

            {/* ─── RIGHT: Preview ─── */}
            <motion.div
              className={`bg-black/30 ${mobileTab !== 'preview' ? 'hidden lg:block' : ''}`}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.06] bg-white/[0.01]">
                <Eye className="w-3.5 h-3.5 text-white/30" />
                <span className="text-xs font-mono text-white/30">PREVIEW</span>
                <div className="flex-1" />
                <motion.button
                  onClick={copyHtml}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                  whileTap={{ scale: 0.95 }}
                  aria-label="Copy HTML"
                >
                  {copiedHtml ? <Check className="w-3 h-3 text-violet-400" /> : <Copy className="w-3 h-3" />}
                  {copiedHtml ? 'Copied!' : 'Copy HTML'}
                </motion.button>
                <motion.button
                  onClick={exportHtml}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                  whileTap={{ scale: 0.95 }}
                  aria-label="Export as HTML"
                >
                  <Download className="w-3 h-3" />
                  Export
                </motion.button>
              </div>
              <div className="h-[400px] lg:h-[500px] overflow-y-auto custom-scrollbar p-4 md:p-6">
                {markdown.trim() ? (
                  <div
                    className="markdown-preview"
                    dangerouslySetInnerHTML={{ __html: htmlOutput }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="text-white/10 text-6xl mb-4 font-mono">#</div>
                    <p className="text-sm font-mono text-white/20">
                      Start typing to see the live preview
                    </p>
                    <p className="text-xs font-mono text-white/10 mt-2">
                      or load a sample template from the toolbar
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Bottom border */}
          <div className="rounded-b-xl border border-t-0 border-white/[0.08] bg-white/[0.02] backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-4 text-[10px] font-mono text-white/25">
                <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{stats.chars} chars</span>
                <span>{stats.lines} lines</span>
                <span className="flex items-center gap-1"><Type className="w-3 h-3" />{stats.words} words</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{stats.readingTime} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-white/15">Auto-saved</span>
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400/60" />
              </div>
            </div>
          </div>
        </div>

        {/* Info bar */}
        <motion.div
          className="max-w-7xl mx-auto mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-mono text-white/25"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {[
            { icon: Type, text: 'Live Preview' },
            { icon: FileText, text: `${SAMPLE_TEMPLATES.length} Templates` },
            { icon: Copy, text: 'Copy / Export HTML' },
            { icon: Code2, text: 'GFM Support' },
          ].map((info, i) => (
            <div key={`md-info-${i}`} className="flex items-center gap-1.5">
              <info.icon className="w-3.5 h-3.5" />
              <span>{info.text}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ───────────── Markdown Preview Styles ───────────── */}
      <style jsx global>{`
        .markdown-preview {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
          line-height: 1.75;
        }
        .markdown-preview h1 {
          font-size: 1.8rem;
          font-weight: 700;
          color: #c084fc;
          margin: 1.5rem 0 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(139, 92, 246, 0.2);
        }
        .markdown-preview h2 {
          font-size: 1.45rem;
          font-weight: 600;
          color: #a78bfa;
          margin: 1.25rem 0 0.625rem;
          padding-bottom: 0.375rem;
          border-bottom: 1px solid rgba(139, 92, 246, 0.1);
        }
        .markdown-preview h3 {
          font-size: 1.2rem;
          font-weight: 600;
          color: #8b5cf6;
          margin: 1rem 0 0.5rem;
        }
        .markdown-preview h4 {
          font-size: 1.05rem;
          font-weight: 600;
          color: #a78bfa;
          margin: 0.875rem 0 0.4375rem;
        }
        .markdown-preview h5 {
          font-size: 0.95rem;
          font-weight: 600;
          color: #c084fc;
          margin: 0.75rem 0 0.375rem;
        }
        .markdown-preview h6 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #a78bfa;
          margin: 0.625rem 0 0.3125rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .markdown-preview p {
          margin: 0.5rem 0;
        }
        .markdown-preview strong {
          color: #ffffff;
          font-weight: 600;
        }
        .markdown-preview em {
          color: #c084fc;
        }
        .markdown-preview del {
          color: rgba(255, 255, 255, 0.35);
        }
        .markdown-preview a.md-link {
          color: #c084fc;
          text-decoration: none;
          border-bottom: 1px solid rgba(192, 132, 252, 0.3);
          transition: border-color 0.2s, color 0.2s;
        }
        .markdown-preview a.md-link:hover {
          border-color: #c084fc;
          color: #d8b4fe;
        }
        .markdown-preview .md-inline-code {
          background: rgba(139, 92, 246, 0.12);
          border: 1px solid rgba(139, 92, 246, 0.2);
          color: #c084fc;
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          font-size: 0.85em;
          font-family: 'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace;
        }
        .markdown-preview .md-code-block {
          background: #0a0a12;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          margin: 0.875rem 0;
          overflow: hidden;
        }
        .markdown-preview .md-code-header {
          background: rgba(255, 255, 255, 0.04);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding: 0.4rem 1rem;
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.3);
          font-family: 'SF Mono', 'Fira Code', monospace;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .markdown-preview .md-code-block pre {
          margin: 0;
          padding: 1rem;
          overflow-x: auto;
        }
        .markdown-preview .md-code-block code {
          font-family: 'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace;
          font-size: 0.8rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.7);
        }
        .markdown-preview .md-blockquote {
          border-left: 3px solid #10b981;
          margin: 0.875rem 0;
          padding: 0.625rem 1rem;
          background: rgba(16, 185, 129, 0.04);
          border-radius: 0 8px 8px 0;
          color: rgba(255, 255, 255, 0.65);
        }
        .markdown-preview .md-blockquote p {
          margin: 0.25rem 0;
        }
        .markdown-preview .md-ul {
          list-style: disc;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .markdown-preview .md-ol {
          list-style: decimal;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .markdown-preview .md-ul li,
        .markdown-preview .md-ol li {
          margin: 0.25rem 0;
          color: rgba(255, 255, 255, 0.75);
        }
        .markdown-preview .md-task-list {
          list-style: none;
          padding-left: 0.25rem;
          margin: 0.5rem 0;
        }
        .markdown-preview .md-task-item {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin: 0.375rem 0;
        }
        .markdown-preview .md-task-item input[type="checkbox"] {
          appearance: none;
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          min-width: 16px;
          border: 2px solid rgba(139, 92, 246, 0.4);
          border-radius: 4px;
          background: transparent;
          margin-top: 4px;
          cursor: default;
          position: relative;
          transition: all 0.2s;
        }
        .markdown-preview .md-task-item input[type="checkbox"]:checked {
          background: rgba(139, 92, 246, 0.25);
          border-color: #8b5cf6;
        }
        .markdown-preview .md-task-item input[type="checkbox"]:checked::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #c084fc;
          font-size: 10px;
          font-weight: bold;
        }
        .markdown-preview .md-hr {
          border: none;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.25), transparent);
          margin: 1.5rem 0;
        }
        .markdown-preview .md-img {
          max-width: 100%;
          border-radius: 8px;
          margin: 0.5rem 0;
        }
        .markdown-preview .md-table-wrap {
          overflow-x: auto;
          margin: 0.875rem 0;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .markdown-preview .md-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.82rem;
        }
        .markdown-preview .md-table th {
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 0.5rem 0.75rem;
          text-align: left;
          font-weight: 600;
          color: #c084fc;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .markdown-preview .md-table td {
          border: 1px solid rgba(255, 255, 255, 0.04);
          padding: 0.4375rem 0.75rem;
          color: rgba(255, 255, 255, 0.65);
        }
        .markdown-preview .md-table tbody tr:nth-child(even) {
          background: rgba(139, 92, 246, 0.03);
        }
        .markdown-preview .md-table tbody tr:hover {
          background: rgba(139, 92, 246, 0.06);
        }

        /* Syntax highlighting classes (matching globals.css) */
        .markdown-preview .syn-keyword { color: #ff79c6; }
        .markdown-preview .syn-string { color: #f1fa8c; }
        .markdown-preview .syn-function { color: #50fa7b; }
        .markdown-preview .syn-comment { color: #6272a4; font-style: italic; }
        .markdown-preview .syn-number { color: #bd93f9; }
      `}</style>
    </section>
  );
}
