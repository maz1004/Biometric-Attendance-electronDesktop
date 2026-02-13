import { useState } from "react";
import styled from "styled-components";
import { HiMagnifyingGlass, HiAdjustmentsHorizontal } from "react-icons/hi2";
import { DevicesFilters } from "./DeviceTypes";
import { useTranslation } from "react-i18next";
import Select from "../../ui/Select";

const Bar = styled.div`
  background: var(--color-toolbar-bg);
  border: 1px solid var(--color-toolbar-border);
  border-radius: var(--border-radius-md);
  padding: 1rem 1.2rem;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.8rem;
  align-items: center;
`;
const SearchWrap = styled.label`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  border: 1px solid var(--color-toolbar-input-border);
  background: var(--color-toolbar-input-bg);
  color: var(--color-text-strong);
  border-radius: var(--border-radius-sm);
  padding: 0.6rem 0.8rem;
  input {
    all: unset;
    min-width: 280px;
  }
`;
const Btn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1rem;
  border: 1px solid var(--color-toolbar-input-border);
  background: var(--color-toolbar-input-bg);
  color: var(--color-text-strong);
  border-radius: var(--border-radius-sm);
`;
const Pop = styled.div`
  position: absolute;
  right: 0;
  margin-top: 0.5rem;
  z-index: 30;
  width: 320px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-toolbar-border);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);
  padding: 1.5rem;
  display: grid;
  gap: 1.2rem;
`;
const Row = styled.div`
  display: grid;
  gap: 0.4rem;
`;
const Label = styled.label`
  font-size: 1.2rem;
  color: var(--color-text-dim);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export default function DeviceHeaderBar(props: {
  filters: DevicesFilters;
  onChange: (patch: Partial<DevicesFilters>) => void;
}) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <Bar>
      <SearchWrap>
        <HiMagnifyingGlass />
        <input
          placeholder={t("devices.filters.search_placeholder")}
          value={props.filters.q}
          onChange={(e) => props.onChange({ q: e.target.value })}
        />
      </SearchWrap>

      <div style={{ position: "relative", justifySelf: "end" }}>
        <Btn onClick={() => setOpen((v) => !v)}>
          <HiAdjustmentsHorizontal /> {t("devices.filters.filter_btn")}
        </Btn>
        {open && (
          <Pop>
            <Row>
              <Label>{t("devices.filters.status_label")}</Label>
              <Select
                value={props.filters.status}
                onChange={(e) =>
                  props.onChange({ status: e.target.value as any })
                }
                options={[
                  { value: "all", label: t("devices.filters.status_options.all") },
                  { value: "online", label: t("devices.filters.status_options.online") },
                  { value: "offline", label: t("devices.filters.status_options.offline") },
                  { value: "error", label: t("devices.filters.status_options.error") },
                ]}
              />
            </Row>
            <Row>
              <Label>{t("devices.filters.sort_label")}</Label>
              <Select
                value={props.filters.sort}
                onChange={(e) =>
                  props.onChange({ sort: e.target.value as any })
                }
                options={[
                  { value: "lastsync-new", label: t("devices.filters.sort.newest_sync") },
                  { value: "lastsync-old", label: t("devices.filters.sort.oldest_sync") },
                  { value: "name-az", label: t("devices.filters.sort.name_az") },
                  { value: "name-za", label: t("devices.filters.sort.name_za") },
                ]}
              />
            </Row>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: ".6rem",
                marginTop: "0.5rem"
              }}
            >
              <Btn
                onClick={() =>
                  props.onChange({ q: "", status: "all", sort: "lastsync-new" })
                }
              >
                {t("devices.filters.clear")}
              </Btn>
              <Btn onClick={() => setOpen(false)}>{t("devices.filters.apply")}</Btn>
            </div>
          </Pop>
        )}
      </div>
    </Bar>
  );
}
