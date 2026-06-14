import type { ReactNode } from 'react';

type SectionShellProps = {
    children: ReactNode;
};

export function SectionShell({ children }: SectionShellProps) {
    return <section>{children}</section>;
}
