'use client';

import { MousePointer2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────

export interface ElementRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SelectedElement {
  tagName: string;
  id?: string;
  className?: string;
  outerHTML: string;
  innerHTML: string;
  innerText?: string;
  styles: Record<string, string>;
  attributes: Record<string, string>;
  rect: ElementRect;
}

export interface SelectElementConfig {
  highlightColor?: string;
  highlightBg?: string;
  maxHtmlLength?: number;
  maxTextLength?: number;
  styleProperties?: string[];
  smallTags?: string[];
  showTooltip?: boolean;
  useOverlay?: boolean;
  tooltipHint?: string;
  parentNavigateHint?: string;
  originalNavigateHint?: string;
  autoSelectHint?: (tag: string) => string;
  onSelect?: (element: SelectedElement) => void;
  onCancel?: () => void;
}

// ─── Default Config ───────────────────────────────────────────────────

const DEFAULT_CONFIG: Required<Omit<SelectElementConfig, 'onSelect' | 'onCancel'>> = {
  highlightColor: '#89b4fa',
  highlightBg: 'rgba(137, 180, 250, 0.15)',
  maxHtmlLength: 2000,
  maxTextLength: 200,
  styleProperties: [
    'display', 'position', 'flexDirection', 'alignItems', 'justifyContent',
    'padding', 'margin', 'width', 'height', 'backgroundColor', 'color',
    'fontSize', 'fontFamily', 'border', 'borderRadius', 'overflow',
    'zIndex', 'opacity', 'gap', 'boxShadow', 'gridTemplateColumns',
  ],
  smallTags: ['span', 'svg', 'path', 'use', 'img', 'i', 'small', 'strong', 'em', 'b', 'a', 'button'],
  showTooltip: true,
  useOverlay: false,
  tooltipHint: 'Click to select | Up/Down - parent/child | Esc to cancel',
  parentNavigateHint: 'Navigated to parent',
  originalNavigateHint: 'Navigated to original',
  autoSelectHint: (tag: string) => `Auto-selected from <${tag}> (Down - original)`,
};

// ─── useSelectElement Hook ────────────────────────────────────────────

export function useSelectElement(config: SelectElementConfig = {}) {
  const [isActive, setIsActive] = React.useState(false);
  const [selectedElement, setSelectedElement] = React.useState<SelectedElement | null>(null);

  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  const hoveredElementRef = React.useRef<HTMLElement | null>(null);
  const currentElementRef = React.useRef<HTMLElement | null>(null);
  const originalElementRef = React.useRef<HTMLElement | null>(null);
  const tooltipRef = React.useRef<HTMLDivElement | null>(null);
  const styleRef = React.useRef<HTMLStyleElement | null>(null);
  const overlayRef = React.useRef<HTMLDivElement | null>(null);
  const highlightRef = React.useRef<HTMLDivElement | null>(null);
  const lastSelectionTimeRef = React.useRef(0);

  const findSmartParent = React.useCallback((el: HTMLElement): HTMLElement => {
    const tagName = el.tagName.toLowerCase();
    const rect = el.getBoundingClientRect();
    const isSmall = rect.width < 60 || rect.height < 30;
    const isSmallTag = mergedConfig.smallTags.includes(tagName);

    if ((isSmall || isSmallTag) && el.parentElement) {
      const parent = el.parentElement;
      const parentClasses = typeof parent.className === 'string' ? parent.className : '';
      const isContainer =
        parentClasses.includes('flex') || parentClasses.includes('grid') ||
        parentClasses.includes('button') || parentClasses.includes('badge') ||
        parentClasses.includes('card') || parentClasses.includes('rounded') ||
        parent.tagName.toLowerCase() === 'button' ||
        parent.getAttribute('role') === 'button';
      if (isContainer) return parent;
    }
    return el;
  }, [mergedConfig.smallTags]);

  const getComputedStyles = React.useCallback((element: Element): Record<string, string> => {
    const styles = window.getComputedStyle(element);
    const result: Record<string, string> = {};
    for (const prop of mergedConfig.styleProperties) {
      const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
      const value = styles.getPropertyValue(cssProp);
      if (value) result[prop] = value;
    }
    return result;
  }, [mergedConfig.styleProperties]);

  const getAttributes = React.useCallback((element: Element): Record<string, string> => {
    const attrs: Record<string, string> = {};
    for (const attr of Array.from(element.attributes)) attrs[attr.name] = attr.value;
    return attrs;
  }, []);

  const extractElementInfo = React.useCallback((element: HTMLElement): SelectedElement => {
    const rect = element.getBoundingClientRect();
    const styles = getComputedStyles(element);
    const attributes = getAttributes(element);
    const classNameStr = typeof element.className === 'string'
      ? element.className : element.className?.baseVal || '';
    const cleanClassName = classNameStr
      .replace('select-element-highlight', '').replace('select-element-hovered', '').trim();

    return {
      tagName: element.tagName.toLowerCase(),
      id: element.id || undefined,
      className: cleanClassName || undefined,
      outerHTML: element.outerHTML.replace(/ select-element-highlight/g, '').replace(/ select-element-hovered/g, '').slice(0, mergedConfig.maxHtmlLength),
      innerHTML: element.innerHTML.slice(0, mergedConfig.maxHtmlLength),
      innerText: element.textContent?.substring(0, mergedConfig.maxTextLength) || undefined,
      styles,
      attributes,
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
    };
  }, [getComputedStyles, getAttributes, mergedConfig.maxHtmlLength, mergedConfig.maxTextLength]);

  const updateTooltip = React.useCallback((element: HTMLElement, e: MouseEvent, parentHint = '') => {
    if (!tooltipRef.current || !mergedConfig.showTooltip) return;
    const tooltip = tooltipRef.current;
    const tagName = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const classStr = typeof element.className === 'string'
      ? element.className.replace('select-element-highlight', '').trim().split(' ').slice(0, 3).filter(Boolean).map(c => `.${c}`).join('')
      : '';
    const rect = element.getBoundingClientRect();

    const tagEl = tooltip.querySelector('.se-tip-tag');
    if (tagEl) tagEl.innerHTML = `<span class="se-tip-tag">&lt;${tagName}&gt;</span>${id ? `<span class="se-tip-id">${id}</span>` : ''}${classStr ? `<span class="se-tip-class">${classStr}</span>` : ''}`;
    const dimsEl = tooltip.querySelector('.se-tip-dims');
    if (dimsEl) dimsEl.innerHTML = `${Math.round(rect.width)} x ${Math.round(rect.height)} px`;
    const parentEl = tooltip.querySelector('.se-tip-parent');
    if (parentEl) parentEl.innerHTML = parentHint;

    let tx = e.clientX + 15, ty = e.clientY + 15;
    if (tx + 370 > window.innerWidth) tx = e.clientX - 370;
    if (ty + 120 > window.innerHeight) ty = e.clientY - 120;
    tooltip.style.left = `${tx}px`;
    tooltip.style.top = `${ty}px`;
    tooltip.style.display = 'block';
  }, [mergedConfig.showTooltip]);

  const updateOverlayHighlight = React.useCallback((element: HTMLElement) => {
    if (!highlightRef.current || !mergedConfig.useOverlay) return;
    const rect = element.getBoundingClientRect();
    const h = highlightRef.current;
    h.style.left = `${rect.left}px`; h.style.top = `${rect.top}px`;
    h.style.width = `${rect.width}px`; h.style.height = `${rect.height}px`;
    h.style.display = 'block';
  }, [mergedConfig.useOverlay]);

  const cleanup = React.useCallback(() => {
    if (hoveredElementRef.current && !mergedConfig.useOverlay) {
      hoveredElementRef.current.classList.remove('select-element-highlight');
    }
    [styleRef, tooltipRef, overlayRef, highlightRef].forEach(ref => {
      if (ref.current) { ref.current.remove(); ref.current = null; }
    });
    hoveredElementRef.current = null;
    currentElementRef.current = null;
    originalElementRef.current = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    lastSelectionTimeRef.current = 0;
  }, [mergedConfig.useOverlay]);

  const activate = React.useCallback(() => setIsActive(true), []);
  const deactivate = React.useCallback(() => { setIsActive(false); setSelectedElement(null); }, []);

  React.useEffect(() => {
    if (!isActive) { cleanup(); return; }

    const style = document.createElement('style');
    style.id = 'select-element-styles';
    style.textContent = `
      ${mergedConfig.useOverlay ? '' : `.select-element-highlight { outline: 2px solid ${mergedConfig.highlightColor} !important; outline-offset: -2px !important; background-color: ${mergedConfig.highlightBg} !important; box-shadow: 0 0 0 4px rgba(137, 180, 250, 0.3) !important; }`}
      .se-tooltip { position: fixed !important; z-index: 999999 !important; background: #1e1e2e !important; border: 1px solid ${mergedConfig.highlightColor} !important; border-radius: 6px !important; padding: 8px 12px !important; font-family: 'JetBrains Mono', 'Consolas', monospace !important; font-size: 11px !important; color: #cdd6f4 !important; pointer-events: none !important; max-width: 350px !important; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important; }
      .se-tip-tag { color: #a6e3a1 !important; font-weight: bold !important; }
      .se-tip-id { color: #f9e2af !important; }
      .se-tip-class { color: ${mergedConfig.highlightColor} !important; }
      .se-tip-dims { color: #94e2d5 !important; margin-left: 8px !important; }
      .se-tip-hint { color: #6c7086 !important; margin-top: 4px !important; font-size: 10px !important; }
      .se-tip-parent { color: #a6adc8 !important; font-size: 10px !important; margin-top: 2px !important; padding-top: 4px !important; border-top: 1px solid #313244 !important; }
      .se-overlay { position: fixed !important; inset: 0 !important; z-index: 999998 !important; cursor: crosshair !important; background: transparent !important; }
      .se-highlight-box { position: fixed !important; pointer-events: none !important; z-index: 999997 !important; border: 2px solid ${mergedConfig.highlightColor} !important; background: ${mergedConfig.highlightBg} !important; transition: all 0.1s ease !important; border-radius: 2px !important; }
    `;
    document.head.appendChild(style);
    styleRef.current = style;

    if (mergedConfig.useOverlay) {
      const overlay = document.createElement('div');
      overlay.className = 'se-overlay';
      document.body.appendChild(overlay);
      overlayRef.current = overlay;
      const highlight = document.createElement('div');
      highlight.className = 'se-highlight-box';
      document.body.appendChild(highlight);
      highlightRef.current = highlight;
      document.body.style.cursor = 'crosshair';
      document.body.style.userSelect = 'none';
    }

    if (mergedConfig.showTooltip) {
      const tooltip = document.createElement('div');
      tooltip.className = 'se-tooltip';
      tooltip.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;"><span class="se-tip-tag"></span><span class="se-tip-dims"></span></div><div class="se-tip-parent"></div><div class="se-tip-hint">${mergedConfig.tooltipHint}</div>`;
      document.body.appendChild(tooltip);
      tooltipRef.current = tooltip;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (mergedConfig.useOverlay && (target === overlayRef.current || target === highlightRef.current)) return;
      if (tooltipRef.current && (target === tooltipRef.current || tooltipRef.current.contains(target))) return;

      const smartTarget = findSmartParent(target);
      if (hoveredElementRef.current === smartTarget) {
        if (tooltipRef.current && mergedConfig.showTooltip) updateTooltip(smartTarget, e);
        return;
      }

      if (hoveredElementRef.current && !mergedConfig.useOverlay) hoveredElementRef.current.classList.remove('select-element-highlight');
      if (!mergedConfig.useOverlay) smartTarget.classList.add('select-element-highlight');

      hoveredElementRef.current = smartTarget;
      currentElementRef.current = smartTarget;
      originalElementRef.current = target;

      if (mergedConfig.useOverlay) updateOverlayHighlight(smartTarget);

      let parentHint = '';
      if (smartTarget !== target) parentHint = mergedConfig.autoSelectHint(target.tagName.toLowerCase());
      if (mergedConfig.showTooltip) updateTooltip(smartTarget, e, parentHint);
    };

    const handleClick = (e: MouseEvent) => {
      if (!isActive) return;
      const now = Date.now();
      if (now - lastSelectionTimeRef.current < 500) return;
      lastSelectionTimeRef.current = now;

      const target = e.target as HTMLElement;
      if (mergedConfig.useOverlay && (target === overlayRef.current || target === highlightRef.current)) return;
      if (tooltipRef.current && (target === tooltipRef.current || tooltipRef.current.contains(target))) return;

      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();

      const elementToSelect = hoveredElementRef.current || target;
      const elementInfo = extractElementInfo(elementToSelect);
      setSelectedElement(elementInfo);
      config.onSelect?.(elementInfo);
      cleanup();
      setIsActive(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cleanup();
        setIsActive(false);
        config.onCancel?.();
      } else if (e.key === 'ArrowUp' && currentElementRef.current?.parentElement) {
        e.preventDefault();
        const parent = currentElementRef.current.parentElement;
        if (parent && parent !== document.body && parent !== document.documentElement) {
          if (!mergedConfig.useOverlay && hoveredElementRef.current) hoveredElementRef.current.classList.remove('select-element-highlight');
          hoveredElementRef.current = parent; currentElementRef.current = parent;
          if (!mergedConfig.useOverlay) parent.classList.add('select-element-highlight');
          if (mergedConfig.useOverlay) updateOverlayHighlight(parent);
          if (tooltipRef.current && mergedConfig.showTooltip) {
            const tn = parent.tagName.toLowerCase(), id = parent.id ? `#${parent.id}` : '';
            const cs = typeof parent.className === 'string' ? parent.className.replace('select-element-highlight', '').trim().split(' ').slice(0, 3).filter(Boolean).map(c => `.${c}`).join('') : '';
            const tagEl = tooltipRef.current.querySelector('.se-tip-tag');
            if (tagEl) tagEl.innerHTML = `<span class="se-tip-tag">&lt;${tn}&gt;</span>${id ? `<span class="se-tip-id">${id}</span>` : ''}${cs ? `<span class="se-tip-class">${cs}</span>` : ''}`;
            const dimsEl = tooltipRef.current.querySelector('.se-tip-dims');
            if (dimsEl) { const r = parent.getBoundingClientRect(); dimsEl.innerHTML = `${Math.round(r.width)} x ${Math.round(r.height)} px`; }
            const parentEl = tooltipRef.current.querySelector('.se-tip-parent');
            if (parentEl) parentEl.innerHTML = mergedConfig.parentNavigateHint;
          }
        }
      } else if (e.key === 'ArrowDown' && currentElementRef.current && originalElementRef.current) {
        e.preventDefault();
        if (!mergedConfig.useOverlay && hoveredElementRef.current) hoveredElementRef.current.classList.remove('select-element-highlight');
        hoveredElementRef.current = originalElementRef.current; currentElementRef.current = originalElementRef.current;
        if (!mergedConfig.useOverlay) originalElementRef.current.classList.add('select-element-highlight');
        if (mergedConfig.useOverlay) updateOverlayHighlight(originalElementRef.current);
        if (tooltipRef.current && mergedConfig.showTooltip) {
          const tn = originalElementRef.current.tagName.toLowerCase(), id = originalElementRef.current.id ? `#${originalElementRef.current.id}` : '';
          const cs = typeof originalElementRef.current.className === 'string' ? originalElementRef.current.className.replace('select-element-highlight', '').trim().split(' ').slice(0, 3).filter(Boolean).map(c => `.${c}`).join('') : '';
          const tagEl = tooltipRef.current.querySelector('.se-tip-tag');
          if (tagEl) tagEl.innerHTML = `<span class="se-tip-tag">&lt;${tn}&gt;</span>${id ? `<span class="se-tip-id">${id}</span>` : ''}${cs ? `<span class="se-tip-class">${cs}</span>` : ''}`;
          const parentEl = tooltipRef.current.querySelector('.se-tip-parent');
          if (parentEl) parentEl.innerHTML = mergedConfig.originalNavigateHint;
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      cleanup();
    };
  }, [isActive, mergedConfig, findSmartParent, extractElementInfo, updateTooltip, updateOverlayHighlight, cleanup, config]);

  return { isActive, selectedElement, activate, deactivate, setSelectedElement };
}

// ─── Presets ──────────────────────────────────────────────────────────

export const PRESETS = {
  devtools: { useOverlay: true, showTooltip: true, highlightColor: '#3b82f6', highlightBg: 'rgba(59, 130, 246, 0.15)' },
  minimal: { showTooltip: false, useOverlay: false, highlightColor: '#22c55e', highlightBg: 'rgba(34, 197, 94, 0.15)' },
  figma: { useOverlay: true, showTooltip: true, highlightColor: '#a855f7', highlightBg: 'rgba(168, 85, 247, 0.15)' },
  testing: { highlightColor: '#ef4444', highlightBg: 'rgba(239, 68, 68, 0.15)', showTooltip: true, maxHtmlLength: 10000, maxTextLength: 1000 },
} as const;

export type PresetName = keyof typeof PRESETS;

// ─── Button Component ────────────────────────────────────────────────

interface SelectElementButtonProps extends SelectElementConfig {
  className?: string;
  style?: React.CSSProperties;
  showLabel?: boolean;
  label?: string;
  activeLabel?: string;
  activeColor?: string;
  defaultColor?: string;
  textColor?: string;
  onElementSelect?: (element: SelectedElement) => void;
}

export function SelectElementButton({
  className = '',
  style,
  showLabel = false,
  label = 'Select Element',
  activeLabel = 'Selecting...',
  activeColor = '#f38ba8',
  defaultColor = '#89b4fa',
  textColor = '#1e1e2e',
  onElementSelect,
  ...config
}: SelectElementButtonProps) {
  const { isActive, activate, deactivate } = useSelectElement({
    ...config,
    onSelect: onElementSelect,
  });

  return (
    <button
      onClick={() => isActive ? deactivate() : activate()}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${className}`}
      style={{ backgroundColor: isActive ? activeColor : defaultColor, color: textColor, fontWeight: 500, ...style }}
    >
      <MousePointer2 className="w-4 h-4" />
      {showLabel && <span>{isActive ? activeLabel : label}</span>}
    </button>
  );
}

export default SelectElementButton;
