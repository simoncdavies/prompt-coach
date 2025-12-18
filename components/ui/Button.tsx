import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
                    {
                        'bg-[#2BA84A] text-[#FCFFFC] hover:bg-[#248232] focus:ring-[#2BA84A]': variant === 'primary',
                        'bg-[#248232] text-[#FCFFFC] hover:bg-[#1f6d2b] focus:ring-[#248232]': variant === 'secondary',
                        'border border-[#2D3A3A]/40 text-[#040F0F] hover:bg-[#040F0F]/5 focus:ring-[#2D3A3A]': variant === 'outline',
                        'text-[#2D3A3A] hover:bg-[#040F0F]/5 focus:ring-[#2D3A3A]/60': variant === 'ghost',
                        'h-8 px-3 text-sm': size === 'sm',
                        'h-10 px-4 py-2': size === 'md',
                        'h-12 px-6 text-lg': size === 'lg',
                    },
                    className
                )}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
Button.displayName = 'Button';
