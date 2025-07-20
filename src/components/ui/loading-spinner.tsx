import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={cn('flex items-center justify-center p-4', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-primary-500',
          sizeClasses[size]
        )}
      />
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}