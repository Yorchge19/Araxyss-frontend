'use client';

import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  size?: ModalSize;
  nested?: boolean;
  showClose?: boolean;
  className?: string;
  panelClassName?: string;
}

const sizeClass: Record<ModalSize, string> = {
  sm: 'ui-modal-panel--md',
  md: 'ui-modal-panel--lg',
  lg: 'ui-modal-panel--xl',
  xl: 'max-w-4xl',
};

export function Modal({
  open,
  onClose,
  children,
  title,
  subtitle,
  size = 'md',
  nested = false,
  showClose = true,
  className,
  panelClassName,
}: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    if (!nested) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open, nested]);

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, handleEscape]);

  if (!open) return null;

  return (
    <div
      className={cn(
        nested ? 'ui-modal-overlay ui-modal-overlay--nested' : 'ui-modal-overlay',
        className
      )}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={cn('ui-modal-panel', sizeClass[size], panelClassName)}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {(title || showClose) && (
          <div className="flex items-start justify-between gap-4 p-6 border-b border-border shrink-0">
            <div className="min-w-0">
              {title && (
                <h2 id="modal-title" className="text-lg font-bold text-text-heading">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-sm text-text-muted mt-1">{subtitle}</p>
              )}
            </div>
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 p-1.5 rounded-lg text-text-muted hover:text-text-heading hover:bg-surface-hover transition-colors"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
