import styled from "styled-components";
import {
  HiXMark,
} from "react-icons/hi2";
import { StatusType } from "./AttendanceTypes";
import { useState } from "react";

const Card = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 0.8rem);
  min-width: 300px;
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  padding: 1.2rem;
  display: grid;
  gap: 1rem;
  z-index: 30;
`;
const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const Title = styled.div`
  font-weight: 600;
  color: var(--color-text-strong);
`;
const Close = styled.button`
  border: 1px solid var(--color-grey-300);
  background: var(--color-grey-0);
  border-radius: var(--border-radius-sm);
  padding: 0.3rem 0.5rem;
`;
const Label = styled.div`
  font-size: 1.1rem;
  color: var(--color-text-dim);
  font-weight: 600;
  text-transform: uppercase;
`;
const Select = styled.select`
  width: 100%;
  padding: 0.7rem 1rem;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-sm);
  background: var(--color-grey-0);
  color: var(--color-text-strong);
`;
const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.6rem;
`;
const Ghost = styled.button`
  border: 1px solid var(--color-grey-300);
  background: var(--color-grey-0);
  padding: 0.7rem 1rem;
  border-radius: var(--border-radius-sm);
  display: inline-flex;
  gap: 0.5rem;
`;
const Primary = styled.button`
  border: 1px solid var(--color-brand-600);
  background: var(--color-brand-600);
  color: #fff;
  padding: 0.7rem 1rem;
  border-radius: var(--border-radius-sm);
  display: inline-flex;
  gap: 0.5rem;
`;

export default function AttendanceFiltersPopover(props: {
  initialDepartment: string;
  initialStatus: StatusType | "all";
  onApply: (f: { department: string; status: StatusType | "all" }) => void;
  onClose: () => void;
  onClear: () => void;
}) {
  const [department, setDepartment] = useState<string>(props.initialDepartment);
  const [status, setStatus] = useState<StatusType | "all">(props.initialStatus);

  return (
    <Card>
      <Row>
        <Title>Filters</Title>
        <Close onClick={props.onClose}>
          <HiXMark />
        </Close>
      </Row>

      <div>
        <Label>Department</Label>
        <Select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="all">All</option>
          <option value="R&D">R&amp;D</option>
          <option value="Operations">Operations</option>
          <option value="Design">Design</option>
          <option value="QA">QA</option>
          <option value="HR">HR</option>
        </Select>
      </div>

      <div>
        <Label>Status</Label>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
        >
          <option value="all">All</option>
          <option value="present">Present</option>
          <option value="late">Late</option>
          <option value="absent">Absent</option>
          <option value="left-early">Left early</option>
          <option value="manual">Manual</option>
        </Select>
      </div>

      <Footer>
        <Ghost onClick={props.onClear}>Clear</Ghost>
        <div style={{ display: "flex", gap: ".6rem" }}>
          <Ghost onClick={props.onClose}>Cancel</Ghost>
          <Primary onClick={() => props.onApply({ department, status })}>
            Apply
          </Primary>
        </div>
      </Footer>
    </Card>
  );
}
