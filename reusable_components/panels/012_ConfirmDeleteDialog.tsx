'use client'

import { cn } from 'tailwind-variants'
import { Button } from './ui-button' // shadcn/ui button

/**
 * ConfirmDeleteDialog — reusable confirmation dialog for destructive actions.
 * Pattern was duplicated 8+ times across Wiki-Codex-v2 components.
 *
 * Source: Wiki-Codex-v2 /src/components/codex/*.tsx (AlertDialog pattern)
 * De-hardcoded:
 *   - Generic title, description, confirmLabel, cancelLabel
 *   - Async onConfirm with loading state
 *   - Configurable variant (default: destructive)
 *   - Controlled open state
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui-alert-dialog' // shadcn/ui alert-dialog

interface ConfirmDeleteDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Called when open state should change */
  onOpenChange: (open: boolean) => void
  /** Dialog title */
  title?: string
  /** Dialog description (supports JSX for item name interpolation) */
  description?: React.ReactNode
  /** Confirm button label */
  confirmLabel?: string
  /** Cancel button label */
  cancelLabel?: string
  /** Async confirm callback */
  onConfirm: () => Promise<void> | void
  /** Whether the action is in progress */
  isLoading?: boolean
  /** Additional class name for the confirm button */
  className?: string
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title = 'Delete item?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  isLoading = false,
  className,
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={cn('bg-destructive text-white hover:bg-destructive/90', className)}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
