import { ROUTES } from './routes';

export const MAIN_NAVIGATION = [
    {
        label: 'Dashboard',
        href: ROUTES.dashboard,
    },
    {
        label: 'Todos',
        href: ROUTES.todos,
    },
] as const;
