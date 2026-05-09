import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// ─── Code Transformation ─────────────────────────────────────────

/**
 * Remove import statements that reference local/relative paths or common broken patterns.
 * Returns the transformed code and the list of removed import sources.
 */
function transformComponentCode(source: string): { code: string; removedImports: string[]; componentName: string } {
  const removedImports: string[] = [];
  let componentName = '';

  // Try to extract the component name
  const defaultExportFn = source.match(/export\s+default\s+function\s+(\w+)/);
  const defaultExportConst = source.match(/export\s+default\s+(\w+)/);
  const namedExportFn = source.match(/export\s+function\s+(\w+)/);
  const namedExportConst = source.match(/(?:export\s+(?:const|function)\s+(\w+)(?!\s*\()|export\s+const\s+(\w+)\s*=\s*(?:\([^)]*\)|\w+)\s*=>)/);

  if (defaultExportFn) componentName = defaultExportFn[1];
  else if (defaultExportConst) componentName = defaultExportConst[1];
  else if (namedExportFn) componentName = namedExportFn[1];
  else if (namedExportConst) componentName = namedExportConst[2] || namedExportConst[1];

  // Process lines to remove/transform imports
  const lines = source.split('\n');
  const transformed: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty 'use client' / 'use server' directives
    if (trimmed === "'use client'" || trimmed === '"use client"' || trimmed === "'use server'" || trimmed === '"use server"') {
      continue;
    }

    // Check if this is an import line
    if (trimmed.startsWith('import ')) {
      // Extract the module path
      const fromMatch = trimmed.match(/from\s+['"]([^'"]+)['"]/);
      const modulePath = fromMatch ? fromMatch[1] : '';

      // Skip local/relative imports (starting with ., @/, ~/)
      if (
        modulePath.startsWith('.') ||
        modulePath.startsWith('@/') ||
        modulePath.startsWith('~/') ||
        modulePath.startsWith('../')
      ) {
        // Check for common broken import patterns
        if (
          modulePath.includes('store') ||
          modulePath.includes('hooks/') ||
          modulePath.includes('utils/') ||
          modulePath.includes('lib/') ||
          modulePath.includes('components/ui/') ||
          modulePath.includes('@components/')
        ) {
          removedImports.push(modulePath);
          continue;
        }
        // Other relative imports - still remove
        removedImports.push(modulePath);
        continue;
      }

      // Handle lucide-react imports — replace with stub
      if (modulePath === 'lucide-react') {
        const namedImports = trimmed.match(/import\s*\{([^}]+)\}/);
        if (namedImports) {
          const icons = namedImports[1].split(',').map((s) => s.trim()).filter(Boolean);
          const stubLines = icons.map(
            (icon) =>
              `const ${icon} = (props) => React.createElement('svg', { ...props, width: props.size || 24, height: props.size || 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' });`
          );
          transformed.push(...stubLines);
        }
        continue;
      }

      // Handle clsx / tailwind-merge imports — already polyfilled
      if (modulePath === 'clsx' || modulePath === 'tailwind-merge') {
        continue;
      }

      // Handle framer-motion — stub with passthrough
      if (modulePath === 'framer-motion' || modulePath.startsWith('framer-motion/')) {
        const namedImports = trimmed.match(/import\s*\{([^}]+)\}/);
        if (namedImports) {
          const items = namedImports[1].split(',').map((s) => s.trim()).filter(Boolean);
          const stubLines = items.map(
            (item) => {
              const aliased = item.match(/(\w+)\s+as\s+(\w+)/);
              const name = aliased ? aliased[2] : item;
              // motion.div etc should just pass through
              if (item.startsWith('motion')) {
                return `const ${name} = 'div';`;
              }
              return `const ${name} = ({ children, ...props }) => React.createElement('div', props, children);`;
            }
          );
          transformed.push(...stubLines);
        }
        removedImports.push(modulePath);
        continue;
      }

      // Handle class-variance-authority — stub
      if (modulePath === 'class-variance-authority' || modulePath === 'cva') {
        transformed.push('const cva = (...args) => args.join(" ");');
        continue;
      }

      // Handle @radix-ui/* — stub components
      if (modulePath.startsWith('@radix-ui/')) {
        const namedImports = trimmed.match(/import\s*\{([^}]+)\}/);
        if (namedImports) {
          const items = namedImports[1].split(',').map((s) => s.trim()).filter(Boolean);
          const stubLines = items.map((item) => {
            const aliased = item.match(/(\w+)\s+as\s+(\w+)/);
            const name = aliased ? aliased[2] : item;
            return `const ${name} = ({ children, ...props }) => React.createElement('div', props, children);`;
          });
          transformed.push(...stubLines);
        }
        removedImports.push(modulePath);
        continue;
      }

      // Handle zustand — stub
      if (modulePath === 'zustand') {
        const defaultImport = trimmed.match(/import\s+(\w+)\s+from/);
        if (defaultImport) {
          transformed.push(`const ${defaultImport[1]} = (fn) => fn(() => ({}));`);
        }
        removedImports.push(modulePath);
        continue;
      }

      // Handle next-themes — stub
      if (modulePath === 'next-themes') {
        const namedImports = trimmed.match(/import\s*\{([^}]+)\}/);
        if (namedImports) {
          const items = namedImports[1].split(',').map((s) => s.trim()).filter(Boolean);
          const stubLines = items.map((item) => {
            const aliased = item.match(/(\w+)\s+as\s+(\w+)/);
            const name = aliased ? aliased[2] : item;
            return `const ${name} = { theme: 'light', setTheme: () => {}, resolvedTheme: 'light' };`;
          });
          transformed.push(...stubLines);
        }
        removedImports.push(modulePath);
        continue;
      }

      // Keep react / react-dom imports as-is
      if (modulePath === 'react' || modulePath === 'react-dom' || modulePath === 'react/jsx-runtime') {
        // Remove these imports since we load React globally in the preview
        continue;
      }

      // Unknown imports — stub them
      const namedImports = trimmed.match(/import\s*\{([^}]+)\}/);
      const defaultImport = trimmed.match(/import\s+(\w+)\s+from/);
      if (namedImports) {
        const items = namedImports[1].split(',').map((s) => s.trim()).filter(Boolean);
        const stubLines = items.map((item) => {
          const aliased = item.match(/(\w+)\s+as\s+(\w+)/);
          const name = aliased ? aliased[2] : item;
          return `const ${name} = () => null;`;
        });
        transformed.push(...stubLines);
      } else if (defaultImport) {
        transformed.push(`const ${defaultImport[1]} = () => null;`);
      }
      removedImports.push(modulePath);
      continue;
    }

    transformed.push(line);
  }

  // If no component name was found, try harder with the full code
  if (!componentName) {
    const allExports = transformed.join('\n').match(/(?:export\s+(?:default\s+)?)?(?:function|const)\s+(\w+)/g);
    if (allExports && allExports.length > 0) {
      const lastMatch = allExports[allExports.length - 1];
      const nameMatch = lastMatch.match(/(\w+)$/);
      if (nameMatch) componentName = nameMatch[1];
    }
  }

  return {
    code: transformed.join('\n'),
    removedImports,
    componentName,
  };
}

// ─── Generate HTML ─────────────────────────────────────────────────

function generatePreviewHtml(source: string, filePath: string): string {
  const { code, removedImports, componentName } = transformComponentCode(source);

  // Extract file name for title
  const fileName = filePath.split('/').pop() || 'Component';
  const title = componentName || fileName.replace(/\.\w+$/, '');

  // Build warning message for removed imports
  const warnings = removedImports.length > 0
    ? `// ⚠️ ${removedImports.length} import(s) removed: ${removedImports.slice(0, 5).join(', ')}${removedImports.length > 5 ? ` +${removedImports.length - 5} more` : ''}\n`
    : '';

  // Build the render call
  const renderCall = componentName
    ? `const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(React.createElement(${componentName}, {}));`
    : `document.getElementById('root').innerHTML = '<div class="info">Could not detect component export name.<br/>Source:<br/><pre style="text-align:left;font-size:11px;max-height:200px;overflow:auto;background:#f3f4f6;padding:8px;border-radius:4px;">' + ${JSON.stringify(code.replace(/</g, '&lt;').replace(/>/g, '&gt;').substring(0, 2000))} + '</pre></div>';`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 16px;
      background: #f9fafb;
      min-height: 100vh;
    }
    .preview-error {
      color: #dc2626;
      background: #fef2f2;
      border: 1px solid #fecaca;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
      font-size: 13px;
      white-space: pre-wrap;
      word-break: break-word;
      max-width: 100%;
      overflow: auto;
    }
    .preview-info {
      color: #6b7280;
      text-align: center;
      padding: 40px 20px;
      font-size: 14px;
      line-height: 1.6;
    }
    .preview-warning {
      color: #92400e;
      background: #fffbeb;
      border: 1px solid #fde68a;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      margin-bottom: 12px;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
    }
    #root {
      min-height: 50px;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="typescript,react">
    // Polyfills
    const cn = (...args) => args.filter(Boolean).join(' ');
    const clsx = cn;
    const twMerge = cn;

    ${warnings}

    // ─── Transformed Component Code ───
    ${code.replace(/<\/script>/g, '<\\/script>')}

    // ─── Render ───
    try {
      ${renderCall}
    } catch(e) {
      console.error('Render error:', e);
      document.getElementById('root').innerHTML =
        '<div class="preview-error"><strong>Render Error</strong>\\n\\n' +
        e.message + '\\n\\n' +
        (e.stack ? e.stack.split('\\n').slice(0, 5).join('\\n') : '') +
        '</div>';
    }
  </script>
</body>
</html>`;
}

// ─── Route Handler ─────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const filePath = pathSegments.join('/');

    if (!filePath) {
      return NextResponse.json(
        { error: 'path parameter is required' },
        { status: 400 }
      );
    }

    const fullPath = path.join(
      process.cwd(),
      'download',
      'reusable_components',
      filePath
    );

    // Security check — prevent path traversal
    const componentsDir = path.join(
      process.cwd(),
      'download',
      'reusable_components'
    );
    const resolvedFullPath = path.resolve(fullPath);
    const resolvedComponentsDir = path.resolve(componentsDir);
    if (!resolvedFullPath.startsWith(resolvedComponentsDir)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Only process .tsx and .ts files
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) {
      return NextResponse.json(
        { error: 'Only .tsx and .ts files are supported' },
        { status: 400 }
      );
    }

    const source = fs.readFileSync(fullPath, 'utf-8');
    const html = generatePreviewHtml(source, filePath);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate preview';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
