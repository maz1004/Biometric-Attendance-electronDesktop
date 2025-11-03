import { useState } from "react";
import styled from "styled-components";
import {
  HiMagnifyingGlass,
  HiFunnel,
  HiChevronUpDown,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi2";
import { PeriodFilter, SortByOption, StatusType } from "./AttendanceTypes";
import AttendanceFiltersPopover from "./AttendanceFiltersPopover";

const Bar = styled.div`
  background-color: var(--color-toolbar-bg);
  border: 1px solid var(--color-toolbar-border);
  border-radius: var(--border-radius-md);
  padding: 1rem 1.2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
`;

const SearchWrap = styled.div`
  position: relative;
  min-width: 220px;
  flex: 1 1 280px;
`;
const SearchIcon = styled.span`
  position: absolute;
  left: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-toolbar-input-placeholder);
  pointer-events: none;
  font-size: 1.4rem;
`;
const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.6rem;
  font-size: 1.35rem;
  background: var(--color-toolbar-input-bg);
  border: 1px solid var(--color-toolbar-input-border);
  border-radius: var(--border-radius-sm);
  color: var(--color-text-strong);
  &::placeholder {
    color: var(--color-toolbar-input-placeholder);
  }
`;

const Group = styled.div`
  display: flex;
  gap: 0.8rem;
  align-items: center;
`;
const GhostBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.7rem 0.9rem;
  background: var(--color-toolbar-input-bg);
  border: 1px solid var(--color-toolbar-input-border);
  border-radius: var(--border-radius-sm);
  color: var(--color-text-strong);
  cursor: pointer;
`;

const SelectWrap = styled.div`
  position: relative;
`;
const Select = styled.select`
  min-width: 160px;
  padding: 0.7rem 2.2rem 0.7rem 0.9rem;
  font-size: 1.3rem;
  font-weight: 500;
  background: var(--color-toolbar-input-bg);
  border: 1px solid var(--color-toolbar-input-border);
  border-radius: var(--border-radius-sm);
  color: var(--color-text-strong);
`;
const Chevron = styled.span`
  position: absolute;
  right: 0.7rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-dim);
`;

const Pager = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
`;
const PagerBtn = styled.button`
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--color-toolbar-input-border);
  background: var(--color-toolbar-input-bg);
  border-radius: var(--border-radius-sm);
  color: var(--color-text-strong);
`;

export default function AttendanceHeaderBar(props: {
  search: string;
  onSearch: (v: string) => void;
  period: PeriodFilter;
  onPeriod: (p: PeriodFilter) => void;
  sortBy: SortByOption;
  onSort: (s: SortByOption) => void;
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  department: string;
  status: StatusType | "all";
  onFiltersApply: (f: {
    department: string;
    status: StatusType | "all";
  }) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <Bar>
        <SearchWrap>
          <SearchIcon>
            <HiMagnifyingGlass />
          </SearchIcon>
          <SearchInput
            placeholder="Search name, employee ID, department…"
            value={props.search}
            onChange={(e) => props.onSearch(e.target.value)}
          />
        </SearchWrap>

        <Group>
          <GhostBtn onClick={() => setOpen((v) => !v)}>
            <HiFunnel /> Filters
          </GhostBtn>

          <SelectWrap>
            <Select
              value={props.period}
              onChange={(e) => props.onPeriod(e.target.value as PeriodFilter)}
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </Select>
            <Chevron>
              <HiChevronUpDown />
            </Chevron>
          </SelectWrap>

          <SelectWrap>
            <Select
              value={props.sortBy}
              onChange={(e) => props.onSort(e.target.value as SortByOption)}
            >
              <option value="date-desc">Newest date</option>
              <option value="date-asc">Oldest date</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="status-asc">Status (A-Z)</option>
              <option value="status-desc">Status (Z-A)</option>
            </Select>
            <Chevron>
              <HiChevronUpDown />
            </Chevron>
          </SelectWrap>

          <Pager>
            <PagerBtn onClick={props.onPrev}>
              <HiChevronLeft />
            </PagerBtn>
            <span
              style={{ fontSize: "1.2rem", color: "var(--color-text-dim)" }}
            >
              {props.page} / {props.totalPages}
            </span>
            <PagerBtn onClick={props.onNext}>
              <HiChevronRight />
            </PagerBtn>
          </Pager>
        </Group>
      </Bar>

      {open && (
        <AttendanceFiltersPopover
          initialDepartment={props.department}
          initialStatus={props.status}
          onApply={(f) => {
            props.onFiltersApply(f);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
          onClear={() => {
            props.onFiltersApply({ department: "all", status: "all" });
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
