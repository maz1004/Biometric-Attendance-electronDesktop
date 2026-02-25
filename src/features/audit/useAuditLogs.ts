import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "../../services";

export function useAuditLogs(filters?: {
    page?: number;
    limit?: number;
    action?: string;
    actor_id?: string;
    target_id?: string;
}) {
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
