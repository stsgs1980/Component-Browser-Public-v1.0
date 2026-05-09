/**
 * ThemeSettings - Theme customization panel
 */

'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { fontLabels, sizeLabels, colorPresets } from '@/data/layouts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Palette, Sun, Moon, Type, Monitor } from 'lucide-react';

export function ThemeSettings() {
  const { theme, setTheme } = useAppStore();
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Palette className="h-5 w-5" />
          Тема
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Mode */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Режим
          </Label>
          <div className="flex gap-2">
            {(['light', 'dark'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setTheme({ mode })}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded border transition-all",
                  theme.mode === mode 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "border-border hover:border-primary/50"
                )}
              >
                {mode === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span className="text-sm">{mode === 'light' ? 'Светлая' : 'Тёмная'}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Accent Color */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Акцентный цвет
          </Label>
          <div className="flex flex-wrap gap-2">
            {colorPresets.map((color) => (
              <button
                key={color.value}
                onClick={() => setTheme({ accentColor: color.value })}
                className={cn(
                  "w-8 h-8 rounded-full transition-transform",
                  "ring-2 ring-offset-2 ring-offset-background",
                  theme.accentColor === color.value ? "ring-primary scale-110" : "ring-transparent hover:scale-105"
                )}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>
        
        {/* Font Family */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Шрифт
          </Label>
          <div className="flex gap-2">
            {(['sans', 'serif', 'mono'] as const).map((family) => (
              <button
                key={family}
                onClick={() => setTheme({ fontFamily: family })}
                className={cn(
                  "flex-1 px-3 py-2 rounded border text-sm transition-all",
                  {
                    'font-sans': family === 'sans',
                    'font-serif': family === 'serif',
                    'font-mono': family === 'mono'
                  },
                  theme.fontFamily === family 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "border-border hover:border-primary/50"
                )}
              >
                {fontLabels[family]}
              </button>
            ))}
          </div>
        </div>
        
        {/* Font Size */}
        <div className="space-y-2">
          <Label>Размер шрифта</Label>
          <div className="flex gap-2">
            {(['sm', 'md', 'lg'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setTheme({ fontSize: size })}
                className={cn(
                  "flex-1 px-4 py-2 rounded border text-sm transition-all",
                  theme.fontSize === size 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "border-border hover:border-primary/50"
                )}
              >
                {sizeLabels[size]}
              </button>
            ))}
          </div>
        </div>
        
        {/* Preview */}
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">Предпросмотр:</p>
          <div 
            className="p-4 rounded border space-y-2"
            style={{ 
              fontFamily: `var(--font-${theme.fontFamily})`,
              fontSize: theme.fontSize === 'sm' ? '14px' : theme.fontSize === 'lg' ? '18px' : '16px'
            }}
          >
            <p className="font-medium">Заголовок</p>
            <p className="text-muted-foreground">Обычный текст для примера.</p>
            <p style={{ color: theme.accentColor }} className="font-medium">
              Акцентный цвет
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
