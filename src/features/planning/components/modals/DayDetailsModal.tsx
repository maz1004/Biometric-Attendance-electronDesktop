import { useMemo } from "react";
import styled from "styled-components";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { HiXMark, HiCheckCircle, HiPlus, HiClock, HiUserGroup, HiCalendarDays } from "react-icons/hi2";
import { UserShift, Shift } from "../../types";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

// Wider, larger modal without internal scroll if possible (fits on screen)
const Content = styled.div`
  background: white;
  width: 900px;
  max-width: 95vw;
  max-height: 90vh; /* Safety limit */
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden; 
  overflow-y: auto; 

  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
`;

const Header = styled.div`
  padding: 2.5rem 3rem;
  background: linear-gradient(to right, #f8fafc, #fff);
  border-bottom: 1px solid var(--color-border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SubTitle = styled.div`
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CloseButton = styled.button`
  background: #f1f5f9;
  border: none;
  width: 40px; height: 40px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
  &:hover { background: #e2e8f0; color: #334155; }
`;

const Body = styled.div`
  padding: 3rem;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 4rem;
  flex: 1;
`;

const MainColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const SideColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-left: 2rem;
  border-left: 1px dashed var(--color-border-element);
`;

const ShiftCard = styled.div<{ $color: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border: 1px solid var(--color-border-element);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  transition: all 0.2s;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 6px;
    background: ${props => props.$color};
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px -5px rgba(0,0,0,0.1);
  }
`;

const ShiftInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ShiftTitle = styled.span`
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--color-text-primary);
`;

const ShiftTime = styled.div`
  display: flex; align-items: center; gap: 0.5rem;
  color: var(--color-text-secondary);
  font-size: 1rem;
`;

const ShiftBadge = styled.div`
  display: flex; align-items: center; gap: 8px;
  background: var(--color-grey-100);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-secondary);
`;


const DateTitle = styled.h2`
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  text-transform: capitalize;
  letter-spacing: -0.02em;
`;

const SectionHeader = styled.h3`
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  font-weight: 700;
  margin: 0 0 1.25rem 0;
  display: flex; align-items: center; gap: 0.5rem;
`;

const ActionButton = styled.button<{ $variant: 'primary' | 'danger' }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 1.25rem;
  border: 2px solid ${props => props.$variant === 'danger' ? '#fecaca' : '#e2e8f0'};
  background: ${props => props.$variant === 'danger' ? '#fef2f2' : '#f8fafc'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    background: ${props => props.$variant === 'danger' ? '#fee2e2' : '#f1f5f9'};
    border-color: ${props => props.$variant === 'danger' ? '#f87171' : '#cbd5e1'};
    transform: scale(1.02);
  }

  svg {
    width: 24px; height: 24px;
    color: ${props => props.$variant === 'danger' ? '#dc2626' : '#64748b'};
  }
`;

const ActionText = styled.div`
  display: flex; flex-direction: column;
  span.label { font-weight: 700; color: ${props => props.color || 'var(--color-text-primary)'}; font-size: 1.1rem; }
`;


interface DayDetailsModalProps {
  date: Date;
  onClose: () => void;
  userShifts: UserShift[];
  shifts: Record<string, Shift>;
  onAddException: (type: 'HOLIDAY' | 'SPECIAL_HOURS') => void;
}

export default function DayDetailsModal({
  date,
  onClose,
  userShifts,
  shifts,
  onAddException
}: DayDetailsModalProps) {

  const activeShifts = useMemo(() => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayShifts = userShifts.filter(us => {
      if (!us.isActive) return false;
      return us.assignedAt.startsWith(dateStr);
    });

    // Group by Shift ID
    const grouped: Record<string, number> = {};
    dayShifts.forEach(us => {
      grouped[us.shiftId] = (grouped[us.shiftId] || 0) + 1;
    });

    return Object.keys(grouped).map(sid => ({
      shiftId: sid,
      shift: shifts[sid],
      count: grouped[sid]
    }));
  }, [userShifts, shifts, date]);

  const totalEmployees = activeShifts.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Overlay onClick={onClose}>
      <Content onClick={e => e.stopPropagation()}>
        <Header>
          <TitleBlock>
            <DateTitle>{format(date, "EEEE d MMMM", { locale: fr })}</DateTitle>
            <SubTitle>
              <HiCalendarDays />
              {format(date, "yyyy")}
              <span style={{ margin: '0 8px', opacity: 0.3 }}>|</span>
              {totalEmployees} employé(s) planifié(s)
            </SubTitle>
          </TitleBlock>
          <CloseButton onClick={onClose}>
            <HiXMark size={20} />
          </CloseButton>
        </Header>

        <Body>
          <MainColumn>
            <SectionHeader><HiUserGroup /> Planning des Équipes</SectionHeader>
            {activeShifts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center">
                <div className="mb-3 p-3 bg-gray-100 rounded-full text-gray-400">
                  <HiClock size={32} />
                </div>
                <h4 className="font-medium text-gray-600">Aucun planning</h4>
                <p className="text-sm text-gray-500 mt-1">Aucune équipe n'est assignée pour cette journée.</p>
              </div>
            ) : (
              activeShifts.map(({ shiftId, shift, count }) => (
                <ShiftCard key={shiftId} $color={shift?.color || '#cbd5e1'}>
                  <ShiftInfo>
                    <ShiftTitle>{shift?.name || 'Shift Standard'}</ShiftTitle>
                    <ShiftTime>
                      <HiClock /> {shift?.startTime?.slice(0, 5)} - {shift?.endTime?.slice(0, 5)}
                    </ShiftTime>
                  </ShiftInfo>
                  <ShiftBadge>
                    <HiUserGroup />
                    {count} Staff
                  </ShiftBadge>
                </ShiftCard>
              ))
            )}

            {/* Could add a graph or timeline here later */}
          </MainColumn>

          <SideColumn>
            <SectionHeader><HiCheckCircle /> Actions Rapides</SectionHeader>

            <ActionButton $variant="danger" onClick={() => onAddException('HOLIDAY')}>
              <div><HiXMark /></div>
              <ActionText color="#dc2626">
                <span className="label">Marquer Férié</span>
              </ActionText>
            </ActionButton>

            <ActionButton $variant="primary" onClick={() => onAddException('SPECIAL_HOURS')}>
              <div><HiPlus /></div>
              <ActionText>
                <span className="label">Horaires Spéciaux</span>
              </ActionText>
            </ActionButton>

            {/* Placeholder for more actions */}
          </SideColumn>
        </Body>
      </Content>
    </Overlay>
  );
}
