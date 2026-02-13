import { useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import {
  HiMagnifyingGlass,
  HiFunnel,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi2";
import { PeriodFilter, SortByOption, StatusType } from "./AttendanceTypes";
import AttendanceFiltersPopover from "./AttendanceFiltersPopover";
import SelectMenu from "../../ui/SelectMenu";

const Bar = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
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
  color: var(--color-grey-500);
  pointer-events: none;
  font-size: 1.4rem;
`;
const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.6rem;
  font-size: 1.35rem;
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-sm);
  color: var(--color-grey-900);
  &::placeholder {
    color: var(--color-grey-500);
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
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-sm);
  color: var(--color-grey-900);
  cursor: pointer;
`;

const Pager = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
`;
const PagerBtn = styled.button`
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--color-grey-300);
  background: var(--color-grey-0);
  border-radius: var(--border-radius-sm);
  color: var(--color-grey-900);
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
  const { t } = useTranslation();

  return (
    <div style={{ position: "relative" }}>
      <Bar>
        <SearchWrap>
          <SearchIcon>
            <HiMagnifyingGlass />
          </SearchIcon>
          <SearchInput
            placeholder={t("attendance.filters.search_placeholder")}
            value={props.search}
            onChange={(e) => props.onSearch(e.target.value)}
          />
        </SearchWrap>

        <Group>
          <GhostBtn onClick={() => setOpen((v) => !v)}>
            <HiFunnel /> {t("attendance.filters.filter_btn")}
          </GhostBtn>

          <SelectMenu
            width="14rem"
            value={props.period}
            onChange={(v) => props.onPeriod(v as PeriodFilter)}
            options={[
              { value: "day", label: t("attendance.filters.period.day") },
              { value: "week", label: t("attendance.filters.period.week") },
              { value: "month", label: t("attendance.filters.period.month") },
            ]}
          />

          <SelectMenu
            width="18rem" // Increased width for sort options
            value={props.sortBy}
            onChange={(v) => props.onSort(v as SortByOption)}
            options={[
              { value: "date-desc", label: t("attendance.filters.sort.date_newest") },
              { value: "date-asc", label: t("attendance.filters.sort.date_oldest") },
              { value: "name-asc", label: t("attendance.filters.sort.name_asc") },
              { value: "name-desc", label: t("attendance.filters.sort.name_desc") },
              { value: "status-asc", label: t("attendance.filters.sort.status_asc") },
              { value: "status-desc", label: t("attendance.filters.sort.status_desc") },
            ]}
          />

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
