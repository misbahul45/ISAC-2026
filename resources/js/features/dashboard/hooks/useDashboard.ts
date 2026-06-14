import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '../api/dashboardApi';
import type { DashboardSummaryResponse } from '../types/dashboardTypes';

const DASHBOARD_SUMMARY_QUERY_KEY = ['dashboard', 'summary'] as const;

export function useDashboard() {
    const summaryQuery = useQuery<DashboardSummaryResponse, Error>({
        queryKey: DASHBOARD_SUMMARY_QUERY_KEY,
        queryFn: getDashboardSummary,
    });

    return {
        summary: summaryQuery.data?.data,
        summaryQuery,
    };
}
