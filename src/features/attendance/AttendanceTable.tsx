import Table from "../../ui/Table";
import AttendanceRow from "./AttendanceRow";
import { AttendanceRecord } from "./AttendanceTypes";

export default function AttendanceTable({
  rows,
}: {
  rows: AttendanceRecord[];
}) {
  return (
    <Table columns="1.5fr 1fr 1fr 0.7fr 0.7fr 0.9fr 0.5fr">
      <Table.Header>
        <div>Name</div>
        <div>Department</div>
        <div>Date</div>
        <div>In</div>
        <div>Out</div>
        <div>Status</div>
        <div>Actions</div>
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
