// --- source: Code-Snippets-Gallery / code-dialog.tsx ---
// Full-screen code viewer dialog with Preview/Code tabs, line-numbered display,
// copy-to-clipboard with checkmark feedback, and delete confirmation.
// De-hardcoded: all text via props (was i18n t()), sizes/colors via props, no locale dep.

'use client';

import { useState, type ReactNode } from 'react';
import { Heart, Copy, Check, Trash2, Code2, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface CodeViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Title of the content */
  title?: string;
  /** Subtitle / author line */
  subtitle?: string;
  /** Description text */
  description?: string;
  /** Language badge label */
  badge?: string;
  /** Badge extra class */
  badgeClass?: string;
  /** Full source code to display */
  code: string;
  /** Optional rendered preview (e.g. iframe element) */
  preview?: ReactNode;
  /** Like count */
  likes?: number;
  /** Callbacks */
  onLike?: () => void;
  onDelete?: () => void;
  /** Content area height (default "50vh sm:h-[55vh]") */
  contentHeight?: string;
  /** Dialog max width (default "max-w-4xl sm:max-w-5xl") */
  maxWidth?: string;
  /** Copy feedback duration in ms (default 2000) */
  copyFeedbackMs?: number;
  /** Label overrides */
  labels?: {
    preview?: string;
    code?: string;
    copy?: string;
    copied?: string;
    delete?: string;
    deleteTitle?: string;
    deleteConfirm?: string;
    deleteNote?: string;
    cancel?: string;
    copyFailed?: string;
  };
}

type TabType = 'preview' | 'code';

export function CodeViewerDialog({
  open, onOpenChange,
  title, subtitle, description, badge, badgeClass,
  code, preview, likes, onLike, onDelete,
  contentHeight = '50vh sm:h-[55vh]',
  maxWidth = 'max-w-4xl sm:max-w-5xl',
  copyFeedbackMs = 2000,
  labels = {},
}: CodeViewerDialogProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(
    preview ? 'preview' : 'code',
  );

  const hasPreview = !!preview;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), copyFeedbackMs);
    } catch {
      // Clipboard API not available — could call toast here
      console.warn(labels.copyFailed || 'Copy failed');
    }
  };

  const lines = code.split('\n');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(maxWidth, 'max-h-[92vh] flex flex-col p-0')}>
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                {title && <DialogTitle className="text-xl">{title}</DialogTitle>}
                {subtitle && (
                  <DialogDescription className="text-sm">{subtitle}</DialogDescription>
                )}
              </div>
              {badge && (
                <Badge variant="outline" className={cn('text-xs shrink-0', badgeClass)}>
                  {badge}
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                {description}
              </p>
            )}
          </DialogHeader>
        </div>

        {/* Tabs */}
        {hasPreview && (
          <div className="flex border-b shrink-0">
            <button
              onClick={() => setActiveTab('preview')}
              className={cn(
                'flex items-center gap-1.5 px-6 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
                activeTab === 'preview'
                  ? 'text-foreground border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground',
              )}
            >
              <Play className="size-4" />
              {labels.preview || 'Preview'}
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={cn(
                'flex items-center gap-1.5 px-6 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
                activeTab === 'code'
                  ? 'text-foreground border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground',
              )}
            >
              <Code2 className="size-4" />
              {labels.code || 'Code'}
            </button>
          </div>
        )}

        {/* Tab Content */}
        <div className="flex-1 min-h-0">
          {activeTab === 'preview' && hasPreview && (
            <div style={{ height: contentHeight }}>
              {preview}
            </div>
          )}

          {activeTab === 'code' && (
            <ScrollArea style={{ height: contentHeight }}>
              <div className="p-4 sm:p-6">
                <div className="rounded-lg bg-[#0c0c14] dark:bg-[#08080e] p-4 overflow-x-auto">
                  <pre className="text-xs sm:text-sm font-mono leading-relaxed">
                    <code>
                      {lines.map((line, i) => (
                        <div key={i} className="flex hover:bg-white/5 -mx-4 px-4 transition-colors">
                          <span className="inline-block w-8 sm:w-10 text-right mr-4 sm:mr-6 text-muted-foreground/30 select-none shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-foreground/80 whitespace-pre">{line}</span>
                        </div>
                      ))}
                    </code>
                  </pre>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t shrink-0">
          <div className="flex items-center gap-2">
            {onLike && likes !== undefined && (
              <Button
                variant="ghost" size="sm"
                className="gap-1.5 text-muted-foreground hover:text-rose-500"
                onClick={onLike}
              >
                <Heart className="size-4" />
                <span className="text-sm">{likes}</span>
              </Button>
            )}
            <Button
              variant="ghost" size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={handleCopy}
            >
              {copied
                ? <Check className="size-4 text-green-500" />
                : <Copy className="size-4" />}
              <span className="text-sm">
                {copied ? (labels.copied || 'Copied!') : (labels.copy || 'Copy')}
              </span>
            </Button>
          </div>

          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost" size="sm"
                  className="gap-1.5 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                  <span className="text-sm">{labels.delete || 'Delete'}</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{labels.deleteTitle || 'Delete'}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {labels.deleteConfirm || 'Are you sure?'}{' '}
                    {labels.deleteNote || 'This action cannot be undone.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{labels.cancel || 'Cancel'}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    {labels.delete || 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
