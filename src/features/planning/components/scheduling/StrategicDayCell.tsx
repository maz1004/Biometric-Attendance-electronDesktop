import { memo } from "react";
import styled, { css } from "styled-components";
import { ComputedSchedule, ShiftException } from "@/features/planning/types";

export interface MonthDayMeta {
    color?: string;
    items?: ComputedSchedule[];
    exception?: ShiftException;
}

export type SelectionState = 'none' | 'start' | 'end' | 'in-range' | 'single-selected';

interface StrategicDayCellProps {
    date: Date;
    meta?: MonthDayMeta;
    selectionState?: SelectionState;
    isPanorama?: boolean;
}

const getSelectionStyles = (state?: SelectionState) => {
    switch (state) {
        case 'start':
            return css`
                background-color: var(--color-brand-100, #dbeafe);
                box-shadow: inset 3px 0 0 0 var(--color-brand-600, #2563eb);
                z-index: 20;
            `;
        case 'end':
            return css`
                background-color: var(--color-brand-100, #dbeafe);
                box-shadow: inset -3px 0 0 0 var(--color-brand-600, #2563eb);
                z-index: 20;
            `;
        case 'in-range':
            return css`
                background-color: var(--color-brand-50, #eff6ff);
            `;
        case 'single-selected':
            return css`
                background-color: var(--color-brand-100, #dbeafe);
                box-shadow: inset 0 0 0 2px var(--color-brand-600, #2563eb);
                z-index: 20;
            `;
        default:
            return css``;
    }
};

const Container = styled.div<{ $bgColor?: string; $selectionState?: SelectionState }>`
    width: 100%;
    height: 100%;
    background-color: ${p => p.$bgColor || 'transparent'};
    /* Force black text if a background color is set (for Holidays/Exceptions visibility) */
    color: ${p => p.$bgColor ? '#000000' : 'inherit'}; 
    display: flex;
    flex-direction: column;
    padding: 2px 4px;
    border-radius: 8px; /* ✅ FIX: Enforce rounded corners */
    cursor: pointer;
    position: relative;
    z-index: 10;
    transition: background-color 0.1s;
    ${p => getSelectionStyles(p.$selectionState)}
    
    // Class-based overrides for direct DOM manipulation (Performance)
    &.is-start {
        background-color: var(--color-brand-100, #dbeafe);
        box-shadow: inset 0 0 0 2px var(--color-brand-600, #2563eb);
        color: var(--color-brand-900);
        z-index: 20;
    }
    &.is-end {
        background-color: var(--color-brand-100, #dbeafe);
        box-shadow: inset 0 0 0 2px var(--color-brand-600, #2563eb);
        color: var(--color-brand-900);
        z-index: 20;
    }
    &.is-in-range {
         background-color: var(--color-brand-50, #eff6ff);
         box-shadow: inset 0 0 0 1px var(--color-brand-400, #60a5fa);
         color: var(--color-brand-900);
    }
    &.is-single-selected {
        background-color: var(--color-brand-100, #dbeafe);
        box-shadow: inset 0 0 0 2px var(--color-brand-600, #2563eb);
        color: var(--color-brand-900);
        z-index: 20;
    }

    &:hover {
        ${p => p.$selectionState === 'none' && css`
            background-color: var(--color-brand-100, #dbeafe); /* ✅ FIX: Light BG on hover */
            color: var(--color-brand-900); /* ✅ FIX: Dark text on hover */
            box-shadow: inset 0 0 0 2px var(--color-brand-600);
            z-index: 20;
        `}
    }
`;

const DateLabel = styled.div`
  text-align: right;
  font-weight: 500;
  font-size: 0.85rem;
  color: var(--color-text-primary);
`;

const DotsContainer = styled.div`
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
  margin-top: auto;
  align-content: flex-end;
`;

const Dot = styled.div<{ $color: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${p => p.$color};
`;

const StrategicDayCell = memo(({
    date,
    meta,
    selectionState = 'none',
    isPanorama,
    className
}: StrategicDayCellProps & { className?: string }) => {

    const items = meta?.items || [];
    const bgColor = meta?.color;
    const showDotIndicator = items.length > 0;

    if (isPanorama) {
        return (
            <Container
                $bgColor={bgColor}
                $selectionState={selectionState}
                className={className}
            >
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: showDotIndicator ? 600 : 400 }}>
                        {date.getDate()}
                    </span>
                </div>
            </Container>
        );
    }

    return (
        <Container
            $bgColor={bgColor}
            $selectionState={selectionState}
            className={className}
        >
            <DateLabel>{date.getDate()}</DateLabel>
            <DotsContainer>
                {items.slice(0, 6).map((item, i) => (
                    <Dot key={i} $color={item.color || '#ccc'} />
                ))}
                {items.length > 6 && <span style={{ fontSize: 8, color: 'var(--color-text-secondary)' }}>+</span>}
            </DotsContainer>
        </Container>
    );
}, (prev: StrategicDayCellProps, next: StrategicDayCellProps) => {
    return (
        prev.date.getTime() === next.date.getTime() &&
        prev.isPanorama === next.isPanorama &&
        prev.selectionState === next.selectionState &&
        prev.meta === next.meta
    );
});

StrategicDayCell.displayName = 'StrategicDayCell';
export default StrategicDayCell;
