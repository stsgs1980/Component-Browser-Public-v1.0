/**
 * PreviewArea - Live layout preview with fullscreen mode
 */

'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Eye, Maximize2, Minimize2, MousePointer } from 'lucide-react';

// Preview block component
function Block({ 
  title, 
  className, 
  accent = false,
  size = 'md' 
}: { 
  title: string; 
  className?: string; 
  accent?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}) {
  const sizes = { xs: 'text-[8px]', sm: 'text-[10px]', md: 'text-xs', lg: 'text-sm' };
  
  return (
    <div 
      className={cn(
        "rounded flex items-center justify-center font-medium border border-dashed border-border/40",
        sizes[size],
        accent && "border-primary/30",
        className
      )}
      style={accent ? { backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)' } : undefined}
    >
      {title}
    </div>
  );
}

// Layout preview renderer
function LayoutPreview({ fullscreen = false }: { fullscreen?: boolean }) {
  const { selectedLayout } = useAppStore();
  
  if (!selectedLayout) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
        <MousePointer className="h-12 w-12 mb-4 opacity-30" />
        <p className="text-center font-medium">Выберите макет слева</p>
        <p className="text-center text-sm mt-2 opacity-70">
          Здесь появится интерактивный предпросмотр
        </p>
      </div>
    );
  }
  
  const structure = selectedLayout.structure;
  const cols = fullscreen ? 5 : 4;
  
  // Render different structures
  const renderLayout = () => {
    switch (structure) {
      // === BASIC ===
      case 'sidebar-left':
        return (
          <div className="h-full grid gap-1" style={{ gridTemplateColumns: '70px 1fr', gridTemplateRows: '35px 1fr 25px' }}>
            <Block title="Header" className="col-span-2" accent />
            <Block title="Nav" className="bg-muted/50" size="xs" />
            <Block title="Content" className="bg-muted/30" />
            <Block title="Footer" className="col-span-2 bg-muted/20" size="xs" />
          </div>
        );
        
      case 'sidebar-right':
        return (
          <div className="h-full grid gap-1" style={{ gridTemplateColumns: '1fr 70px', gridTemplateRows: '35px 1fr 25px' }}>
            <Block title="Header" className="col-span-2" accent />
            <Block title="Content" className="bg-muted/30" />
            <Block title="Side" className="bg-muted/50" size="xs" />
            <Block title="Footer" className="col-span-2 bg-muted/20" size="xs" />
          </div>
        );
        
      case 'top-nav':
        return (
          <div className="h-full grid gap-1" style={{ gridTemplateRows: '35px 1fr 25px' }}>
            <Block title="Navigation" accent />
            <Block title="Hero Section" className="bg-muted/30" />
            <Block title="Footer" className="bg-muted/20" size="xs" />
          </div>
        );
        
      case 'two-columns':
        return (
          <div className="h-full grid gap-1" style={{ gridTemplateColumns: '1fr 1fr', gridTemplateRows: '35px 1fr 25px' }}>
            <Block title="Header" className="col-span-2" accent />
            <Block title="Left" className="bg-muted/30" size="sm" />
            <Block title="Right" className="bg-muted/30" size="sm" />
            <Block title="Footer" className="col-span-2 bg-muted/20" size="xs" />
          </div>
        );
        
      case 'three-columns':
        return (
          <div className="h-full grid gap-1" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: '35px 1fr 25px' }}>
            <Block title="Header" className="col-span-3" accent />
            <Block title="Col 1" className="bg-muted/30" size="xs" />
            <Block title="Col 2" className="bg-muted/30" size="xs" />
            <Block title="Col 3" className="bg-muted/30" size="xs" />
            <Block title="Footer" className="col-span-3 bg-muted/20" size="xs" />
          </div>
        );
        
      // === CLASSIC ===
      case 'holy-grail':
        return (
          <div className="h-full grid gap-1" style={{ 
            gridTemplateAreas: '"header header header" "nav main aside" "footer footer footer"',
            gridTemplateColumns: '50px 1fr 50px',
            gridTemplateRows: '35px 1fr 25px'
          }}>
            <Block title="Header" style={{ gridArea: 'header' }} accent />
            <Block title="Nav" style={{ gridArea: 'nav' }} className="bg-muted/50" size="xs" />
            <Block title="Main" style={{ gridArea: 'main' }} className="bg-muted/30" />
            <Block title="Aside" style={{ gridArea: 'aside' }} className="bg-muted/50" size="xs" />
            <Block title="Footer" style={{ gridArea: 'footer' }} className="bg-muted/20" size="xs" />
          </div>
        );
        
      case 'split-screen':
        return (
          <div className="h-full grid gap-1" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <Block title="Left Panel" accent />
            <Block title="Right Panel" className="bg-muted/30" />
          </div>
        );
        
      case 'cards-grid':
        const cardCount = fullscreen ? 8 : 6;
        return (
          <div className="h-full grid gap-1" style={{ gridTemplateRows: '35px 1fr 25px' }}>
            <Block title="Header" accent />
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${fullscreen ? 4 : 3}, 1fr)` }}>
              {Array.from({ length: cardCount }).map((_, i) => (
                <Block key={i} title={`Card ${i + 1}`} className="bg-muted/30" size="xs" />
              ))}
            </div>
            <Block title="Footer" className="bg-muted/20" size="xs" />
          </div>
        );
        
      case 'magazine':
        return (
          <div className="h-full grid gap-1" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: '35px repeat(2, 1fr) 25px' }}>
            <Block title="Header" className="col-span-3" accent />
            <Block title="Featured" className="row-span-2" accent />
            <Block title="Article 1" className="bg-muted/30" size="xs" />
            <Block title="Article 2" className="bg-muted/30" size="xs" />
            <Block title="Article 3" className="bg-muted/30" size="xs" />
            <Block title="Article 4" className="bg-muted/30" size="xs" />
            <Block title="Footer" className="col-span-3 bg-muted/20" size="xs" />
          </div>
        );
        
      case 'fullscreen-hero':
        return (
          <div className="h-full grid gap-0" style={{ gridTemplateRows: '2fr 1fr' }}>
            <Block title="Full Screen Hero (100vh)" accent size="lg" />
            <div className="grid gap-1 p-1" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <Block title="Section" className="bg-muted/30" size="xs" />
              <Block title="Section" className="bg-muted/30" size="xs" />
              <Block title="Section" className="bg-muted/30" size="xs" />
            </div>
          </div>
        );
        
      // === BENTO ===
      case 'bento-grid':
        return (
          <div className="h-full grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridAutoRows: '1fr', gridAutoFlow: 'dense' }}>
            <Block title="Featured" className="col-span-2 row-span-2" accent />
            <Block title="Card" className="bg-muted/30" size="xs" />
            <Block title="Card" className="bg-muted/30" size="xs" />
            <Block title="Wide" className="col-span-2 bg-muted/40" size="xs" />
            {fullscreen && <><Block title="Card" className="bg-muted/30" size="xs" /><Block title="Card" className="bg-muted/30" size="xs" /></>}
            <Block title="Data" className="bg-muted/30" size="xs" />
            <Block title="Info" className="bg-muted/30" size="xs" />
            <Block title="Stats" className="bg-muted/40" size="xs" />
            <Block title="Card" className="bg-muted/30" size="xs" />
          </div>
        );
        
      case 'bento-sidebar':
        return (
          <div className="h-full grid gap-1" style={{ gridTemplateColumns: '50px repeat(3, 1fr)', gridAutoRows: '1fr' }}>
            <Block title="Nav" className="row-span-3" accent size="xs" />
            <Block title="Main" className="col-span-2 row-span-2" accent />
            <Block title="Card" className="bg-muted/30" size="xs" />
            <Block title="Card" className="bg-muted/30" size="xs" />
            <Block title="Wide" className="col-span-2 bg-muted/40" size="xs" />
            <Block title="Card" className="bg-muted/30" size="xs" />
          </div>
        );
        
      case 'bento-hero':
        return (
          <div className="h-full grid gap-1" style={{ gridTemplateRows: '80px 1fr' }}>
            <Block title="Hero Block" accent />
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridAutoFlow: 'dense' }}>
              <Block title="Featured" className="col-span-2 row-span-2" accent />
              <Block title="Card" className="bg-muted/30" size="xs" />
              <Block title="Card" className="bg-muted/30" size="xs" />
              <Block title="Wide" className="col-span-2 bg-muted/40" size="xs" />
              <Block title="Card" className="bg-muted/30" size="xs" />
              <Block title="Card" className="bg-muted/30" size="xs" />
            </div>
          </div>
        );
        
      case 'bento-masonry':
        return (
          <div className="h-full grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridAutoRows: '25px' }}>
            <Block title="Tall" className="row-span-3" accent />
            <Block title="Small" className="bg-muted/30" size="xs" />
            <Block title="Medium" className="row-span-2 bg-muted/40" size="xs" />
            <Block title="Small" className="bg-muted/30" size="xs" />
            <Block title="Small" className="bg-muted/30" size="xs" />
            <Block title="Tall" className="row-span-3" accent />
            <Block title="Wide" className="col-span-2 bg-muted/40" size="xs" />
            <Block title="Small" className="bg-muted/30" size="xs" />
            <Block title="Small" className="bg-muted/30" size="xs" />
            <Block title="Medium" className="row-span-2 bg-muted/40" size="xs" />
          </div>
        );
        
      // === ADVANCED ===
      case 'masonry-grid':
        const mCount = fullscreen ? 8 : 6;
        const heights = [4, 6, 3, 5, 4, 3, 5, 4];
        return (
          <div className="h-full grid gap-1" style={{ gridTemplateColumns: `repeat(${fullscreen ? 4 : 3}, 1fr)`, gridAutoRows: '15px' }}>
            {Array.from({ length: mCount }).map((_, i) => (
              <Block key={i} title="" className={i % 3 === 0 ? 'bg-muted/40' : 'bg-muted/30'} style={{ gridRow: `span ${heights[i]}` }} />
            ))}
          </div>
        );
        
      case 'asymmetric-grid':
        return (
          <div className="h-full grid gap-1" style={{ gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: 'repeat(3, 1fr)' }}>
            <Block title="Main" className="row-span-2" accent />
            <Block title="Side" className="bg-muted/30" size="xs" />
            <Block title="Info" className="bg-muted/40" size="xs" />
            <Block title="Data" className="bg-muted/30" size="xs" />
            <Block title="Stats" className="bg-muted/40" size="xs" />
            <Block title="Footer" className="col-span-3 bg-muted/20" size="xs" />
          </div>
        );
        
      case 'span-grid':
        return (
          <div className="h-full grid gap-1" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(3, 1fr)' }}>
            <Block title="2×2" className="col-span-2 row-span-2" accent />
            <Block title="Span 2" className="col-span-2 bg-muted/40" size="sm" />
            <Block title="1×1" className="bg-muted/30" size="xs" />
            <Block title="1×1" className="bg-muted/30" size="xs" />
            <Block title="Span 3" className="col-span-3 bg-muted/20" size="xs" />
            <Block title="1×1" className="bg-muted/30" size="xs" />
          </div>
        );
        
      case 'overlap-grid':
        return (
          <div className="h-full relative">
            <div className="absolute inset-0 grid gap-1" style={{ gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' }}>
              <Block title="Base" className="bg-muted/20" />
              <Block title="Base" className="bg-muted/20" />
              <Block title="Base" className="bg-muted/20" />
              <Block title="Base" className="bg-muted/20" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2/3 h-2/3 border-2 border-dashed rounded flex items-center justify-center" style={{ borderColor: 'var(--accent)', backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}>
                <span className="text-xs font-medium">Overlap</span>
              </div>
            </div>
          </div>
        );
        
      case 'honeycomb-grid':
        return (
          <div className="h-full grid gap-1 p-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="flex flex-col gap-1 pt-4">
              <Block title="⬡" className="bg-muted/40 aspect-square" size="lg" />
              <Block title="⬡" className="bg-muted/30 aspect-square" size="lg" />
            </div>
            <div className="flex flex-col gap-1">
              <Block title="⬡" className="bg-muted/30 aspect-square" size="lg" />
              <Block title="⬡" className="bg-muted/40 aspect-square" size="lg" />
            </div>
            <div className="flex flex-col gap-1 pt-4">
              <Block title="⬡" className="bg-muted/30 aspect-square" size="lg" />
              <Block title="⬡" className="bg-muted/40 aspect-square" size="lg" />
            </div>
          </div>
        );
        
      case 'mosaic-grid':
        return (
          <div className="h-full grid gap-1" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(4, 1fr)' }}>
            <Block title="" className="col-span-2 row-span-2" accent />
            <Block title="" className="row-span-2 bg-muted/30" />
            <Block title="" className="row-span-2 bg-muted/40" />
            <Block title="" className="col-span-2 bg-muted/30" />
            <Block title="" className="bg-muted/40" size="xs" />
            <Block title="" className="bg-muted/30" size="xs" />
            <Block title="" className="col-span-3 bg-muted/20" size="xs" />
            <Block title="" className="bg-muted/40" size="xs" />
          </div>
        );
        
      case 'responsive-grid':
        const rCount = fullscreen ? 15 : 10;
        return (
          <div className="h-full grid gap-1" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(50px, 1fr))', gridAutoRows: '1fr' }}>
            {Array.from({ length: rCount }).map((_, i) => (
              <Block key={i} title="" className={i % 5 === 0 ? 'bg-muted/40' : 'bg-muted/30'} size="xs" />
            ))}
          </div>
        );
        
      // === FIBONACCI ===
      case 'fibonacci-grid':
        return (
          <div className="h-full grid gap-1" style={{ gridTemplateColumns: '1fr 1fr 2fr 3fr 5fr', gridTemplateRows: '1fr 1fr 2fr 3fr' }}>
            <Block title="1" className="bg-muted/30" size="xs" />
            <Block title="1" className="bg-muted/30" size="xs" />
            <Block title="2" className="bg-muted/40" size="sm" />
            <Block title="3" className="bg-muted/50" size="sm" />
            <Block title="5" accent />
            <Block title="1" className="bg-muted/30" size="xs" />
            <Block title="1" className="bg-muted/30" size="xs" />
            <Block title="2" className="row-span-2 bg-muted/40" size="sm" />
            <Block title="3" className="row-span-2 bg-muted/50" />
            <Block title="5" className="row-span-3" accent />
            <Block title="2" className="col-span-2 bg-muted/40" size="sm" />
            <Block title="3" className="row-span-2 bg-muted/50" />
            <Block title="5" className="row-span-2" accent />
            <Block title="3" className="col-span-3 bg-muted/50" size="sm" />
            <Block title="5" className="col-span-2" accent />
          </div>
        );
        
      case 'fibonacci-spiral':
        return (
          <div className="h-full relative p-2">
            <div className="absolute inset-0 grid gap-0.5" style={{ gridTemplateColumns: '5fr 3fr 2fr 1fr', gridTemplateRows: '5fr 3fr 2fr 1fr' }}>
              <Block title="8" accent />
              <Block title="5" className="col-span-2 bg-muted/50" />
              <Block title="3" className="col-span-2 bg-muted/40" />
              <Block title="2" className="row-span-2 bg-muted/40" />
              <Block title="1" className="bg-muted/30" size="xs" />
              <Block title="1" className="bg-muted/30" size="xs" />
              <Block title="1" className="col-span-2 bg-muted/30" size="xs" />
              <Block title="φ" className="col-span-2 row-span-2 bg-muted/20" size="lg" />
            </div>
          </div>
        );
        
      case 'fibonacci-columns':
        return (
          <div className="h-full grid gap-1" style={{ gridTemplateColumns: '1fr 1fr 2fr 3fr 5fr', gridTemplateRows: '35px 1fr 25px' }}>
            <Block title="Header" className="col-span-5" accent />
            <Block title="1" className="bg-muted/30" size="xs" />
            <Block title="1" className="bg-muted/30" size="xs" />
            <Block title="2" className="bg-muted/40" size="sm" />
            <Block title="3" className="bg-muted/50" />
            <Block title="5" accent />
            <Block title="Footer" className="col-span-5 bg-muted/20" size="xs" />
          </div>
        );
        
      case 'fibonacci-tiles':
        return (
          <div className="h-full grid gap-1" style={{ gridTemplateColumns: 'repeat(8, 1fr)', gridTemplateRows: 'repeat(5, 1fr)', gridAutoFlow: 'dense' }}>
            <Block title="8×5" className="col-span-5 row-span-3" accent />
            <Block title="5×3" className="col-span-3 row-span-2 bg-muted/50" />
            <Block title="3×2" className="col-span-2 row-span-2 bg-muted/40" />
            <Block title="2×1" className="col-span-2 bg-muted/40" size="sm" />
            <Block title="1" className="bg-muted/30" size="xs" />
            <Block title="1" className="bg-muted/30" size="xs" />
            <Block title="1" className="bg-muted/30" size="xs" />
            <Block title="1" className="bg-muted/30" size="xs" />
          </div>
        );
        
      case 'fibonacci-responsive':
        return (
          <div className="h-full grid gap-2" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="flex flex-col gap-1">
              <p className="text-[10px] text-center text-muted-foreground">Mobile</p>
              <div className="flex-1 grid gap-0.5" style={{ gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' }}>
                {[1,1,1,1].map((_, i) => <Block key={i} title="1" className="bg-muted/30" size="xs" />)}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[10px] text-center text-muted-foreground">Tablet</p>
              <div className="flex-1 grid gap-0.5" style={{ gridTemplateColumns: '2fr 3fr' }}>
                <Block title="2" className="bg-muted/40" size="xs" />
                <Block title="3" className="bg-muted/50" size="xs" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[10px] text-center text-muted-foreground">Desktop</p>
              <div className="flex-1 grid gap-0.5" style={{ gridTemplateColumns: '5fr 8fr' }}>
                <Block title="5" className="bg-muted/50" size="xs" />
                <Block title="8" accent size="xs" />
              </div>
            </div>
          </div>
        );
        
      case 'fibonacci-masonry':
        return (
          <div className="h-full grid gap-1" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gridAutoRows: '18px' }}>
            <Block title="8" className="row-span-8" accent />
            <Block title="5" className="row-span-5 bg-muted/50" />
            <Block title="3" className="row-span-3 bg-muted/40" />
            <Block title="2" className="row-span-2 bg-muted/40" />
            <Block title="1" className="row-span-1 bg-muted/30" size="xs" />
            <Block title="5" className="row-span-5 bg-muted/50" />
            <Block title="3" className="row-span-3 bg-muted/40" />
            <Block title="8" className="row-span-8" accent />
            <Block title="2" className="row-span-2 bg-muted/40" />
          </div>
        );
        
      case 'fibonacci-bento':
        return (
          <div className="h-full grid gap-1" style={{ gridTemplateColumns: '8fr 5fr 3fr', gridTemplateRows: '5fr 3fr 2fr 1fr', gridAutoFlow: 'dense' }}>
            <Block title="8×5" className="row-span-2" accent />
            <Block title="5×3" className="row-span-2 bg-muted/50" />
            <Block title="3×2" className="bg-muted/40" size="sm" />
            <Block title="2" className="bg-muted/40" size="xs" />
            <Block title="2" className="col-span-2 bg-muted/40" size="xs" />
            <Block title="1" className="bg-muted/30" size="xs" />
            <Block title="1" className="bg-muted/30" size="xs" />
            <Block title="1" className="bg-muted/30" size="xs" />
            <Block title="3" className="col-span-2 bg-muted/40" size="sm" />
          </div>
        );
        
      case 'fibonacci-diagonal':
        return (
          <div className="h-full relative overflow-hidden">
            <div className="absolute w-[60%] h-[60%] top-[5%] left-[5%] border rounded flex items-center justify-center text-xs font-medium" style={{ borderColor: 'var(--accent)', backgroundColor: 'color-mix(in srgb, var(--accent) 20%, transparent)' }}>1</div>
            <div className="absolute w-[50%] h-[50%] top-[15%] left-[25%] border rounded flex items-center justify-center text-xs bg-muted/40">1</div>
            <div className="absolute w-[45%] h-[45%] top-[25%] left-[40%] border rounded flex items-center justify-center text-xs bg-muted/30">2</div>
            <div className="absolute w-[40%] h-[40%] top-[35%] left-[50%] border rounded flex items-center justify-center text-xs bg-muted/40">3</div>
            <div className="absolute w-[35%] h-[35%] top-[45%] left-[58%] border rounded flex items-center justify-center text-xs font-medium" style={{ borderColor: 'var(--accent)', backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}>5</div>
          </div>
        );
        
      case 'fibonacci-steps':
        return (
          <div className="h-full grid gap-1" style={{ gridTemplateRows: '1fr 2fr 3fr 5fr', gridTemplateColumns: '1fr 2fr 3fr 5fr' }}>
            <Block title="1" className="col-start-1 bg-muted/30" size="xs" />
            <Block title="2" className="col-start-1 col-span-2 bg-muted/40" size="sm" />
            <Block title="3" className="col-start-1 col-span-3 bg-muted/50" />
            <Block title="5" className="col-start-1 col-span-4" accent />
          </div>
        );
        
      case 'fibonacci-radiant':
        return (
          <div className="h-full relative">
            <div className="absolute top-1/2 left-1/2 w-[15%] h-[15%] -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: 'var(--accent)', color: 'white' }}>φ</div>
            {['8', '5', '3', '2', '1', '1', '3', '5'].map((n, i) => (
              <div 
                key={i}
                className="absolute w-[18%] h-[25%] rounded flex items-center justify-center text-xs"
                style={{ 
                  top: `${50 + 35 * Math.cos((i * 45 - 90) * Math.PI / 180)}%`,
                  left: `${50 + 35 * Math.sin((i * 45 - 90) * Math.PI / 180)}%`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: i % 2 === 0 ? 'color-mix(in srgb, var(--accent) 20%, transparent)' : undefined,
                  border: '1px dashed var(--border)'
                }}
              >
                {n}
              </div>
            ))}
          </div>
        );
        
      case 'fibonacci-cascade':
        return (
          <div className="h-full grid gap-1" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gridAutoRows: '1fr', gridAutoFlow: 'column' }}>
            <Block title="1" className="row-span-1 bg-muted/30" size="xs" />
            <Block title="2" className="row-span-2 bg-muted/40" size="sm" />
            <Block title="3" className="row-span-3 bg-muted/50" />
            <Block title="5" className="row-span-5" accent />
            <Block title="8" className="row-span-8" accent />
          </div>
        );
        
      case 'fibonacci-nested':
        return (
          <div className="h-full relative p-1">
            <div className="absolute inset-0 border-2 rounded m-1 flex items-center justify-center text-lg font-bold" style={{ borderColor: 'var(--accent)', backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}>8</div>
            <div className="absolute border-2 rounded bg-background/80 flex items-center justify-center text-sm font-medium" style={{ top: '10%', left: '55%', right: '10%', bottom: '20%', borderColor: 'var(--accent)' }}>5</div>
            <div className="absolute border rounded bg-background/90 flex items-center justify-center text-xs" style={{ top: '55%', left: '10%', width: '35%', height: '35%' }}>3</div>
            <div className="absolute border rounded bg-background flex items-center justify-center text-[10px]" style={{ top: '65%', left: '50%', width: '20%', height: '20%' }}>2</div>
            <div className="absolute rounded flex items-center justify-center text-[8px] font-bold" style={{ top: '75%', left: '60%', width: '10%', height: '10%', backgroundColor: 'var(--accent)', color: 'white' }}>1</div>
          </div>
        );
        
      case 'fibonacci-triangle':
        return (
          <div className="h-full flex flex-col items-center justify-center gap-0.5 py-2">
            <div className="flex gap-0.5">
              <Block title="1" className="w-6 h-6 bg-muted/30" size="xs" />
            </div>
            <div className="flex gap-0.5">
              <Block title="1" className="w-6 h-6 bg-muted/30" size="xs" />
              <Block title="1" className="w-6 h-6 bg-muted/40" size="xs" />
            </div>
            <div className="flex gap-0.5">
              <Block title="2" className="w-6 h-6 bg-muted/40" size="xs" />
              <Block title="3" className="w-6 h-6 bg-muted/50" size="xs" />
              <Block title="2" className="w-6 h-6 bg-muted/40" size="xs" />
            </div>
            <div className="flex gap-0.5">
              <Block title="3" className="w-6 h-6 bg-muted/50" size="xs" />
              <Block title="5" className="w-6 h-6" accent size="xs" />
              <Block title="8" className="w-6 h-6" accent size="xs" />
              <Block title="5" className="w-6 h-6" accent size="xs" />
            </div>
            <div className="flex gap-0.5">
              <Block title="5" className="w-6 h-6" accent size="xs" />
              <Block title="8" className="w-6 h-6" accent size="xs" />
              <Block title="13" className="w-8 h-6" accent size="xs" />
              <Block title="8" className="w-6 h-6" accent size="xs" />
              <Block title="5" className="w-6 h-6" accent size="xs" />
            </div>
          </div>
        );
        
      // === MATH ===
      case 'golden-ratio-grid':
        return (
          <div className="h-full grid gap-1" style={{ gridTemplateColumns: '61.8fr 38.2fr', gridTemplateRows: '38.2fr 61.8fr' }}>
            <Block title="Main (61.8%)" className="row-span-2" accent />
            <Block title="Top (38.2%)" className="bg-muted/40" size="sm" />
            <Block title="Bottom (38.2%)" className="bg-muted/30" size="sm" />
          </div>
        );
        
      case 'spiral-grid':
        return (
          <div className="h-full relative">
            <div className="absolute inset-0 grid gap-1" style={{ gridTemplateColumns: '1fr', gridTemplateRows: '1fr' }}>
              <Block title="" className="bg-muted/20" />
            </div>
            <div className="absolute" style={{ top: '5%', left: '5%', right: '30%', bottom: '30%' }}>
              <div className="h-full border-2 border-dashed rounded flex items-center justify-center text-xs font-medium" style={{ borderColor: 'var(--accent)', backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}>1</div>
            </div>
            <div className="absolute" style={{ top: '5%', left: '70%', right: '5%', bottom: '55%' }}>
              <div className="h-full border-2 border-dashed rounded flex items-center justify-center text-xs bg-muted/30">2</div>
            </div>
            <div className="absolute" style={{ top: '45%', left: '45%', right: '5%', bottom: '30%' }}>
              <div className="h-full border-2 border-dashed rounded flex items-center justify-center text-xs bg-muted/20">3</div>
            </div>
            <div className="absolute" style={{ top: '70%', left: '5%', right: '55%', bottom: '5%' }}>
              <div className="h-full border-2 border-dashed rounded flex items-center justify-center text-xs bg-muted/30">5</div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-medium" style={{ color: 'var(--accent)' }}>Spiral</div>
          </div>
        );
        
      case 'phi-grid':
        return (
          <div className="h-full grid gap-0.5" style={{ gridTemplateColumns: '61.8fr 38.2fr', gridTemplateRows: '61.8fr 38.2fr' }}>
            <Block title="φ" accent />
            <Block title="φ'" className="bg-muted/40" />
            <Block title="φ''" className="bg-muted/40" />
            <Block title="φ'''" className="bg-muted/30" />
            {/* Cross lines */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-[61.8%] top-0 bottom-0 w-px bg-border/50" />
              <div className="absolute top-[61.8%] left-0 right-0 h-px bg-border/50" />
            </div>
          </div>
        );
        
      case 'rule-of-thirds':
        return (
          <div className="h-full grid gap-0.5" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)' }}>
            {[...Array(9)].map((_, i) => (
              <Block key={i} title="" className={i === 4 ? 'bg-muted/50' : 'bg-muted/30'} size="xs" />
            ))}
            {/* Power points */}
            <div className="absolute top-[33%] left-[33%] w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
            <div className="absolute top-[33%] left-[66%] w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
            <div className="absolute top-[66%] left-[33%] w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
            <div className="absolute top-[66%] left-[66%] w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
          </div>
        );
        
      case 'root-rectangle':
        return (
          <div className="h-full flex flex-col gap-1">
            <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: '1.414fr 1fr' }}>
              <Block title="√2" accent />
              <Block title="1" className="bg-muted/40" size="sm" />
            </div>
            <div className="flex gap-1 text-[10px] text-center text-muted-foreground">
              <span className="flex-1 p-1 bg-muted/20 rounded">√2 = 1.414</span>
              <span className="flex-1 p-1 bg-muted/20 rounded">√3 = 1.732</span>
              <span className="flex-1 p-1 bg-muted/20 rounded">√4 = 2</span>
            </div>
          </div>
        );
        
      case 'dynamic-symmetry':
        return (
          <div className="h-full relative overflow-hidden">
            <div className="absolute inset-0 grid gap-1" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 1fr)' }}>
              <Block title="" className="bg-muted/20" />
              <Block title="" className="bg-muted/30" />
              <Block title="" className="bg-muted/30" />
              <Block title="" className="bg-muted/20" />
            </div>
            {/* Diagonal lines */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="0" y1="0" x2="100" y2="100" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="2,2" />
              <line x1="100" y1="0" x2="0" y2="100" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="2,2" />
              <line x1="50" y1="0" x2="100" y2="50" stroke="var(--accent)" strokeWidth="0.3" strokeDasharray="1,1" />
              <line x1="0" y1="50" x2="50" y2="100" stroke="var(--accent)" strokeWidth="0.3" strokeDasharray="1,1" />
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-medium" style={{ color: 'var(--accent)' }}>√5</div>
          </div>
        );
        
      case 'harmonic-series':
        return (
          <div className="h-full grid gap-1" style={{ gridTemplateColumns: '1fr 0.5fr 0.333fr 0.25fr' }}>
            <Block title="1" accent />
            <Block title="1/2" className="bg-muted/50" size="sm" />
            <Block title="1/3" className="bg-muted/40" size="xs" />
            <Block title="1/4" className="bg-muted/30" size="xs" />
          </div>
        );
        
      case 'pi-grid':
        return (
          <div className="h-full relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[60%] h-[60%] rounded-full border-2 border-dashed flex items-center justify-center" style={{ borderColor: 'var(--accent)' }}>
                <span className="text-lg font-bold" style={{ color: 'var(--accent)' }}>π</span>
              </div>
            </div>
            <div className="absolute top-[10%] left-[10%] right-[68%] bottom-[68%] border rounded bg-muted/30" />
            <div className="absolute bottom-[10%] right-[10%] left-[68%] top-[68%] border rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 20%, transparent)' }} />
            <div className="absolute bottom-2 left-2 text-[10px] text-muted-foreground">π ≈ 3.14159</div>
          </div>
        );
        
      case 'prime-grid':
        return (
          <div className="h-full grid gap-1" style={{ gridTemplateColumns: '2fr 3fr 5fr 7fr', gridTemplateRows: '35px 1fr 25px' }}>
            <Block title="2" className="bg-muted/30" size="xs" />
            <Block title="3" className="bg-muted/40" size="sm" />
            <Block title="5" className="bg-muted/50" />
            <Block title="7" accent />
            <Block title="11" className="col-span-2 bg-muted/30" size="sm" />
            <Block title="13" className="col-span-2" accent size="sm" />
            <Block title="Prime Numbers" className="col-span-4 bg-muted/20" size="xs" />
          </div>
        );
        
      case 'sqrt-grid':
        return (
          <div className="h-full grid gap-1" style={{ gridTemplateColumns: '1fr 1.414fr 1.732fr 2fr' }}>
            <Block title="√1" className="bg-muted/30" size="xs" />
            <Block title="√2" className="bg-muted/40" size="sm" />
            <Block title="√3" className="bg-muted/50" />
            <Block title="√4" accent />
          </div>
        );
        
      case 'modular-grid':
        const gridSize = fullscreen ? 8 : 6;
        return (
          <div className="h-full grid gap-0.5 p-1" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`, gridTemplateRows: `repeat(${gridSize}, 1fr)` }}>
            {Array.from({ length: gridSize * gridSize }).map((_, i) => (
              <div 
                key={i} 
                className="border border-dashed border-border/30 rounded-sm flex items-center justify-center text-[8px] text-muted-foreground"
              >
                {i + 1}
              </div>
            ))}
          </div>
        );
        
      // === COMPLEX ===
      case 'dashboard':
        const wCount = fullscreen ? 8 : 6;
        return (
          <div className="h-full grid gap-1" style={{ gridTemplateColumns: '50px 1fr', gridTemplateRows: '35px 1fr' }}>
            <Block title="Nav" className="col-span-2" accent size="sm" />
            <Block title="Menu" className="bg-muted/40" size="xs" />
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${fullscreen ? 4 : 3}, 1fr)` }}>
              {Array.from({ length: wCount }).map((_, i) => (
                <Block key={i} title={`W${i + 1}`} className="bg-muted/30" size="xs" />
              ))}
            </div>
          </div>
        );
        
      case 'blog':
        return (
          <div className="h-full grid gap-1" style={{ gridTemplateColumns: '1fr 70px', gridTemplateRows: '35px 1fr 25px' }}>
            <Block title="Header" className="col-span-2" accent />
            <Block title="Articles" className="bg-muted/30" />
            <Block title="Sidebar" className="bg-muted/40" size="xs" />
            <Block title="Footer" className="col-span-2 bg-muted/20" size="xs" />
          </div>
        );
        
      default:
        return (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <p>Предпросмотр в разработке</p>
          </div>
        );
    }
  };
  
  return (
    <div className="h-full min-h-[250px]">
      {renderLayout()}
    </div>
  );
}

// Main component
export function PreviewArea() {
  const { selectedLayout, theme } = useAppStore();
  const [fullscreen, setFullscreen] = React.useState(false);
  
  const fontClass = {
    'sans': 'font-sans',
    'serif': 'font-serif',
    'mono': 'font-mono'
  }[theme.fontFamily];
  
  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-5 w-5" />
              Предпросмотр
            </CardTitle>
            {selectedLayout && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground font-normal hidden sm:block">
                  {selectedLayout.name}
                </span>
                <Button variant="outline" size="sm" onClick={() => setFullscreen(true)} className="gap-1.5">
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">На весь экран</span>
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className={cn("flex-1 pb-4", fontClass)}>
          <LayoutPreview />
        </CardContent>
        
        {selectedLayout && (
          <div className="px-6 pb-4">
            <div className="p-3 bg-muted/50 rounded text-xs space-y-1">
              <p className="font-medium">CSS Grid:</p>
              <code className="text-muted-foreground block font-mono text-[11px]">
                {selectedLayout.techNotes}
              </code>
            </div>
          </div>
        )}
      </Card>
      
      {/* Fullscreen Dialog */}
      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] max-h-[95vh] p-0 gap-0">
          <DialogHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {selectedLayout?.name}
            </DialogTitle>
            <Button variant="outline" size="sm" onClick={() => setFullscreen(false)} className="gap-1.5">
              <Minimize2 className="h-3.5 w-3.5" />
              Свернуть
            </Button>
          </DialogHeader>
          
          <div className={cn("flex-1 p-6", fontClass)}>
            <LayoutPreview fullscreen />
          </div>
          
          {selectedLayout && (
            <div className="px-6 pb-4 border-t pt-4">
              <div className="p-4 bg-muted/50 rounded text-sm">
                <p className="font-medium mb-1">CSS Grid код:</p>
                <code className="text-xs text-muted-foreground block bg-muted p-3 rounded font-mono">
                  {selectedLayout.techNotes}
                </code>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
