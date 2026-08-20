import { fetchJson } from '@/lib/api';
import { ROUTES } from '@/constants/routes';
import type {
    DashboardSummaryResponse,
    ExamShellResponse,
    SubmissionShellResponse,
} from '../types/dashboardTypes';

export function getDashboardSummary(): Promise<DashboardSummaryResponse> {
    return fetchJson<DashboardSummaryResponse>(ROUTES.api.dashboardSummary);
}

export function getExamShell(examId: string): Promise<ExamShellResponse> {
    return fetchJson<ExamShellResponse>(`/api/dashboard/exams/${examId}`);
}

export function getSubmissionShell(stageId: string): Promise<SubmissionShellResponse> {
    return fetchJson<SubmissionShellResponse>(`/api/dashboard/stages/${stageId}`);
}
