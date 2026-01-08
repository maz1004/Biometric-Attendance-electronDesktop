import styled from "styled-components";
import Button from "../../ui/Button";
import { Device } from "./DeviceTypes";
import { HiArrowPath, HiTrash } from "react-icons/hi2";
import { useDeviceControl } from "../../hooks/useDeviceControl";

const Wrap = styled.div`
  border: 1px solid var(--color-border-card);
  border-radius: var(--border-radius-md);
  overflow: hidden;
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  thead th {
    text-align: left;
    background: var(--color-bg-elevated);
    padding: 0.8rem 1rem;
    border-bottom: 1px solid var(--color-border-card);
  }
  tbody td {
    padding: 0.8rem 1rem;
    border-top: 1px solid var(--color-border-card);
    vertical-align: middle;
  }
`;
const Badge = styled.span<{ $s: "online" | "offline" | "error" }>`
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 12px;
  color: #fff;
  background: ${(p) =>
    p.$s === "online" ? "#16a34a" : p.$s === "offline" ? "#6b7280" : "#ef4444"};
`;

const ModeSelect = styled.select`
  padding: 0.2rem 0.5rem;
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-border-input);
  background: var(--color-bg-input);
  color: var(--color-text-input);
  font-size: 12px;
`;

function DeviceRow({ d }: { d: Device }) {
  const { handleSetMode, handleSync, loading } = useDeviceControl();

  return (
    <tr>
      <td style={{ fontWeight: 600 }}>{d.name}</td>
      <td>{d.location ?? "—"}</td>
      <td>
        <Badge $s={d.status}>{d.status}</Badge>
      </td>
      <td>{new Date(d.lastSyncISO).toLocaleString()}</td>
      <td>{d.ip ?? "—"}</td>
      <td>{d.version ?? "—"}</td>
      <td>
        <div style={{ display: "flex", gap: ".4rem", alignItems: "center" }}>
          <ModeSelect
            value={d.currentMode || "recognition"}
            onChange={(e) => handleSetMode(d.id, e.target.value as any)}
            disabled={loading}
          >
            <option value="recognition">Recognition</option>
            <option value="enrollment">Enrollment</option>
          </ModeSelect>

          <Button
            variation="secondary"
            size="small"
            onClick={() => handleSync(d.id)}
            disabled={loading}
          >
            <HiArrowPath />
          </Button>

          <Button variation="danger" size="small">
            <HiTrash />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function DeviceTable(props: { devices: Device[] }) {
  return (
    <Wrap>
      <Table>
        <thead>
          <tr>
            <th>Device</th>
            <th>Location</th>
            <th>Status</th>
            <th>Last sync</th>
            <th>IP</th>
            <th>Version</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {props.devices.map((d) => (
            <DeviceRow key={d.id} d={d} />
          ))}
        </tbody>
      </Table>
    </Wrap>
  );
}
