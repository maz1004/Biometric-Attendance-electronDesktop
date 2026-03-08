import { useState } from "react";
import styled from "styled-components";
import Heading from "../ui/Heading";
import Row from "../ui/Row";
import Spinner from "../ui/Spinner";
import Pagination from "../ui/Pagination";
import AuditLogTable from "../features/audit/AuditLogTable";
import AuditLogFilters, { ACTION_CATEGORY_MAP } from "../features/audit/AuditLogFilters";
import AuditLogDetailModal from "../features/audit/AuditLogDetailModal";
import { useAuditLogs } from "../features/audit/useAuditLogs";
import { AuditLog } from "../services/types/api-types";
import { useSearchParams } from "react-router-dom";

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
`;

export default function AuditLogs() {
    const [searchParams] = useSearchParams();
    const page = Number(searchParams.get("page") || "1");

    // Filter state
    const [selectedActions, setSelectedActions] = useState<string[]>([]);
    const [selectedCrud, setSelectedCrud] = useState<string[]>([]);
    const [selectedManagers, setSelectedManagers] = useState<string[]>([]);

    // Detail modal state
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    // Map action categories to actual action strings for the API
    const resolvedActions: string[] = selectedActions.flatMap(
        category => ACTION_CATEGORY_MAP[category] || []
    );

    // Mutual exclusion: if connection is selected, ignore CRUD
    const isConnectionSelected = selectedActions.includes("connection");
    const resolvedCrud = isConnectionSelected ? [] : selectedCrud;

    const { isLoading, logs, total } = useAuditLogs({
        page,
        limit: 20,
        actor_ids: selectedManagers.length > 0 ? selectedManagers : undefined,
        actions: resolvedActions.length > 0 ? resolvedActions : undefined,
        crud: resolvedCrud.length > 0 ? resolvedCrud : undefined,
    });

    return (
        <PageContainer>
            <Row type="horizontal">
                <Heading as="h1">Journal d'Audit</Heading>
            </Row>

            <AuditLogFilters
                selectedActions={selectedActions}
                onActionsChange={setSelectedActions}
                selectedCrud={selectedCrud}
                onCrudChange={setSelectedCrud}
                selectedManagers={selectedManagers}
                onManagersChange={setSelectedManagers}
            />

            {isLoading ? (
                <Spinner />
            ) : (
                <>
                    <AuditLogTable
                        logs={logs}
                        onRowClick={(log) => setSelectedLog(log)}
                    />
                    <Pagination count={total} />
                </>
            )}

            {selectedLog && (
                <AuditLogDetailModal
                    log={selectedLog}
                    onClose={() => setSelectedLog(null)}
                />
            )}
        </PageContainer>
    );
}
