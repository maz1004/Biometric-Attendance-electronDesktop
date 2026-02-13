import Table from "../../ui/Table";
import AttendanceRow from "./AttendanceRow";
import { AttendanceRecord } from "./AttendanceTypes";
import { useTranslation } from "react-i18next";

export default function AttendanceTable({
  rows,
}: {
  rows: AttendanceRecord[];
}) {
  const { t } = useTranslation();
  return (
    <Table columns="1.5fr 1fr 1fr 1fr 1fr 1fr">
      <Table.Header>
        <div>{t("attendance.table.name")}</div>
        <div>{t("attendance.table.department")}</div>
        <div>{t("attendance.table.date")}</div>
        <div>{t("attendance.table.in")}</div>
        <div>{t("attendance.table.out")}</div>
        <div>{t("attendance.table.status")}</div>
      </Table.Header>

      <Table.Body
        data={rows}
        render={(r) => <AttendanceRow key={r.id} row={r} />}
      />

      <Table.Footer>
        {/* put totals or export buttons here if you like */}
      </Table.Footer>
    </Table>
  );
}
