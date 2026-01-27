import { useState, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { HiCalendarDays, HiTableCells, HiXMark } from 'react-icons/hi2';
import { EmployeeMini, ComputedSchedule } from '../../types';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContainer = styled.div`
  background: var(--color-grey-0);
  border-radius: 12px;
  width: 90%;
  max-width: 1000px;
  height: 85vh; /* Fixed large height */
  max-height: 900px;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from { 
      opacity: 0;
      transform: translateY(20px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--color-grey-200);
`;

const EmployeeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-brand-100);
`;

const AvatarPlaceholder = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-brand-100);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-brand-600);
`;

const EmployeeName = styled.h2`
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-grey-800);
  margin: 0;
`;

const EmployeeDept = styled.span`
  font-size: 0.9rem;
  color: var(--color-grey-500);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--color-grey-500);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: var(--color-grey-100);
    color: var(--color-grey-800);
  }

  svg { font-size: 1.5rem; }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  padding: 0 2rem;
  border-bottom: 1px solid var(--color-grey-200);
`;

const Tab = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-grey-500);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  transition: all 0.2s;

  &:hover {
    color: var(--color-brand-600);
    background-color: var(--color-grey-50);
  }

  ${props => props.$active && css`
    border-color: var(--color-brand-600);
    color: var(--color-brand-600);
  `}

  svg { font-size: 1.2rem; }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem;
`;

// Weekly Grid Styles
const WeekGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
`;

const DayColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const DayHeader = styled.div`
  text-align: center;
  padding: 0.8rem;
  background: var(--color-grey-100);
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  color: var(--color-grey-700);
`;

const DayContent = styled.div`
  min-height: 220px; /* Taller days */
  background: var(--color-grey-50);
  border-radius: 8px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const ShiftBlock = styled.div<{ $color: string }>`
  background-color: ${p => p.$color};
  color: white;
  border-radius: 6px;
  padding: 0.6rem 0.8rem;
  font-size: 0.95rem;

  .time {
    font-weight: 700;
    font-size: 0.85rem;
    opacity: 0.9;
  }

  .name {
    font-weight: 600;
    font-size: 0.95rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const EmptyDay = styled.div`
  color: var(--color-grey-400);
  font-size: 0.8rem;
  text-align: center;
  padding: 2rem 0;
`;

// Table Styles
const ScheduleTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  width: 100%;
  border-collapse: collapse;
  font-size: 1.05rem;

  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid var(--color-grey-200);
  }

  th {
    background: var(--color-grey-50);
    font-weight: 600;
    color: var(--color-grey-700);
    position: sticky;
    top: 0;
  }

  tbody tr:hover {
    background: var(--color-grey-50);
  }
`;

const ShiftBadge = styled.span<{ $color: string }>`
  background-color: ${p => p.$color};
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const NoShifts = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--color-grey-500);
  font-size: 1rem;
`;

// ============================================================================
// COMPONENT
// ============================================================================

interface EmployeeScheduleModalProps {
  employee: EmployeeMini;
  weekDays: Date[];
  items: ComputedSchedule[];
  onClose: () => void;
}

export default function EmployeeScheduleModal({
  employee,
  weekDays,
  items,
  onClose
}: EmployeeScheduleModalProps) {
  const [activeTab, setActiveTab] = useState<'grid' | 'table'>('grid');

  // Group items by date for grid view
  const itemsByDate = useMemo(() => {
    const map: Record<string, ComputedSchedule[]> = {};
    weekDays.forEach(d => {
      const dateStr = format(d, 'yyyy-MM-dd');
      map[dateStr] = items.filter(i => i.date === dateStr);
    });
    return map;
  }, [weekDays, items]);

  // Get initials for avatar placeholder
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Stop propagation to prevent closing when clicking inside modal
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={handleModalClick}>
        {/* Header */}
        <Header>
          <EmployeeInfo>
            {employee.avatar ? (
              <Avatar src={employee.avatar} alt={employee.name} />
            ) : (
              <AvatarPlaceholder>{getInitials(employee.name)}</AvatarPlaceholder>
            )}
            <div>
              <EmployeeName>{employee.name}</EmployeeName>
              <EmployeeDept>{employee.department}</EmployeeDept>
            </div>
          </EmployeeInfo>
          <CloseButton onClick={onClose}>
            <HiXMark />
          </CloseButton>
        </Header>

        {/* Tabs */}
        <TabsContainer>
          <Tab $active={activeTab === 'grid'} onClick={() => setActiveTab('grid')}>
            <HiCalendarDays /> Vue Grille
          </Tab>
          <Tab $active={activeTab === 'table'} onClick={() => setActiveTab('table')}>
            <HiTableCells /> Vue Tableau
          </Tab>
        </TabsContainer>

        {/* Content */}
        <Content>
          {activeTab === 'grid' && (
            <WeekGrid>
              {weekDays.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayItems = itemsByDate[dateStr] || [];

                return (
                  <DayColumn key={dateStr}>
                    <DayHeader>
                      {format(day, 'EEE', { locale: fr })}
                      <br />
                      {format(day, 'd MMM', { locale: fr })}
                    </DayHeader>
                    <DayContent>
                      {dayItems.length > 0 ? (
                        dayItems.map(item => (
                          <ShiftBlock key={item.id} $color={item.color || '#3b82f6'}>
                            <div className="time">{item.startTime} - {item.endTime}</div>
                            <div className="name">{item.shiftName}</div>
                          </ShiftBlock>
                        ))
                      ) : (
                        <EmptyDay>Repos</EmptyDay>
                      )}
                    </DayContent>
                  </DayColumn>
                );
              })}
            </WeekGrid>
          )}

          {activeTab === 'table' && (
            items.length > 0 ? (
              <ScheduleTable>
                <thead>
                  <tr>
                    <th>Jour</th>
                    <th>Date</th>
                    <th>Shift</th>
                    <th>Horaires</th>
                    <th>Durée</th>
                  </tr>
                </thead>
                <tbody>
                  {weekDays.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const dayItems = itemsByDate[dateStr] || [];

                    if (dayItems.length === 0) {
                      return (
                        <tr key={dateStr}>
                          <td>{format(day, 'EEEE', { locale: fr })}</td>
                          <td>{format(day, 'd MMM yyyy', { locale: fr })}</td>
                          <td colSpan={3} style={{ color: 'var(--color-grey-400)' }}>
                            — Repos —
                          </td>
                        </tr>
                      );
                    }

                    return dayItems.map((item, idx) => {
                      // Calculate duration
                      const [startH, startM] = item.startTime.split(':').map(Number);
                      const [endH, endM] = item.endTime.split(':').map(Number);
                      let durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
                      if (durationMinutes < 0) durationMinutes += 24 * 60; // Cross-day
                      const hours = Math.floor(durationMinutes / 60);
                      const mins = durationMinutes % 60;

                      return (
                        <tr key={item.id}>
                          {idx === 0 && (
                            <>
                              <td rowSpan={dayItems.length}>
                                {format(day, 'EEEE', { locale: fr })}
                              </td>
                              <td rowSpan={dayItems.length}>
                                {format(day, 'd MMM yyyy', { locale: fr })}
                              </td>
                            </>
                          )}
                          <td>
                            <ShiftBadge $color={item.color || '#3b82f6'}>
                              {item.shiftName}
                            </ShiftBadge>
                          </td>
                          <td>{item.startTime} - {item.endTime}</td>
                          <td>{hours}h{mins > 0 ? ` ${mins}min` : ''}</td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </ScheduleTable>
            ) : (
              <NoShifts>
                Aucun shift assigné pour cette semaine
              </NoShifts>
            )
          )}
        </Content>
      </ModalContainer>
    </Overlay>
  );
}
