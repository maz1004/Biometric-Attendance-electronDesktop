import * as React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css"; // ✅ IMPORT DU CSS DE BASE
import styled from "styled-components";
import { HiChevronLeft, HiChevronRight, HiChevronDown } from "react-icons/hi2";
import Button from "./Button";

export type CalendarView = "month" | "year" | "panorama";

interface ShiftIndicator {
  color: string;
  type: "SHIFT" | "EXCEPTION";
  tooltip?: string;
}

// --- STYLED WRAPPER (SIMPLIFIÉ) ---
// On customise seulement l'apparence, RDP gère la structure
const CalendarWrapper = styled.div<{ $isPanorama?: boolean }>`
  width: 100%;
  padding: 1rem;
  overflow-y: auto;

  /* Panorama : 3 colonnes de mois */
  .rdp-months {
    display: grid;
    grid-template-columns: ${props => props.$isPanorama ? 'repeat(3, 1fr)' : '1fr'};
    gap: 2rem;
    max-width: ${props => props.$isPanorama ? 'none' : '1000px'};
    margin: 0 auto;
  }

  /* Carte blanche pour chaque mois */
  .rdp-month {
    background: var(--color-grey-0);
    border: 1px solid var(--color-grey-200);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    padding: 1.5rem;
  }

  /* Header du mois (avec navigation) */
  .rdp-caption {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    position: relative;
    min-height: 48px;
  }

  /* Titre du mois */
  .rdp-caption_label {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--color-text-main);
    text-transform: capitalize;
    letter-spacing: 0.02em;
  }

  /* Headers (Lu, Ma, Me...) */
  .rdp-head_cell {
    color: var(--color-text-tertiary, #94a3b8);
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    text-align: center;
    padding: 0.5rem 0;
  }

  /* Cellules de jours */
  .rdp-cell {
    height: ${props => props.$isPanorama ? '100px' : '140px'};
    border-top: 1px solid var(--color-border-subtle, #f1f5f9);
    text-align: center;
    vertical-align: middle;
  }

  /* Bouton de jour - CENTRÉ ET AGRANDI */
  .rdp-day {
    /* ❌ PAS de display: flex - ça casse le tableau */
    border-radius: 8px;
    font-weight: 300 !important; /* Light Font */
    padding: 0 !important; /* ✅ FIX: Remove padding to let child fill 100% */
    color: var(--color-text-main);
    font-size: 1.1rem; 
    text-align: center;
    vertical-align: middle;
  }

  /* États */
  .rdp-day:hover:not([disabled]) {
    background-color: transparent !important; /* ✅ FIX: Remove default RDP hover */
  }

  .rdp-day_selected:not([disabled]) {
    background-color: transparent !important; /* Let specific component handle BG */
    color: inherit !important;
    font-weight: 600 !important;
  }

  .rdp-day_today {
    color: var(--color-brand-600, #4f46e5);
    font-weight: 700 !important;
  }

  .rdp-day_outside {
    opacity: 0.25;
  }

  /* Navigation RDP native - CACHÉE (on utilise nos boutons custom) */
  .rdp-nav {
    display: none !important;
  }

  /* Boutons de navigation personnalisés */
  .custom-nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: var(--color-grey-0);
    border: 1px solid var(--color-grey-200);
    color: var(--color-grey-500);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not([disabled]) {
      background-color: var(--color-brand-50);
      border-color: var(--color-brand-200);
      color: var(--color-brand-600);
    }
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
  }

  /* Boutons de navigation < > (Legacy RDP) */
  .rdp-button_previous,
  .rdp-button_next {
    display: flex !important;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: transparent;
    border: 1px solid var(--color-grey-200);
    color: var(--color-grey-500);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not([disabled]) {
      background-color: var(--color-brand-50);
      border-color: var(--color-brand-200);
      color: var(--color-brand-600);
    }
/* ... */
`;

type CalendarProps = Omit<React.ComponentProps<typeof DayPicker>, "mode" | "selected"> & {
  mode?: "single";
  selected?: Date | undefined;
  onSelect?: (date: Date | undefined) => void;
  view?: CalendarView;
  onViewChange?: (view: CalendarView) => void;
  getDayShifts?: (day: Date) => ShiftIndicator[];
  hideViewSwitcher?: boolean;
};

const Calendar = ({
  className,
  getDayShifts,
  view: propView,
  onViewChange,
  hideViewSwitcher,
  components: userComponents,
  ...props
}: CalendarProps) => {
  const [internalView, setInternalView] = React.useState<CalendarView>("month");
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());

  const view = propView || internalView;
  const setView = onViewChange || setInternalView;

  const handlePrevMonth = () => {
    const newDate = new Date(currentMonth);
    if (view === "panorama") {
      newDate.setFullYear(newDate.getFullYear() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    if (view === "panorama") {
      newDate.setFullYear(newDate.getFullYear() + 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentMonth(newDate);
  };

  const DefaultDayContent = React.useMemo(() => {
    return (dayProps: any) => {
      const shifts = getDayShifts?.(dayProps.date) || [];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'space-between', paddingBottom: 4 }}>
          <span>{dayProps.date.getDate()}</span>
          <div style={{ display: 'flex', gap: '2px' }}>
            {shifts.map((s, i) => (
              <span
                key={i}
                style={{
                  display: 'block', width: '5px', height: '5px',
                  borderRadius: '50%', backgroundColor: s.color
                }}
                title={s.tooltip || s.type}
              />
            ))}
          </div>
        </div>
      );
    };
  }, [getDayShifts]);

  const finalComponents = React.useMemo(() => ({
    DayContent: DefaultDayContent,
    IconLeft: () => <HiChevronLeft />,
    IconRight: () => <HiChevronRight />,
    IconDropdown: () => <HiChevronDown />,
    ...userComponents
  }), [DefaultDayContent, userComponents]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {!hideViewSwitcher && (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            variation={view === "month" ? "primary" : "secondary"}
            size="small"
            onClick={() => setView("month")}
          >
            Mois
          </Button>
          <Button
            variation={view === "panorama" ? "primary" : "secondary"}
            size="small"
            onClick={() => setView("panorama")}
          >
            12 Mois
          </Button>
        </div>
      )}

      <div style={{ position: 'relative', width: '100%' }}>
        {/* Boutons de navigation personnalisés en haut à droite */}
        <div style={{
          position: 'absolute',
          right: '1.5rem',
          top: '1.5rem',
          zIndex: 10,
          display: 'flex',
          gap: '0.5rem'
        }}>
          <button
            onClick={handlePrevMonth}
            className="custom-nav-btn"
          >
            <HiChevronLeft size={18} />
          </button>
          <button
            onClick={handleNextMonth}
            className="custom-nav-btn"
          >
            <HiChevronRight size={18} />
          </button>
        </div>

        <CalendarWrapper $isPanorama={view === "panorama"} className={className}>
          <DayPicker
            {...(props as any)}
            mode="single"
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            numberOfMonths={view === "month" ? 1 : 12}
            showOutsideDays={true}
            components={finalComponents}
          />
        </CalendarWrapper>
      </div>
    </div>
  );
};

export { Calendar };
