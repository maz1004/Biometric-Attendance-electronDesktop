import styled from "styled-components";
import { Device } from "./DeviceTypes";
import { HiArrowPath, HiTrash, HiCpuChip, HiUserPlus } from "react-icons/hi2";
import { useDeviceControl } from "../../hooks/useDeviceControl";
import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import Modal from "../../ui/Modal";
import ConfirmDelete from "../../ui/ConfirmDelete";

const Badge = styled.span<{ $s: "online" | "offline" | "error" }>`
  display: inline-block;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  font-size: 1.2rem;
  font-weight: 500;
  text-transform: uppercase;
  color: ${(p) => (p.$s === "online" ? "#15803d" : p.$s === "error" ? "#b91c1c" : "#4b5563")};
  background: ${(p) => (p.$s === "online" ? "#dcfce7" : p.$s === "error" ? "#fee2e2" : "#f3f4f6")};
`;

const SecondaryText = styled.div`
  font-size: 1.2rem;
  color: var(--color-grey-500);
`;

const DeviceName = styled.div`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-900);
`;

function DeviceRow({ d }: { d: Device }) {
  const { handleSetMode, handleSync, loading } = useDeviceControl();

  return (
    <Table.Row>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
        <DeviceName>{d.name}</DeviceName>
        <SecondaryText>{d.ip ?? "No IP"}</SecondaryText>
      </div>

      <div>{d.location ?? "—"}</div>

      <div>
        <Badge $s={d.status}>{d.status}</Badge>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
        <span>{new Date(d.lastSyncISO).toLocaleDateString()}</span>
        <SecondaryText>{new Date(d.lastSyncISO).toLocaleTimeString()}</SecondaryText>
      </div>

      <div>
        {d.currentMode === "recognition" ? "Recognition" : d.currentMode === "enrollment" ? "Enrollment" : "Idle"}
      </div>

      <div>{d.version ?? "1.0.0"}</div>

      <div>
        <Modal>
          <Menus.Menu>
            <Menus.Toggle id={d.id} />

            <Menus.List id={d.id}>
              <Menus.Button icon={<HiArrowPath />} onClick={() => handleSync(d.id)}>
                Sync Now
              </Menus.Button>

              {d.currentMode !== "recognition" && (
                <Menus.Button icon={<HiCpuChip />} onClick={() => handleSetMode(d.id, "recognition")}>
                  Switch to Recognition
                </Menus.Button>
              )}

              {d.currentMode !== "enrollment" && (
                <Menus.Button icon={<HiUserPlus />} onClick={() => handleSetMode(d.id, "enrollment")}>
                  Switch to Enrollment
                </Menus.Button>
              )}

              <Modal.Open opens="delete-device">
                <Menus.Button icon={<HiTrash />}>Delete Device</Menus.Button>
              </Modal.Open>
            </Menus.List>
          </Menus.Menu>

          <Modal.Window name="delete-device">
            <ConfirmDelete
              resourceName={`Device ${d.name}`}
              onConfirm={() => {
                // TODO: Implement delete logic
                console.log("Delete device", d.id);
              }}
              disabled={loading}
              onCloseModal={() => { }}
            />
          </Modal.Window>
        </Modal>
      </div>
    </Table.Row>
  );
}

export default function DeviceTable({ devices }: { devices: Device[] }) {
  return (
    <Menus>
      <Table columns="1.8fr 1.2fr 0.8fr 1.2fr 1.2fr 0.8fr 3.2rem">
        <Table.Header>
          <div>Device</div>
          <div>Location</div>
          <div>Status</div>
          <div>Last Sync</div>
          <div>Mode</div>
          <div>Version</div>
          <div></div>
        </Table.Header>

        <Table.Body data={devices} render={(d) => <DeviceRow key={d.id} d={d} />} />
      </Table>
    </Menus>
  );
}
