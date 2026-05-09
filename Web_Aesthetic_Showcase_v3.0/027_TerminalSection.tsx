// Project: Web Aesthetic Showcase v3.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v3.0\src\components
// Lines: 978

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Terminal, Command, ChevronRight, Clock, Cpu, Wifi, Palette } from 'lucide-react';
import { useSound } from '@/components/sound-toggle';

// ─── Types ───────────────────────────────────────────────────────────────────

type ThemeColor = 'green' | 'amber' | 'white';

interface TerminalLine {
  id: number;
  content: string;
  type: 'output' | 'input' | 'error' | 'system' | 'ascii';
  timestamp?: string;
  isHtml?: boolean;
}

// ─── Theme Config ────────────────────────────────────────────────────────────

const THEME_CONFIG: Record<ThemeColor, { text: string; glow: string; dim: string; accent: string; label: string }> = {
  green: {
    text: '#00ff41',
    glow: 'rgba(0, 255, 65, 0.6)',
    dim: 'rgba(0, 255, 65, 0.3)',
    accent: '#00ff41',
    label: 'PHOSPHOR GREEN',
  },
  amber: {
    text: '#ffb000',
    glow: 'rgba(255, 176, 0, 0.6)',
    dim: 'rgba(255, 176, 0, 0.3)',
    accent: '#ffb000',
    label: 'AMBER MONOCHROME',
  },
  white: {
    text: '#e0e0e0',
    glow: 'rgba(224, 224, 224, 0.4)',
    dim: 'rgba(224, 224, 224, 0.3)',
    accent: '#ffffff',
    label: 'WHITE PHOSPHOR',
  },
};

// ─── Boot Sequence ───────────────────────────────────────────────────────────

const BOOT_LINES = [
  'Z.AI OS v2.0.25 [Build 2025.06.27]',
  'BIOS: Z.AI Virtual Machine',
  'CPU: Neural Processing Unit @ 4.2 GHz',
  'RAM: 32768 MB OK',
  'GPU: RTX Holographic 5090',
  'Loading kernel modules... [OK]',
  'Initializing network... [OK]',
  'Starting AI services... [OK]',
  '',
  'Welcome to Z.AI Terminal — type \'help\' to begin',
];

// ─── ASCII Art ───────────────────────────────────────────────────────────────

const ZAI_LOGO = `
 ████████╗███████╗███╗   ██╗████████╗
 ╚══██╔══╝██╔════╝████╗  ██║╚══██╔══╝
    ██║   █████╗  ██╔██╗ ██║   ██║
    ██║   ██╔══╝  ██║╚██╗██║   ██║
    ██║   ███████╗██║ ╚████║   ██║
    ╚═╝   ╚══════╝╚═╝  ╚═══╝   ╚═╝
`;

const SKILLS_ASCII = `
┌─────────────────────────────────────────────┐
│  ╔══════════════════════════════════════╗    │
│  ║         DEVELOPER SKILLS             ║    │
│  ╚══════════════════════════════════════╝    │
│                                             │
│  ██ TypeScript/JavaScript  ██████████  95%  │
│  ██ React / Next.js       ██████████  93%  │
│  ██ Node.js / Bun         ████████░░  88%  │
│  ██ Python / ML           ████████░░  85%  │
│  ██ Rust / Go             ██████░░░░  75%  │
│  ██ CSS / Tailwind        █████████░  92%  │
│  ██ PostgreSQL / Redis    ████████░░  87%  │
│  ██ Docker / K8s          ███████░░░  82%  │
│  ██ AWS / GCP             ███████░░░  80%  │
│                                             │
└─────────────────────────────────────────────┘
`;

const NEOFETCH_ASCII = `
       ▄▄▄▄▄▄▄▄▄▄▄            user@z-ai
      ██████████████           ─────────────
      ██████████████           OS: Z.AI OS v2.0.25
      ██████████████           Host: Virtual Machine
      ██████████████           Kernel: z-kernel 6.1
      ██████████████           Uptime: ${() => {
        const h = Math.floor(Math.random() * 24);
        const m = Math.floor(Math.random() * 60);
        return `${h} hours, ${m} mins`;
      }}
      ██████████████           Shell: zsh 5.9
      ██████████████           Resolution: 3840x2160
      ██████████████           DE: HyperTerminal
      ██████████████           WM: zai-wm
      ██████████████           Terminal: Z.AI Terminal
      ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀         CPU: NPU @ 4.2 GHz
                               GPU: RTX Holographic 5090
                               Memory: 8192MB / 32768MB
`;

const PROJECTS_DATA = [
  { name: 'z-ai-engine', desc: 'AI inference engine with real-time streaming', status: '● LIVE', lang: 'Rust' },
  { name: 'neuro-dashboard', desc: 'ML model monitoring & visualization platform', status: '● LIVE', lang: 'TypeScript' },
  { name: 'quantum-poker', desc: 'Quantum computing poker game simulation', status: '● BETA', lang: 'Python' },
  { name: 'void-renderer', desc: 'GPU-accelerated 3D rendering engine', status: '● DEV', lang: 'C++' },
  { name: 'synth-wave-api', desc: 'Music synthesis REST API with WebSocket', status: '● LIVE', lang: 'Go' },
];

const FORTUNES = [
  'There are only 10 types of people in this world: those who understand binary and those who don\'t.',
  'A SQL query walks into a bar, sees two tables, and asks: "Can I JOIN you?"',
  'There\'s no place like 127.0.0.1',
  'Debugging is like being the detective in a crime movie where you are also the murderer.',
  'Code never lies; comments sometimes do. — Ron Jeffries',
  'First, solve the problem. Then, write the code. — John Johnson',
  'Any fool can write code that a computer can understand. Good programmers write code that humans can understand. — Martin Fowler',
  'The best error message is the one that never shows up. — Thomas Fuchs',
  'Programs must be written for people to read, and only incidentally for machines to execute. — Harold Abelson',
  'It\'s not a bug — it\'s an undocumented feature.',
  'In order to be irreplaceable, one must always be different. — Coco Chanel',
  'The computer was born to solve problems that did not exist before. — Bill Gates',
  'Talk is cheap. Show me the code. — Linus Torvalds',
  'Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away. — Antoine de Saint-Exupery',
  'Simplicity is the soul of efficiency. — Austin Freeman',
];

const WEATHER_DATA = [
  { condition: 'Cloudy with a chance of bugs', temp: '22°C', humidity: '66%', wind: '12 km/h', visibility: '10km' },
  { condition: 'Partly cloudy, compiling in background', temp: '18°C', humidity: '71%', wind: '8 km/h', visibility: '15km' },
  { condition: 'Sunny, perfect for coding outside', temp: '26°C', humidity: '45%', wind: '5 km/h', visibility: '20km' },
  { condition: 'Rainy, ideal for deep work sessions', temp: '14°C', humidity: '89%', wind: '18 km/h', visibility: '5km' },
  { condition: 'Overcast, deployment day vibes', temp: '20°C', humidity: '55%', wind: '10 km/h', visibility: '12km' },
];

const AVAILABLE_COMMANDS = [
  'help', 'about', 'skills', 'projects', 'theme', 'matrix',
  'fortune', 'cowsay', 'date', 'echo', 'weather', 'history',
  'clear', 'whoami', 'neofetch',
];

const COWSAY_ASCII = (text: string) => {
  const top = ' ' + '_'.repeat(text.length + 2);
  const mid = `< ${text} >`;
  const bot = ' ' + '-'.repeat(text.length + 2);
  return `${top}
${mid}
${bot}
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||`;
};

const WHOAMI_DATA = `
┌─────────────────────────────────────────┐
│            USER PROFILE                  │
├─────────────────────────────────────────┤
│  Name:     Z.AI Developer               │
│  Role:     Full-Stack AI Engineer       │
│  Shell:    /bin/zsh                     │
│  Home:     /home/z-ai                   │
│  Editor:   nvim + copilot               │
│  PGP Key:  A1B2C3D4E5F6G7H8             │
│                                          │
│  "The best code is the code you never    │
│   have to write... but I write it anyway" │
└─────────────────────────────────────────┘
`;

// ─── Helper ─────────────────────────────────────────────────────────────────

function getTimestamp(): string {
  const now = new Date();
  return `[${now.toTimeString().slice(0, 8)}]`;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function TerminalSection() {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [theme, setTheme] = useState<ThemeColor>('green');
  const [isBooting, setIsBooting] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { playSound } = useSound();
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const themeRef = useRef(theme);
  themeRef.current = theme;

  // ─── Cursor position measurement ─────────────────────────────────────────

  const [cpuUsage, setCpuUsage] = useState(5);
  const [memUsage, setMemUsage] = useState(5.2);
  const [clock, setClock] = useState('--:--:--');

  useEffect(() => {
    if (measureRef.current && cursorRef.current) {
      cursorRef.current.style.left = `${measureRef.current.offsetWidth}px`;
    }
  }, [input]);

  // ─── Animate status bar stats & clock ────────────────────────────────────

  useEffect(() => {
    const tickClock = () => setClock(new Date().toLocaleTimeString('en-US', { hour12: false }));
    tickClock(); // Set immediately on mount
    setCpuUsage(Math.floor(Math.random() * 10 + 2));
    setMemUsage(+(Math.random() * 8 + 4).toFixed(1));
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(Math.random() * 10 + 2));
      setMemUsage(+(Math.random() * 8 + 4).toFixed(1));
      tickClock();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const idCounter = useRef(0);
  const nextId = useCallback(() => ++idCounter.current, []);

  // ─── Auto-scroll ─────────────────────────────────────────────────────────

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  // ─── Add line helper ─────────────────────────────────────────────────────

  const addLine = useCallback((
    content: string,
    type: TerminalLine['type'] = 'output',
    showTimestamp = false
  ) => {
    setLines(prev => [...prev, {
      id: nextId(),
      content,
      type,
      ...(showTimestamp ? { timestamp: getTimestamp() } : {}),
    }]);
  }, []);

  // ─── Boot sequence ───────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    let i = 0;

    const boot = async () => {
      for (const line of BOOT_LINES) {
        if (cancelled) return;
        const id = Date.now() + Math.random();
        setLines(prev => [...prev, {
          id,
          content: line,
          type: 'system',
        }]);
        await new Promise(r => setTimeout(r, 120 + Math.random() * 80));
      }
      if (!cancelled) {
        setIsBooting(false);
        await new Promise(r => setTimeout(r, 200));
        inputRef.current?.focus();
      }
    };

    boot();
    return () => { cancelled = true; };
  }, []);

  // ─── Matrix animation ────────────────────────────────────────────────────

  const showMatrix = useCallback(() => {
    const chars = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ012345789ZABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const cols = 40;
    const rows = 12;
    let frame = 0;
    const matrixData: string[][] = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => chars[Math.floor(Math.random() * chars.length)])
    );

    const id = Date.now() + Math.random();
    setLines(prev => [...prev, {
      id,
      content: '',
      type: 'output',
      timestamp: getTimestamp(),
      isHtml: true,
    }]);

    // We'll do a brief burst of matrix lines
    const totalFrames = 8;
    const interval = setInterval(() => {
      frame++;
      // Mutate some chars
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() > 0.7) {
            matrixData[r][c] = chars[Math.floor(Math.random() * chars.length)];
          }
        }
      }
      const matrixStr = matrixData.map(row => row.join('')).join('\n');
      setLines(prev => {
        const updated = [...prev];
        const lastLine = updated[updated.length - 1];
        if (lastLine && lastLine.isHtml) {
          updated[updated.length - 1] = {
            ...lastLine,
            content: `<span style="opacity:0.7;font-size:10px;line-height:1.1;letter-spacing:1px">${matrixStr.replace(/\n/g, '<br/>')}</span>`,
          };
        }
        return updated;
      });

      if (frame >= totalFrames) {
        clearInterval(interval);
      }
    }, 150);
  }, []);

  // ─── Command execution ───────────────────────────────────────────────────

  const executeCommand = useCallback(async (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    const ts = getTimestamp();
    playSound('click');

    // Echo the input line
    setLines(prev => [...prev, {
      id: nextId(),
      content: `user@z-ai:~$ ${cmd}`,
      type: 'input',
      timestamp: ts,
    }]);

    // Show processing dots
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 300 + Math.random() * 400));
    setIsProcessing(false);
    playSound('success');

    const respond = (content: string, type: TerminalLine['type'] = 'output') => {
      setLines(prev => [...prev, {
        id: nextId(),
        content,
        type,
        timestamp: ts,
      }]);
    };

    // Handle commands with arguments (early return)
    if (trimmed.startsWith('cowsay')) {
      const msg = cmd.replace(/^cowsay\s*/i, '').trim() || 'Moo!';
      respond(COWSAY_ASCII(msg));
      return;
    }
    if (trimmed.startsWith('echo')) {
      const echoText = cmd.replace(/^echo\s*/i, '').trim();
      respond(echoText || '(no text to echo)');
      return;
    }

    switch (trimmed) {
      case '':
        break;

      case 'help':
        respond(`Available commands:
  help      — Show this help message
  about     — About this terminal demo
  skills    — List developer skills
  projects  — Show project portfolio
  theme     — Toggle terminal color theme
  matrix    — Trigger Matrix rain effect
  fortune   — Display a random dev quote
  cowsay    — A cow says your message
  date      — Show current date and time
  echo      — Echo text back to terminal
  weather   — Simulated weather report
  history   — Show command history
  clear     — Clear the terminal
  whoami    — Display user profile
  neofetch  — Show system information`);
        break;

      case 'about':
        respond(`╔══════════════════════════════════════════════╗
║  Z.AI Terminal — Code Aesthetic Showcase      ║
║                                              ║
║  A retro-futuristic terminal emulator that    ║
║  celebrates the art of the command line.      ║
║  Built with Next.js, TypeScript & love.       ║
║                                              ║
║  Try 'theme' to change colors, 'matrix' for  ║
║  a visual treat, or 'neofetch' for system     ║
║  info.                                       ║
║                                              ║
║  Use ↑/↓ arrows to navigate command history.  ║
╚══════════════════════════════════════════════╝`);
        break;

      case 'skills':
        respond(SKILLS_ASCII);
        break;

      case 'projects': {
        let projectsStr = `┌───── PROJECTS ─────────────────────────────────┐\n`;
        PROJECTS_DATA.forEach(p => {
          projectsStr += `│                                              │\n`;
          projectsStr += `│  📦 ${p.name.padEnd(20)} [${p.lang}]        │\n`;
          projectsStr += `│     ${p.desc.padEnd(44)}│\n`;
          projectsStr += `│     Status: ${p.status.padEnd(38)}│\n`;
        });
        projectsStr += `│                                              │\n`;
        projectsStr += `└──────────────────────────────────────────────┘`;
        respond(projectsStr);
        break;
      }

      case 'theme': {
        const themes: ThemeColor[] = ['green', 'amber', 'white'];
        const currentIdx = themes.indexOf(themeRef.current);
        const nextTheme = themes[(currentIdx + 1) % themes.length];
        setTheme(nextTheme);
        respond(`Theme changed to: ${THEME_CONFIG[nextTheme].label}`);
        break;
      }

      case 'matrix':
        showMatrix();
        respond('Initializing Matrix rain sequence...', 'system');
        break;

      case 'fortune':
        respond(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);
        break;

      case 'date':
        respond(`📅 ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
🕐 ${new Date().toLocaleTimeString('en-US', { hour12: true })}
⏰ Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
        break;

      case 'weather': {
        const w = WEATHER_DATA[Math.floor(Math.random() * WEATHER_DATA.length)];
        respond(`┌────────── WEATHER ──────────────┐
│  🌍 Location: Virtual Server Farm  │
│  🌡️  Temperature: ${w.temp.padEnd(16)}│
│  💧 Humidity: ${w.humidity.padEnd(17)}│
│  💨 Wind: ${w.wind.padEnd(21)}│
│  👁️  Visibility: ${w.visibility.padEnd(15)}│
│  ☁️  ${w.condition.padEnd(25)}│
└────────────────────────────────┘`);
        break;
      }

      case 'history':
        if (history.length === 0) {
          respond('No command history yet.');
        } else {
          const histStr = history.slice(0, 20).map((h, i) => `  ${String(i + 1).padStart(3)}  ${h}`).join('\n');
          respond(`Command history:\n${histStr}`);
        }
        break;

      case 'clear':
        setLines([]);
        break;

      case 'whoami':
        respond(WHOAMI_DATA);
        break;

      case 'neofetch': {
        const now = new Date();
        const uptimeH = Math.floor(Math.random() * 24) + 1;
        const uptimeM = Math.floor(Math.random() * 60);
        const mem = 8192 + Math.floor(Math.random() * 4096);
        const neofetch = `
       ▄▄▄▄▄▄▄▄▄▄▄            user@z-ai
      ██████████████           ─────────────
      ██████████████           OS: Z.AI OS v2.0.25
      ██████████████           Host: Virtual Machine
      ██████████████           Kernel: z-kernel 6.1
      ██████████████           Uptime: ${uptimeH} hours, ${uptimeM} mins
      ██████████████           Shell: zsh 5.9
      ██████████████           Resolution: 3840x2160
      ██████████████           DE: HyperTerminal
      ██████████████           WM: zai-wm
      ██████████████           Terminal: Z.AI Terminal
      ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀         CPU: NPU @ 4.2 GHz
                               GPU: RTX Holographic 5090
                               Memory: ${mem}MB / 32768MB`;
        respond(neofetch);
        break;
      }

      default:
        respond(`zsh: command not found: ${trimmed}`, 'error');
        respond(`Type 'help' to see available commands.`, 'system');
        break;
    }
  }, [addLine, showMatrix, theme]);

  // ─── Input handling ──────────────────────────────────────────────────────

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (isBooting || isProcessing || !input.trim()) return;

    const cmd = input;
    setInput('');
    setHistory(prev => [cmd, ...prev]);
    setHistoryIndex(-1);
    executeCommand(cmd);
  }, [input, isBooting, isProcessing, executeCommand]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Play key sound for printable characters
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      playSound('key');
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHistory(prev => {
        const newIndex = historyIndex < prev.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        if (prev[newIndex]) setInput(prev[newIndex]);
        return prev;
      });
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        setHistory(prev => {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          if (prev[newIndex]) setInput(prev[newIndex]);
          return prev;
        });
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const trimmedInput = input.trim().toLowerCase();
      if (!trimmedInput) return;
      const matches = AVAILABLE_COMMANDS.filter(c => c.startsWith(trimmedInput));
      if (matches.length === 1) {
        setInput(matches[0] + ' ');
      } else if (matches.length > 1) {
        setLines(prev => [...prev, {
          id: nextId(),
          content: matches.join('    '),
          type: 'system',
          timestamp: getTimestamp(),
        }]);
      }
    }
  }, [historyIndex, input, nextId]);

  // ─── Click to focus ──────────────────────────────────────────────────────

  const handleTerminalClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // ─── Theme colors ────────────────────────────────────────────────────────

  const tc = THEME_CONFIG[theme];

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <section className="w-full py-8 md:py-12" style={{ background: '#050505' }}>
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full border border-[#1a1a1a] bg-[#0a0a0a]">
            <Terminal className="w-4 h-4" style={{ color: tc.text }} />
            <span className="text-xs font-mono uppercase tracking-widest" style={{ color: tc.dim }}>
              Terminal Aesthetic
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-mono" style={{ color: tc.text }}>
            Interactive Terminal
          </h2>
          <p className="mt-2 text-sm font-mono" style={{ color: tc.dim }}>
            A fully functional CLI experience — type, explore, interact
          </p>
        </div>

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Terminal Window */}
          <div className="flex-1 min-w-0">
            <div
              className="rounded-lg overflow-hidden shadow-2xl scanlines crt-effect terminal-green-glow"
              style={{
                background: '#0a0a0a',
                border: `1px solid ${tc.dim}`,
              }}
            >
              {/* Title Bar */}
              <div
                className="flex items-center gap-2 px-4 py-2.5"
                style={{ background: '#1a1a1a', borderBottom: `1px solid ${tc.dim}` }}
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-110 transition-all cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e] hover:brightness-110 transition-all cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840] hover:brightness-110 transition-all cursor-pointer" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs font-mono" style={{ color: tc.dim }}>
                    user@z-ai:~
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" style={{ color: tc.dim }} />
                  <span className="text-xs font-mono" style={{ color: tc.dim }}>
                    {clock}
                  </span>
                </div>
              </div>

              {/* Terminal Body */}
              <div
                ref={terminalRef}
                className="p-3 md:p-4 custom-scrollbar overflow-y-auto cursor-text"
                style={{
                  minHeight: '420px',
                  maxHeight: '520px',
                  fontFamily: 'var(--font-geist-mono), monospace',
                  fontSize: '13px',
                  lineHeight: '1.6',
                }}
                onClick={handleTerminalClick}
              >
                {/* Output Lines */}
                {lines.map((line) => (
                  <div key={line.id} className="mb-0.5">
                    {/* Timestamp */}
                    {line.timestamp && (
                      <span
                        className="mr-2 select-none"
                        style={{ color: tc.dim, fontSize: '11px' }}
                      >
                        {line.timestamp}
                      </span>
                    )}
                    {/* Content */}
                    {line.isHtml ? (
                      <span
                        dangerouslySetInnerHTML={{ __html: line.content }}
                        style={{ color: tc.text }}
                      />
                    ) : (
                      <span
                        style={{
                          color:
                            line.type === 'error'
                              ? '#ff5555'
                              : line.type === 'input'
                                ? tc.accent
                                : line.type === 'system'
                                  ? tc.dim
                                  : tc.text,
                          fontWeight: line.type === 'input' ? 600 : 400,
                          textShadow:
                            line.type === 'error'
                              ? 'none'
                              : `0 0 6px ${tc.glow}`,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all',
                        }}
                      >
                        {line.content}
                      </span>
                    )}
                  </div>
                ))}

                {/* Processing indicator */}
                {isProcessing && (
                  <div className="mb-0.5 flex items-center gap-1" style={{ color: tc.dim }}>
                    <span style={{ color: tc.text }}>Processing</span>
                    <span className="inline-flex gap-0.5">
                      <span
                        className="inline-block w-1 h-4"
                        style={{
                          background: tc.text,
                          animation: 'blink 1.4s step-end infinite',
                          animationDelay: '0s',
                        }}
                      />
                      <span
                        className="inline-block w-1 h-4"
                        style={{
                          background: tc.text,
                          animation: 'blink 1.4s step-end infinite',
                          animationDelay: '0.2s',
                        }}
                      />
                      <span
                        className="inline-block w-1 h-4"
                        style={{
                          background: tc.text,
                          animation: 'blink 1.4s step-end infinite',
                          animationDelay: '0.4s',
                        }}
                      />
                    </span>
                  </div>
                )}

                {/* Input Line */}
                {!isBooting && (
                  <form onSubmit={handleSubmit} className="flex items-center">
                    <span className="mr-1 select-none font-bold" style={{ color: tc.text }}>
                      user@z-ai
                    </span>
                    <span className="mr-2 select-none" style={{ color: tc.dim }}>:</span>
                    <span className="mr-1 select-none font-bold" style={{ color: '#5c94fc' }}>
                      ~
                    </span>
                    <span className="mr-2 select-none" style={{ color: tc.text }}>$</span>
                    <div className="flex-1 relative">
                      {/* Hidden span to measure input text width */}
                      <span
                        ref={measureRef}
                        aria-hidden="true"
                        className="invisible absolute pointer-events-none whitespace-pre"
                        style={{
                          fontFamily: 'var(--font-geist-mono), monospace',
                          fontSize: '13px',
                          lineHeight: '1.6',
                        }}
                      >
                        {input}
                      </span>
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-transparent border-none outline-none font-mono"
                        style={{
                          color: tc.text,
                          caretColor: 'transparent',
                          fontSize: '13px',
                          lineHeight: '1.6',
                          textShadow: `0 0 6px ${tc.glow}`,
                        }}
                        disabled={isProcessing}
                        autoComplete="off"
                        spellCheck={false}
                        aria-label="Terminal command input"
                      />
                      {/* Blinking cursor */}
                      <span
                        ref={cursorRef}
                        className="cursor-blink absolute top-0 pointer-events-none"
                        style={{
                          color: tc.text,
                          textShadow: `0 0 8px ${tc.glow}`,
                          fontSize: '13px',
                          lineHeight: '1.6',
                        }}
                      >
                        ▊
                      </span>
                    </div>
                  </form>
                )}
              </div>

              {/* Status Bar */}
              <div
                className="flex items-center justify-between px-3 py-1.5 text-xs font-mono"
                style={{
                  background: '#111',
                  borderTop: `1px solid ${tc.dim}`,
                  color: tc.dim,
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3 h-3" />
                    CPU: {cpuUsage}%
                  </span>
                  <span className="flex items-center gap-1">
                    MEM: {memUsage}GB
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Wifi className="w-3 h-3" />
                    CONNECTED
                  </span>
                  <span
                    className="px-1.5 py-0.5 rounded text-xs"
                    style={{
                      background: `${tc.dim.replace('0.3', '0.15')}`,
                      color: tc.text,
                    }}
                  >
                    {THEME_CONFIG[theme].label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Command Reference Sidebar */}
          <div className="lg:w-72 xl:w-80 shrink-0">
            <div
              className="rounded-lg p-4 font-mono text-xs"
              style={{
                background: '#0a0a0a',
                border: `1px solid ${tc.dim}`,
              }}
            >
              <div
                className="flex items-center gap-2 mb-3 pb-2"
                style={{ borderBottom: `1px solid ${tc.dim}` }}
              >
                <Command className="w-3.5 h-3.5" style={{ color: tc.text }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: tc.text }}>
                  Quick Reference
                </span>
              </div>

              <div className="space-y-2">
                {[
                  { cmd: 'help', desc: 'Show all commands' },
                  { cmd: 'about', desc: 'About this demo' },
                  { cmd: 'skills', desc: 'Developer skills' },
                  { cmd: 'projects', desc: 'Project portfolio' },
                  { cmd: 'fortune', desc: 'Random dev quote' },
                  { cmd: 'weather', desc: 'Weather report' },
                  { cmd: 'cowsay', desc: 'Cow says moo' },
                  { cmd: 'theme', desc: 'Toggle color theme' },
                  { cmd: 'matrix', desc: 'Matrix rain effect' },
                  { cmd: 'neofetch', desc: 'System info' },
                  { cmd: 'clear', desc: 'Clear terminal' },
                ].map(item => (
                  <button
                    key={item.cmd}
                    onClick={() => {
                      if (!isBooting && !isProcessing) {
                        setInput(item.cmd);
                        inputRef.current?.focus();
                      }
                    }}
                    className="w-full flex items-start gap-2 px-2 py-1.5 rounded transition-colors text-left group"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: isBooting || isProcessing ? 'not-allowed' : 'pointer',
                      opacity: isBooting ? 0.4 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isBooting && !isProcessing) {
                        (e.currentTarget as HTMLElement).style.background = `${tc.dim.replace('0.3', '0.08')}`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    <ChevronRight
                      className="w-3 h-3 mt-0.5 shrink-0 transition-transform group-hover:translate-x-0.5"
                      style={{ color: tc.text }}
                    />
                    <div className="min-w-0">
                      <div
                        className="font-bold"
                        style={{ color: tc.text }}
                      >
                        {item.cmd}
                      </div>
                      <div style={{ color: tc.dim, fontSize: '11px' }}>
                        {item.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Keyboard Shortcuts */}
              <div
                className="mt-4 pt-3"
                style={{ borderTop: `1px solid ${tc.dim}` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="w-3 h-3" style={{ color: tc.text }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: tc.text }}>
                    Shortcuts
                  </span>
                </div>
                <div className="space-y-1.5" style={{ color: tc.dim }}>
                  <div className="flex justify-between">
                    <span>Navigate history</span>
                    <div className="flex gap-1">
                      <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ background: '#1a1a1a', color: tc.text }}>↑</kbd>
                      <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ background: '#1a1a1a', color: tc.text }}>↓</kbd>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Execute command</span>
                    <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ background: '#1a1a1a', color: tc.text }}>Enter</kbd>
                  </div>
                </div>
              </div>

              {/* Theme Switcher */}
              <div
                className="mt-4 pt-3"
                style={{ borderTop: `1px solid ${tc.dim}` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="w-3 h-3" style={{ color: tc.text }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: tc.text }}>
                    Theme
                  </span>
                </div>
                <div className="flex gap-2">
                  {(['green', 'amber', 'white'] as ThemeColor[]).map(t => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className="flex-1 py-1.5 rounded text-xs font-mono transition-all"
                      style={{
                        background: theme === t ? THEME_CONFIG[t].dim.replace('0.3', '0.2') : '#111',
                        border: theme === t ? `1px solid ${THEME_CONFIG[t].text}` : '1px solid #222',
                        color: THEME_CONFIG[t].text,
                        cursor: 'pointer',
                        textShadow: theme === t ? `0 0 8px ${THEME_CONFIG[t].glow}` : 'none',
                      }}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
