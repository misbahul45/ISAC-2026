import { fetchJson } from '@/lib/api';
import { ROUTES } from '@/constants/routes';
import type { DashboardSummaryResponse } from '../types/dashboardTypes';

export function getDashboardSummary(): Promise<DashboardSummaryResponse> {
    return fetchJson<DashboardSummaryResponse>(ROUTES.api.dashboardSummary);
}
