import styled from "styled-components";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { usePlanning } from "../../hooks/usePlanning";
import { EmployeeMini } from "../../types";

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Dialog = styled.div`
  background-color: var(--color-bg-card, #1f2937); /* Fallback to dark gray */
  color: var(--color-text-main);
  padding: 24px;
  border-radius: 8px;
  width: 600px;
  max-width: 90vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid var(--color-border-subtle);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 1001;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  h2 { margin: 0; font-size: 1.25rem; color: var(--color-text-main); }
  button { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--color-text-secondary); }
`;

const List = styled.div`
  flex: 1;
  overflow-y: auto;
  border: 1px solid var(--color-border-element);
  border-radius: 4px;
  padding: 8px;
  background: var(--color-bg-surface);
`;

const Item = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid var(--color-border-element);
  &:last-child { border-bottom: none; }
  strong { color: var(--color-text-main); }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border-element);
`;

const InputGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid var(--color-border-element);
  background: var(--color-bg-subtle);
  color: var(--color-text-main);
  border-radius: 4px;
  flex: 1;
`;

const Select = styled.select`
  padding: 8px;
  border: 1px solid var(--color-border-element);
  background: var(--color-bg-subtle);
  color: var(--color-text-main);
  border-radius: 4px;
  flex: 1;
`;

const Button = styled.button`
  padding: 8px 16px;
  background: var(--color-primary-600);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:disabled { opacity: 0.5; }
`;

interface ExceptionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Record<string, EmployeeMini>;
}

export default function ExceptionManager({ isOpen, onClose, employees }: ExceptionManagerProps) {
  const { exceptions, createException } = usePlanning();
  const { register, handleSubmit, reset } = useForm<any>();

  if (!isOpen) return null;

  const onSubmit = (data: any) => {
    if (!data.user_id || !data.start_date || !data.end_date) return;

    // Naive ISO string construction for simplicity in this MVP
    // Assuming inputs are datetime-local or just date. Let's use datetime-local
    // data.start_date is likely "YYYY-MM-DDTHH:mm"
    const start = new Date(data.start_date).toISOString();
    const end = new Date(data.end_date).toISOString();

    createException({
      user_id: data.user_id,
      type: data.type,
      start_date: start,
      end_date: end,
      reason: data.reason
    });
    reset();
  };

  const getEmployeeName = (id: string) => employees[id]?.name || id;

  return (
    <Overlay onClick={onClose}>
      <Dialog onClick={e => e.stopPropagation()}>
        <Header>
          <h2>Manage Exceptions (Leaves/Sick)</h2>
          <button onClick={onClose}>&times;</button>
        </Header>

        <List>
          {exceptions.length === 0 && <div style={{ padding: 10, color: 'var(--color-text-secondary)' }}>No exceptions found for this week.</div>}
          {exceptions.map(ex => (
            <Item key={ex.id}>
              <div>
                <strong>{getEmployeeName(ex.user_id)}</strong> - <span style={{ color: 'var(--color-primary)' }}>{ex.type}</span>
                <div style={{ fontSize: '0.8em', color: 'var(--color-text-secondary)' }}>
                  {format(new Date(ex.start_date), "dd MMM HH:mm")} - {format(new Date(ex.end_date), "dd MMM HH:mm")}
                </div>
              </div>
              <div style={{ fontSize: '0.8em', fontStyle: 'italic', color: 'var(--color-text-tertiary)' }}>{ex.status}</div>
            </Item>
          ))}
        </List>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <h4 style={{ color: 'var(--color-text-main)' }}>Add New Exception</h4>
          <InputGroup>
            <Select {...register("user_id", { required: true })} style={{ flex: 1 }}>
              <option value="">Select Employee</option>
              {Object.values(employees).map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </Select>
            <Select {...register("type")}>
              <option value="LEAVE">Leave</option>
              <option value="SICK">Sick</option>
              <option value="REMOTE">Remote</option>
              <option value="OVERRIDE">Override</option>
            </Select>
          </InputGroup>
          <InputGroup>
            <Input type="datetime-local" {...register("start_date", { required: true })} />
            <Input type="datetime-local" {...register("end_date", { required: true })} />
          </InputGroup>
          <Input type="text" placeholder="Reason" {...register("reason")} />
          <Button type="submit">Add Exception</Button>
        </Form>
      </Dialog>
    </Overlay>
  );
}
