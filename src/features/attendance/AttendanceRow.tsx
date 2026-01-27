import styled from "styled-components";
import Table from "../../ui/Table";
import { AttendanceRecord } from "./AttendanceTypes";

const Badge = styled.span<{ $type: string }>`
  padding: 0.35rem 0.7rem;
  border-radius: var(--border-radius-sm);
  font-size: 1.2rem;
  font-weight: 600;
  text-transform: capitalize;
  ${({ $type }) => {
    if ($type === "present")
      return `background: rgba(16,185,129,.15); color:#22c55e; border:1px solid rgba(16,185,129,.35);`;
    if ($type === "late")
      return `background: rgba(245,158,11,.15); color:#f59e0b; border:1px solid rgba(245,158,11,.35);`;
    if ($type === "absent")
      return `background: rgba(244,63,94,.15); color:#f43f5e; border:1px solid rgba(244,63,94,.35);`;
    if ($type === "left-early")
      return `background: rgba(59,130,246,.15); color:#3b82f6; border:1px solid rgba(59,130,246,.35);`;
    return `background: rgba(148,163,184,.15); color:#94a3b8; border:1px solid rgba(148,163,184,.35);`;
  }}
`;

export default function AttendanceRow({ row }: { row: AttendanceRecord }) {


  return (
    <Table.Row>
      <div style={{ fontWeight: 600, color: "var(--color-text-strong)" }}>
        {row.fullName}
      </div>
      <div style={{ color: "var(--color-text-dim)" }}>{row.department}</div>
      <div>{row.dateISO}</div>
      <div>{row.checkIn ?? "—"}</div>
      <div>{row.checkOut ?? "—"}</div>
      <div>
        <Badge $type={row.status}>{row.status.replace("-", " ")}</Badge>
      </div>

    </Table.Row>
  );
}
