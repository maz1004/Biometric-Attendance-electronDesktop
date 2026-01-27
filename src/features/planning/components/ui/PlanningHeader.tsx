import styled from "styled-components";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import Select from "../../../../ui/Select";

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--color-grey-0);
  border-bottom: 1px solid var(--color-border-element);
  position: relative;
`;

// Center the nav group absolutely to ensure it's perfectly centered
const CenterNav = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const NavButton = styled.button`
  background: var(--color-grey-0);
  border: 1px solid var(--color-border-element);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-main);
  transition: all 0.2s;
  
  &:hover {
    background: var(--color-bg-hover);
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
`;

const DateDisplay = styled.div`
  font-weight: 700;
  color: var(--color-text-main);
  font-size: 1.1rem;
  text-transform: capitalize;
  min-width: 200px;
  text-align: center;
`;

const RightControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto; /* Push to right if not using absolute center for nav */
`;

export interface PlanningHeaderProps {
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  viewMode: "week" | "month" | "cells";
  onViewChange: (mode: "week" | "month" | "cells") => void;
  timeSlot: "day" | "night";
  onTimeSlotChange: (slot: "day" | "night") => void;
  // onClone?: () => void; // Removed per user request
  mode: "view" | "template"; // NEW
  onModeChange: (m: "view" | "template") => void; // NEW
}

export default function PlanningHeader({
  currentDate,
  onPrev,
  onNext,
  viewMode,
  onViewChange,
  timeSlot,
  onTimeSlotChange,
  mode,
  onModeChange
}: PlanningHeaderProps) {

  const handleViewChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onViewChange(e.target.value as "week" | "month" | "cells");
  };

  const handleTimeSlotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onTimeSlotChange(e.target.value as "day" | "night");
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onModeChange(e.target.value as "view" | "template");
  };

  return (
    <HeaderContainer>
      {/* Left Side: Actions */}
      <div style={{ width: 220, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Select
          options={[
            { value: "view", label: "Vue Planning" },
            { value: "template", label: "Mode Modèle" }
          ]}
          value={mode}
          onChange={handleModeChange}
          variant="default"
        />
      </div>

      {/* Centered Date Navigation (Only in VIEW mode) */}
      <CenterNav style={{ opacity: mode === 'template' ? 0 : 1, pointerEvents: mode === 'template' ? 'none' : 'auto' }}>
        <NavButton onClick={onPrev}>
          <HiChevronLeft size={20} />
        </NavButton>
        <DateDisplay>
          {format(currentDate, viewMode === "week" ? "d MMMM yyyy" : "MMMM yyyy", { locale: fr })}
        </DateDisplay>
        <NavButton onClick={onNext}>
          <HiChevronRight size={20} />
        </NavButton>
      </CenterNav>

      {/* Right Side Controls */}
      <RightControls>

        {viewMode === "week" && (
          <Select
            options={[
              { value: "day", label: "Jour (08h - 19h)" },
              { value: "night", label: "Nuit (19h - 07h)" }
            ]}
            value={timeSlot}
            onChange={handleTimeSlotChange}
            variant="white"
          />
        )}

        {mode === 'view' && (
          <Select
            options={[
              { value: "month", label: "Stratégique" },
              { value: "week", label: "Opérationnel" },
              { value: "cells", label: "Vue par cases" }
            ]}
            value={viewMode}
            onChange={handleViewChange}
            variant="white"
          />
        )}
      </RightControls>
    </HeaderContainer>
  );
}
