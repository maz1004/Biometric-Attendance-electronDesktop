import styled, { keyframes } from "styled-components";
import { Shift } from "../../types";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PopoverContainer = styled.div<{ x: number; y: number }>`
  position: fixed;
  top: ${p => p.y}px;
  left: ${p => p.x}px;
  /* Visuals handled by Tailwind className */
  z-index: 1000;
  width: 250px;
  max-height: 350px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  animation: ${fadeIn} 0.15s ease-out;
`;

const Header = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  /* Visuals handled by Tailwind className */
  padding-bottom: 0.4rem;
  display: flex; 
  justify-content: space-between;
  align-items: center;
`;

const ScrollList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow-y: auto;
  max-height: 250px;
`;

const TemplateItem = styled.button<{ color: string }>`
  background: transparent;
  padding: 0.5rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  text-align: left;
  transition: all 0.1s;
  color: inherit;

  &::before {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${p => p.color};
  }
`;

const ClearButton = styled.button`
    color: var(--color-red-500, #ef4444);
    font-size: 0.8rem;
    background: none;
    border: none;
    cursor: pointer;
    &:hover { text-decoration: underline; }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: transparent;
  z-index: 999;
`;

interface MonthDayPopoverProps {
  x: number;
  y: number;
  date: Date;
  templates: Shift[];
  onSelectTemplate: (template: Shift) => void;
  onClear: () => void;
  onClose: () => void;
}

export default function MonthDayPopover({
  x,
  y,
  templates,
  onSelectTemplate,
  onClear,
  onClose
}: MonthDayPopoverProps) {

  const adjustedX = Math.min(x, window.innerWidth - 260);
  const adjustedY = Math.min(y, window.innerHeight - 360);

  return (
    <>
      <Overlay onClick={onClose} />
      <PopoverContainer
        x={adjustedX}
        y={adjustedY}
        className="shadow-xl rounded-lg p-3"
        style={{
          backgroundColor: "var(--color-grey-0)",
          border: "1px solid var(--color-grey-200)",
          color: "var(--color-grey-700)"
        }}
      >
        <Header className="mb-3" style={{
          borderBottom: "1px solid var(--color-border-element)",
          paddingBottom: "0.5rem",
          marginBottom: "0.5rem"
        }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>Assignation</span>
          <ClearButton onClick={onClear}>Effacer tout</ClearButton>
        </Header>

        <ScrollList>
          {/* Section: Modèles */}
          <div className="px-1 py-1 text-sm font-bold text-gray-600 uppercase tracking-wider">Modèles</div>
          {templates.map(t => {
            // Derive a proper display name - detect if name is just a time range
            const isTimeRangeName = t.name && /^\d{1,2}[h:]?\d{0,2}\s*[>\-]\s*\d{1,2}[h:]?\d{0,2}$/i.test(t.name);
            const displayName = isTimeRangeName || !t.name
              ? `Shift ${t.startTime || "09:00"} - ${t.endTime || "17:00"}`
              : t.name;

            // Extract time info for subtitle
            const timeInfo = t.startTime && t.endTime
              ? `${t.startTime} - ${t.endTime}`
              : null;

            return (
              <TemplateItem
                key={t.id}
                color={t.color || "#ccc"}
                onClick={() => onSelectTemplate(t)}
                className="hover:bg-muted/50 hover:border-border"
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 500 }}>{displayName}</span>
                  {timeInfo && !isTimeRangeName && (
                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                      {timeInfo}
                    </span>
                  )}
                </div>
              </TemplateItem>
            );
          })}


        </ScrollList>
      </PopoverContainer>
    </>
  );
}
