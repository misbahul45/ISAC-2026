export const ROUTES = {
    home: '/',
    login: '/auth/login',
    register: '/auth/register',
    dashboard: '/dashboard',
    todos: '/todos',
    api: {
        todos: '/api/todos',
        dashboardSummary: '/api/dashboard/summary',
        dashboardExam: (examId: string) => `/api/dashboard/exams/${examId}`,
        dashboardStage: (stageId: string) => `/api/dashboard/stages/${stageId}`,
    },
} as const;
