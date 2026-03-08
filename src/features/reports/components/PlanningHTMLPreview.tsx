import styled from "styled-components";
import { ReportData, DailyReportRecord } from "../../../services/types/api-types";

const Container = styled.div`
  width: 100%;
  font-size: 1.3rem;
  background: var(--color-grey-0);
  padding: 2rem;
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 3rem;
  color: var(--color-grey-900);
`;

const Title = styled.h3`
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--color-grey-800);
  text-align: center;
  margin-bottom: 1rem;
`;

const ChunkContainer = styled.div`
  overflow-x: auto;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;

  th, td {
    border: 1px solid var(--color-grey-200);
    padding: 0.8rem 1rem;
    text-align: left;
    vertical-align: middle;
  }

  th {
    background-color: var(--color-grey-50);
    font-weight: 600;
    color: var(--color-grey-700);
  }

  /* Make the first column sticky if needed */
  th:first-child, td:first-child {
    background-color: var(--color-grey-0);
    font-weight: 500;
    min-width: 180px;
    border-right: 2px solid var(--color-grey-200);
  }

  tbody tr:nth-child(even) {
    background-color: var(--color-grey-50);
  }

  tbody tr:nth-child(even) td:first-child {
    background-color: var(--color-grey-50);
  }
`;

const ShiftBadge = styled.div<{ $isEmpty?: boolean }>`
  background-color: ${props => props.$isEmpty ? 'transparent' : 'var(--color-brand-500)'};
  color: ${props => props.$isEmpty ? 'var(--color-grey-400)' : 'var(--color-brand-100)'};
  padding: 0.6rem 0.8rem;
  border-radius: var(--border-radius-sm);
  font-size: 1.2rem;
  font-weight: 500;
  text-align: center;
  border: ${props => props.$isEmpty ? '1px dashed var(--color-grey-300)' : 'none'};
  min-height: 4.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
`;

interface PlanningHTMLPreviewProps {
    data: ReportData;
}

// Helpers
function parsePeriodToDates(period: string): { start: Date, end: Date } {
    let dates = period.includes(' → ') ? period.split(' → ') : period.split(' - ');
    const start = new Date(dates[0] ? dates[0].trim() : new Date().toISOString().slice(0, 10));
    const end = new Date(dates[1] ? dates[1].trim() : start);
    return { start, end };
}

function getDaysArray(start: Date, end: Date): Date[] {
    const arr = [];
    let dt = new Date(start);
    while (dt <= end) {
        arr.push(new Date(dt));
        dt.setDate(dt.getDate() + 1);
    }
    return arr;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
        arr.slice(i * size, i * size + size)
    );
}

function formatDateHeader(d: Date): string {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${days[d.getDay()]} ${da}/${mo}`;
}

function formatTimeRange(checkIn?: string, checkOut?: string): string {
    if (!checkIn || !checkOut) return "";

    // Using UTC exact substrings as backend pushes strings without timezone shifting
    const inTime = checkIn.includes("T") ? checkIn.split("T")[1].substring(0, 5) : "";
    const outTime = checkOut.includes("T") ? checkOut.split("T")[1].substring(0, 5) : "";

    if (inTime && outTime) return `${inTime} - ${outTime}`;
    return "";
}

function normalizeDateStr(d: Date | string): string {
    if (typeof d === 'string') {
        // assume it is ISO string, grab YYYY-MM-DD
        return d.slice(0, 10);
    }
    return d.toISOString().slice(0, 10);
}

export function PlanningHTMLPreview({ data }: PlanningHTMLPreviewProps) {
    const { start, end } = parsePeriodToDates(data.period);
    const allDays = getDaysArray(start, end);
    const dayChunks = chunkArray(allDays, 7);

    // Map records for quick O(1) loop access: recordMap[userId][YYYY-MM-DD] = record
    const recordMap: Record<string, Record<string, DailyReportRecord>> = {};
    if (data.users) {
        data.users.forEach(user => {
            recordMap[user.user_id] = {};
            if (user.daily_records) {
                user.daily_records.forEach(rec => {
                    const dStr = normalizeDateStr(rec.date);
                    recordMap[user.user_id][dStr] = rec;
                });
            }
        });
    }

    return (
        <Container>
            <div>
                <Title>Rapport Planning</Title>
                <div style={{ textAlign: "center", color: "var(--color-grey-500)", marginBottom: "1rem" }}>
                    Du {start.toLocaleDateString("fr-FR")} au {end.toLocaleDateString("fr-FR")}
                </div>
            </div>

            {dayChunks.map((chunk, chunkIdx) => (
                <ChunkContainer key={chunkIdx}>
                    <StyledTable>
                        <thead>
                            <tr>
                                <th>Employé</th>
                                {chunk.map(d => (
                                    <th key={d.toISOString()} style={{ textAlign: 'center' }}>
                                        {formatDateHeader(d)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.users?.map(user => (
                                <tr key={user.user_id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{user.user_name}</div>
                                        <div style={{ fontSize: "1.1rem", color: "var(--color-grey-500)" }}>
                                            {user.department !== 'all' ? user.department : 'Non assigné'}
                                        </div>
                                    </td>
                                    {chunk.map(d => {
                                        const dStr = normalizeDateStr(d);
                                        const rec = recordMap[user.user_id]?.[dStr];
                                        return (
                                            <td key={dStr}>
                                                {rec ? (
                                                    <ShiftBadge>
                                                        <div style={{ fontWeight: 600 }}>{rec.status}</div>
                                                        {rec.check_in && rec.check_out ? (
                                                            <div style={{ fontSize: "1.05rem", opacity: 0.9 }}>
                                                                {formatTimeRange(rec.check_in, rec.check_out)}
                                                            </div>
                                                        ) : rec.work_duration_hours > 0 ? (
                                                            <div style={{ fontSize: "1.05rem", opacity: 0.9 }}>
                                                                ({rec.work_duration_hours}h)
                                                            </div>
                                                        ) : null}
                                                    </ShiftBadge>
                                                ) : (
                                                    <ShiftBadge $isEmpty>Repos</ShiftBadge>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </StyledTable>
                </ChunkContainer>
            ))}
        </Container>
    );
}
