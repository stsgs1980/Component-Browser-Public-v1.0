
import { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronDown, Sun, Moon, Check } from 'lucide-react';
import {
  hslToHex, hexToHsl, hexToRgb, rgbToHex, generateColorVariants,
  HTML_COLORS, PRESETS, PRESET_GROUPS, getHtmlColorName, getHtmlColorByName
} from './color-utils';

// ─── Hue Slider ─────────────────────────────────────────────────────────────
function HueSlider({ hue, onChange }: { hue: number; onChange: (h: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const getHue = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    onChange(Math.round((x / rect.width) * 360));
  }, [onChange]);
  const onMouseDown = (e: React.MouseEvent) => { dragging.current = true; getHue(e); };
  useEffect(() => {
    const move = (e: MouseEvent) => { if (dragging.current) getHue(e); };
    const up = () => { dragging.current = false; };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [getHue]);
  return (
    <div ref={ref} className="relative h-4 rounded-full cursor-pointer select-none"
      style={{ background: 'linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)' }}
      onMouseDown={onMouseDown}>
      <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md"
        style={{ left: `calc(${(hue / 360) * 100}% - 8px)`, background: `hsl(${hue},100%,50%)` }} />
    </div>
  );
}

// ─── SL Canvas ──────────────────────────────────────────────────────────────
function SLCanvas({ hue, saturation, lightness, onChangeSL }: {
  hue: number; saturation: number; lightness: number;
  onChangeSL: (s: number, l: number) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const dragging = useRef(false);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const w = canvas.width, h = canvas.height;
    const gradH = ctx.createLinearGradient(0, 0, w, 0);
    gradH.addColorStop(0, 'hsl(0,0%,100%)');
    gradH.addColorStop(1, `hsl(${hue},100%,50%)`);
    ctx.fillStyle = gradH; ctx.fillRect(0, 0, w, h);
    const gradV = ctx.createLinearGradient(0, 0, 0, h);
    gradV.addColorStop(0, 'rgba(0,0,0,0)');
    gradV.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = gradV; ctx.fillRect(0, 0, w, h);
  }, [hue]);
  const getPos = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    const s = Math.round((x / rect.width) * 100);
    const bright = 1 - y / rect.height;
    const l = Math.round(bright * (1 - s / 200) * 100);
    const denom = 1 - Math.abs(2 * l / 100 - 1);
    const sHsl = denom === 0 ? 0 : Math.round(Math.min((s / 100 * bright) / denom * 100, 100));
    onChangeSL(sHsl, l);
  }, [onChangeSL]);
  const onMouseDown = (e: React.MouseEvent) => { dragging.current = true; getPos(e); };
  useEffect(() => {
    const move = (e: MouseEvent) => { if (dragging.current) getPos(e); };
    const up = () => { dragging.current = false; };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [getPos]);
  const bright = lightness / 100 + (saturation / 100) * (lightness / 100) / (1 - Math.abs(2 * lightness / 100 - 1) || 0.001);
  const sbSat = bright === 0 ? 0 : (2 * (bright - lightness / 100)) / bright;
  const cx = Math.min(Math.max(sbSat * 100, 0), 100);
  const cy = Math.min(Math.max((1 - Math.min(bright, 1)) * 100, 0), 100);
  return (
    <div className="relative">
      <canvas ref={ref} width={200} height={150}
        className="rounded cursor-crosshair w-full block" onMouseDown={onMouseDown} />
      <div className="absolute w-4 h-4 rounded-full border-2 border-white shadow pointer-events-none"
        style={{ left: `calc(${cx}% - 8px)`, top: `calc(${cy}% - 8px)`, background: hslToHex(hue, saturation, lightness) }} />
    </div>
  );
}

// ─── SL Canvas + Axes ───────────────────────────────────────────────────────
function SLCanvasWithAxes({ hue, saturation, lightness, onChangeSL, sub, txt }: {
  hue: number; saturation: number; lightness: number;
  onChangeSL: (s: number, l: number) => void;
  sub: string; txt: string;
}) {
  return (
    <div>
      <div className="text-xs mb-1 text-center italic" style={{ color: sub }}>
        Схема: <span style={{ color: txt }}>Насыщенность/Яркость</span>
      </div>
      <div className="flex items-stretch gap-1">
        <div className="flex flex-col items-center justify-between" style={{ width: 14 }}>
          <span className="text-xs" style={{ color: sub }}>+</span>
          <span className="text-xs" style={{ color: sub, writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>яркость</span>
          <span className="text-xs" style={{ color: sub }}>−</span>
        </div>
        <div className="flex-1">
          <SLCanvas hue={hue} saturation={saturation} lightness={lightness} onChangeSL={onChangeSL} />
          <div className="flex justify-between mt-1">
            <span className="text-xs" style={{ color: sub }}>−</span>
            <span className="text-xs" style={{ color: sub }}>насыщенность</span>
            <span className="text-xs" style={{ color: sub }}>+</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Generic Slider ──────────────────────────────────────────────────────────
function Slider({ value, min, max, onChange, gradient, accentHex }: {
  value: number; min: number; max: number; onChange: (v: number) => void;
  gradient?: string; accentHex?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const getVal = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    onChange(Math.round(min + (x / rect.width) * (max - min)));
  }, [min, max, onChange]);
  const onMouseDown = (e: React.MouseEvent) => { dragging.current = true; getVal(e); };
  useEffect(() => {
    const move = (e: MouseEvent) => { if (dragging.current) getVal(e); };
    const up = () => { dragging.current = false; };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [getVal]);
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div ref={ref} className="relative h-3 rounded-full cursor-pointer select-none"
      style={{ background: gradient || '#374151' }} onMouseDown={onMouseDown}>
      <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md"
        style={{ left: `calc(${pct}% - 8px)`, background: accentHex || '#3b82f6' }} />
    </div>
  );
}

// ─── Contrast Canvas + Axes ──────────────────────────────────────────────────
function ContrastCanvasWithAxes({ mainHex, corrSaturation, corrLightness, sub, txt }: {
  mainHex: string; corrSaturation: number; corrLightness: number; sub: string; txt: string;
}) {
  return (
    <div>
      <div className="text-xs mb-1 text-center italic" style={{ color: sub }}>
        Схема: <span style={{ color: txt }}>Контрастность</span>
      </div>
      <div className="flex items-stretch gap-1">
        <div className="flex flex-col items-center justify-between" style={{ width: 14 }}>
          <span className="text-xs" style={{ color: sub }}>+</span>
          <span className="text-xs" style={{ color: sub, writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>тень</span>
          <span className="text-xs" style={{ color: sub }}>−</span>
        </div>
        <div className="flex-1">
          <div className="relative rounded overflow-hidden" style={{ width: '100%', height: 150 }}>
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 35%, #0f3460 65%, #533483 100%)' }} />
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)' }} />
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.5) 100%)' }} />
            <div className="absolute w-5 h-5 rounded-full border-2 border-white"
              style={{
                left: `calc(${corrSaturation / 150 * 100}% - 10px)`,
                top: `calc(${(1 - corrLightness / 150) * 100}% - 10px)`,
                background: mainHex, boxShadow: '0 0 0 1px rgba(0,0,0,0.4)'
              }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs" style={{ color: sub }}>−</span>
            <span className="text-xs" style={{ color: sub }}>свет</span>
            <span className="text-xs" style={{ color: sub }}>+</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Theme Preview ───────────────────────────────────────────────────────────
function ThemePreview({ variants, isDark }: { variants: string[]; isDark: boolean }) {
  const bg = isDark ? '#0f172a' : '#ffffff';
  const surface = isDark ? '#1e293b' : '#f8fafc';
  const text = isDark ? '#e2e8f0' : '#1e293b';
  const subtext = isDark ? '#94a3b8' : '#64748b';
  const accent = variants[2];
  const accentLight = variants[0];
  const accentDark = variants[3];
  return (
    <div className="rounded-lg overflow-hidden text-sm" style={{ background: bg, color: text, border: `1px solid ${accentDark}` }}>
      <div className="px-4 py-3 flex justify-between items-start" style={{ background: accent }}>
        <span className="italic text-white" style={{ fontSize: 16 }}>lorem ipsum</span>
        <div className="text-right text-white text-xs opacity-90"><div>DUIS AUTE</div><div>IRURE DOLOR</div></div>
      </div>
      <div className="flex gap-1 px-3 py-1" style={{ background: accentDark }}>
        {variants.map((c, i) => <div key={i} className="h-1.5 flex-1 rounded-sm" style={{ background: c }} />)}
      </div>
      <div className="flex gap-3 p-3" style={{ background: bg }}>
        <div className="flex-1 space-y-2">
          <div>
            <div className="mb-0.5 text-xs" style={{ color: accent }}>Mollit Anim</div>
            <p className="text-xs leading-relaxed" style={{ color: text }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          </div>
          <div>
            <div className="mb-0.5 text-xs" style={{ color: subtext }}>Lorem</div>
            <p className="text-xs" style={{ color: text }}>Duis aute irure dolor in reprehenderit in voluptate velit.</p>
          </div>
          <div className="rounded p-2 flex gap-2 items-start" style={{ border: `1px solid ${accentLight}`, background: surface }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs" style={{ border: `1px solid ${accent}`, color: accent }}>⏰</div>
            <div className="text-xs" style={{ color: subtext }}>
              <div className="mb-0.5">Duis aute irure dolor</div>
              <div style={{ color: text }}>• Lorem ipsum<br />• Dolor sit amet<br />• Consectetur adipiscing</div>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-2">
              <div className="w-2.5 h-2.5 mt-0.5 flex-shrink-0 rounded-sm" style={{ background: accentDark }} />
              <div className="text-xs">
                <div className="mb-0.5" style={{ color: accent }}>Lorem ipsum dolor sit amet</div>
                <div className="text-xs mb-0.5" style={{ color: subtext }}>Duis aute</div>
                <p style={{ color: text }}>Lorem ipsum dolor sit amet, sed do eiusmod.</p>
                {i === 2 && <div className="mt-1 px-2 py-1 rounded text-xs text-white" style={{ background: accentDark }}>Adipiscing elit sed do eiusmod tempor.</div>}
                <div className="mt-0.5 text-xs" style={{ color: accent }}>ut labore »</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="h-1.5" style={{ background: accent }} />
    </div>
  );
}

// ─── Color Name Autocomplete ─────────────────────────────────────────────────
function ColorNameInput({ value, onChange, panelInput, panelInputBorder, panelText, panelSubtext, accentHex }: {
  value: string; onChange: (hex: string) => void;
  panelInput: string; panelInputBorder: string; panelText: string; panelSubtext: string; accentHex: string;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  useEffect(() => { setQuery(value); }, [value]);
  const filtered = query.length >= 2
    ? HTML_COLORS.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];
  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Имя цвета..."
        className="w-full px-2 py-1.5 rounded text-xs outline-none"
        style={{ background: panelInput, border: `1px solid ${panelInputBorder}`, color: panelText }}
      />
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-0.5 rounded shadow-xl z-20 overflow-hidden"
          style={{ background: panelInput, border: `1px solid ${panelInputBorder}` }}>
          {filtered.map(c => (
            <button key={c.name} className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-left hover:opacity-80"
              style={{ color: panelText }}
              onMouseDown={() => { onChange(c.hex); setQuery(c.name); setOpen(false); }}>
              <div className="w-4 h-4 rounded-sm flex-shrink-0 border" style={{ background: c.hex, borderColor: panelInputBorder }} />
              {c.name}
              <span className="ml-auto font-mono" style={{ color: panelSubtext }}>{c.hex}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Panel ──────────────────────────────────────────────────────────────
export default function ColorPickerPanel() {
  const [appTheme, setAppTheme] = useState<'dark' | 'light'>('light');
  const [tab, setTab] = useState<'palettes' | 'correction'>('palettes');
  const [hue, setHue] = useState(228);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [presetOpen, setPresetOpen] = useState(false);
  const [hexInput, setHexInput] = useState('#0000FF');
  const [rgbInput, setRgbInput] = useState('0, 0, 255');
  const [corrSaturation, setCorrSaturation] = useState(75);
  const [corrLightness, setCorrLightness] = useState(75);
  const [previewMode, setPreviewMode] = useState<'scheme' | 'light' | 'dark'>('dark');

  const variants = generateColorVariants(hue, saturation, lightness);
  const mainHex = hslToHex(hue, saturation, lightness);
  const htmlColorName = getHtmlColorName(mainHex);

  const isDark = appTheme === 'dark';
  const outerBg = isDark ? '#0f172a' : '#e8edf5';
  const panelBg = isDark ? '#1a2235' : '#ffffff';
  const panelSurface = isDark ? '#1e2d42' : '#f8fafc';
  const panelBorder = isDark ? '#2d3f55' : '#dde3ee';
  const panelText = isDark ? '#e2e8f0' : '#1e293b';
  const panelSubtext = isDark ? '#8899aa' : '#64748b';
  const panelInput = isDark ? '#253347' : '#f1f5f9';
  const panelInputBorder = isDark ? '#3a4f66' : '#cbd5e1';
  const tabActive = isDark ? '#e2e8f0' : '#1e293b';
  const tabInactive = isDark ? '#5a7088' : '#94a3b8';

  // Sync hex/rgb inputs when main color changes
  useEffect(() => {
    setHexInput(mainHex);
    const [r, g, b] = hexToRgb(mainHex);
    setRgbInput(`${r}, ${g}, ${b}`);
  }, [mainHex]);

  const applyHex = (val: string) => {
    const clean = val.startsWith('#') ? val : '#' + val;
    if (/^#[0-9A-Fa-f]{6}$/.test(clean)) {
      const [h, s, l] = hexToHsl(clean);
      setHue(h); setSaturation(s); setLightness(l);
    }
  };

  const applyRgb = (val: string) => {
    const parts = val.split(',').map(s => parseInt(s.trim()));
    if (parts.length === 3 && parts.every(p => !isNaN(p))) {
      const hex = rgbToHex(parts[0], parts[1], parts[2]);
      const [h, s, l] = hexToHsl(hex);
      setHue(h); setSaturation(s); setLightness(l);
    }
  };

  const applyPreset = (idx: number) => {
    const p = PRESETS[idx];
    setSelectedPreset(idx);
    setHue(p.h); setSaturation(p.s); setLightness(p.l);
    setPresetOpen(false);
  };

  const corrVariants = variants.map(hex => {
    const [h, s, l] = hexToHsl(hex);
    return hslToHex(h, Math.round(s * corrSaturation / 100), Math.min(Math.round(l * corrLightness / 75), 95));
  });

  return (
    <div className="min-h-screen p-4 transition-colors" style={{ background: outerBg }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 max-w-7xl mx-auto">
        <h1 className="text-lg" style={{ color: panelText }}>Составная панель выбора цветов</h1>
        <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: panelBg, border: `1px solid ${panelBorder}` }}>
          <button onClick={() => setAppTheme('light')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all"
            style={{ background: appTheme === 'light' ? mainHex : 'transparent', color: appTheme === 'light' ? '#fff' : panelSubtext }}>
            <Sun size={12} /> Светлая
          </button>
          <button onClick={() => setAppTheme('dark')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all"
            style={{ background: appTheme === 'dark' ? mainHex : 'transparent', color: appTheme === 'dark' ? '#fff' : panelSubtext }}>
            <Moon size={12} /> Тёмная
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="max-w-7xl mx-auto flex gap-4 items-start">

        {/* ── LEFT: Picker Panel ── */}
        <div className="flex-1 min-w-0 rounded-xl overflow-hidden" style={{ background: panelBg, border: `1px solid ${panelBorder}` }}>
          {/* Tabs */}
          <div className="flex border-b px-4" style={{ borderColor: panelBorder }}>
            {[{ id: 'palettes', label: 'Палитры' }, { id: 'correction', label: 'Коррекция Вариантов' }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id as any)}
                className="px-4 py-2.5 text-xs relative transition-colors"
                style={{ color: tab === t.id ? tabActive : tabInactive }}>
                {t.label}
                {tab === t.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: mainHex }} />}
              </button>
            ))}
          </div>

          {/* Tab: Палитры */}
          {tab === 'palettes' && (
            <div className="p-4 space-y-3">
              <div className="flex gap-4">
                {/* Left col */}
                <div className="flex-1 min-w-0 space-y-3">

                  {/* Preset */}
                  <div>
                    <div className="text-xs mb-1" style={{ color: panelSubtext }}>Пресет:</div>
                    <div className="relative">
                      <button onClick={() => setPresetOpen(!presetOpen)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs"
                        style={{ background: panelInput, border: `1px solid ${panelInputBorder}`, color: panelText }}>
                        {PRESETS[selectedPreset].name}
                        <ChevronDown size={12} className={`flex-shrink-0 transition-transform ${presetOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {presetOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg z-20 shadow-xl overflow-y-auto"
                          style={{ background: panelInput, border: `1px solid ${panelInputBorder}`, maxHeight: 280 }}>
                          {PRESET_GROUPS.map((group, gi) => {
                            const offset = PRESET_GROUPS.slice(0, gi).reduce((acc, g) => acc + g.items.length, 0);
                            return (
                              <div key={gi}>
                                {group.group && (
                                  <div className="px-3 pt-2 pb-0.5 text-xs" style={{ color: panelText }}>{group.group}</div>
                                )}
                                {group.items.map((p, ii) => {
                                  const idx = offset + ii;
                                  return (
                                    <button key={idx} onClick={() => applyPreset(idx)}
                                      className="w-full flex items-center py-1.5 text-xs text-left hover:opacity-80 transition-opacity"
                                      style={{
                                        paddingLeft: group.group ? 20 : 12, paddingRight: 12,
                                        color: idx === selectedPreset ? mainHex : panelSubtext,
                                        background: idx === selectedPreset ? `${panelBorder}55` : 'transparent',
                                      }}>
                                      {p.name}
                                      {idx === selectedPreset && <Check size={10} className="ml-auto flex-shrink-0" />}
                                    </button>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Main color — name */}
                  <div>
                    <div className="text-xs mb-1" style={{ color: panelSubtext }}>
                      Основной цвет: <span style={{ color: panelText }}>{htmlColorName}</span>
                    </div>

                    {/* Color swatch row */}
                    <div className="flex gap-2 mb-2">
                      <div className="w-10 h-10 rounded-lg flex-shrink-0 border" style={{ background: mainHex, borderColor: panelBorder }} />
                      <div className="flex-1 space-y-1.5">
                        {/* HEX input */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs w-8 flex-shrink-0" style={{ color: panelSubtext }}>HEX</span>
                          <input type="text" value={hexInput}
                            onChange={e => setHexInput(e.target.value)}
                            onBlur={e => applyHex(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyHex(hexInput)}
                            className="flex-1 px-2 py-1 rounded text-xs font-mono outline-none"
                            style={{ background: panelInput, border: `1px solid ${panelInputBorder}`, color: panelText }} />
                        </div>
                        {/* RGB input */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs w-8 flex-shrink-0" style={{ color: panelSubtext }}>RGB</span>
                          <input type="text" value={rgbInput}
                            onChange={e => setRgbInput(e.target.value)}
                            onBlur={e => applyRgb(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyRgb(rgbInput)}
                            className="flex-1 px-2 py-1 rounded text-xs font-mono outline-none"
                            style={{ background: panelInput, border: `1px solid ${panelInputBorder}`, color: panelText }} />
                        </div>
                      </div>
                    </div>

                    {/* Color name autocomplete */}
                    <ColorNameInput
                      value={htmlColorName}
                      onChange={hex => { applyHex(hex); }}
                      panelInput={panelInput} panelInputBorder={panelInputBorder}
                      panelText={panelText} panelSubtext={panelSubtext} accentHex={mainHex}
                    />
                  </div>

                  {/* Color variants list */}
                  <div className="space-y-1">
                    {['Базовый цвет', 'Вариант 1', 'Вариант 2', 'Вариант 3', 'Вариант 4'].map((name, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md flex-shrink-0" style={{ background: variants[i] }} />
                        <span className="text-xs" style={{ color: panelSubtext }}>{name}</span>
                        <span className="text-xs ml-auto font-mono" style={{ color: panelSubtext }}>{variants[i]}</span>
                      </div>
                    ))}
                  </div>

                  {/* Hue slider */}
                  <div>
                    <div className="text-xs mb-1.5" style={{ color: panelSubtext }}>Оттенок: <span style={{ color: panelText }}>{hue}°</span></div>
                    <HueSlider hue={hue} onChange={h => setHue(h)} />
                  </div>
                </div>

                {/* Right col: SL Canvas */}
                <div className="w-48 flex-shrink-0">
                  <SLCanvasWithAxes
                    hue={hue} saturation={saturation} lightness={lightness}
                    onChangeSL={(s, l) => { setSaturation(s); setLightness(l); }}
                    sub={panelSubtext} txt={panelText}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab: Коррекция */}
          {tab === 'correction' && (
            <div className="p-4 space-y-3">
              <div className="flex gap-4">
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="text-xs mb-1.5" style={{ color: panelSubtext }}>
                      Насыщенность: <span style={{ color: panelText }}>{corrSaturation}%</span>
                    </div>
                    <Slider value={corrSaturation} min={0} max={150} onChange={setCorrSaturation}
                      gradient={`linear-gradient(to right, hsl(${hue},0%,${lightness}%), hsl(${hue},100%,${lightness}%))`}
                      accentHex={mainHex} />
                  </div>
                  <div>
                    <div className="text-xs mb-1.5" style={{ color: panelSubtext }}>
                      Яркость: <span style={{ color: panelText }}>{corrLightness}%</span>
                    </div>
                    <Slider value={corrLightness} min={0} max={150} onChange={setCorrLightness}
                      gradient={`linear-gradient(to right, #000, hsl(${hue},${saturation}%,50%), #fff)`}
                      accentHex={mainHex} />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs mb-1" style={{ color: panelSubtext }}>Скорректированные варианты:</div>
                    {['Базовый цвет', 'Вариант 1', 'Вариант 2', 'Вариант 3', 'Вариант 4'].map((name, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md flex-shrink-0" style={{ background: corrVariants[i] }} />
                        <span className="text-xs" style={{ color: panelSubtext }}>{name}</span>
                        <span className="text-xs ml-auto font-mono" style={{ color: panelSubtext }}>{corrVariants[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-48 flex-shrink-0">
                  <ContrastCanvasWithAxes mainHex={mainHex} corrSaturation={corrSaturation}
                    corrLightness={corrLightness} sub={panelSubtext} txt={panelText} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Preview Panel ── */}
        <div className="w-96 flex-shrink-0 rounded-xl overflow-hidden" style={{ background: panelBg, border: `1px solid ${panelBorder}` }}>
          {/* Preview header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: panelBorder }}>
            <span className="text-sm" style={{ color: panelText }}>Превью темы</span>
            <div className="flex gap-1">
              {[
                { id: 'scheme', label: 'Просмотр схемы' },
                { id: 'light', label: 'Пример светлой страницы' },
                { id: 'dark', label: 'Пример тёмной страницы' },
              ].map(m => (
                <button key={m.id} onClick={() => setPreviewMode(m.id as any)}
                  className="px-2 py-1 text-xs rounded transition-colors"
                  style={{
                    background: previewMode === m.id ? panelText : 'transparent',
                    color: previewMode === m.id ? (isDark ? '#0f172a' : '#fff') : panelSubtext,
                  }}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3">
            {previewMode === 'scheme' && (
              <div className="space-y-2">
                <div className="flex gap-1.5">
                  {variants.map((c, i) => (
                    <div key={i} className="flex-1 rounded-lg overflow-hidden" style={{ border: `1px solid ${panelBorder}` }}>
                      <div style={{ height: 60, background: c }} />
                      <div className="p-1.5" style={{ background: panelInput }}>
                        <div className="text-xs font-mono truncate" style={{ color: panelText }}>{c}</div>
                        <div className="text-xs" style={{ color: panelSubtext }}>
                          {['Светлый', 'Полусвет', 'Основной', 'Тёмный', 'Глубокий'][i]}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* HTML color row */}
                <div className="rounded-lg p-2 space-y-1" style={{ background: panelInput, border: `1px solid ${panelBorder}` }}>
                  <div className="text-xs mb-1" style={{ color: panelSubtext }}>Ближайшие HTML цвета:</div>
                  <div className="flex flex-wrap gap-1">
                    {variants.map((c, i) => {
                      const name = getHtmlColorName(c);
                      const nc = HTML_COLORS.find(h => h.name === name)?.hex || c;
                      return (
                        <div key={i} className="flex items-center gap-1 px-2 py-0.5 rounded text-xs" style={{ background: panelSurface, border: `1px solid ${panelBorder}` }}>
                          <div className="w-3 h-3 rounded-sm" style={{ background: nc }} />
                          <span style={{ color: panelSubtext }}>{name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            {previewMode === 'light' && <ThemePreview variants={variants} isDark={false} />}
            {previewMode === 'dark' && <ThemePreview variants={variants} isDark={true} />}
          </div>
        </div>

      </div>
    </div>
  );
}
