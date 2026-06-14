import type { ReactNode } from 'react';

type AppLayoutProps = {
    children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
    return <>{children}</>;
}
