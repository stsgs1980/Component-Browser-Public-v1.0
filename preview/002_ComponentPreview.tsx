// Project: DS Reference
// Category: common
// Source: design-systems\DS Reference\src\components\common
// Lines: 644

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { IconCopy, IconCheck, IconCode, IconEye, IconAlertCircle, IconCheckCircle, IconInfo, IconAlertTriangle } from '@/components/common/icons';
import { cn } from '@/lib/utils';

interface ComponentPreviewProps {
  componentName: string;
  description?: string;
}

// Live component previews
const componentPreviews: Record<string, React.FC<{ config: Record<string, unknown> }>> = {
  Button: ({ config }) => {
    const variant = (config.variant as string) || 'default';
    const size = (config.size as string) || 'default';
    const disabled = config.disabled as boolean;
    const label = (config.label as string) || 'Button';
    
    return (
      <Button variant={variant} size={size} disabled={disabled}>
        {label}
      </Button>
    );
  },
  
  Input: ({ config }) => {
    const type = (config.type as string) || 'text';
    const placeholder = (config.placeholder as string) || 'Введите текст...';
    const disabled = config.disabled as boolean;
    
    return (
      <Input 
        type={type} 
        placeholder={placeholder} 
        disabled={disabled}
        className="max-w-xs"
      />
    );
  },
  
  Badge: ({ config }) => {
    const variant = (config.variant as string) || 'default';
    const label = (config.label as string) || 'Badge';
    
    return <Badge variant={variant}>{label}</Badge>;
  },
  
  Card: ({ config }) => {
    const title = (config.title as string) || 'Заголовок карточки';
    const description = (config.description as string) || 'Описание карточки.';
    
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Содержимое карточки с информацией.</p>
        </CardContent>
        <CardFooter className="justify-end">
          <Button size="sm">Действие</Button>
        </CardFooter>
      </Card>
    );
  },
  
  Checkbox: ({ config }) => {
    const label = (config.label as string) || 'Принять условия';
    const checked = config.checked as boolean;
    
    return (
      <div className="flex items-center space-x-2">
        <Checkbox id="preview-checkbox" checked={checked} />
        <Label htmlFor="preview-checkbox">{label}</Label>
      </div>
    );
  },
  
  Switch: ({ config }) => {
    const label = (config.label as string) || 'Включить уведомления';
    const checked = config.checked as boolean;
    
    return (
      <div className="flex items-center space-x-2">
        <Switch id="preview-switch" checked={checked} />
        <Label htmlFor="preview-switch">{label}</Label>
      </div>
    );
  },
  
  Progress: ({ config }) => {
    const value = (config.value as number) || 66;
    
    return (
      <div className="w-full max-w-sm space-y-2">
        <div className="flex justify-between text-sm">
          <span>Прогресс</span>
          <span>{value}%</span>
        </div>
        <Progress value={value} />
      </div>
    );
  },
  
  Skeleton: ({ config }) => {
    const variant = (config.variant as string) || 'card';
    
    if (variant === 'card') {
      return (
        <div className="space-y-3 w-full max-w-sm">
          <Skeleton className="h-[100px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex items-center space-x-4 w-full max-w-sm">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
      </div>
    );
  },
  
  Alert: ({ config }) => {
    const variant = (config.variant as string) || 'default';
    const title = (config.title as string) || 'Внимание';
    const description = (config.description as string) || 'Это важное уведомление.';
    
    return (
      <Alert variant={variant === 'destructive' ? 'destructive' : 'default'} className="max-w-md">
        {variant === 'destructive' ? <IconAlertCircle className="h-4 w-4" /> : <IconInfo className="h-4 w-4" />}
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
    );
  },
  
  Separator: ({ config }) => {
    const orientation = (config.orientation as string) || 'horizontal';
    
    if (orientation === 'vertical') {
      return (
        <div className="flex items-center gap-4 h-8">
          <span className="text-sm">Слева</span>
          <Separator orientation="vertical" />
          <span className="text-sm">Справа</span>
        </div>
      );
    }
    
    return (
      <div className="w-full max-w-sm space-y-4">
        <span className="text-sm">Первая секция</span>
        <Separator />
        <span className="text-sm">Вторая секция</span>
      </div>
    );
  },
  
  Tabs: ({ config }) => {
    return (
      <Tabs defaultValue="tab1" className="w-full max-w-sm">
        <TabsList>
          <TabsTrigger value="tab1">Вкладка 1</TabsTrigger>
          <TabsTrigger value="tab2">Вкладка 2</TabsTrigger>
          <TabsTrigger value="tab3">Вкладка 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="p-4 border rounded-lg mt-2">
          Контент первой вкладки
        </TabsContent>
        <TabsContent value="tab2" className="p-4 border rounded-lg mt-2">
          Контент второй вкладки
        </TabsContent>
        <TabsContent value="tab3" className="p-4 border rounded-lg mt-2">
          Контент третьей вкладки
        </TabsContent>
      </Tabs>
    );
  },
  
  Avatar: ({ config }) => {
    const size = (config.size as string) || 'default';
    const sizeClass = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10';
    
    return (
      <div className="flex items-center gap-4">
        <div className={cn("rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium", sizeClass)}>
          ИИ
        </div>
        <div>
          <p className="text-sm font-medium">Иван Иванов</p>
          <p className="text-xs text-muted-foreground">ivan@example.com</p>
        </div>
      </div>
    );
  },
  
  Textarea: ({ config }) => {
    const placeholder = (config.placeholder as string) || 'Введите описание...';
    const disabled = config.disabled as boolean;
    
    return (
      <textarea 
        placeholder={placeholder}
        disabled={disabled}
        className="flex min-h-[80px] w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
    );
  },
  
  Select: ({ config }) => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<string | null>(null);
    const label = (config.label as string) || 'Выберите вариант';
    
    return (
      <div className="w-full max-w-xs">
        <button
          onClick={() => setOpen(!open)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <span className={value ? '' : 'text-muted-foreground'}>{value || label}</span>
          <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <div className="mt-1 rounded-md border bg-popover p-1 shadow-md">
            {['Вариант 1', 'Вариант 2', 'Вариант 3'].map((option) => (
              <button
                key={option}
                onClick={() => { setValue(option); setOpen(false); }}
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  },
  
  Table: ({ config }) => {
    return (
      <div className="w-full max-w-md rounded-md border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="h-10 px-4 text-left font-medium">Имя</th>
              <th className="h-10 px-4 text-left font-medium">Статус</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-4">Иван Иванов</td>
              <td className="p-4"><Badge>Активен</Badge></td>
            </tr>
            <tr className="border-b">
              <td className="p-4">Мария Петрова</td>
              <td className="p-4"><Badge variant="secondary">Неактивен</Badge></td>
            </tr>
            <tr>
              <td className="p-4">Алексей Сидоров</td>
              <td className="p-4"><Badge variant="outline">Ожидание</Badge></td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  },
  
  Dialog: ({ config }) => {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-lg">Заголовок диалога</CardTitle>
          <CardDescription>Описание содержимого диалогового окна.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Содержимое диалогового окна с информацией.</p>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button variant="outline" size="sm">Отмена</Button>
          <Button size="sm">Подтвердить</Button>
        </CardFooter>
      </Card>
    );
  },
  
  Tooltip: ({ config }) => {
    const text = (config.text as string) || 'Это подсказка!';
    
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">Наведи на меня</Button>
        <div className="absolute top-full mt-2 px-3 py-1.5 text-sm bg-popover border rounded-md shadow-md">
          {text}
        </div>
      </div>
    );
  },
};

// Configuration options for each component
const componentConfigs: Record<string, { label: string; type: string; options?: string[]; default: unknown }[]> = {
  Button: [
    { label: 'variant', type: 'select', options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'], default: 'default' },
    { label: 'size', type: 'select', options: ['default', 'sm', 'lg', 'icon'], default: 'default' },
    { label: 'label', type: 'text', default: 'Button' },
    { label: 'disabled', type: 'boolean', default: false }
  ],
  Input: [
    { label: 'type', type: 'select', options: ['text', 'email', 'password', 'number', 'search'], default: 'text' },
    { label: 'placeholder', type: 'text', default: 'Введите текст...' },
    { label: 'disabled', type: 'boolean', default: false }
  ],
  Badge: [
    { label: 'variant', type: 'select', options: ['default', 'secondary', 'destructive', 'outline'], default: 'default' },
    { label: 'label', type: 'text', default: 'Badge' }
  ],
  Card: [
    { label: 'title', type: 'text', default: 'Заголовок карточки' },
    { label: 'description', type: 'text', default: 'Описание карточки.' }
  ],
  Checkbox: [
    { label: 'label', type: 'text', default: 'Принять условия' },
    { label: 'checked', type: 'boolean', default: false }
  ],
  Switch: [
    { label: 'label', type: 'text', default: 'Включить уведомления' },
    { label: 'checked', type: 'boolean', default: false }
  ],
  Progress: [
    { label: 'value', type: 'number', default: 66 }
  ],
  Skeleton: [
    { label: 'variant', type: 'select', options: ['card', 'profile'], default: 'card' }
  ],
  Alert: [
    { label: 'variant', type: 'select', options: ['default', 'destructive'], default: 'default' },
    { label: 'title', type: 'text', default: 'Внимание' },
    { label: 'description', type: 'text', default: 'Это важное уведомление.' }
  ],
  Separator: [
    { label: 'orientation', type: 'select', options: ['horizontal', 'vertical'], default: 'horizontal' }
  ],
  Avatar: [
    { label: 'size', type: 'select', options: ['sm', 'default', 'lg'], default: 'default' }
  ],
  Textarea: [
    { label: 'placeholder', type: 'text', default: 'Введите описание...' },
    { label: 'disabled', type: 'boolean', default: false }
  ],
  Select: [
    { label: 'label', type: 'text', default: 'Выберите вариант' }
  ],
  Tooltip: [
    { label: 'text', type: 'text', default: 'Это подсказка!' }
  ]
};

// Generate code from config
const generateCode = (componentName: string, config: Record<string, unknown>): string => {
  const propsStr = Object.entries(config)
    .filter(([key, value]) => value !== componentConfigs[componentName]?.find(c => c.label === key)?.default)
    .map(([key, value]) => {
      if (typeof value === 'string') return `${key}="${value}"`;
      if (typeof value === 'boolean') return value ? key : '';
      if (typeof value === 'number') return `${key}={${value}}`;
      return '';
    })
    .filter(Boolean)
    .join(' ');

  const templates: Record<string, string> = {
    Button: `<Button${propsStr ? ' ' + propsStr : ''}>${config.label || 'Button'}</Button>`,
    Input: `<Input${propsStr ? ' ' + propsStr : ''} />`,
    Badge: `<Badge${propsStr ? ' ' + propsStr : ''}>${config.label || 'Badge'}</Badge>`,
    Card: `<Card>
  <CardHeader>
    <CardTitle>${config.title || 'Заголовок'}</CardTitle>
    <CardDescription>${config.description || 'Описание'}</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Содержимое карточки</p>
  </CardContent>
</Card>`,
    Checkbox: `<div className="flex items-center space-x-2">
  <Checkbox${config.checked ? ' checked' : ''} />
  <Label>${config.label || 'Принять'}</Label>
</div>`,
    Switch: `<div className="flex items-center space-x-2">
  <Switch${config.checked ? ' checked' : ''} />
  <Label>${config.label || 'Включить'}</Label>
</div>`,
    Progress: `<Progress value={${config.value || 66}} />`,
    Skeleton: config.variant === 'profile' ? 
`<div className="flex items-center space-x-4">
  <Skeleton className="h-12 w-12 rounded-full" />
  <div className="space-y-2">
    <Skeleton className="h-4 w-[150px]" />
    <Skeleton className="h-4 w-[100px]" />
  </div>
</div>` :
`<div className="space-y-3">
  <Skeleton className="h-[100px] w-full rounded-xl" />
  <div className="space-y-2">
    <Skeleton className="h-4 w-[200px]" />
    <Skeleton className="h-4 w-[150px]" />
  </div>
</div>`,
    Alert: `<Alert${config.variant === 'destructive' ? ' variant="destructive"' : ''}>
  <AlertTitle>${config.title || 'Внимание'}</AlertTitle>
  <AlertDescription>${config.description || 'Уведомление'}</AlertDescription>
</Alert>`,
    Separator: `<Separator${config.orientation === 'vertical' ? ' orientation="vertical"' : ''} />`,
    Tabs: `<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Вкладка 1</TabsTrigger>
    <TabsTrigger value="tab2">Вкладка 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Контент</TabsContent>
</Tabs>`,
    Avatar: `<Avatar${config.size !== 'default' ? ` size="${config.size}"` : ''}>
  <AvatarImage src="/avatar.jpg" />
  <AvatarFallback>ИИ</AvatarFallback>
</Avatar>`,
    Textarea: `<Textarea${propsStr ? ' ' + propsStr : ''} />`,
    Select: `<Select>
  <SelectTrigger>
    <SelectValue placeholder="${config.label || 'Выберите'}" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Вариант 1</SelectItem>
    <SelectItem value="2">Вариант 2</SelectItem>
  </SelectContent>
</Select>`,
    Table: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Имя</TableHead>
      <TableHead>Статус</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Иван</TableCell>
      <TableCell><Badge>Активен</Badge></TableCell>
    </TableRow>
  </TableBody>
</Table>`,
    Dialog: `<Dialog>
  <DialogTrigger asChild>
    <Button>Открыть</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Заголовок</DialogTitle>
      <DialogDescription>Описание</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>`,
    Tooltip: `<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button>Наведи</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>${config.text || 'Подсказка'}</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>`
  };

  return templates[componentName] || `<${componentName}${propsStr ? ' ' + propsStr : ''} />`;
};

export function ComponentPreview({ componentName, description }: ComponentPreviewProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);
  const [config, setConfig] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    componentConfigs[componentName]?.forEach(c => {
      initial[c.label] = c.default;
    });
    return initial;
  });

  const PreviewComponent = componentPreviews[componentName];
  const configOptions = componentConfigs[componentName] || [];
  const code = generateCode(componentName, config);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateConfig = (key: string, value: unknown) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  if (!PreviewComponent) {
    return (
      <div className="flex items-center justify-center h-48 border rounded-lg bg-muted/30">
        <p className="text-muted-foreground">Превью для {componentName} недоступно</p>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'preview' | 'code')}>
          <TabsList className="h-8">
            <TabsTrigger value="preview" className="text-xs flex items-center gap-1.5">
              <IconEye size={14} />
              Превью
            </TabsTrigger>
            <TabsTrigger value="code" className="text-xs flex items-center gap-1.5">
              <IconCode size={14} />
              Код
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={copyCode}
          className="h-7 gap-1.5 text-xs"
        >
          {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
          {copied ? 'Скопировано!' : 'Копировать'}
        </Button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,280px]">
        {/* Preview area */}
        <div className="flex items-center justify-center min-h-[200px] p-8 bg-background border-r">
          <AnimatePresence mode="wait">
            {activeTab === 'preview' ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <PreviewComponent config={config} />
              </motion.div>
            ) : (
              <motion.pre
                key="code"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-full max-w-md overflow-x-auto text-sm bg-muted p-4 rounded-lg"
              >
                <code className="text-foreground">{code}</code>
              </motion.pre>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="p-4 bg-muted/20 border-t lg:border-t-0">
          <h4 className="font-semibold text-sm mb-4">Настройки</h4>
          <div className="space-y-4">
            {configOptions.map((option) => (
              <div key={option.label} className="space-y-2">
                <Label className="text-xs">{option.label}</Label>
                {option.type === 'select' && (
                  <div className="flex flex-wrap gap-1">
                    {option.options?.map((opt) => (
                      <Button
                        key={opt}
                        variant={config[option.label] === opt ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => updateConfig(option.label, opt)}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                )}
                {option.type === 'text' && (
                  <Input
                    value={config[option.label] as string}
                    onChange={(e) => updateConfig(option.label, e.target.value)}
                    className="h-8 text-sm"
                  />
                )}
                {option.type === 'boolean' && (
                  <Switch
                    checked={config[option.label] as boolean}
                    onCheckedChange={(checked) => updateConfig(option.label, checked)}
                  />
                )}
                {option.type === 'number' && (
                  <Input
                    type="number"
                    value={config[option.label] as number}
                    onChange={(e) => updateConfig(option.label, parseInt(e.target.value) || 0)}
                    className="h-8 text-sm"
                    min={0}
                    max={100}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
