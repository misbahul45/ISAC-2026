import type { ApiResponse } from '@/types';

export type DashboardSummary = {
    total: number;
    active: number;
    completed: number;
};

export type DashboardSummaryResponse = ApiResponse<DashboardSummary>;
