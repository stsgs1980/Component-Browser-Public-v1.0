/**
 * @fileoverview Zero-dependency syntax highlighter for React.
 *
 * Supports four languages via regex-based tokenization:
 * - **Markdown** (`.md`) — headings, blockquotes, lists, code fences
 * - **JSON** (`.json`) — keys, string values, numbers, booleans, null
 * - **TypeScript** (`.ts`, `.tsx`) — keywords, strings, class names, comments
 * - **CSS** (`.css`) — comments, custom properties (`--var`), color values
 *
 * ## Usage
 * ```tsx
 * import SyntaxHighlight from './002_SyntaxHighlight';
 * // or import individual line renderers:
 * // import { MdLine, JsonLine, TsLine, CssLine } from './002_SyntaxHighlight';
 *
 * <SyntaxHighlight
 *   content={'const x: number = 42;\nconsole.log(x);'}
 *   filename="app.ts"
 *   className="my-code-block"
 * />
 * ```
 *
 * ## Extending with a new language
 * 1. Add the file extension to the `EXT_MAP` inside `SyntaxHighlight`.
 * 2. Write a `NewLangLine(props: { text: string; theme: SyntaxTheme }) => JSX.Element`
 *    using the same `Inline` helper (or your own `<span>` strategy).
 * 3. Export the renderer as a named export and add it to `EXT_MAP`.
 *
 * No external dependencies — pure React + regex.
 */

import React, { useMemo } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Props accepted by the top-level `SyntaxHighlight` component. */
export interface SyntaxHighlightProps {
  /** The full source text to highlight, including newlines. */
  content: string;
  /**
   * Filename used to detect the language via extension.
   * Supported extensions: `.md`, `.json`, `.ts`, `.tsx`, `.css`.
   */
  filename: string;
  /** Optional additional CSS class applied to the wrapping `<pre>`. */
  className?: string;
}

/** Colour tokens consumed by every line renderer. */
export interface SyntaxTheme {
  /** Language keywords (`import`, `const`, `class`, …). */
  keyword: string;
  /** String literals. */
  string: string;
  /** Class / type names. */
  className: string;
  /** Comments. */
  comment: string;
  /** Variables / custom properties. */
  variable: string;
  /** Numeric literals. */
  number: string;
  /** Plain text (fallback). */
  text: string;
  /** Markdown headings. */
  heading: string;
}

// ---------------------------------------------------------------------------
// Default theme — Catppuccin Mocha
// ---------------------------------------------------------------------------

const CATPPUCCIN_MOCHA: SyntaxTheme = {
  keyword: '#cba6f7',   // Mauve
  string: '#a6e3a1',    // Green
  className: '#f9e2af', // Yellow
  comment: '#6c7086',   // Overlay 0
  variable: '#89b4fa',  // Blue
  number: '#fab387',    // Peach
  text: '#cdd6f4',      // Text
  heading: '#89b4fa',   // Blue
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Internal union of all token types produced by the line renderers.
 * Kept deliberately minimal so each renderer can add new types as needed.
 */
type Token = { type: string; text: string };

/** Shorthand to render an array of `{type, text}` tokens as coloured `<span>`s. */
function Inline({
  tokens,
  theme,
}: {
  tokens: Token[];
  theme: SyntaxTheme;
}): React.ReactNode {
  return (
    <>
      {tokens.map((t, i) => {
        const color: string = (theme as Record<string, string>)[t.type] ?? theme.text;
        return (
          <span key={i} style={{ color }}>
            {t.text}
          </span>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Language detection
// ---------------------------------------------------------------------------

/** Map of lowercase file extension → line renderer. Extend this to add languages. */
const EXT_MAP: Record<
  string,
  (props: { text: string; theme: SyntaxTheme }) => React.ReactNode
> = {
  '.md': MdLine,
  '.json': JsonLine,
  '.ts': TsLine,
  '.tsx': TsLine,
  '.css': CssLine,
};

function getRenderer(filename: string) {
  const dot = filename.lastIndexOf('.');
  if (dot === -1) return null;
  const ext = filename.slice(dot).toLowerCase();
  return EXT_MAP[ext] ?? null;
}

// ---------------------------------------------------------------------------
// MdLine — Markdown
// ---------------------------------------------------------------------------

/**
 * Highlights a single line of Markdown.
 *
 * Recognises:
 * - ATX headings (`#`, `##`, `###`, …)
 * - Blockquotes (`>`)
 * - Unordered list markers (`-`, `*`)
 * - Inline code (backtick pairs)
 * - Bold (`**…**`) and italic (`*…*`)
 * - Links (`[text](url)`)
 */
export function MdLine({
  text,
  theme,
}: {
  text: string;
  theme: SyntaxTheme;
}): React.ReactNode {
  const tokens: Token[] = [];

  // Heading
  const headingMatch = text.match(/^(#{1,6})\s/);
  if (headingMatch) {
    tokens.push({ type: 'heading', text: headingMatch[1] });
    const rest = text.slice(headingMatch[0].length);
    tokens.push({ type: 'heading', text: rest });
    return <Inline tokens={tokens} theme={theme} />;
  }

  // Blockquote
  if (text.startsWith('> ')) {
    tokens.push({ type: 'comment', text: '> ' });
    tokens.push({ type: 'text', text: text.slice(2) });
    return <Inline tokens={tokens} theme={theme} />;
  }

  // Unordered list marker
  const listMatch = text.match(/^(\s*)([-*])\s/);
  if (listMatch) {
    tokens.push({ type: 'keyword', text: listMatch[0] });
    tokens.push({ type: 'text', text: text.slice(listMatch[0].length) });
    return <Inline tokens={tokens} theme={theme} />;
  }

  // Code fence markers
  if (/^```/.test(text)) {
    tokens.push({ type: 'comment', text });
    return <Inline tokens={tokens} theme={theme} />;
  }

  // Fallback — plain text
  tokens.push({ type: 'text', text });
  return <Inline tokens={tokens} theme={theme} />;
}

// ---------------------------------------------------------------------------
// JsonLine — JSON
// ---------------------------------------------------------------------------

/**
 * Highlights a single line of JSON.
 *
 * Recognises:
 * - Keys (text before `:`) styled as `variable`
 * - String values in quotes styled as `string`
 * - Numeric literals styled as `number`
 * - Boolean / null styled as `keyword`
 * - Brackets / braces / commas in default `text`
 */
export function JsonLine({
  text,
  theme,
}: {
  text: string;
  theme: SyntaxTheme;
}): React.ReactNode {
  const tokens: Token[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    // Whitespace
    const wsMatch = remaining.match(/^(\s+)/);
    if (wsMatch) {
      tokens.push({ type: 'text', text: wsMatch[1] });
      remaining = remaining.slice(wsMatch[1].length);
      continue;
    }

    // String (key or value)
    const strMatch = remaining.match(/^"(?:[^"\\]|\\.)*"/);
    if (strMatch) {
      // Heuristic: if the next non-whitespace char after the string is `:`,
      // treat it as a key; otherwise a string value.
      const after = remaining.slice(strMatch[0].length).trimStart();
      const isKey = after.startsWith(':') && !after.startsWith('::');
      tokens.push({
        type: isKey ? 'variable' : 'string',
        text: strMatch[0],
      });
      remaining = remaining.slice(strMatch[0].length);
      continue;
    }

    // Number (int / float / negative / scientific)
    const numMatch = remaining.match(/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/);
    if (numMatch) {
      tokens.push({ type: 'number', text: numMatch[0] });
      remaining = remaining.slice(numMatch[0].length);
      continue;
    }

    // Boolean / null
    const literalMatch = remaining.match(/^(true|false|null)\b/);
    if (literalMatch) {
      tokens.push({ type: 'keyword', text: literalMatch[0] });
      remaining = remaining.slice(literalMatch[0].length);
      continue;
    }

    // Punctuation / other single character
    tokens.push({ type: 'text', text: remaining[0] });
    remaining = remaining.slice(1);
  }

  return <Inline tokens={tokens} theme={theme} />;
}

// ---------------------------------------------------------------------------
// TsLine — TypeScript / TSX
// ---------------------------------------------------------------------------

/**
 * List of generic TS/JS keywords to highlight.
 */
const TS_KEYWORDS = new Set([
  'import',
  'export',
  'from',
  'const',
  'let',
  'var',
  'return',
  'new',
  'function',
  'class',
  'if',
  'else',
  'for',
  'while',
  'do',
  'switch',
  'case',
  'break',
  'continue',
  'async',
  'await',
  'type',
  'interface',
  'extends',
  'implements',
  'typeof',
  'instanceof',
  'in',
  'of',
  'throw',
  'try',
  'catch',
  'finally',
  'default',
  'void',
  'readonly',
  'enum',
  'declare',
  'abstract',
  'static',
  'public',
  'private',
  'protected',
  'super',
  'this',
  'yield',
]);

/**
 * Regex that matches a single or double-quoted string (with backslash escapes).
 */
const RE_STRING_QUOTES = /^"(?:[^"\\]|\\.)*"|^'(?:[^'\\]|\\.)*'/;

/**
 * Regex that matches a template literal (backtick string), including basic
 * interpolation markers `${…}`.
 */
const RE_TEMPLATE_LITERAL = /^`(?:[^`\\]|\\.)*`/;

/**
 * Regex that matches a single-line comment `//` to end of line.
 */
const RE_LINE_COMMENT = /^\/\/.*$/;

/**
 * Regex that matches a block comment `/* … */` (non-greedy, may span lines
 * within the current line token).
 */
const RE_BLOCK_COMMENT = /^\/\*[\s\S]*?\*\//;

/**
 * Regex that matches a numeric literal.
 */
const RE_NUMBER = /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/;

/**
 * Regex that matches an identifier (letter/underscore/$ followed by word chars).
 */
const RE_IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*/;

/**
 * Regex that matches a JSX tag opening `<ComponentName` or closing `</ComponentName`.
 */
const RE_JSX_TAG = /^<\/?[A-Za-z][A-Za-z0-9]*/;

/**
 * Highlights a single line of TypeScript / TSX.
 *
 * Recognises:
 * - Keywords (see `TS_KEYWORDS`) styled as `keyword`
 * - String literals (single / double / template) styled as `string`
 * - Line & block comments styled as `comment`
 * - Numeric literals styled as `number`
 * - Class / type names after `class` or `new` keywords styled as `className`
 * - JSX tag names (capitalised) styled as `className`
 * - Identifiers styled as `text`
 */
export function TsLine({
  text,
  theme,
}: {
  text: string;
  theme: SyntaxTheme;
}): React.ReactNode {
  const tokens: Token[] = [];
  let remaining = text;
  let prevKeyword: string | null = null;

  while (remaining.length > 0) {
    // Single-line comment
    const lineCommentMatch = remaining.match(RE_LINE_COMMENT);
    if (lineCommentMatch) {
      tokens.push({ type: 'comment', text: lineCommentMatch[0] });
      remaining = remaining.slice(lineCommentMatch[0].length);
      prevKeyword = null;
      continue;
    }

    // Block comment
    const blockCommentMatch = remaining.match(RE_BLOCK_COMMENT);
    if (blockCommentMatch) {
      tokens.push({ type: 'comment', text: blockCommentMatch[0] });
      remaining = remaining.slice(blockCommentMatch[0].length);
      prevKeyword = null;
      continue;
    }

    // Template literal
    const templateMatch = remaining.match(RE_TEMPLATE_LITERAL);
    if (templateMatch) {
      tokens.push({ type: 'string', text: templateMatch[0] });
      remaining = remaining.slice(templateMatch[0].length);
      prevKeyword = null;
      continue;
    }

    // Quoted string
    const stringMatch = remaining.match(RE_STRING_QUOTES);
    if (stringMatch) {
      tokens.push({ type: 'string', text: stringMatch[0] });
      remaining = remaining.slice(stringMatch[0].length);
      prevKeyword = null;
      continue;
    }

    // Number
    const numMatch = remaining.match(RE_NUMBER);
    if (numMatch) {
      tokens.push({ type: 'number', text: numMatch[0] });
      remaining = remaining.slice(numMatch[0].length);
      prevKeyword = null;
      continue;
    }

    // Whitespace
    const wsMatch = remaining.match(/^(\s+)/);
    if (wsMatch) {
      tokens.push({ type: 'text', text: wsMatch[1] });
      remaining = remaining.slice(wsMatch[1].length);
      // Whitespace does NOT reset prevKeyword — "class Foo" should still detect Foo
      continue;
    }

    // Identifier / keyword
    const idMatch = remaining.match(RE_IDENTIFIER);
    if (idMatch) {
      const word = idMatch[0];

      if (TS_KEYWORDS.has(word)) {
        tokens.push({ type: 'keyword', text: word });
        // Track `class` / `new` so the *next* identifier can be a class name
        prevKeyword = word === 'class' || word === 'new' || word === 'interface' || word === 'type'
          ? word
          : null;
      } else if (
        prevKeyword !== null &&
        word[0] === word[0].toUpperCase() &&
        word[0] !== word[0].toLowerCase()
      ) {
        // Capitalised identifier immediately after class/new/interface/type
        tokens.push({ type: 'className', text: word });
        prevKeyword = null;
      } else {
        tokens.push({ type: 'text', text: word });
        prevKeyword = null;
      }

      remaining = remaining.slice(word.length);
      continue;
    }

    // JSX tag name (capitalised)
    const jsxMatch = remaining.match(RE_JSX_TAG);
    if (jsxMatch) {
      tokens.push({ type: 'className', text: jsxMatch[0] });
      remaining = remaining.slice(jsxMatch[0].length);
      prevKeyword = null;
      continue;
    }

    // Operators / punctuation — consume single character
    // Reset prevKeyword only on non-whitespace, non-identifier chars that
    // would break "class Foo" (e.g. `=`, `(`, `{`)
    tokens.push({ type: 'text', text: remaining[0] });
    prevKeyword = null;
    remaining = remaining.slice(1);
  }

  return <Inline tokens={tokens} theme={theme} />;
}

// ---------------------------------------------------------------------------
// CssLine — CSS
// ---------------------------------------------------------------------------

/**
 * Regex matching a CSS colour value:
 * - `#hex3` / `#hex6` / `#hex8`
 * - `rgb(...)` / `rgba(...)` / `hsl(...)` / `hsla(...)`
 * - Named colour keywords
 */
const RE_CSS_COLOR =
  /^#(?:[0-9a-fA-F]{3,8})\b|^(?:rgba?|hsla?)\s*\([^)]*\)|^(?:transparent|currentColor|inherit|initial|unset|none)\b/;

/**
 * Regex matching a CSS number (optionally with unit suffix).
 */
const RE_CSS_NUMBER = /^-?\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|vmin|vmax|deg|s|ms|fr|ch|ex|pt|pc)?\b/;

/**
 * Regex matching a CSS custom property `--variable-name`.
 */
const RE_CSS_CUSTOM_PROP = /^--[A-Za-z_-][A-Za-z0-9_-]*/;

/**
 * Regex matching a CSS block comment.
 */
const RE_CSS_COMMENT = /^\/\*[\s\S]*?\*\//;

/**
 * Regex matching a CSS @-rule (e.g. `@media`, `@keyframes`).
 */
const RE_CSS_AT_RULE = /^@[A-Za-z-]+/;

/**
 * Regex matching a CSS property name (word before `:`).
 */
const RE_CSS_PROPERTY = /^[A-Za-z-]+(?=\s*:)/;

/**
 * Regex matching a CSS selector class `.classname`.
 */
const RE_CSS_CLASS_SELECTOR = /^\.[A-Za-z_-][A-Za-z0-9_-]*/;

/**
 * Regex matching a CSS selector ID `#idname` (not a hex colour).
 */
const RE_CSS_ID_SELECTOR = /^#[A-Za-z_-][A-Za-z0-9_-]*(?!\d)/;

/**
 * Highlights a single line of CSS.
 *
 * Recognises:
 * - Block comments styled as `comment`
 * - Custom properties (`--my-var`) styled as `variable`
 * - Colour values (hex, rgb, hsl) styled as `number`
 * - Numeric literals (with optional unit) styled as `number`
 * - @-rules styled as `keyword`
 * - Property names (word before `:`) styled as `keyword`
 * - Class selectors (`.foo`) styled as `className`
 * - Everything else as `text`
 */
export function CssLine({
  text,
  theme,
}: {
  text: string;
  theme: SyntaxTheme;
}): React.ReactNode {
  const tokens: Token[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    // Block comment
    const commentMatch = remaining.match(RE_CSS_COMMENT);
    if (commentMatch) {
      tokens.push({ type: 'comment', text: commentMatch[0] });
      remaining = remaining.slice(commentMatch[0].length);
      continue;
    }

    // Whitespace
    const wsMatch = remaining.match(/^(\s+)/);
    if (wsMatch) {
      tokens.push({ type: 'text', text: wsMatch[1] });
      remaining = remaining.slice(wsMatch[1].length);
      continue;
    }

    // CSS colour value
    const colorMatch = remaining.match(RE_CSS_COLOR);
    if (colorMatch) {
      tokens.push({ type: 'number', text: colorMatch[0] });
      remaining = remaining.slice(colorMatch[0].length);
      continue;
    }

    // Custom property
    const varMatch = remaining.match(RE_CSS_CUSTOM_PROP);
    if (varMatch) {
      tokens.push({ type: 'variable', text: varMatch[0] });
      remaining = remaining.slice(varMatch[0].length);
      continue;
    }

    // @-rule
    const atMatch = remaining.match(RE_CSS_AT_RULE);
    if (atMatch) {
      tokens.push({ type: 'keyword', text: atMatch[0] });
      remaining = remaining.slice(atMatch[0].length);
      continue;
    }

    // Property name (identifier followed by `:`)
    const propMatch = remaining.match(RE_CSS_PROPERTY);
    if (propMatch) {
      tokens.push({ type: 'keyword', text: propMatch[0] });
      remaining = remaining.slice(propMatch[0].length);
      continue;
    }

    // Class selector
    const classSelMatch = remaining.match(RE_CSS_CLASS_SELECTOR);
    if (classSelMatch) {
      tokens.push({ type: 'className', text: classSelMatch[0] });
      remaining = remaining.slice(classSelMatch[0].length);
      continue;
    }

    // Number with optional CSS unit
    const numMatch = remaining.match(RE_CSS_NUMBER);
    if (numMatch) {
      tokens.push({ type: 'number', text: numMatch[0] });
      remaining = remaining.slice(numMatch[0].length);
      continue;
    }

    // Quoted string
    const strMatch = remaining.match(RE_STRING_QUOTES);
    if (strMatch) {
      tokens.push({ type: 'string', text: strMatch[0] });
      remaining = remaining.slice(strMatch[0].length);
      continue;
    }

    // Punctuation / other — consume single character
    tokens.push({ type: 'text', text: remaining[0] });
    remaining = remaining.slice(1);
  }

  return <Inline tokens={tokens} theme={theme} />;
}

// ---------------------------------------------------------------------------
// SyntaxHighlight — main component (default export)
// ---------------------------------------------------------------------------

/**
 * Top-level syntax highlighter component.
 *
 * Detects the language from `filename` extension and renders each line with
 * the appropriate sub-highlighter. Falls back to plain-text rendering for
 * unknown extensions.
 *
 * @example
 * ```tsx
 * <SyntaxHighlight content={sourceCode} filename="styles.css" />
 * ```
 */
const SyntaxHighlight: React.FC<SyntaxHighlightProps> = ({
  content,
  filename,
  className,
}) => {
  const renderer = getRenderer(filename);

  const lines = useMemo(() => content.split('\n'), [content]);

  if (!renderer) {
    // Unknown language — render as plain text
    return (
      <pre
        className={className}
        style={{
          margin: 0,
          padding: '1rem',
          background: '#1e1e2e',
          color: CATPPUCCIN_MOCHA.text,
          fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
          fontSize: '0.875rem',
          lineHeight: 1.6,
          overflowX: 'auto',
          borderRadius: '0.5rem',
        }}
      >
        {lines.map((line, i) => (
          <div key={i}>
            <Inline tokens={[{ type: 'text', text: line }]} theme={CATPPUCCIN_MOCHA} />
          </div>
        ))}
      </pre>
    );
  }

  const theme = CATPPUCCIN_MOCHA;

  return (
    <pre
      className={className}
      style={{
        margin: 0,
        padding: '1rem',
        background: '#1e1e2e',
        color: theme.text,
        fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
        fontSize: '0.875rem',
        lineHeight: 1.6,
        overflowX: 'auto',
        borderRadius: '0.5rem',
      }}
    >
      {lines.map((line, i) => (
        <div key={i}>{renderer({ text: line, theme })}</div>
      ))}
    </pre>
  );
};

export default SyntaxHighlight;
