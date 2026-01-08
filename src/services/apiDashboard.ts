import { apiClient } from "./api";
import { SuccessResponse } from "./types";

export interface TeamMetrics {
    date: string;
    total_team_size: number;
    arrived_count: number;
    late_count: number;
    absent_count: number;
    late_percentage: number;
    absent_percentage: number;
    late_comparison: number;
    absent_comparison: number;
    monthly_avg_late: number;
    monthly_avg_absent: number;
}

export interface AttendanceTrend {
    date: string;
    day: string;
    value: number;
    label: string;
}

export interface PerformanceAlert {
    id: string;
    type: string;
    severity: "low" | "medium" | "high";
    title: string;
    description: string;
    value: number;
    threshold: number;
    createdAt: string;
}

export interface DashboardInsights {
    team_metrics: TeamMetrics;
    attendance_trends: AttendanceTrend[];
    alerts: PerformanceAlert[];
    last_updated: string;
}

// ============================================================================
// DASHBOARD API
// ============================================================================

/**
 * Get dashboard insights
 * GET /api/v1/insights/dashboard
 */
export const getDashboardInsights = async (): Promise<SuccessResponse<DashboardInsights>> => {
    const response = await apiClient.get<SuccessResponse<DashboardInsights>>("/insights/dashboard");
    return response.data;
};
