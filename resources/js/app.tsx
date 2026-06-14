import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { QueryProvider } from './providers/QueryProvider';

const appName = import.meta.env.VITE_APP_NAME || 'ISAC 2026';

type PageModule = {
    default: React.ComponentType<any>;
};

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const pages = import.meta.glob<PageModule>('./Pages/**/*.tsx', { eager: true });
        return pages[`./Pages/${name}.tsx`];
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <React.StrictMode>
                <QueryProvider>
                    <App {...props} />
                </QueryProvider>
            </React.StrictMode>,
        );
    },
    progress: {
        color: '#2563eb',
    },
});
