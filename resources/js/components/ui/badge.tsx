import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
    children: ReactNode;
};

export function Badge({ children, className, ...props }: BadgeProps) {
    return (
        <span className={cn(className)} {...props}>
            {children}
        </span>
    );
}
