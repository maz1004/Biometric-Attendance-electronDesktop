import { useQuery } from "@tanstack/react-query";
import { getUser } from "../../../../../services/users";
import { getHistory } from "../../../../../services/attendance";
import { UserResponse } from "../../../../../services/types/api-types";
import { subMonths } from "date-fns";

export interface EmployeeHistoryData {
    user: UserResponse;
    history: any[]; // The raw history records
    isLoading: boolean;
}

export function useEmployeeHistory(employeeId: string) {
    // 1. Fetch full User details (for profile info)
    const { data: user, isLoading: isLoadingUser } = useQuery({
        queryKey: ["user", employeeId],
        queryFn: () => getUser(employeeId),
        enabled: !!employeeId
    });

    // 2. Fetch History (defaulting to last 3 months for the report)
    const startDate = subMonths(new Date(), 3).toISOString();
    const endDate = new Date().toISOString();

    const { data: historyData, isLoading: isLoadingHistory } = useQuery({
        queryKey: ["attendanceHistory", employeeId, "eport"],
        queryFn: () => getHistory({
            user_id: employeeId,
            start_date: startDate,
            end_date: endDate
        }),
        enabled: !!employeeId
    });

    return {
        user,
        history: historyData?.records || [],
        isLoading: isLoadingUser || isLoadingHistory
    };
}
