import styled from "styled-components";
import { useAuditLogs } from "./useAuditLogs";
import Spinner from "../../ui/Spinner";
import Table from "../../ui/Table";
import Pagination from "../../ui/Pagination";
import { useSearchParams } from "react-router-dom";
import Tag from "../../ui/Tag";
import { PAGE_SIZE } from "../../utils/constants";

const ActionTag = styled(Tag)`
  font-family: monospace;
  font-size: 1.1rem;
`;

export default function AuditLogTable() {
    const [searchParams] = useSearchParams();
    const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

    const { logs, total, isLoading } = useAuditLogs({
        page,
        limit: PAGE_SIZE,
    });

    if (isLoading) return <Spinner />;

    const getActionColor = (action: string) => {
        if (action.startsWith("CREATE")) return "green";
        if (action.startsWith("UPDATE")) return "blue";
        if (action.startsWith("DELETE")) return "red";
        if (action.includes("PASSWORD")) return "orange";
        return "grey";
    };

    return (
        <Table columns="1.5fr 1.5fr 1fr 1fr 2fr 1fr">
            <Table.Header>
                <div>Date</div>
                <div>Acteur</div>
                <div>Action</div>
                <div>Cible</div>
                <div>Description</div>
                <div>IP</div>
            </Table.Header>

            <Table.Body
                data={logs}
                render={(log) => (
                    <Table.Row key={log.id}>
                        <div>
                            {new Date(log.created_at).toLocaleString("fr-FR", {
                                dateStyle: "short",
                                timeStyle: "short",
                            })}
                        </div>
                        <div style={{ fontWeight: 600 }}>{log.actor_name || log.actor_id}</div>
                        <div>
                            <ActionTag type={getActionColor(log.action) as any}>
                                {log.action}
                            </ActionTag>
                        </div>
                        <div>
                            <span style={{ fontSize: "1.2rem", color: "var(--color-grey-500)" }}>
                                {log.target_type}:
                            </span>{" "}
                            {log.target_id}
                        </div>
                        <div style={{ fontSize: "1.3rem" }}>{log.description}</div>
                        <div style={{ fontSize: "1.1rem", color: "var(--color-grey-500)" }}>
                            {log.ip_address}
                        </div>
                    </Table.Row>
                )}
            />

            <Table.Footer>
                <Pagination count={total} />
            </Table.Footer>
        </Table>
    );
}
