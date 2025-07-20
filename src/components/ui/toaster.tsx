'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToasterProps {
  className?: string;
}

// Global toast state
let toasts: Toast[] = [];
let listeners: Array<(toasts: Toast[]) => void> = [];

const addToast = (toast: Omit<Toast, 'id'>) => {
  const id = Math.random().toString(36).substr(2, 9);
  const newToast = { id, ...toast };
  toasts = [newToast, ...toasts];
  listeners.forEach(listener => listener(toasts));
  
  // Auto remove after duration
  setTimeout(() => {
    removeToast(id);
  }, toast.duration || 5000);
  
  return id;
};

const removeToast = (id: string) => {
  toasts = toasts.filter(toast => toast.id !== id);
  listeners.forEach(listener => listener(toasts));
};

const subscribe = (listener: (toasts: Toast[]) => void) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
};

// Toast hook
export const useToast = () => {
  const [toastList, setToastList] = useState<Toast[]>(toasts);

  useEffect(() => {
    return subscribe(setToastList);
  }, []);

  const toast = (props: Omit<Toast, 'id'>) => addToast(props);
  
  const success = (title: string, description?: string) => 
    toast({ title, description, type: 'success' });
    
  const error = (title: string, description?: string) => 
    toast({ title, description, type: 'error' });
    
  const warning = (title: string, description?: string) => 
    toast({ title, description, type: 'warning' });
    
  const info = (title: string, description?: string) => 
    toast({ title, description, type: 'info' });

  return {
    toast,
    success,
    error,
    warning,
    info,
    toasts: toastList,
    dismiss: removeToast,
  };
};

export function Toaster({ className }: ToasterProps) {
  const { toasts, dismiss } = useToast();

  const getToastIcon = (type?: string) => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'error':
        return AlertCircle;
      case 'warning':
        return AlertTriangle;
      case 'info':
        return Info;
      default:
        return Info;
    }
  };

  const getToastStyles = (type?: string) => {
    switch (type) {
      case 'success':
        return 'border-success-200 bg-success-50 text-success-800';
      case 'error':
        return 'border-error-200 bg-error-50 text-error-800';
      case 'warning':
        return 'border-warning-200 bg-warning-50 text-warning-800';
      case 'info':
        return 'border-primary-200 bg-primary-50 text-primary-800';
      default:
        return 'border-gray-200 bg-white text-gray-800';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 flex flex-col space-y-2 w-full max-w-sm',
        className
      )}
    >
      {toasts.map((toast) => {
        const Icon = getToastIcon(toast.type);
        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-start space-x-3 rounded-lg border p-4 shadow-lg animate-slide-down',
              getToastStyles(toast.type)
            )}
          >
            <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              {toast.title && (
                <div className="text-sm font-medium">
                  {toast.title}
                </div>
              )}
              {toast.description && (
                <div className="text-sm opacity-90 mt-1">
                  {toast.description}
                </div>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="flex-shrink-0 rounded-md p-1 hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}