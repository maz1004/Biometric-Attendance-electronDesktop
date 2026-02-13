import React, { useState, useMemo, useCallback, useContext, createContext } from 'react';
import { format, isBefore, isSameDay, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/ui/calendarShadCn";
import StrategicDayCell, { MonthDayMeta, SelectionState } from "./StrategicDayCell";
import MonthDayPopover from "../popovers/MonthDayPopover";
import MonthHoverPopover from "../popovers/MonthHoverPopover";
import { Shift, ComputedSchedule, ShiftException } from "@/features/planning/types";
// import { toast } from "sonner"; // Assuming sonner is used, or alert

interface PlanningCalendarProps {
    month: Date;
    onMonthChange: (date: Date) => void;
    metaMap: Record<string, MonthDayMeta>;
    templates?: Shift[];
    onAssignTemplate?: (date: Date | Date[], template: Shift) => Promise<void>;
    timeZone?: string;
}

// --- INTERNAL CONTEXT ---
interface PlanningContextType {
    metaMap: Record<string, MonthDayMeta>;
    getSelectionState: (date: Date) => SelectionState;
    onDayMouseEnter: (date: Date, e: React.MouseEvent) => void;
    onDayMouseLeave: () => void;
    onDayClick: (date: Date, e: React.MouseEvent) => void;
}

const PlanningContext = createContext<PlanningContextType | null>(null);

// --- STABLE DAY BUTTON COMPONENT ---
const PlanningDayButton = (props: any) => {
    const { day, date: propDate } = props;

    // RDP v9 passes a CalendarDay object as 'day', which contains the actual 'date'.
    const rawDate = day?.date || day || propDate;

    // Fallback extraction
    const date = (rawDate instanceof Date) ? rawDate : (rawDate ? new Date(rawDate) : null);

    const context = useContext(PlanningContext);

    // Strict check: date must be a valid Date object
    if (!context || !date || isNaN(date.getTime())) {
        return null;
    }

    const { metaMap, getSelectionState, onDayMouseEnter, onDayMouseLeave, onDayClick } = context;
    const dateStr = format(date, "yyyy-MM-dd");
    const meta = metaMap[dateStr];

    // Debug specific date to trace visual issue
    // if (dateStr === '2026-01-23') {
    //    console.log(`[PlanningDayButton] Render 2026-01-23. Meta found? ${!!meta} Items: ${meta?.items?.length} Color: ${meta?.color}`);
    // }

    const selectionState = getSelectionState(date);

    return (
        <div
            data-date={format(date, "yyyy-MM-dd")}
            onMouseEnter={(e) => onDayMouseEnter(date, e)}
            onMouseLeave={onDayMouseLeave}
            onClick={(e) => onDayClick(date, e)}
            style={{ height: '100%', width: '100%' }}
        >
            <StrategicDayCell
                className="strategic-day-cell"
                date={date}
                meta={meta}
                selectionState={selectionState}
                isPanorama={true}
            />
        </div>
    );
};

export default function PlanningCalendar({
    month,
    onMonthChange,
    metaMap,
    templates = [],
    onAssignTemplate,
    timeZone
}: PlanningCalendarProps) {
    // --- LOCAL INTERACTION STATE ---
    const [selectionStart, setSelectionStart] = useState<Date | null>(null);
    // Removed hoverDate from state to prevent re-renders

    // Popovers
    const [clickPopover, setClickPopover] = useState<{ x: number, y: number, date: Date, endDate?: Date } | null>(null);
    const [hoverPopover, setHoverPopover] = useState<{ x: number, y: number, dateStr: string, items: ComputedSchedule[], exception?: ShiftException, alignment?: 'left' | 'right' } | null>(null);

    // --- LOGIC ---

    // Direct DOM Manipulation Helper
    const updateRangeVisuals = (start: Date, end: Date | null) => {
        // Clear all previous visual classes
        document.querySelectorAll('.strategic-day-cell').forEach(el => {
            el.classList.remove('is-start', 'is-end', 'is-in-range');
        });

        if (!end) {
            // Just start
            const startStr = format(start, 'yyyy-MM-dd');
            const startEl = document.querySelector(`[data-date="${startStr}"] .strategic-day-cell`);
            if (startEl) startEl.classList.add('is-start');
            return;
        }

        const startDate = isBefore(start, end) ? start : end;
        const endDate = isBefore(start, end) ? end : start;

        // Efficiently iterate visual days? 
        // Or just query all and check date?
        // Querying all is safer given the calendar structure might not include all days in order or might have gaps
        document.querySelectorAll('[data-date]').forEach(el => {
            const dateStr = el.getAttribute('data-date');
            if (!dateStr) return;
            // Simple string comparison works for ISO yyyy-MM-dd if we want to be fast, but dates might be better
            const d = new Date(dateStr);

            if (isSameDay(d, startDate)) {
                el.querySelector('.strategic-day-cell')?.classList.add('is-start');
            } else if (isSameDay(d, endDate)) {
                el.querySelector('.strategic-day-cell')?.classList.add('is-end');
            } else if (isWithinInterval(d, { start: startDate, end: endDate })) {
                el.querySelector('.strategic-day-cell')?.classList.add('is-in-range');
            }
        });
    };

    // 1. Hover Logic (Simple + Range) with Delay
    const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const openTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const clearHoverTimeout = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
    };

    const clearOpenTimeout = () => {
        if (openTimeoutRef.current) {
            clearTimeout(openTimeoutRef.current);
            openTimeoutRef.current = null;
        }
    };

    const handleDayMouseEnter = useCallback((date: Date, e: React.MouseEvent) => {
        // Clear any closing timeout immediately
        clearHoverTimeout();
        clearOpenTimeout(); // Clear any pending open for OTHER cells

        if (selectionStart) {
            // In selection mode: Update DOM directly (Instant feedback preferred)
            updateRangeVisuals(selectionStart, date);
            setHoverPopover(null);
        } else {
            // Simple mode: Check for metadata (tooltip)
            const dateStr = format(date, "yyyy-MM-dd");
            const meta = metaMap[dateStr];

            if (meta && (meta.items?.length || meta.exception)) {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

                // Delay showing to prevent "Gap Crossing" issues
                openTimeoutRef.current = setTimeout(() => {
                    // Check if close to right edge
                    const isNearRightEdge = rect.right > window.innerWidth - 350;

                    setHoverPopover({
                        x: isNearRightEdge ? rect.left : rect.left + rect.width,
                        y: rect.top,
                        dateStr,
                        items: meta.items || [],
                        exception: meta.exception,
                        alignment: isNearRightEdge ? 'left' : 'right'
                    });
                }, 150);
            } else {
                // If moving to empty cell, maybe clear immediately?
                // Or wait? Better to wait to allow crossing empty gaps.
                openTimeoutRef.current = setTimeout(() => {
                    setHoverPopover(null);
                }, 150);
            }
        }
    }, [selectionStart, metaMap]);

    const handleDayMouseLeave = useCallback(() => {
        if (selectionStart) {
            // Don't clear selection visuals, just hover 
        } else {
            // Start timeout to close
            clearOpenTimeout(); // Cancel pending open
            clearHoverTimeout();
            hoverTimeoutRef.current = setTimeout(() => {
                setHoverPopover(null);
            }, 1000); // 1s Delay
        }
    }, [selectionStart]);

    // 2. Click Logic (Selection Start -> End -> Popover)
    const handleDayClick = useCallback((date: Date, e: React.MouseEvent) => {
        e.stopPropagation(); // Just in case

        if (!selectionStart) {
            // Start Selection
            setSelectionStart(date);
            updateRangeVisuals(date, null); // Highlight start immediately
            setHoverPopover(null); // Clear simple hover
            setClickPopover(null); // Clear any old click popover
        } else {
            // End Selection
            const rangeStart = isBefore(date, selectionStart) ? date : selectionStart;
            const rangeEnd = isBefore(date, selectionStart) ? selectionStart : date;

            // Finalize Visuals
            updateRangeVisuals(rangeStart, rangeEnd);

            // Open Assignment Popover
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setClickPopover({
                x: rect.left + rect.width / 2,
                y: rect.bottom,
                date: rangeStart,
                endDate: rangeEnd
            });
        }
    }, [selectionStart]);

    // 3. Selection State Computation (Pure, Derived) - ONLY FOR STATIC PROPS (Initialization)
    // We remove getSelectionState from Context because we rely on DOM manipulation for dynamic stuff
    // But we might want initial state? Actually, metaMap is enough.
    const getSelectionState = useCallback((date: Date): SelectionState => {
        // Should return 'none' generally, visuals handled by DOM
        // EXCEPT if we have a finalized popover open?
        if (clickPopover) {
            // Keep the range highlighted when popover is open
            // But actually, we can leave the DOM classes applied!
            // So this can simpler.
            return 'none';
        }
        if (selectionStart && isSameDay(date, selectionStart)) {
            // Maybe return start to persist if re-render happens
            // But re-renders wipe DOM classes unless we re-apply them.
            // We should re-apply DOM classes in useEffect if necessary.
            return 'start';
        }
        return 'none';
    }, [selectionStart, clickPopover]);

    // Re-apply visuals on render (if selection exists)
    React.useEffect(() => {
        if (selectionStart && !clickPopover) {
            updateRangeVisuals(selectionStart, null);
        } else if (clickPopover) {
            updateRangeVisuals(clickPopover.date, clickPopover.endDate || clickPopover.date);
        } else {
            updateRangeVisuals(new Date(0), new Date(0)); // Clear
        }
    }, [selectionStart, clickPopover]);


    // 4. Action Handlers
    const handleAssign = async (template: Shift) => {
        if (!clickPopover) return;
        const start = clickPopover.date;
        const end = clickPopover.endDate || start;

        const days: Date[] = [];
        let curr = new Date(start);
        while (curr <= end) {
            days.push(new Date(curr));
            curr.setDate(curr.getDate() + 1);
        }

        try {
            if (onAssignTemplate) {
                await onAssignTemplate(days, template);
            }
        } catch (err) {
            console.error(err);
        }

        // Reset
        setSelectionStart(null);
        setClickPopover(null);
    };



    const handleClear = () => {
        setSelectionStart(null);
        setClickPopover(null);
        setHoverPopover(null);
    };

    // --- CONTEXT PROVIDER VALUE ---
    const contextValue = useMemo(() => ({
        metaMap,
        getSelectionState, // Now stable-ish
        onDayMouseEnter: handleDayMouseEnter,
        onDayMouseLeave: handleDayMouseLeave,
        onDayClick: handleDayClick
    }), [metaMap, getSelectionState, handleDayMouseEnter, handleDayMouseLeave, handleDayClick]);

    // Stable components object
    const pComponents = useMemo(() => ({
        DayButton: PlanningDayButton as any
    }), []);

    return (
        <PlanningContext.Provider value={contextValue}>
            <div
                className="relative h-full flex flex-col w-full"
                onClick={handleClear}
            >
                {/* ... (Calendar) */}
                <Calendar
                    mode="single"
                    month={month}
                    onMonthChange={onMonthChange}
                    view="panorama"
                    hideViewSwitcher={true}
                    timeZone={timeZone}
                    locale={fr}
                    className="rounded-md border-none shadow-none bg-transparent"
                    components={pComponents}
                />

                {/* POPOVERS */}
                {clickPopover && (
                    <MonthDayPopover
                        x={clickPopover.x}
                        y={clickPopover.y}
                        date={clickPopover.date}
                        templates={templates}
                        onSelectTemplate={handleAssign}
                        onClear={handleClear}
                        onClose={handleClear}
                    />
                )}

                {hoverPopover && !clickPopover && !selectionStart && (
                    <MonthHoverPopover
                        x={hoverPopover.x}
                        y={hoverPopover.y}
                        dateStr={hoverPopover.dateStr}
                        items={hoverPopover.items}
                        exception={hoverPopover.exception}
                        alignment={hoverPopover.alignment}
                        onMouseEnter={() => {
                            clearHoverTimeout();
                            clearOpenTimeout();
                        }}
                        onMouseLeave={() => {
                            clearHoverTimeout();
                            hoverTimeoutRef.current = setTimeout(() => setHoverPopover(null), 1000);
                        }}
                    />
                )}
            </div>
        </PlanningContext.Provider>
    );
}
