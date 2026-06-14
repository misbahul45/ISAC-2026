export const ROUTES = {
    home: '/',
    login: '/auth/login',
    register: '/auth/register',
    dashboard: '/dashboard',
    todos: '/todos',
    api: {
        todos: '/api/todos',
        dashboardSummary: '/api/dashboard/summary',
    },
} as const;
