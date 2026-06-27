import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export function LoadingSpinner({ size = 'md', className, label }: LoadingSpinnerProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3', className)}
      role="status"
      aria-live="polite"
    >
      <div className={cn('ui-spinner', `ui-spinner--${size}`)} />
      {label && <p className="text-sm text-text-muted animate-pulse">{label}</p>}
    </div>
  );
}

export function LoadingScreen({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="min-h-screen bg-[#121212] dark:bg-canvas flex flex-col justify-center items-center gap-4 px-4">
      <div
        className="w-10 h-10 rounded-full border-2 border-[#757575] border-t-white animate-spin"
        role="status"
        aria-hidden
      />
      {label && (
        <p className="text-sm text-[#757575] dark:text-text-muted text-center">{label}</p>
      )}
    </div>
  );
}
