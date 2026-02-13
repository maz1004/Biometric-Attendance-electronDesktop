import styled from 'styled-components';
import { HiArrowRight, HiClock, HiUser } from 'react-icons/hi2';
import { StyledModal, Overlay } from "../../../../ui/Modal";
import Heading from "../../../../ui/Heading";
import Button from "../../../../ui/Button";

interface OverrideConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    employeeName: string;
    teamName: string;
    teamStart: string;
    teamEnd: string;
    clickedTime: string;
    onOverrideCheckout: () => void;
    onOverrideCheckin: () => void;
    onNewShift: () => void;
    canCheckIn?: boolean;
    canCheckOut?: boolean;
}

const ModalDescription = styled.div`
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const OptionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--color-border-element);
  border-radius: var(--border-radius-md);
  background: var(--color-bg-card);
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  margin-bottom: 0.75rem;
  line-height: 1.5;

  &:hover {
    border-color: var(--color-primary);
    background: var(--color-bg-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  .icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--color-bg-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-primary);
    flex-shrink: 0;
  }

  .content {
    flex: 1;
    .title {
      font-weight: 600;
      color: var(--color-text-main);
      margin-bottom: 0.2rem;
    }
    .desc {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }
  }
`;

const ModalTitle = styled(Heading)`
  margin-bottom: 0.5rem;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
`;

export default function OverrideConfirmationModal({
    isOpen,
    onClose,
    employeeName,
    teamName,
    teamStart,
    teamEnd,
    clickedTime,
    onOverrideCheckout,
    onOverrideCheckin,
    onNewShift,
    canCheckIn = true,
    canCheckOut = true
}: OverrideConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <Overlay onClick={onClose}>
            <StyledModal onClick={(e) => e.stopPropagation()}>
                <ModalTitle as="h3">Modification d'horaire pour {employeeName}</ModalTitle>
                <ModalDescription>
                    Cet employé suit les horaires de l'équipe <strong>{teamName}</strong> ({teamStart} - {teamEnd}).
                    <br />
                    Vous avez cliqué sur <strong>{clickedTime}</strong>. Que voulez-vous faire ?
                </ModalDescription>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {canCheckOut && (
                        <OptionButton onClick={onOverrideCheckout}>
                            <div className="icon"><HiClock size={20} /></div>
                            <div className="content">
                                <div className="title">Définir comme fin de journée (Check-out)</div>
                                <div className="desc">
                                    Garde le début de l'équipe ({teamStart}) et finit à {clickedTime}.
                                </div>
                            </div>
                            <HiArrowRight color="var(--color-text-tertiary)" />
                        </OptionButton>
                    )}

                    {canCheckIn && (
                        <OptionButton onClick={onOverrideCheckin}>
                            <div className="icon"><HiClock size={20} /></div>
                            <div className="content">
                                <div className="title">Définir comme début de journée (Check-in)</div>
                                <div className="desc">
                                    Commence à {clickedTime} et finit avec l'équipe ({teamEnd}).
                                </div>
                            </div>
                            <HiArrowRight color="var(--color-text-tertiary)" />
                        </OptionButton>
                    )}

                    <OptionButton onClick={onNewShift}>
                        <div className="icon"><HiUser size={20} /></div>
                        <div className="content">
                            <div className="title">Créer un shift indépendant</div>
                            <div className="desc">
                                Ignore les horaires de l'équipe et crée un nouveau shift.
                            </div>
                        </div>
                        <HiArrowRight color="var(--color-text-tertiary)" />
                    </OptionButton>
                </div>

                <ButtonRow>
                    <Button variation="secondary" onClick={onClose}>
                        Annuler
                    </Button>
                </ButtonRow>
            </StyledModal>
        </Overlay>
    );
}
