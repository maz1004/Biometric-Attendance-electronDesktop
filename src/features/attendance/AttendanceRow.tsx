import styled from "styled-components";
import Table from "../../ui/Table";
import Modal from "../../ui/Modal";
import Menus from "../../ui/Menus";
import { HiCheck, HiInformationCircle, HiPencil } from "react-icons/hi2";
import { AttendanceRecord } from "./AttendanceTypes";
import ValidateAnomalyModal from "./ValidateAnomalyModal";

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
      <div style={{ display: "flex", gap: ".6rem" }}>
        <Modal>
          <Menus>
            <Menus.Menu>
              <Menus.Toggle id={row.id} />
              <Menus.List id={row.id}>
                <Modal.Open opens="validate">
                  <Menus.Button icon={<HiCheck />}>
                    Validate/Justify
                  </Menus.Button>
                </Modal.Open>
                <Menus.Button icon={<HiPencil />}>Edit row</Menus.Button>
                <Menus.Button icon={<HiInformationCircle />}>
                  Details
                </Menus.Button>
              </Menus.List>
            </Menus.Menu>

            <Modal.Window name="validate">
              <ValidateAnomalyModal
                record={row}
                onCloseModal={() => {}}
                onValidate={(payload) => {
                  console.log("VALIDATE", payload);
                }}
              />
            </Modal.Window>
          </Menus>
        </Modal>
      </div>
    </Table.Row>
  );
}
