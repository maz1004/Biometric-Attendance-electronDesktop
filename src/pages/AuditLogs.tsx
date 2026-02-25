import Heading from "../ui/Heading";
import Row from "../ui/Row";
import AuditLogTable from "../features/audit/AuditLogTable";

export default function AuditLogs() {
    return (
        <>
            <Row type="horizontal">
                <Heading as="h1">Audit Logs</Heading>
            </Row>

            <Row>
                <AuditLogTable />
            </Row>
        </>
    );
}
