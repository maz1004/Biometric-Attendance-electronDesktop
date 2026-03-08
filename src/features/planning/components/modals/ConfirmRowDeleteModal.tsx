import styled from "styled-components";
import Button from "../../../../ui/Button";

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

const ModalContainer = styled.div`
  background: var(--color-grey-0);
  width: 450px;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.2s ease-out;

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-grey-100);
  background: var(--color-grey-50);
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-danger, #ef4444);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Body = styled.div`
  padding: 1.5rem;
  font-size: 0.95rem;
  color: var(--color-text-main);
  line-height: 1.5;
`;

const WarningBox = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--border-radius-md);
  padding: 1rem;
  margin-top: 1rem;
  color: #b91c1c;
`;

const Footer = styled.div`
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-top: 1px solid var(--color-grey-100);
  background: var(--color-grey-50);
`;

interface ConfirmRowDeleteModalProps {
  isOpen: boolean;
  timeStr: string;
  interval: number;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmRowDeleteModal({ isOpen, timeStr, interval, onClose, onConfirm }: ConfirmRowDeleteModalProps) {
  if (!isOpen) return null;

  // Calcul du temps de fin de la tranche
  const [h, m] = timeStr.split(':').map(Number);
  const endMinutes = m + interval;
  const endH = h + Math.floor(endMinutes / 60);
  const endM = endMinutes % 60;
  const endTimeStr = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>⚠️ Suppression de tranche horaire</Title>
        </Header>
        <Body>
          <p>Vous êtes sur le point de supprimer <strong>toutes les assignations</strong> qui se trouvent dans cette plage horaire pour <strong>tous les jours de la semaine</strong> du modèle en cours.</p>

          <WarningBox>
            Mode Vue Actuel : <strong>Créneaux de {interval} minutes</strong><br />
            Plage ciblée : <strong>{timeStr} à {endTimeStr}</strong>
          </WarningBox>

          <p style={{ marginTop: '1rem', marginBottom: 0 }}>Êtes-vous certain de vouloir vider cette ligne entière ? Cette action supprimera les créneaux concernés.</p>
        </Body>
        <Footer>
          <Button variation="secondary" onClick={onClose}>Annuler</Button>
          <Button variation="danger" onClick={() => { onConfirm(); onClose(); }}>Confirmer l'effacement</Button>
        </Footer>
      </ModalContainer>
    </Overlay>
  );
}
