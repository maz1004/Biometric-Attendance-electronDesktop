import { useQuery } from "@tanstack/react-query";
import { getDashboardInsights } from "../../services/apiDashboard";
import { getEmployees } from "../../services/employees";
import { getHistory } from "../../services/attendance";
import { AttendanceRecord, StatusType } from "../attendance/AttendanceTypes";

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

    // 3. Fetch Recent Attendance for List
    const { data: attendanceData, isLoading: isLoadingAttendance } = useQuery({
        queryKey: ["attendance", "recent"],
        queryFn: () => getHistory({ limit: 10 } as any),
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

    // Transform raw API history into UI AttendanceRecord
    const rawAttendance = attendanceData as any;
    const recentAttendance: AttendanceRecord[] = (rawAttendance?.data || rawAttendance?.records || []).map((r: any) => ({
        id: r.id,
        employeeId: r.user_id,
        fullName: r.user_name || r.user_id,
        department: r.department || "General",
        dateISO: (r.timestamp || "").split('T')[0],
        checkIn: r.check_in_time ? new Date(r.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
        checkOut: r.check_out_time ? new Date(r.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
        status: r.status as StatusType,
        justification: r.notes,
        deviceId: r.location
    }));

    return {
        isLoading: isLoadingInsights || isLoadingEmployees || isLoadingAttendance,
        error: errorInsights,
        stats: (isLoadingInsights && !insightsData) ? undefined : enhancedStats,
        trends: insightsData?.attendance_trends || [],
        alerts: insightsData?.alerts || [],
        recentAttendance,
        lastUpdated: insightsData?.last_updated || new Date().toISOString(),
    };
}
