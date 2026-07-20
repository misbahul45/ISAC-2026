import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ApiClientError } from '@/lib/api';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 30,
            retry: (failureCount, error) => {
                if (error instanceof ApiClientError) {
                    return error.status >= 500 && failureCount < 1;
                }

                return failureCount < 1;
            },
            refetchOnWindowFocus: false,
        },
    },
});

type QueryProviderProps = {
    children: ReactNode;
};

export function QueryProvider({ children }: QueryProviderProps) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
