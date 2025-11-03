import { useState } from "react";
import styled from "styled-components";
import { RoleFilter, EnrolledFilter, StatusFilter } from "./EmployeesHeaderBar";
import { HiXMark } from "react-icons/hi2";

const PopoverCard = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 0.8rem);

  min-width: 300px;
  max-width: 320px;

  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-200);
  background-color: var(--color-grey-0);
  box-shadow: var(--shadow-md);

  padding: 1.2rem 1.2rem 1rem;
  z-index: 999;

  display: grid;
  row-gap: 1.2rem;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.2;
`;

const Title = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-grey-800);
`;

const Subtitle = styled.div`
  font-size: 1.2rem;
  color: var(--color-grey-500);
`;

const CloseBtn = styled.button`
  background: none;
  color: var(--color-grey-600);
  line-height: 1;
  padding: 0.4rem 0.6rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 2rem;
  border: none;
  border-radius: var(--border-radius-sm);
  &:hover {
    background-color: var(--color-grey-50);
  }
`;

const Divider = styled.div`
  height: 1px;
  width: 100%;
  background-color: var(--color-grey-200);
`;

const Section = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 0.6rem;
`;

const Label = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-grey-600);
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;

const Select = styled.select`
  font-size: 1.3rem;
  line-height: 1.4;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-grey-0);
  color: var(--color-grey-700);
  padding: 0.7rem 1rem;
  width: 100%;

  &:hover {
    background-color: var(--color-grey-50);
  }
`;

const FooterRow = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.8rem;
`;

const GhostButton = styled.button`
  border: 1px solid var(--color-grey-300);
  background-color: var(--color-grey-0);
  color: var(--color-grey-700);
  border-radius: var(--border-radius-sm);
  font-size: 1.3rem;
  font-weight: 500;
  padding: 0.7rem 1rem;
  line-height: 1.2;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  box-shadow: var(--shadow-sm);

  svg {
    font-size: 1.4rem;
  }

  &:hover {
    background-color: var(--color-grey-50);
  }
`;

const ApplyButton = styled.button`
  border: 1px solid var(--color-brand-600);
  background-color: var(--color-brand-600);
  color: #fff;
  border-radius: var(--border-radius-sm);
  font-size: 1.3rem;
  font-weight: 600;
  padding: 0.7rem 1rem;
  line-height: 1.2;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  box-shadow: var(--shadow-sm);

  svg {
    font-size: 1.4rem;
  }

  &:hover {
    background-color: var(--color-brand-700);
    border-color: var(--color-brand-700);
  }
`;

export type EmployeesFiltersPopoverProps = {
  initialRole: RoleFilter;
  initialEnrolled: EnrolledFilter;
  initialStatus: StatusFilter;
  onApply: (val: {
    role: RoleFilter;
    enrolled: EnrolledFilter;
    status: StatusFilter;
  }) => void;
  onClose: () => void;
  onClear: () => void;
};

export function EmployeesFiltersPopover({
  initialRole,
  initialEnrolled,
  initialStatus,
  onApply,
  onClose,
  onClear,
}: EmployeesFiltersPopoverProps): JSX.Element {
  const [role, setRole] = useState<RoleFilter>(initialRole);
  const [enrolled, setEnrolled] = useState<EnrolledFilter>(initialEnrolled);
  const [status, setStatus] = useState<StatusFilter>(initialStatus);

  return (
    <PopoverCard>
      {/* header */}
      <HeaderRow>
        <TitleBlock>
          <Title>Filters</Title>
          <Subtitle>Refine the employee list</Subtitle>
        </TitleBlock>

        <CloseBtn type="button" onClick={onClose}>
          <HiXMark />
        </CloseBtn>
      </HeaderRow>

      <Divider />

      {/* Role */}
      <Section>
        <Label>Role</Label>
        <Select
          value={role}
          onChange={(e) => setRole(e.target.value as RoleFilter)}
        >
          <option value="all">All roles</option>
          <option value="employee">Employees</option>
          <option value="manager">Managers</option>
        </Select>
      </Section>

      {/* Enrollment */}
      <Section>
        <Label>Enrollment</Label>
        <Select
          value={enrolled}
          onChange={(e) => setEnrolled(e.target.value as EnrolledFilter)}
        >
          <option value="all">All enroll</option>
          <option value="enrolled">Enrolled</option>
          <option value="not">Not enrolled</option>
        </Select>
      </Section>

      {/* Status */}
      <Section>
        <Label>Status</Label>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </Section>

      <Divider />

      <FooterRow>
        <GhostButton
          type="button"
          onClick={() => {
            onClear();
          }}
        >
          <span>Clear all</span>
        </GhostButton>

        <div style={{ display: "flex", gap: "0.8rem" }}>
          <GhostButton type="button" onClick={onClose}>
            <span>Cancel</span>
          </GhostButton>

          <ApplyButton
            type="button"
            onClick={() => {
              onApply({ role, enrolled, status });
            }}
          >
            <span>Apply</span>
          </ApplyButton>
        </div>
      </FooterRow>
    </PopoverCard>
  );
}
