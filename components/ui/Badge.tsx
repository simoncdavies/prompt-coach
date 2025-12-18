import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'outline' | 'destructive' | 'success' | 'warning';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                {
                    'border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80': variant === 'default',
                    'text-slate-950': variant === 'outline',
                    'border-transparent bg-red-500 text-white hover:bg-red-600': variant === 'destructive',
                    'border-transparent bg-green-500 text-white hover:bg-green-600': variant === 'success',
                    'border-transparent bg-amber-500 text-white hover:bg-amber-600': variant === 'warning',
                },
                className
            )}
            {...props}
        />
    );
}
