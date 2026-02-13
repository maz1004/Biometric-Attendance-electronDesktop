import styled from "styled-components";
import { Capture, Device, QueueFilters } from "./DeviceTypes";
import CaptureCard from "./CaptureCard";
import { useTranslation } from "react-i18next";


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
  const { t } = useTranslation();

  return (
    <Panel>
      <Head>
        <strong>{t("devices.validation.title")}</strong>
        <Filters>
          <Select
            value={props.filters.device}
            onChange={(e) => props.onChange({ device: e.target.value })}
          >
            <option value="all">{t("devices.validation.filters.all_devices")}</option>
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
            <option value="all">{t("devices.validation.filters.all_liveness")}</option>
            <option value="pass">{t("devices.validation.filters.liveness_pass")}</option>
            <option value="fail">{t("devices.validation.filters.liveness_fail")}</option>
            <option value="unknown">{t("devices.validation.filters.unknown")}</option>
          </Select>

          <Select
            value={props.filters.status}
            onChange={(e) => props.onChange({ status: e.target.value as any })}
          >
            <option value="all">{t("devices.validation.filters.all_statuses")}</option>
            <option value="pending">{t("devices.validation.filters.pending")}</option>
            <option value="accepted">{t("devices.validation.filters.accepted")}</option>
            <option value="rejected">{t("devices.validation.filters.rejected")}</option>
          </Select>

          <label
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <span style={{ opacity: 0.75, fontSize: 12 }}>{t("devices.validation.filters.min_score")}</span>
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
