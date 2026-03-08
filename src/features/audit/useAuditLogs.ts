import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "../../services";

export interface AuditLogFiltersParams {
    page?: number;
    limit?: number;
    actor_ids?: string[];
    actions?: string[];
    crud?: string[];
    target_id?: string;
}

export function useAuditLogs(filters?: AuditLogFiltersParams) {
    const {
        isLoading,
        data,
        error,
    } = useQuery({
        queryKey: ["audit-logs", filters],
        queryFn: () => getAuditLogs(filters),
    });

    return {
        isLoading,
        logs: data?.logs || [],
        total: data?.total || 0,
        error,
    };
}
