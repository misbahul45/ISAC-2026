import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary, getExamShell, getSubmissionShell } from '../api/dashboardApi';
import type { DashboardSummaryResponse, ExamShellResponse, SubmissionShellResponse } from '../types/dashboardTypes';

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

export function useExamShell(examId: string) {
    return useQuery<ExamShellResponse, Error>({
        queryKey: ['dashboard', 'exam', examId],
        queryFn: () => getExamShell(examId),
        enabled: examId.length > 0,
    });
}

export function useSubmissionShell(stageId: string) {
    return useQuery<SubmissionShellResponse, Error>({
        queryKey: ['dashboard', 'stage', stageId],
        queryFn: () => getSubmissionShell(stageId),
        enabled: stageId.length > 0,
    });
}
