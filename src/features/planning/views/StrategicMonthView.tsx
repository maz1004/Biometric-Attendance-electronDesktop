import { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { format, addDays, subDays, startOfYear, endOfYear } from "date-fns";
import { useQuery } from "@tanstack/react-query";

import { Shift, UserShift, ComputedSchedule } from "@/features/planning/types";
import { PlanningService } from "../../../services/planning";
import { computeScheduleWithValidation } from "../engine/PlanningEngine";
import PlanningCalendar from "../components/scheduling/PlanningCalendar";
import { MonthDayMeta } from "../components/scheduling/StrategicDayCell";
import { usePlanning } from "../hooks/usePlanning";
import HolidayManager from "../components/modals/HolidayManager";
import ExceptionManager from "../components/modals/ExceptionManager";
import PlanningFilterBar from "../components/scheduling/PlanningFilterBar";

// --- STYLED COMPONENTS ---
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-grey-0);
  padding: 0; /* REMOVED PADDING to maximize space */
  overflow-y: auto; 
`;

const Toolbar = styled.div`
  display: flex;
  gap: 12px;
  padding: 8px 16px;
  background: var(--color-grey-0);
  border-bottom: 1px solid var(--color-grey-200);
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--color-grey-700);
  transition: background-color 0.2s;
  &:hover { background: var(--color-grey-100); }
`;

// --- COMPONENT ---
interface StrategicMonthManagerProps {
  userShifts?: UserShift[];
  shifts?: Record<string, Shift>;
  templates?: Shift[];
  onAssignTemplate?: (date: Date, template: Shift) => void;
}

export default function StrategicMonthManager({
  userShifts: propUserShifts = [],
  shifts: propShifts = {},
  templates = [],
  onAssignTemplate
}: StrategicMonthManagerProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Use the full planning hook for global state/actions
  const {
    holidays,
    // exceptions: weekExceptions,
    employees,
    settings,
    createException
  } = usePlanning();

  const [showHolidayManager, setShowHolidayManager] = useState(false);
  const [showExceptionManager, setShowExceptionManager] = useState(false);

  // Data Fetching: Full Year Scope (12 Months)
  // Ensures all data for the current year is loaded for scrolling/panorama views.
  const yearStart = startOfYear(currentMonth);
  const yearEnd = endOfYear(currentMonth);

  const { data: monthAssignments } = useQuery({
    queryKey: ["assignments", "year", format(yearStart, "yyyy")],
    queryFn: () => PlanningService.getAssignments(format(yearStart, "yyyy-MM-dd"), format(yearEnd, "yyyy-MM-dd"))
  });

  const { data: monthShifts, isLoading: shiftsLoading } = useQuery({
    queryKey: ["shifts", "year", format(yearStart, "yyyy")],
    queryFn: async () => PlanningService.getShifts()
  });

  // Fetch Exceptions for the whole year
  const { data: monthExceptions } = useQuery({
    queryKey: ["exceptions", "year", format(yearStart, "yyyy")],
    queryFn: () => PlanningService.getExceptions({ start_date: format(yearStart, "yyyy-MM-dd"), end_date: format(yearEnd, "yyyy-MM-dd") })
  });


  const userShifts = monthAssignments?.data || propUserShifts;

  const shifts = useMemo(() => {
    // Priority: Fetched Data > Props
    if (monthShifts && monthShifts.length > 0) {
      const record: Record<string, Shift> = {};
      monthShifts.forEach(s => record[s.id] = s);
      return record;
    }
    return propShifts;
  }, [monthShifts, propShifts]);

  // Combine fetched exceptions with manual ones if any (legacy)
  const exceptionsList = monthExceptions || [];

  const [timeZone, setTimeZone] = useState<string | undefined>(undefined);

  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  // --- COMPUTATION LOGIC (with Validation) ---
  const computedMonthData: ComputedSchedule[] = useMemo(() => {
    // Compute for the FULL fetched range to ensure smooth scrolling
    const start = yearStart;
    const end = yearEnd;
    const days: Date[] = [];

    // Optimized buffer
    const bufferStart = subDays(start, 7); // Extra buffer
    const bufferEnd = addDays(end, 7);

    for (let d = new Date(bufferStart); d <= bufferEnd; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    // CRITICAL FIX: Always wait for local shifts to load to prevent partial layout rendering errors
    if (shiftsLoading) return [];

    // Compute with validation
    const result = computeScheduleWithValidation(shifts, userShifts, {}, {}, { weekDates: days, debugContext: 'MonthView', settings });

    // Log any validation issues
    if (!result.validation.isValid) {
      console.warn('[StrategicMonthView] Validation errors:', result.validation.errors);
    }
    if (result.disabledShifts.length > 0) {
      console.warn('[StrategicMonthView] Disabled shifts:', result.disabledShifts.map(s => s.shiftName));
    }

    return result.schedule;
  }, [currentMonth, userShifts, shifts, yearStart, yearEnd, shiftsLoading, settings]);



  const [filters, setFilters] = useState({
    showShifts: true,
    showExceptions: true,
    showHolidays: true
  });

  const handleFilterChange = (key: keyof typeof filters, value: boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Compute metaMap
  const metaMap = useMemo(() => {
    const map: Record<string, MonthDayMeta> = {};

    computedMonthData.forEach((item) => {
      // Filter Logic for Computed Items
      if (item.source === 'RULE' && !filters.showShifts) return;
      // If engine returns exceptions as items, filter them too:
      if ((item.source === 'EXCEPTION' || item.source === 'OVERRIDE') && !filters.showExceptions) return;

      let dateMeta = map[item.date];
      if (!dateMeta) {
        dateMeta = { items: [] };
        map[item.date] = dateMeta;
      }
      if (!dateMeta.items) dateMeta.items = [];
      dateMeta.items.push(item);
      if (!dateMeta.color) {
        dateMeta.color = (item.color || '#3b82f6') + '30';
      }
    });

    // Overlay Holidays
    if (holidays && filters.showHolidays) {
      holidays.forEach(h => {
        const dateStr = format(new Date(h.date), "yyyy-MM-dd");
        let dateMeta = map[dateStr];
        if (!dateMeta) {
          dateMeta = { items: [] };
          map[dateStr] = dateMeta;
        }
        // Add pseudo-item for display or just color
        dateMeta.items?.push({
          id: `holiday-${h.id}`,
          date: dateStr,
          shiftId: 'holiday',
          shiftName: `🏖️ ${h.name}`,
          startTime: '00:00',
          endTime: '23:59',
          source: 'EXCEPTION',
          color: '#fee2e2'
        });
        dateMeta.color = 'var(--color-bg-error-subtle, #fee2e2)';
      });
    }

    // Overlay Exceptions (Leaves)
    if (exceptionsList && filters.showExceptions) {
      exceptionsList.forEach(ex => {
        const start = new Date(ex.start_date);
        const dateStr = format(start, "yyyy-MM-dd");
        let dateMeta = map[dateStr];
        if (!dateMeta) {
          dateMeta = { items: [] };
          map[dateStr] = dateMeta;
        }
        dateMeta.items?.push({
          id: `ex-${ex.id}`,
          date: dateStr,
          shiftId: 'exception',
          shiftName: `⚠️ ${ex.type} (${employees[ex.user_id]?.name || 'User'})`,
          startTime: format(start, "HH:mm"),
          endTime: format(new Date(ex.end_date), "HH:mm"),
          source: 'EXCEPTION',
          color: '#fff3cd'
        });
      });
    }

    return map;
  }, [computedMonthData, holidays, exceptionsList, employees, filters]);

  // Adapter for onAssignTemplate promise wrapping if needed
  const handleAssignTemplate = async (date: Date | Date[], template: Shift) => {
    if (onAssignTemplate) {
      // @ts-ignore - Prop drilling flexible type
      onAssignTemplate(date, template);
    }
  };

  const handleAssignException = async (date: Date | Date[], type: 'LEAVE' | 'SICK' | 'REMOTE' | 'OVERRIDE') => {
    const dates = Array.isArray(date) ? date : [date];

    // Simulate/Call API
    // Since backend might throw "Not Ready", we catch and simulate UI feedback
    for (const d of dates) {
      try {
        await createException({
          start_date: format(d, 'yyyy-MM-dd'),
          end_date: format(d, 'yyyy-MM-dd'),
          type: type,
          user_id: 'GLOBAL' // Or derived from context if/when available
        });
      } catch (e) {
        console.warn("Exception creation simulation/error:", e);
        // Optimistically update or just notify
      }
    }
  };

  return (
    <Container>
      <PlanningFilterBar filters={filters} onFilterChange={handleFilterChange} />
      <Toolbar>
        <ActionButton onClick={() => setShowHolidayManager(true)}>Manage Holidays</ActionButton>
        <ActionButton onClick={() => setShowExceptionManager(true)}>Manage Exceptions</ActionButton>
      </Toolbar>
      <PlanningCalendar
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        metaMap={metaMap}
        templates={templates}
        onAssignTemplate={handleAssignTemplate}
        onAssignException={handleAssignException}
        timeZone={timeZone}
      />
      <HolidayManager isOpen={showHolidayManager} onClose={() => setShowHolidayManager(false)} />
      <ExceptionManager
        isOpen={showExceptionManager}
        onClose={() => setShowExceptionManager(false)}
        employees={employees}
      />
    </Container>
  );
}
