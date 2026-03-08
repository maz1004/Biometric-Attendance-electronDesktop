import styled from "styled-components";
import { ReportData } from "../../../services/types/api-types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
  width: 100%;
  color: var(--color-grey-800);
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding-bottom: 1.6rem;
  border-bottom: 1px solid var(--color-grey-200);

  h2 {
    font-size: 2.4rem;
    font-weight: 700;
    color: var(--color-grey-900);
    margin: 0;
  }

  p {
    font-size: 1.4rem;
    color: var(--color-grey-600);
    margin: 0;
  }
`;

const TableContainer = styled.div`
  background: var(--color-grey-0);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  border: 1px solid var(--color-grey-200);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 1.4rem;

  th {
    background: var(--color-grey-50);
    color: var(--color-grey-600);
    font-weight: 600;
    text-transform: uppercase;
    font-size: 1.2rem;
    letter-spacing: 0.05em;
    padding: 1.6rem;
    text-align: left;
    border-bottom: 1px solid var(--color-grey-200);
  }

  td {
    padding: 1.6rem;
    border-bottom: 1px solid var(--color-grey-100);
    color: var(--color-grey-700);
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover {
    background: var(--color-grey-50);
  }
`;

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 1.2rem;
  border-radius: 100px;
  font-size: 1.2rem;
  font-weight: 600;
  text-transform: capitalize;

  background-color: ${(props) => {
        switch (props.$status.toLowerCase()) {
            case "present": return "var(--color-green-100)";
            case "absent": return "var(--color-red-100)";
            case "late": return "var(--color-yellow-100)";
            case "left_early": return "var(--color-orange-100)";
            case "manual": return "var(--color-purple-100)";
            default: return "var(--color-grey-100)";
        }
    }};

  color: ${(props) => {
        switch (props.$status.toLowerCase()) {
            case "present": return "var(--color-green-700)";
            case "absent": return "var(--color-red-700)";
            case "late": return "var(--color-yellow-700)";
            case "left_early": return "var(--color-orange-700)";
            case "manual": return "var(--color-purple-700)";
            default: return "var(--color-grey-700)";
        }
    }};
`;

const MethodBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.8rem;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: 500;
  background-color: var(--color-grey-100);
  color: var(--color-grey-600);
  text-transform: uppercase;
`;

const EmptyState = styled.div`
  padding: 4.8rem;
  text-align: center;
  color: var(--color-grey-500);
  font-size: 1.6rem;
  background: var(--color-grey-0);
  border-radius: var(--border-radius-md);
  border: 1px dashed var(--color-grey-300);
`;

interface AttendanceLogsHTMLPreviewProps {
    data: ReportData;
}

export function AttendanceLogsHTMLPreview({ data }: AttendanceLogsHTMLPreviewProps) {
    const logs = data.attendance_logs || [];

    const formatTime = (dateString?: string) => {
        if (!dateString) return "-";
        try {
            return format(new Date(dateString), "HH:mm");
        } catch {
            return "-";
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "dd MMM yyyy", { locale: fr });
        } catch {
            return dateString;
        }
    };

    return (
        <Container>
            <Header>
                <h2>Logs de Présence Bruts</h2>
                <p>Période: {data.period}</p>
            </Header>

            {logs.length === 0 ? (
                <EmptyState>Aucun enregistrement trouvé pour ces critères.</EmptyState>
            ) : (
                <TableContainer>
                    <Table>
                        <thead>
                            <tr>
                                <th>Employé</th>
                                <th>Département</th>
                                <th>Date</th>
                                <th>Entrée</th>
                                <th>Sortie</th>
                                <th>Statut</th>
                                <th>Méthode</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log.id}>
                                    <td>
                                        <div style={{ fontWeight: 500, color: 'var(--color-grey-900)' }}>{log.user_name}</div>
                                        <div style={{ fontSize: '1.2rem', color: 'var(--color-grey-500)' }}>{log.user_email}</div>
                                    </td>
                                    <td>{log.department || "-"}</td>
                                    <td>{formatDate(log.date)}</td>
                                    <td>{formatTime(log.check_in_time)}</td>
                                    <td>{formatTime(log.check_out_time)}</td>
                                    <td>
                                        <StatusBadge $status={log.status}>
                                            {log.status.replace("_", " ")}
                                        </StatusBadge>
                                    </td>
                                    <td>
                                        <MethodBadge>{log.method}</MethodBadge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
}
