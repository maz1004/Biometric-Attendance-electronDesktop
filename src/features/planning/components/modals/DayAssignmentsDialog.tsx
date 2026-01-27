import styled from "styled-components";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { StyledModal, Overlay } from "../../../../ui/Modal";
import Button from "../../../../ui/Button";
import { HiPencil } from "react-icons/hi2";
import { ComputedSchedule } from "../../types";
import Heading from "../../../../ui/Heading";

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  max-height: 60vh;
  overflow-y: auto;
  padding: 0.5rem;
`;

const AssignmentItem = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1rem;
  border: 1px solid var(--color-border-card);
  border-radius: var(--border-radius-md);
  background: var(--color-bg-subtle);
  border-left: 4px solid ${props => props.color};
  transition: background 0.2s;

  &:hover {
    background: var(--color-grey-50);
  }
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  
  .name { font-weight: 600; color: var(--color-text-main); }
  .time { font-size: 0.85rem; color: var(--color-text-secondary); }
`;

const ModalContent = styled(StyledModal)`
  width: min(90vw, 40rem);
  padding: 2.4rem;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: auto;
`;

interface DayAssignmentsDialogProps {
    date: Date;
    assignments: ComputedSchedule[];
    onClose: () => void;
    onEditShift: (shiftId: string) => void;
    onAddAssignment: () => void; // Allow adding more to the day?
}

export default function DayAssignmentsDialog({
    date,
    assignments,
    onClose,
    onEditShift,
    onAddAssignment
}: DayAssignmentsDialogProps) {

    return (
        <Overlay onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <Heading as="h2">
                    Assignments du {format(date, "d MMMM yyyy", { locale: fr })}
                </Heading>

                <ListContainer>
                    {assignments.length === 0 && <p>Aucune assignation.</p>}

                    {assignments.map(item => (
                        <AssignmentItem key={item.id} color={item.color || "#ccc"}>
                            <Info>
                                <div className="name">{item.assigneeName || item.shiftName}</div>
                                <div className="time">{item.startTime} - {item.endTime}</div>
                            </Info>
                            <Button size="small" variation="secondary" onClick={() => onEditShift(item.shiftId)}>
                                <HiPencil /> Editer
                            </Button>
                        </AssignmentItem>
                    ))}
                </ListContainer>

                <Footer>
                    <Button variation="secondary" onClick={onAddAssignment}>
                        + Ajouter
                    </Button>
                    <Button variation="primary" onClick={onClose}>
                        Fermer
                    </Button>
                </Footer>
            </ModalContent>
        </Overlay>
    );
}
