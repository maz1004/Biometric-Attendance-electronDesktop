import styled from "styled-components";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { usePlanning } from "../../hooks/usePlanning";
import { Holiday } from "../../types";

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
  background-color: var(--color-bg-card, #1f2937); /* Fallback to dark gray if var missing */
  color: var(--color-text-main);
  padding: 24px;
  border-radius: 8px;
  width: 500px;
  max-width: 90vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid var(--color-border-subtle);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 1001; /* Ensure above overlay */
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

interface HolidayManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HolidayManager({ isOpen, onClose }: HolidayManagerProps) {
  const { holidays, createHoliday, deleteHoliday } = usePlanning();
  const { register, handleSubmit, reset } = useForm<Partial<Holiday>>();

  if (!isOpen) return null;

  const onSubmit = (data: Partial<Holiday>) => {
    if (!data.name || !data.date) return;
    createHoliday({
      name: data.name,
      date: data.date,
      type: data.type || "OTHER",
      description: data.description
    });
    reset();
  };

  return (
    <Overlay onClick={onClose}>
      <Dialog onClick={e => e.stopPropagation()}>
        <Header>
          <h2>Manage Holidays</h2>
          <button onClick={onClose}>&times;</button>
        </Header>

        <List>
          {holidays.length === 0 && <div style={{ padding: 10, color: 'var(--color-text-secondary)' }}>No holidays defined.</div>}
          {holidays.map(h => (
            <Item key={h.id}>
              <div>
                <strong>{format(new Date(h.date), "dd MMM yyyy")}</strong> - {h.name}
                <div style={{ fontSize: '0.8em', color: 'var(--color-text-secondary)' }}>{h.type}</div>
              </div>
              <button
                onClick={() => deleteHoliday(h.id)}
                style={{ color: 'var(--color-danger, #ef4444)', fontSize: '1rem', padding: '4px' }}
                title="Delete"
              >
                &times;
              </button>
            </Item>
          ))}
        </List>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <h4 style={{ color: 'var(--color-text-main)' }}>Add New Holiday</h4>
          <InputGroup>
            <Input type="text" placeholder="Holiday Name" {...register("name", { required: true })} />
            <Input type="date" {...register("date", { required: true })} />
          </InputGroup>
          <InputGroup>
            <Select {...register("type")}>
              <option value="NATIONAL">National</option>
              <option value="RELIGIOUS">Religious</option>
              <option value="OTHER">Other</option>
            </Select>
            <Input type="text" placeholder="Description (optional)" {...register("description")} />
          </InputGroup>
          <Button type="submit">Add Holiday</Button>
        </Form>
      </Dialog>
    </Overlay>
  );
}
