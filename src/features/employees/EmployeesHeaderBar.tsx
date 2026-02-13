import { useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { EmployeesFiltersPopover } from "./EmployeesFiltersPopover";
import { HiFunnel, HiMagnifyingGlass, HiChevronUpDown, HiPlus } from "react-icons/hi2";
import Button from "../../ui/Button";

export type RoleFilter = "all" | "employee" | "manager";
export type EnrolledFilter = "all" | "enrolled" | "not";
export type StatusFilter = "all" | "active" | "inactive";
export type SortByOption =
  | "createdAt-desc"
  | "createdAt-asc"
  | "name-asc"
  | "name-desc"
  | "presenceRate-desc"
  | "presenceRate-asc";

// ... (styled components)

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.6rem;
  background-color: var(--color-grey-0);
  padding: 1.2rem;
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-grey-100);
`;

const LeftSide = styled.div`
  flex: 1 1 auto;
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

const SearchWrapper = styled.div`
  position: relative;
  flex: 1 1 auto;
  min-width: 180px;
  max-width: 480px;
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  color: var(--color-grey-500);
  font-size: 1.4rem;
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  font-size: 1.4rem;
  line-height: 1.4;
  padding: 0.8rem 1.2rem 0.8rem 2.8rem;

  background-color: var(--color-grey-50);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  color: var(--color-grey-700);

  &::placeholder {
    color: var(--color-grey-500);
  }

  &:focus {
    outline: 2px solid var(--color-brand-600);
    outline-offset: -1px;
    background-color: var(--color-grey-0);
  }
`;

const RightSide = styled.div`
  flex: 0 0 auto;

  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

const FiltersButton = styled.button`
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.3rem;
  line-height: 1.3;
  font-weight: 500;

  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-grey-300);
  background-color: var(--color-grey-0);
  color: var(--color-grey-700);

  padding: 0.7rem 1rem;
  cursor: pointer;

  box-shadow: var(--shadow-sm);

  &:hover {
    background-color: var(--color-grey-50);
  }

  svg {
    font-size: 1.5rem;
    color: var(--color-grey-600);
  }
`;

const SortWrapper = styled.div`
  position: relative;
  flex: 0 0 auto;
`;

const SortSelect = styled.select`
  appearance: none;
  min-width: 150px;

  font-size: 1.3rem;
  line-height: 1.4;
  font-weight: 500;
  border-radius: var(--border-radius-sm);

  border: 1px solid var(--color-grey-300);
  background-color: var(--color-grey-0);
  color: var(--color-grey-700);

  padding: 0.7rem 2.4rem 0.7rem 1rem;
  cursor: pointer;
  box-shadow: var(--shadow-sm);

  &:hover {
    background-color: var(--color-grey-50);
  }
`;

const SortChevron = styled.span`
  pointer-events: none;
  position: absolute;
  right: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  color: var(--color-grey-500);
  font-size: 1.4rem;
`;

export type EmployeesHeaderBarProps = {
  onChangeSearch: (value: string) => void;
  onApplyFilters: (filters: {
    role: RoleFilter;
    enrolled: EnrolledFilter;
    status: StatusFilter;
  }) => void;
  onChangeSort: (value: SortByOption) => void;
  onAddEmployee?: () => void;

  search: string;
  role: RoleFilter;
  enrolled: EnrolledFilter;
  status: StatusFilter;
  sortBy: SortByOption;
  actionComponent?: React.ReactNode;
};

export default function EmployeesHeaderBar({
  onChangeSearch,
  onApplyFilters,
  onChangeSort,
  onAddEmployee,
  search,
  role,
  enrolled,
  status,
  sortBy,
}: EmployeesHeaderBarProps): JSX.Element {
  const [openFilters, setOpenFilters] = useState<boolean>(false);
  const { t } = useTranslation();

  return (
    <div style={{ position: "relative" }}>
      <Toolbar>
        {/* LEFT: search */}
        <LeftSide>
          <SearchWrapper>
            <SearchIcon>
              <HiMagnifyingGlass />
            </SearchIcon>

            <SearchInput
              placeholder={t("employees.filters.search_placeholder")}
              value={search}
              onChange={(e) => onChangeSearch(e.target.value)}
            />
          </SearchWrapper>

          {onAddEmployee && (
            <Button size="medium" onClick={onAddEmployee}>
              <HiPlus />
              <span>{t("employees.actions.add_employee")}</span>
            </Button>
          )}
        </LeftSide>

        {/* RIGHT: filters + sort */}
        <RightSide>
          <FiltersButton
            type="button"
            onClick={() => setOpenFilters((prev) => !prev)}
          >
            <HiFunnel />
            <span>{t("employees.filters.filter_btn")}</span>
          </FiltersButton>

          <SortWrapper>
            <SortSelect
              value={sortBy}
              onChange={(e) => onChangeSort(e.target.value as SortByOption)}
            >
              <option value="createdAt-desc">{t("employees.filters.sort.newest")}</option>
              <option value="createdAt-asc">{t("employees.filters.sort.oldest")}</option>
              <option value="name-asc">{t("employees.filters.sort.name_asc")}</option>
              <option value="name-desc">{t("employees.filters.sort.name_desc")}</option>
              <option value="presenceRate-desc">{t("employees.filters.sort.best_attendance")}</option>
              <option value="presenceRate-asc">{t("employees.filters.sort.lowest_attendance")}</option>
            </SortSelect>

            <SortChevron>
              <HiChevronUpDown />
            </SortChevron>
          </SortWrapper>
        </RightSide>
      </Toolbar>

      {/* FLOATING FILTERS PANEL */}
      {openFilters && (
        <EmployeesFiltersPopover
          initialRole={role}
          initialEnrolled={enrolled}
          initialStatus={status}
          onApply={(vals) => {
            onApplyFilters(vals);
            setOpenFilters(false);
          }}
          onClose={() => setOpenFilters(false)}
          onClear={() => {
            onApplyFilters({
              role: "all",
              enrolled: "all",
              status: "all",
            });
            setOpenFilters(false);
          }}
        />
      )}
    </div>
  );
}
