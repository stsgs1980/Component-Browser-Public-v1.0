// Project: DS Reference
// Category: common
// Source: design-systems\DS Reference\src\components\common
// Lines: 339

'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface LivePreviewProps {
  componentType: string;
  className?: string;
}

function IconCopy({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconCheck({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconRefresh({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
    </svg>
  );
}

export function LivePreview({ componentType, className }: LivePreviewProps) {
  const [copied, setCopied] = React.useState(false);
  
  // Interactive state for live controls
  const [buttonVariant, setButtonVariant] = React.useState<'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'>('default');
  const [buttonSize, setButtonSize] = React.useState<'default' | 'sm' | 'lg' | 'icon'>('default');
  const [buttonDisabled, setButtonDisabled] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [inputDisabled, setInputDisabled] = React.useState(false);
  const [sliderValue, setSliderValue] = React.useState([50]);

  const copyCode = () => {
    const code = getPreviewCode();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetState = () => {
    setButtonVariant('default');
    setButtonSize('default');
    setButtonDisabled(false);
    setInputValue('');
    setInputDisabled(false);
    setSliderValue([50]);
  };

  const getPreviewCode = () => {
    switch (componentType) {
      case 'Button':
        return `<Button 
  variant="${buttonVariant}" 
  size="${buttonSize}"
  ${buttonDisabled ? 'disabled' : ''}
>
  Click me
</Button>`;
      case 'Input':
        return `<Input 
  placeholder="Enter text..." 
  value="${inputValue}"
  ${inputDisabled ? 'disabled' : ''}
  onChange={(e) => setValue(e.target.value)}
/>`;
      case 'Badge':
        return `<Badge variant="default">Badge</Badge>`;
      case 'Card':
        return `<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Card content
  </CardContent>
</Card>`;
      case 'Slider':
        return `<Slider 
  value={[${sliderValue[0]}]} 
  onValueChange={setValue}
  max={100}
  step={1}
/>`;
      default:
        return `<${componentType} />`;
    }
  };

  const renderPreview = () => {
    switch (componentType) {
      case 'Button':
        return (
          <motion.div
            key={`${buttonVariant}-${buttonSize}-${buttonDisabled}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Button 
              variant={buttonVariant} 
              size={buttonSize}
              disabled={buttonDisabled}
            >
              Click me
            </Button>
          </motion.div>
        );
      case 'Input':
        return (
          <motion.div
            key={`${inputDisabled}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-sm"
          >
            <Input 
              placeholder="Enter text..." 
              value={inputValue}
              disabled={inputDisabled}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </motion.div>
        );
      case 'Badge':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-wrap gap-2"
          >
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </motion.div>
        );
      case 'Card':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm"
          >
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description goes here</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This is the card content area. You can place any content here.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );
      case 'Slider':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-sm space-y-4"
          >
            <Slider 
              value={sliderValue} 
              onValueChange={setSliderValue}
              max={100}
              step={1}
            />
            <p className="text-sm text-muted-foreground text-center">
              Value: {sliderValue[0]}
            </p>
          </motion.div>
        );
      default:
        return (
          <div className="text-muted-foreground">
            Preview not available for {componentType}
          </div>
        );
    }
  };

  const renderControls = () => {
    switch (componentType) {
      case 'Button':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Variant</label>
              <div className="flex flex-wrap gap-2">
                {(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setButtonVariant(v)}
                    className={cn(
                      'px-3 py-1 text-xs rounded-md border transition-colors',
                      buttonVariant === v 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-background hover:bg-muted'
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Size</label>
              <div className="flex flex-wrap gap-2">
                {(['sm', 'default', 'lg', 'icon'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setButtonSize(s)}
                    className={cn(
                      'px-3 py-1 text-xs rounded-md border transition-colors',
                      buttonSize === s 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-background hover:bg-muted'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={buttonDisabled} 
                onCheckedChange={setButtonDisabled}
                id="button-disabled"
              />
              <label htmlFor="button-disabled" className="text-sm">Disabled</label>
            </div>
          </div>
        );
      case 'Input':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch 
                checked={inputDisabled} 
                onCheckedChange={setInputDisabled}
                id="input-disabled"
              />
              <label htmlFor="input-disabled" className="text-sm">Disabled</label>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Live Value</label>
              <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                {inputValue || '(empty)'}
              </p>
            </div>
          </div>
        );
      default:
        return (
          <p className="text-sm text-muted-foreground">
            No controls available
          </p>
        );
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Preview Area */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted/50 px-4 py-2 border-b flex items-center justify-between">
          <span className="text-sm font-medium">Preview</span>
          <div className="flex items-center gap-2">
            <button
              onClick={resetState}
              className="p-1.5 hover:bg-background rounded transition-colors"
              title="Reset"
            >
              <IconRefresh size={14} />
            </button>
            <button
              onClick={copyCode}
              className="p-1.5 hover:bg-background rounded transition-colors"
              title="Copy code"
            >
              {copied ? <IconCheck size={14} className="text-green-500" /> : <IconCopy size={14} />}
            </button>
          </div>
        </div>
        <div className="p-8 flex items-center justify-center min-h-[120px] bg-background">
          {renderPreview()}
        </div>
      </div>

      {/* Controls */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted/50 px-4 py-2 border-b">
          <span className="text-sm font-medium">Controls</span>
        </div>
        <div className="p-4 bg-background">
          {renderControls()}
        </div>
      </div>

      {/* Code Preview */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted/50 px-4 py-2 border-b flex items-center justify-between">
          <span className="text-sm font-medium">Code</span>
        </div>
        <pre className="p-4 text-sm overflow-x-auto bg-muted/30">
          <code>{getPreviewCode()}</code>
        </pre>
      </div>
    </div>
  );
}
