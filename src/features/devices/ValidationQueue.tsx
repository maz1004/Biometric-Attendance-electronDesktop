import styled from "styled-components";
import { Capture, Device, QueueFilters } from "./DeviceTypes";
import CaptureCard from "./CaptureCard";

const Panel = styled.div`
  border: 1px solid var(--color-border-card);
  border-radius: var(--border-radius-md);
  padding: 1rem;
  display: grid;
  gap: 1rem;
`;
const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const Filters = styled.div`
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
`;
const Select = styled.select`
  padding: 0.5rem 0.7rem;
  border: 1px solid var(--color-toolbar-input-border);
  background: var(--color-toolbar-input-bg);
  color: var(--color-text-strong);
  border-radius: var(--border-radius-sm);
`;
const Range = styled.input.attrs({ type: "range", min: 0, max: 1, step: 0.01 })`
  accent-color: var(--color-brand-600);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(520px, 1fr));
  gap: 12px;
`;

export default function ValidationQueue(props: {
  allDevices: Device[];
  filters: QueueFilters;
  onChange: (patch: Partial<QueueFilters>) => void;
  items: Capture[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <Panel>
      <Head>
        <strong>Unverified Captures</strong>
        <Filters>
          <Select
            value={props.filters.device}
            onChange={(e) => props.onChange({ device: e.target.value })}
          >
            <option value="all">All devices</option>
            {props.allDevices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>

          <Select
            value={props.filters.liveness}
            onChange={(e) =>
              props.onChange({ liveness: e.target.value as any })
            }
          >
            <option value="all">All liveness</option>
            <option value="pass">Liveness pass</option>
            <option value="fail">Liveness fail</option>
            <option value="unknown">Unknown</option>
          </Select>

          <Select
            value={props.filters.status}
            onChange={(e) => props.onChange({ status: e.target.value as any })}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </Select>

          <label
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <span style={{ opacity: 0.75, fontSize: 12 }}>min score</span>
            <Range
              value={props.filters.scoreMin}
              onChange={(e) =>
                props.onChange({ scoreMin: Number(e.target.value) })
              }
            />
            <span style={{ width: 36, textAlign: "right" }}>
              {props.filters.scoreMin.toFixed(2)}
            </span>
          </label>
        </Filters>
      </Head>

      <Grid>
        {props.items.map((c) => (
          <CaptureCard
            key={c.id}
            capture={c}
            device={props.allDevices.find((d) => d.id === c.deviceId)}
            onAccept={props.onAccept}
            onReject={props.onReject}
          />
        ))}
      </Grid>
    </Panel>
  );
}
