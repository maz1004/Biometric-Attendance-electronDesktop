import { useQuery } from "@tanstack/react-query";
import { getDashboardInsights } from "../../services/apiDashboard";
import { getEmployees } from "../../services/employees";

export function useDashboard() {
    // 1. Fetch Insights (currently mocked in backend)
    const { data: insightsData, isLoading: isLoadingInsights, error: errorInsights } = useQuery({
        queryKey: ["dashboard", "insights"],
        queryFn: async () => {
            const res = await getDashboardInsights();
            return res.data;
        },
        refetchInterval: 60000,
    });

    // 2. Fetch Real Employee Data to override mocked counts
    const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
        queryKey: ["employees", { limit: 1 }],
        queryFn: () => getEmployees({ limit: 1 }),
    });

    const stats = insightsData?.team_metrics;
    const realTotalEmployees = employeesData?.total || stats?.total_team_size || 0;

    // Enhance stats with real total count. If insightsData is missing, provide a skeleton with real total.
    const enhancedStats = {
        ...(stats || {
            arrived_count: 0,
            late_count: 0,
            absent_count: realTotalEmployees,
            late_percentage: 0,
            absent_percentage: 100,
            late_comparison: 0,
            absent_comparison: 0,
            monthly_avg_late: 0,
            monthly_avg_absent: 0,
            date: new Date().toISOString().split('T')[0],
        }),
        total_team_size: realTotalEmployees,
    };

    return {
        isLoading: isLoadingInsights || isLoadingEmployees,
        error: errorInsights,
        stats: (isLoadingInsights && !insightsData) ? undefined : enhancedStats,
        trends: insightsData?.attendance_trends || [],
        alerts: insightsData?.alerts || [],
        lastUpdated: insightsData?.last_updated || new Date().toISOString(),
    };
}
