import { useEffect } from "react";
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
  background: var(--color-grey-100);
  color: var(--color-text-main);
  border-radius: 4px;
  flex: 1;

  &::placeholder {
    color: var(--color-text-secondary);
  }
`;

const Select = styled.select`
  padding: 8px;
  border: 1px solid var(--color-border-element);
  background: var(--color-grey-100);
  color: var(--color-text-main);
  border-radius: 4px;
  flex: 1;

  option {
    background: var(--color-bg-card);
    color: var(--color-text-main);
  }
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const Label = styled.label`
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  font-weight: 500;
`;

const Button = styled.button`
  padding: 8px 16px;
  background: var(--color-primary-600);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.2s, background 0.2s;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    background: var(--color-primary-500);
  }
`;

const ErrorText = styled.span`
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 4px;
`;

interface ExceptionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Record<string, EmployeeMini>;
}

const TimeOptions = Array.from({ length: 48 }).map((_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, '0');
  const m = (i % 2) * 30 === 0 ? '00' : '30';
  return `${h}:${m}`;
});

export default function ExceptionManager({ isOpen, onClose, employees }: ExceptionManagerProps) {
  const { exceptions, createException } = usePlanning();
  const { register, handleSubmit, reset, watch, setValue, formState: { isValid } } = useForm<any>({
    mode: "onChange",
    defaultValues: {
      type: "LEAVE"
    }
  });

  const startDateDay = watch("start_date_day");
  const endDateDay = watch("end_date_day");
  const startTime = watch("start_time");
  const endTime = watch("end_time");

  // Auto-fill End Date when Start Date changes
  useEffect(() => {
    if (startDateDay) {
      // Only update if end date is empty OR if user hasn't explicitly set a DIFFERENT end date?
      // User requirement: "que mon end date prennent la mm valeur".
      // Simple approach: When start date changes, sync end date to be at least start date.
      // If end date was equal to OLD start date, move it to NEW start date.
      // Simplest: Always sync end date to start date when start date changes.
      setValue("end_date_day", startDateDay);
    }
  }, [startDateDay, setValue]);

  // Auto-fill End Time when Start Time changes
  useEffect(() => {
    if (startTime) {
      // Find index of start time
      const startIndex = TimeOptions.indexOf(startTime);
      if (startIndex !== -1) {
        // Default to +2 slots (1 hour) later, or last slot if near end of day
        const endIndex = Math.min(startIndex + 2, TimeOptions.length - 1);
        setValue("end_time", TimeOptions[endIndex]);
      }
    }
  }, [startTime, setValue]);

  // Validation
  let dateError = "";
  if (startDateDay && endDateDay) {
    // Simple string comparison works for ISO YYYY-MM-DD
    if (endDateDay < startDateDay) {
      dateError = "La date de fin ne peut pas être antérieure à la date de début.";
    } else if (endDateDay === startDateDay && startTime && endTime) {
      // Compare times if same day
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      if (eh < sh || (eh === sh && em <= sm)) {
        dateError = "L'heure de fin doit être postérieure à l'heure de début.";
      }
    }
  }

  if (!isOpen) return null;

  const onSubmit = (data: any) => {
    if (dateError) return;
    if (!data.user_id || !data.start_date_day || !data.start_time || !data.end_date_day || !data.end_time) return;

    // Combine Date and Time
    const start = new Date(`${data.start_date_day}T${data.start_time}:00`).toISOString();
    const end = new Date(`${data.end_date_day}T${data.end_time}:00`).toISOString();

    createException({
      user_id: data.user_id,
      type: data.type || "LEAVE",
      start_date: start,
      end_date: end,
      reason: data.reason
    });
    reset({ type: "LEAVE" });
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
            <FieldGroup>
              <Label>Start</Label>
              <div style={{ display: 'flex', gap: 4 }}>
                <Input type="date" {...register("start_date_day", { required: true })} style={{ flex: 2 }} />
                <Select {...register("start_time", { required: true })} style={{ flex: 1 }}>
                  {TimeOptions.map(t => <option key={`start-${t}`} value={t}>{t}</option>)}
                </Select>
              </div>
            </FieldGroup>
            <FieldGroup>
              <Label>End</Label>
              <div style={{ display: 'flex', gap: 4 }}>
                <Input
                  type="date"
                  {...register("end_date_day", { required: true })}
                  style={{ flex: 2, borderColor: dateError ? '#ef4444' : 'var(--color-border-element)' }}
                />
                <Select
                  {...register("end_time", { required: true })}
                  style={{ flex: 1, borderColor: dateError ? '#ef4444' : 'var(--color-border-element)' }}
                >
                  {TimeOptions.map(t => <option key={`end-${t}`} value={t}>{t}</option>)}
                </Select>
              </div>
            </FieldGroup>
          </InputGroup>

          {dateError && <ErrorText>{dateError}</ErrorText>}

          <Input type="text" placeholder="Reason" {...register("reason", { required: true })} />
          <Button
            type="submit"
            disabled={!isValid || !!dateError}
            title={!isValid ? "Please fill all required fields" : ""}
          >
            Add Exception
          </Button>
        </Form>
      </Dialog>
    </Overlay>
  );
}
