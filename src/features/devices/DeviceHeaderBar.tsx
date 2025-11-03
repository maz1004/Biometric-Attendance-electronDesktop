import styled from "styled-components";
import { HiMagnifyingGlass, HiAdjustmentsHorizontal } from "react-icons/hi2";
import { DevicesFilters } from "./DeviceTypes";

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
  padding: 1rem;
  display: grid;
  gap: 0.8rem;
`;
const Row = styled.div`
  display: grid;
  gap: 0.4rem;
`;
const Label = styled.label`
  font-size: 1.2rem;
  color: var(--color-text-dim);
`;
const Select = styled.select`
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--color-toolbar-input-border);
  background: var(--color-toolbar-input-bg);
  color: var(--color-text-strong);
  border-radius: var(--border-radius-sm);
`;

export default function DeviceHeaderBar(props: {
  filters: DevicesFilters;
  onChange: (patch: Partial<DevicesFilters>) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Bar>
      <SearchWrap>
        <HiMagnifyingGlass />
        <input
          placeholder="Search device, IP, location…"
          value={props.filters.q}
          onChange={(e) => props.onChange({ q: e.target.value })}
        />
      </SearchWrap>

      <div style={{ position: "relative", justifySelf: "end" }}>
        <Btn onClick={() => setOpen((v) => !v)}>
          <HiAdjustmentsHorizontal /> Filters
        </Btn>
        {open && (
          <Pop>
            <Row>
              <Label>Status</Label>
              <Select
                value={props.filters.status}
                onChange={(e) =>
                  props.onChange({ status: e.target.value as any })
                }
              >
                <option value="all">All</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="error">Error</option>
              </Select>
            </Row>
            <Row>
              <Label>Sort</Label>
              <Select
                value={props.filters.sort}
                onChange={(e) =>
                  props.onChange({ sort: e.target.value as any })
                }
              >
                <option value="lastsync-new">Last sync (newest)</option>
                <option value="lastsync-old">Last sync (oldest)</option>
                <option value="name-az">Name A → Z</option>
                <option value="name-za">Name Z → A</option>
              </Select>
            </Row>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: ".6rem",
              }}
            >
              <Btn
                onClick={() =>
                  props.onChange({ q: "", status: "all", sort: "lastsync-new" })
                }
              >
                Clear
              </Btn>
              <Btn onClick={() => setOpen(false)}>Apply</Btn>
            </div>
          </Pop>
        )}
      </div>
    </Bar>
  );
}
import { useState } from "react";
