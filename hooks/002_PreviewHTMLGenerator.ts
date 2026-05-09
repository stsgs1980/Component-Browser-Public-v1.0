// --- source: Code-Snippets-Gallery / preview-renderer.ts ---
// Factory functions that generate complete sandboxed HTML documents for
// 4 preview types: Canvas2D, WebGL, CSS, and Static content.
// De-hardcoded: removed PREVIEW_MAP (domain-specific CUID-keyed config),
// each generator now accepts its own config object.

// ============================================================
//  UTILITIES
// ============================================================

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// ============================================================
//  CANVAS 2D GENERATOR
// ============================================================

interface Canvas2DConfig {
  /** JS code defining init vars + `function render(ctx, w, h, time){}` */
  setupCode: string;
  /** Enable requestAnimationFrame loop */
  animate?: boolean;
  /** Canvas background color (default #0a0a0f) */
  background?: string;
}

export function generateCanvas2dHTML(config: Canvas2DConfig): string {
  const { setupCode, animate = true, background = '#0a0a0f' } = config;

  const loopCode = animate
    ? `let _animId;\nfunction _loop(t) {\n  render(ctx, canvas.width, canvas.height, t / 1000);\n  _animId = requestAnimationFrame(_loop);\n}\n_animId = requestAnimationFrame(_loop);`
    : `render(ctx, canvas.width, canvas.height, 0);`;

  return `<!DOCTYPE html><html><head>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:;"><style>
*{margin:0;padding:0}body{background:${escapeHtml(background)};overflow:hidden}
canvas{display:block;width:100%;height:100%}
</style></head><body>
<canvas id="c"></canvas>
<script>
var canvas = document.getElementById('c');
var ctx = canvas.getContext('2d');
function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resize(); window.addEventListener('resize', resize);
${setupCode}
${loopCode}
</script></body></html>`;
}

// ============================================================
//  WEBGL GENERATOR
// ============================================================

interface WebGLConfig {
  /** Fragment shader source code */
  fragShader: string;
  /** Optional custom vertex shader (default: fullscreen triangle strip) */
  vertexShader?: string;
  /** Background color when WebGL fails */
  fallbackColor?: string;
}

export function generateWebGLHTML(config: WebGLConfig): string {
  const { fragShader, vertexShader, fallbackColor = '#888' } = config;

  const vs = vertexShader || 'attribute vec2 a_position; void main(){ gl_Position = vec4(a_position, 0.0, 1.0); }';

  return `<!DOCTYPE html><html><head>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:;"><style>
*{margin:0;padding:0}body{overflow:hidden;background:#000}
canvas{display:block;width:100%;height:100%}
</style></head><body>
<canvas id="c"></canvas>
<script>
var canvas = document.getElementById('c');
var gl = canvas.getContext('webgl');
if (!gl) { document.body.innerHTML = '<p style="color:${escapeHtml(fallbackColor)};padding:20px;font-family:sans-serif">WebGL not supported</p>'; }
function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; if (gl) gl.viewport(0, 0, canvas.width, canvas.height); }
resize(); window.addEventListener('resize', resize);

var vs = ${JSON.stringify(vs)};
var fs = \`${fragShader}\`;

function compile(src, type) {
  var s = gl.createShader(type);
  gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); return null; }
  return s;
}
var prog = gl.createProgram();
gl.attachShader(prog, compile(vs, gl.VERTEX_SHADER));
gl.attachShader(prog, compile(fs, gl.FRAGMENT_SHADER));
gl.linkProgram(prog);
if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(prog)); }
gl.useProgram(prog);

var buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
var pos = gl.getAttribLocation(prog, 'a_position');
gl.enableVertexAttribArray(pos);
gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

var ut = gl.getUniformLocation(prog, 'u_time');
var ur = gl.getUniformLocation(prog, 'u_resolution');
function loop(t) {
  gl.uniform1f(ut, t / 1000);
  gl.uniform2f(ur, canvas.width, canvas.height);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
</script></body></html>`;
}

// ============================================================
//  CSS GENERATOR
// ============================================================

interface CSSConfig {
  /** Full CSS + trailing HTML elements (auto-splits at first <div> or <span>) */
  cssAndHtml: string;
}

export function generateCSSHTML(config: CSSConfig): string {
  const { cssAndHtml } = config;

  const htmlTagMatch = cssAndHtml.match(/(<div[\s>]|<span[\s>])/);
  let css = cssAndHtml;
  let html = '';
  if (htmlTagMatch) {
    const idx = cssAndHtml.indexOf(htmlTagMatch[1]);
    css = cssAndHtml.substring(0, idx);
    html = cssAndHtml.substring(idx);
  }

  return `<!DOCTYPE html><html><head>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:;"><style>${css}</style></head><body>${html}</body></html>`;
}

// ============================================================
//  STATIC CONTENT GENERATOR
// ============================================================

interface StaticConfig {
  /** Language/technology label */
  language: string;
  /** Display title */
  title: string;
  /** Short description */
  description?: string;
  /** Code preview (first N lines) */
  codePreview?: string;
  /** Maximum code lines to show (default 12) */
  maxLines?: number;
  /** Accent color (default #666) */
  accentColor?: string;
  /** Background color (default #0c0c14) */
  background?: string;
}

export function generateStaticHTML(config: StaticConfig): string {
  const {
    language, title, description = '', codePreview = '',
    maxLines = 12, accentColor = '#666', background = '#0c0c14',
  } = config;

  const codeLines = codePreview.split('\n').slice(0, maxLines).map(escapeHtml).join('\n');

  return `<!DOCTYPE html><html><head>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:;"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:${escapeHtml(background)};display:flex;align-items:center;justify-content:center;height:100vh;font-family:'Courier New',monospace;color:#e0e0e0;overflow:hidden}
.card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:28px;max-width:90%;max-height:90%;overflow:hidden}
.badge{display:inline-block;background:${escapeHtml(accentColor)}22;color:${escapeHtml(accentColor)};border:1px solid ${escapeHtml(accentColor)}44;border-radius:20px;padding:4px 14px;font-size:11px;margin-bottom:16px;letter-spacing:0.5px}
.title{font-size:20px;font-weight:700;margin-bottom:6px;color:#fff}
.desc{font-size:12px;color:#888;margin-bottom:16px;line-height:1.5}
.code{background:rgba(0,0,0,0.4);border-radius:8px;padding:14px;font-size:11px;line-height:1.7;overflow:hidden;max-height:200px;color:#aab;border-left:2px solid ${escapeHtml(accentColor)}66}
</style></head><body>
<div class="card">
  <div class="badge">${escapeHtml(language)}</div>
  <div class="title">${escapeHtml(title)}</div>
  ${description ? `<div class="desc">${escapeHtml(description)}</div>` : ''}
  ${codePreview ? `<pre class="code">${codeLines}</pre>` : ''}
</div>
</body></html>`;
}
