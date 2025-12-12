import styled from "styled-components";
import { useDevices } from "../features/devices/useDevices";
import DeviceHeaderBar from "../features/devices/DeviceHeaderBar";
import ValidationQueue from "../features/devices/ValidationQueue";
import DeviceTable from "../features/devices/DeviceTable";

const Section = styled.section`
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: 2rem;
  display: grid;
  gap: 1.6rem;
`;

export default function Devices(): JSX.Element {
  const d = useDevices();

  return (
    <Section>
      <h2 style={{ margin: 0 }}>Devices & Validation</h2>

      <DeviceHeaderBar
        filters={d.devFilters}
        onChange={(patch) => d.setDevFilters((prev) => ({ ...prev, ...patch }))}
      />

      <DeviceTable devices={d.devices} />

      <ValidationQueue
        allDevices={d.allDevices}
        filters={d.qFilters}
        onChange={(patch) => d.setQFilters(prev => ({ ...prev, ...patch }))}
        items={d.queue}
        onAccept={(id) => d.setCaptureStatus(id, "accepted")}
        onReject={(id) => d.setCaptureStatus(id, "rejected")}
      />
    </Section>
  );
}
