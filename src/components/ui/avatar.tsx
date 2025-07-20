import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export function Avatar({ 
  src, 
  alt = '', 
  fallback = '?', 
  size = 'md', 
  className 
}: AvatarProps) {
  const sizeClasses: { [key: string]: string } = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm', 
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl'
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <AvatarPrimitive.Root className={cn('relative flex shrink-0 overflow-hidden rounded-full', sizeClass, className)}>
      <AvatarPrimitive.Image
        src={src}
        alt={alt}
        className="aspect-square h-full w-full object-cover"
      />
      <AvatarPrimitive.Fallback className={cn('flex h-full w-full items-center justify-center rounded-full bg-muted font-medium', sizeClass)}>
        {fallback}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}