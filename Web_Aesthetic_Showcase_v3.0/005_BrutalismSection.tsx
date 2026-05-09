// Project: Web Aesthetic Showcase v3.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v3.0\src\components
// Lines: 859

'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Zap, Trash2, ExternalLink, Code, Bug } from 'lucide-react';

/* ────────────────────────────────────────────
   DATA
   ──────────────────────────────────────────── */

const CHAOS_EMOJIS = ['💀', '🔥', '⚡', '👾', '🤖', '💀', '⚠️', '🔧', '💥', '🔮', '👁️', '🐛', '🌐', '🧨', '☠️'];

const CHAOS_MESSAGES = [
  'ERROR: CSS_NOT_FOUND',
  'WARNING: border-radius is a lie',
  'SYNTAX ERROR at line ∞',
  'undefined is not a function()',
  'stack overflow: too much brutalism',
  'FATAL: aesthetics.exe has stopped',
  'HTTP 418: I AM A TEAPOT',
  'SEGFAULT in design.dll',
  'Cannot read property of null',
  'Unexpected token: <brutalism>',
];

const DESIGN_RULES = [
  ['Use rounded corners everywhere', 'No shadows or gradients', 'Always follow the grid'],
  ['Pick a color palette and stick to it', 'Use consistent spacing', 'Make everything symmetrical'],
  ['Add subtle hover animations', 'Use elegant typography', 'Keep whitespace generous'],
  ['Follow accessibility guidelines', 'Test on all browsers', 'Optimize for performance'],
];

const FAKE_LINKS = [
  { label: 'about.html', href: '/about.html', html: '<a href="/about.html">about.html</a>' },
  { label: 'contact.php', href: '/contact.php', html: '<a href="/contact.php">contact.php</a>' },
  { label: 'secret_page.htm', href: '/secret_page.htm', html: '<a href="/secret_page.htm">secret_page.htm</a>' },
  { label: 'old_website/index.html', href: '/old_website/index.html', html: '<a href="/old_website/index.html">old_website/index.html</a>' },
  { label: 'downloads/stuff.zip', href: '/downloads/stuff.zip', html: '<a href="/downloads/stuff.zip">downloads/stuff.zip</a>' },
  { label: 'guestbook.php', href: '/guestbook.php', html: '<a href="/guestbook.php">guestbook.php</a>' },
];

const BUTTON_STYLES = [
  { bg: '#ff0000', color: '#ffffff', border: '#000000' },
  { bg: '#000000', color: '#ffff00', border: '#ff0000' },
  { bg: '#ffff00', color: '#000000', border: '#ff0000' },
  { bg: '#00ff00', color: '#000000', border: '#000000' },
  { bg: '#ff00ff', color: '#ffffff', border: '#ffff00' },
  { bg: '#ffffff', color: '#ff0000', border: '#000000' },
  { bg: '#000000', color: '#00ff00', border: '#00ff00' },
  { bg: '#ff6600', color: '#ffffff', border: '#000000' },
  { bg: '#00ffff', color: '#000000', border: '#ff00ff' },
  { bg: '#333333', color: '#ff0000', border: '#ff0000' },
];

const RAW_HTML_SOURCE = `<html>
  <head>
    <title>brutalism.html</title>
    <style>
      * { border: 4px solid black; }
      body {
        background: white;
        font-family: Times New Roman;
        margin: 0;
        padding: 0;
      }
      h1 {
        font-size: 72px;
        border-bottom: 4px solid black;
      }
    </style>
  </head>
  <body>
    <h1>NO FRILLS</h1>
    <p>JUST RAW CONTENT</p>
    <a href="#">UNDERSTAND?</a>
    <table border="1">
      <tr>
        <td>NO</td>
        <td>CSS</td>
        <td>FRAMEWORK</td>
      </tr>
    </table>
  </body>
</html>`;

const RAW_CSS_CODE = `* {
  margin: 0 !important;
  padding: 0 !important;
  border: 4px solid black !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  font-family: Times New Roman !important;
  background: white !important;
  color: black !important;
}

a {
  color: blue;
  text-decoration: underline;
  cursor: pointer;
}

img {
  border: 4px solid black;
  display: block;
}`;

const RAW_HTML_IN_BOX = `<div style="border:4px solid black; padding:20px;">
  <h1>BREAK THE GRID</h1>
  <p>design is dead</p>
  <marquee>we dont care</marquee>
  <blink>ATTENTION</blink>
  <table border="1" cellpadding="8">
    <tr>
      <td>rule #1</td>
      <td>there are no rules</td>
    </tr>
    <tr>
      <td>rule #2</td>
      <td>see rule #1</td>
    </tr>
  </table>
</div>`;

/* ────────────────────────────────────────────
   TYPES
   ──────────────────────────────────────────── */

interface ChaosElement {
  id: number;
  type: 'rotated-text' | 'border-overlay' | 'emoji-splatter' | 'css-error';
  content: string;
  x: number;
  y: number;
  rotation: number;
  fontSize: number;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

/* ────────────────────────────────────────────
   COMPONENT
   ──────────────────────────────────────────── */

export default function BrutalismSection() {
  const [chaosCount, setChaosCount] = useState(0);
  const [chaosElements, setChaosElements] = useState<ChaosElement[]>([]);
  const [buttonStyle, setButtonStyle] = useState(BUTTON_STYLES[0]);
  const [buttonText, setButtonText] = useState('CLICK TO ADD CHAOS');
  const [hoveredLink, setHoveredLink] = useState<number | null>(null);
  const [shakingBox, setShakingBox] = useState<number | null>(null);
  const chaosContainerRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  const randomPick = useCallback(<T,>(arr: T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)];
  }, []);

  const randomBetween = useCallback((min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }, []);

  const addChaos = useCallback(() => {
    const type = randomPick<ChaosElement['type']>(['rotated-text', 'border-overlay', 'emoji-splatter', 'css-error']);
    const newEl: ChaosElement = {
      id: nextId.current++,
      type,
      content: '',
      x: randomBetween(5, 85),
      y: randomBetween(5, 85),
      rotation: randomBetween(-15, 15),
      fontSize: randomBetween(14, 48),
      bgColor: randomPick(['#ff0000', '#ffff00', '#00ff00', '#ff00ff', '#00ffff', '#ffffff', '#000000', '#ff6600']),
      borderColor: randomPick(['#000000', '#ff0000', '#ffff00', '#00ff00', '#0000ff', '#ff00ff']),
      textColor: randomPick(['#000000', '#ffffff', '#ff0000', '#ffff00', '#00ff00']),
    };

    switch (type) {
      case 'rotated-text':
        newEl.content = randomPick([
          'BROKEN', 'ERROR', 'FIX ME', 'WHY?', 'HELP', 'BUG', '?????', '404', 'NaN', 'null',
          'undefined', 'NOPE', 'CRASH', 'OOPS', 'LOL', 'WTF', 'BRB', '???',
        ]);
        break;
      case 'border-overlay':
        newEl.content = randomPick(CHAOS_EMOJIS);
        break;
      case 'emoji-splatter':
        newEl.content = Array.from({ length: randomBetween(3, 8) }, () => randomPick(CHAOS_EMOJIS)).join(' ');
        break;
      case 'css-error':
        newEl.content = randomPick(CHAOS_MESSAGES);
        break;
    }

    setChaosCount((c) => c + 1);
    setChaosElements((prev) => {
      const next = [...prev, newEl];
      return next.length > 50 ? next.slice(-40) : next;
    });
    setButtonStyle(randomPick(BUTTON_STYLES));
    setButtonText(randomPick([
      'CLICK TO ADD CHAOS',
      'MORE CHAOS NOW',
      'DESTROY EVERYTHING',
      'BREAK IT MORE',
      'EMBRACE THE MESS',
      'NO GOING BACK',
      'TOTAL CHAOS',
      'KEEP GOING???',
    ]));
  }, [randomPick, randomBetween]);

  const resetChaos = useCallback(() => {
    setChaosCount(0);
    setChaosElements([]);
    setButtonStyle(BUTTON_STYLES[0]);
    setButtonText('CLICK TO ADD CHAOS');
    nextId.current = 0;
  }, []);

  // Cleanup cap is handled inline in addChaos to avoid setState-in-effect

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: '#ffffff', fontFamily: 'Times New Roman, Georgia, serif' }}
    >
      {/* ═══════════════════════════════════════
          HEADER AREA
          ═══════════════════════════════════════ */}
      <div className="border-b-[4px] border-black px-4 py-8 md:px-8 md:py-12">
        {/* Giant Raw Heading */}
        <div className="mb-2">
          <span
            className="text-xs md:text-sm font-mono"
            style={{ color: '#999', fontFamily: 'monospace' }}
          >
            {'<h1>'}
          </span>
        </div>
        <h1
          className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold uppercase leading-none tracking-tight"
          style={{
            fontFamily: 'Times New Roman, Georgia, serif',
            color: '#000000',
            border: 'none',
          }}
        >
          WEB
          <br />
          <span style={{ background: '#ffff00', padding: '0 8px' }}>BRUTALI</span>
          <span className="line-through decoration-red-500 decoration-8">SM</span>
        </h1>
        <div className="mt-2">
          <span
            className="text-xs md:text-sm font-mono"
            style={{ color: '#999', fontFamily: 'monospace' }}
          >
            {'</h1>'}
          </span>
        </div>

        {/* Subtitle */}
        <div className="mt-6">
          <span
            className="text-xs md:text-sm font-mono"
            style={{ color: '#999', fontFamily: 'monospace' }}
          >
            {'<p>'}
          </span>
          <p
            className="text-lg md:text-2xl italic mt-1"
            style={{
              fontFamily: 'Times New Roman, Georgia, serif',
              color: '#333',
              borderLeft: '4px solid #000',
              paddingLeft: '16px',
            }}
          >
            this is not a bug. this is a feature.
          </p>
          <span
            className="text-xs md:text-sm font-mono block mt-1"
            style={{ color: '#999', fontFamily: 'monospace' }}
          >
            {'</p>'}
          </span>
        </div>

        {/* Decorative tag labels */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className="text-xs font-mono px-2 py-1 border-2 border-black"
            style={{ background: '#f0f0f0', fontFamily: 'monospace' }}
          >
            &lt;body&gt;
          </span>
          <span
            className="text-xs font-mono px-2 py-1 border-2 border-black"
            style={{ background: '#f0f0f0', fontFamily: 'monospace' }}
          >
            &lt;div style=&quot;chaos: true&quot;&gt;
          </span>
          <span
            className="text-xs font-mono px-2 py-1 border-2 border-black"
            style={{ background: '#ff0000', color: '#fff', fontFamily: 'monospace' }}
          >
            ERROR
          </span>
        </div>
      </div>

      {/* Marquee Banner */}
      <div
        className="overflow-hidden border-b-[4px] border-t-[4px] border-black py-3"
        style={{ background: '#ffff00' }}
      >
        <div className="marquee-text whitespace-nowrap inline-block">
          <span
            className="text-xl md:text-2xl font-bold uppercase tracking-wider"
            style={{ fontFamily: 'monospace', color: '#000000' }}
          >
            {Array.from({ length: 8 })
              .fill('✦ WEB BRUTALISM ✦ RAW DESIGN ✦ NO CSS NEEDED ✦ BREAK THE RULES ✦ ')
              .join('')}
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          BROKEN GRID LAYOUT
          ═══════════════════════════════════════ */}
      <div className="px-4 py-8 md:px-8 md:py-12">
        <div className="mb-4">
          <span className="text-xs font-mono" style={{ color: '#999', fontFamily: 'monospace' }}>
            {'<!-- GRID? WHAT GRID? -->'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Box 1: Raw HTML Source — spans 2 columns */}
          <motion.div
            className="md:col-span-2 border-[4px] border-black p-4 md:p-6"
            style={{
              background: '#ffffff',
              transform: 'rotate(-0.5deg)',
              fontFamily: 'monospace',
            }}
            onMouseEnter={() => setShakingBox(1)}
            onMouseLeave={() => setShakingBox(null)}
            animate={
              shakingBox === 1
                ? { x: [0, -3, 3, -2, 2, 0], y: [0, 2, -2, 1, -1, 0] }
                : {}
            }
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-3 border-b-[3px] border-black pb-2">
              <Code size={18} />
              <span className="font-bold text-sm uppercase" style={{ fontFamily: 'monospace' }}>
                raw_html.html
              </span>
              <span
                className="ml-auto text-xs px-2 py-0.5 border-2 border-black"
                style={{ background: '#f0f0f0' }}
              >
                index.html
              </span>
            </div>
            <pre
              className="text-xs md:text-sm whitespace-pre-wrap overflow-auto max-h-64"
              style={{
                fontFamily: 'monospace',
                color: '#000',
                lineHeight: '1.6',
              }}
            >
              {RAW_HTML_IN_BOX}
            </pre>
          </motion.div>

          {/* Box 2: 404 Error */}
          <motion.div
            className="border-[4px] border-black p-4 md:p-6"
            style={{
              background: '#f5f5f5',
              transform: 'rotate(1deg)',
            }}
            onMouseEnter={() => setShakingBox(2)}
            onMouseLeave={() => setShakingBox(null)}
            animate={
              shakingBox === 2
                ? { x: [0, -3, 3, -2, 2, 0], y: [0, 2, -2, 1, -1, 0] }
                : {}
            }
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <div
                className="text-6xl md:text-8xl font-bold"
                style={{ fontFamily: 'Times New Roman, Georgia, serif', color: '#000' }}
              >
                404
              </div>
              <div
                className="text-lg md:text-xl mt-2 uppercase"
                style={{ fontFamily: 'monospace', borderBottom: '3px solid black', paddingBottom: '8px' }}
              >
                Not Found
              </div>
              <div className="mt-4 text-sm" style={{ fontFamily: 'monospace', color: '#666' }}>
                <p className="border border-black px-2 py-1 inline-block" style={{ background: '#fff' }}>
                  The requested page was not found on this server.
                </p>
              </div>
              <div className="mt-3 text-xs" style={{ fontFamily: 'monospace', color: '#999' }}>
                Apache/2.4.41 (Ubuntu) Server at brutalism Port 80
              </div>
              <div className="mt-3">
                <span
                  className="inline-block border-2 border-black px-4 py-2 text-sm cursor-pointer"
                  style={{ background: '#000', color: '#fff', fontFamily: 'monospace' }}
                >
                  [ GO BACK ]
                </span>
              </div>
            </div>
          </motion.div>

          {/* Box 3: Raw CSS Code */}
          <motion.div
            className="border-[4px] border-black p-4 md:p-6"
            style={{
              background: '#ffffff',
              transform: 'rotate(-1deg)',
              fontFamily: 'monospace',
            }}
            onMouseEnter={() => setShakingBox(3)}
            onMouseLeave={() => setShakingBox(null)}
            animate={
              shakingBox === 3
                ? { x: [0, -3, 3, -2, 2, 0], y: [0, 2, -2, 1, -1, 0] }
                : {}
            }
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-3 border-b-[3px] border-black pb-2">
              <Bug size={18} />
              <span className="font-bold text-sm uppercase" style={{ fontFamily: 'monospace' }}>
                style.css
              </span>
            </div>
            <pre
              className="text-xs md:text-sm whitespace-pre-wrap overflow-auto max-h-64"
              style={{
                fontFamily: 'monospace',
                color: '#000',
                lineHeight: '1.6',
              }}
            >
              {RAW_CSS_CODE}
            </pre>
          </motion.div>

          {/* Box 4: Design Rules Table — full width */}
          <motion.div
            className="md:col-span-2 border-[4px] border-black p-4 md:p-6"
            style={{
              background: '#fafafa',
              transform: 'rotate(0.3deg)',
            }}
            onMouseEnter={() => setShakingBox(4)}
            onMouseLeave={() => setShakingBox(null)}
            animate={
              shakingBox === 4
                ? { x: [0, -3, 3, -2, 2, 0], y: [0, 2, -2, 1, -1, 0] }
                : {}
            }
            transition={{ duration: 0.3 }}
          >
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle size={18} />
              <span className="font-bold text-lg uppercase" style={{ fontFamily: 'Times New Roman, Georgia, serif' }}>
                Design Rules (All Broken)
              </span>
            </div>
            <div className="overflow-x-auto">
              <table
                className="w-full border-collapse"
                style={{ border: '3px solid black' }}
              >
                <thead>
                  <tr style={{ background: '#000', color: '#fff' }}>
                    <th className="border-[3px] border-black px-4 py-2 text-left text-sm" style={{ fontFamily: 'monospace' }}>
                      RULE #
                    </th>
                    <th className="border-[3px] border-black px-4 py-2 text-left text-sm" style={{ fontFamily: 'monospace' }}>
                      CONVENTIONAL RULE
                    </th>
                    <th className="border-[3px] border-black px-4 py-2 text-left text-sm" style={{ fontFamily: 'monospace' }}>
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {DESIGN_RULES.flat().map((rule, i) => (
                    <tr key={`rule-${i}`} style={{ background: i % 2 === 0 ? '#fff' : '#f0f0f0' }}>
                      <td className="border-[3px] border-black px-4 py-2 text-sm" style={{ fontFamily: 'monospace' }}>
                        {String(i + 1).padStart(2, '0')}
                      </td>
                      <td className="border-[3px] border-black px-4 py-2 text-sm line-through decoration-red-500 decoration-2" style={{ fontFamily: 'sans-serif' }}>
                        {rule}
                      </td>
                      <td className="border-[3px] border-black px-4 py-2 text-sm font-bold" style={{ fontFamily: 'monospace', color: '#ff0000' }}>
                        ✗ IGNORED
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          RAW HTML SHOWCASE
          ═══════════════════════════════════════ */}
      <div className="px-4 py-8 md:px-8 md:py-12 border-t-[4px] border-black">
        <div className="mb-4">
          <span className="text-xs font-mono" style={{ color: '#999', fontFamily: 'monospace' }}>
            {'<!-- RAW SOURCE CODE -->'}
          </span>
        </div>

        <div className="mb-2 flex items-center gap-3">
          <span className="text-xs font-mono px-2 py-1 border-2 border-black" style={{ background: '#ffff00', fontFamily: 'monospace' }}>
            brutalism.html
          </span>
          <span className="text-xs" style={{ color: '#999', fontFamily: 'monospace' }}>
            — view source —
          </span>
        </div>

        <div className="border-[4px] border-black overflow-auto max-h-96" style={{ background: '#1a1a1a' }}>
          {/* Window chrome */}
          <div
            className="flex items-center gap-2 px-4 py-2 border-b-[3px] border-black"
            style={{ background: '#333' }}
          >
            <span className="w-3 h-3 inline-block" style={{ background: '#ff5f56' }} />
            <span className="w-3 h-3 inline-block" style={{ background: '#ffbd2e' }} />
            <span className="w-3 h-3 inline-block" style={{ background: '#27c93f' }} />
            <span className="ml-4 text-xs" style={{ color: '#999', fontFamily: 'monospace' }}>
              brutalism.html — ~/sites/brutalism/
            </span>
          </div>
          <pre
            className="p-4 md:p-6 text-xs md:text-sm leading-relaxed overflow-auto"
            style={{
              fontFamily: 'monospace',
              color: '#00ff41',
              margin: 0,
            }}
          >
            <code>{RAW_HTML_SOURCE}</code>
          </pre>
        </div>

        {/* "Rendered" version below */}
        <div className="mt-6">
          <span className="text-xs font-mono" style={{ color: '#999', fontFamily: 'monospace' }}>
            {'<!-- RENDERED OUTPUT (approximation) -->'}
          </span>
          <div className="mt-2 border-[4px] border-black p-6" style={{ background: '#fff' }}>
            <h2
              className="text-3xl md:text-5xl font-bold border-b-[4px] border-black pb-2 mb-3"
              style={{ fontFamily: 'Times New Roman, Georgia, serif' }}
            >
              NO FRILLS
            </h2>
            <p className="text-base md:text-lg mb-3" style={{ fontFamily: 'sans-serif' }}>
              JUST RAW CONTENT
            </p>
            <a
              href="#"
              className="text-blue-600 underline text-base md:text-lg"
              onClick={(e) => e.preventDefault()}
            >
              UNDERSTAND?
            </a>
            <table className="mt-3 border-collapse" style={{ border: '3px solid black' }}>
              <tbody>
                <tr>
                  <td className="px-4 py-2 text-sm" style={{ border: '2px solid black', fontFamily: 'monospace' }}>NO</td>
                  <td className="px-4 py-2 text-sm" style={{ border: '2px solid black', fontFamily: 'monospace' }}>CSS</td>
                  <td className="px-4 py-2 text-sm" style={{ border: '2px solid black', fontFamily: 'monospace' }}>FRAMEWORK</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          INTERACTIVE DESTROY BUTTON
          ═══════════════════════════════════════ */}
      <div
        className="px-4 py-8 md:px-8 md:py-12 border-t-[4px] border-black relative"
        ref={chaosContainerRef}
        style={{ minHeight: '400px' }}
      >
        {/* Chaos counter */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Zap size={20} />
            <span
              className="text-xl md:text-2xl font-bold uppercase"
              style={{ fontFamily: 'Times New Roman, Georgia, serif' }}
            >
              Chaos Level: {chaosCount}
            </span>
          </div>
          {chaosCount > 0 && (
            <motion.button
              onClick={resetChaos}
              className="flex items-center gap-2 px-4 py-2 border-[3px] border-black text-sm uppercase cursor-pointer"
              style={{ background: '#fff', fontFamily: 'monospace' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trash2 size={14} />
              RESET CHAOS
            </motion.button>
          )}
        </div>

        {/* Main destroy button */}
        <div className="flex justify-center mb-8">
          <motion.button
            onClick={addChaos}
            className="px-8 py-4 md:px-12 md:py-6 border-[4px] text-xl md:text-2xl font-bold uppercase tracking-wide cursor-pointer"
            style={{
              background: buttonStyle.bg,
              color: buttonStyle.color,
              borderColor: buttonStyle.border,
              fontFamily: 'Times New Roman, Georgia, serif',
            }}
            whileHover={{ scale: 1.08, rotate: [-1, 1, -1, 0] }}
            whileTap={{ scale: 0.95, rotate: 3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            {buttonText}
          </motion.button>
        </div>

        {/* Chaos level bar */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="border-[3px] border-black h-6" style={{ background: '#f0f0f0' }}>
            <motion.div
              className="h-full flex items-center justify-end pr-2 text-xs font-bold"
              style={{
                background: chaosCount > 20 ? '#ff0000' : chaosCount > 10 ? '#ff6600' : '#ffff00',
                color: chaosCount > 10 ? '#fff' : '#000',
                fontFamily: 'monospace',
                minWidth: `${Math.min(chaosCount * 2, 100)}%`,
                maxWidth: '100%',
              }}
              animate={{ width: `${Math.min(chaosCount * 2, 100)}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {Math.min(chaosCount * 2, 100)}%
            </motion.div>
          </div>
        </div>

        {/* Chaos elements container */}
        <div className="relative" style={{ minHeight: '200px' }}>
          <AnimatePresence>
            {chaosElements.map((el) => (
              <motion.div
                key={el.id}
                className="absolute pointer-events-none select-none"
                style={{
                  left: `${el.x}%`,
                  top: `${el.y}%`,
                  transform: `rotate(${el.rotation}deg)`,
                  fontFamily: el.type === 'css-error' ? 'monospace' : 'inherit',
                  fontSize: `${el.fontSize}px`,
                  zIndex: chaosCount,
                }}
                initial={{ opacity: 0, scale: 0, rotate: el.rotation - 20 }}
                animate={{ opacity: 1, scale: 1, rotate: el.rotation }}
                exit={{ opacity: 0, scale: 0.5, rotate: el.rotation + 30 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                {el.type === 'css-error' && (
                  <div
                    className="px-3 py-2 border-[3px]"
                    style={{
                      background: el.bgColor,
                      borderColor: el.borderColor,
                      color: el.textColor,
                      fontFamily: 'monospace',
                      fontSize: `${Math.max(el.fontSize * 0.6, 10)}px`,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ color: '#ff0000' }}>⚠</span> {el.content}
                  </div>
                )}
                {el.type === 'rotated-text' && (
                  <div
                    className="px-3 py-1 border-[3px] font-bold"
                    style={{
                      background: el.bgColor,
                      borderColor: el.borderColor,
                      color: el.textColor,
                      fontFamily: 'Times New Roman, Georgia, serif',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {el.content}
                  </div>
                )}
                {el.type === 'border-overlay' && (
                  <div
                    className="border-[4px] p-2"
                    style={{
                      background: 'transparent',
                      borderColor: el.borderColor,
                    }}
                  >
                    <span style={{ fontSize: `${el.fontSize * 2}px` }}>{el.content}</span>
                  </div>
                )}
                {el.type === 'emoji-splatter' && (
                  <div
                    style={{
                      fontSize: `${el.fontSize * 0.8}px`,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {el.content}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          LINK COLLECTION
          ═══════════════════════════════════════ */}
      <div className="px-4 py-8 md:px-8 md:py-12 border-t-[4px] border-black" style={{ background: '#fafafa' }}>
        <div className="mb-4">
          <span className="text-xs font-mono" style={{ color: '#999', fontFamily: 'monospace' }}>
            {'<!-- NAVIGATION -->'}
          </span>
        </div>
        <h2
          className="text-2xl md:text-4xl font-bold uppercase mb-6 border-b-[4px] border-black pb-2"
          style={{ fontFamily: 'Times New Roman, Georgia, serif' }}
        >
          <span className="text-xs font-mono align-top mr-2" style={{ color: '#999' }}>
            {'<nav>'}
          </span>
          Links
          <span className="text-xs font-mono align-top ml-2" style={{ color: '#999' }}>
            {'</nav>'}
          </span>
        </h2>

        <div className="space-y-1">
          {FAKE_LINKS.map((link, i) => (
            <div
              key={`link-${i}`}
              className="relative"
              onMouseEnter={() => setHoveredLink(i)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <div className="flex items-start gap-3 py-2 border-b-[2px] border-black/10">
                <a
                  href={link.href}
                  className="text-blue-600 underline text-base md:text-lg"
                  style={{ fontFamily: 'sans-serif' }}
                  onClick={(e) => e.preventDefault()}
                >
                  <span className="text-xs mr-1" style={{ fontFamily: 'monospace', color: '#999' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {link.label}
                </a>
                <span
                  className="text-xs mt-1 hidden sm:inline-block"
                  style={{ fontFamily: 'monospace', color: '#999' }}
                >
                  href=&quot;{link.href}&quot;
                </span>
                <ExternalLink size={14} className="mt-1 hidden sm:block" style={{ color: '#999' }} />
              </div>

              {/* Tooltip with raw HTML */}
              {hoveredLink === i && (
                <motion.div
                  className="absolute left-0 top-full z-50 border-[3px] border-black px-3 py-2"
                  style={{
                    background: '#000',
                    color: '#00ff41',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    whiteSpace: 'nowrap',
                  }}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {link.html}
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Last updated fake footer */}
        <div className="mt-6 pt-4 border-t-[3px] border-black">
          <p className="text-xs" style={{ fontFamily: 'monospace', color: '#999' }}>
            Last updated: 1999-12-31 23:59:59 | Webmaster: admin@brutalism.net | Best viewed in Netscape Navigator 4.0
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          BOTTOM MARQUEE (REVERSE)
          ═══════════════════════════════════════ */}
      <div
        className="overflow-hidden border-t-[4px] border-black py-3"
        style={{ background: '#000' }}
      >
        <div className="marquee-text whitespace-nowrap inline-block" style={{ animationDirection: 'reverse' }}>
          <span
            className="text-lg md:text-xl font-bold uppercase tracking-wider"
            style={{ fontFamily: 'monospace', color: '#00ff41' }}
          >
            {Array.from({ length: 10 })
              .fill(
                '// THIS PAGE HAS NO FRAMEWORK // NO BUILD STEP // NO NODE_MODULES // PURE HTML // JUST LIKE 1999 // ',
              )
              .join('')}
          </span>
        </div>
      </div>
    </section>
  );
}
