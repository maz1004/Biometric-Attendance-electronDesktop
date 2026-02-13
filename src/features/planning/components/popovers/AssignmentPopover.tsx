import styled, { keyframes } from "styled-components";
import React, { useEffect, useRef } from "react";
import { Team, EmployeeMini } from "../../types";
import { HiQuestionMarkCircle, HiClock, HiArrowRight } from "react-icons/hi2";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PopoverContainer = styled.div`
  position: absolute;
  /* top/left managed via inline style for dynamic flip */
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);
  padding: 0.75rem;
  z-index: 1000;
  width: 250px;
  max-height: 600px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  animation: ${fadeIn} 0.15s ease-out;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: var(--color-border-element); border-radius: 4px; }
`;

const Header = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  border-bottom: 1px solid var(--color-border-subtle);
  padding-bottom: 0.4rem;
  margin-bottom: 0.2rem;
  flex-shrink: 0;
`;

const List = styled.div<{ maxHeight?: string }>`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow-y: ${p => p.maxHeight ? 'auto' : 'visible'};
  max-height: ${p => p.maxHeight || 'none'};
  flex-shrink: 0; 

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: var(--color-border-element); border-radius: 4px; }
`;

const Item = styled.button<{ color: string; isSelected: boolean }>`
  background: ${p => p.isSelected ? 'var(--color-bg-subtle)' : 'transparent'};
  border: 1px solid ${p => p.isSelected ? p.color : 'transparent'};
  padding: 0.4rem 0.6rem;
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.1s;
  text-align: left;
  color: var(--color-text-main);

  &:hover {
    background: var(--color-bg-hover);
  }

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${p => p.color};
  }
`;



// ... existing styles ...

const ConflictContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ConflictHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-orange-700);
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--color-border-subtle);
    margin-bottom: 0.2rem;
`;

const ConflictOption = styled.button`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.6rem;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--border-radius-md);
  background: var(--color-bg-subtle);
  color: var(--color-text-main);
  text-align: left;
  transition: all 0.2s;
  cursor: pointer;
  line-height: 1.4; /* Fix text overlap/glitch due to global button svg style */

  &:hover {
    border-color: var(--color-primary);
    background: var(--color-bg-hover);
  }

  .icon {
    color: var(--color-primary);
    flex-shrink: 0;
  }
  
  .text {
    flex: 1;
    display: flex;
    flex-direction: column;
    
    .label { font-weight: 500; font-size: 0.85rem; }
    .sub { font-size: 0.75rem; color: var(--color-text-secondary); }
  }
`;

const IconButton = styled.button`
    background: none;
    border: none;
    padding: 2px;
    color: var(--color-text-tertiary);
    &:hover { color: var(--color-primary); }
    display: flex;
    align-items: center;
    justify-content: center;
`;

interface CollisionData {
    employeeName: string;
    teamName: string;
    teamStart: string;
    teamEnd: string;
    clickedTime: string;
    canCheckIn?: boolean;
    canCheckOut?: boolean;
}

interface AssignmentPopoverProps {
    x: number;
    y: number;
    cellHeight?: number;
    teams: Team[];
    employees?: EmployeeMini[];
    assignedIds: string[];
    onToggle: (id: string, type: 'team' | 'employee') => void;
    onClose: () => void;
    collisionData?: CollisionData | null;
    onResolveConflict?: (mode: 'checkout' | 'checkin' | 'new') => void;
    onShowHelp?: () => void;
}

export default function AssignmentPopover({
    x,
    y,
    cellHeight = 0,
    teams,
    employees = [],
    assignedIds,
    onToggle,
    onClose,
    collisionData,
    onResolveConflict,
    onShowHelp
}: AssignmentPopoverProps) {
    const popoverRef = useRef<HTMLDivElement>(null);
    const conflictRef = useRef<HTMLDivElement>(null);

    // Dynamic Positioning Logic
    const [style, setStyle] = React.useState<{ top: number; left: number; maxHeight: number; transform?: string }>({
        top: y,
        left: x,
        maxHeight: 400
    });

    useEffect(() => {
        // Calculate available space
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;
        const scrollY = window.scrollY;

        const popoverWidth = 250;
        const preferredMaxHeight = 500;
        const padding = 10;
        const minimumUsableHeight = 200;

        let finalLeft = x + window.scrollX;
        let finalMaxHeight = preferredMaxHeight;
        let finalTransform = undefined;

        const absoluteY = y + scrollY;
        const spaceBelow = windowHeight + scrollY - absoluteY - padding;

        let finalTop = absoluteY;

        if (spaceBelow < minimumUsableHeight) {
            const spaceAbove = absoluteY - scrollY - padding;
            if (spaceAbove > spaceBelow) {
                // FLIP UPWARDS
                finalTransform = "translateY(-100%)";
                // Adjust top to be above the cell (y - cellHeight) so it doesn't cover the cell
                finalTop = absoluteY - cellHeight;
                finalMaxHeight = Math.min(preferredMaxHeight, spaceAbove - cellHeight - 10);
            } else {
                finalMaxHeight = spaceBelow;
            }
        } else {
            finalMaxHeight = Math.min(preferredMaxHeight, spaceBelow);
        }

        if (finalLeft + popoverWidth > windowWidth + window.scrollX) {
            finalLeft = (windowWidth + window.scrollX) - popoverWidth - padding;
        }

        setStyle({
            top: finalTop,
            left: finalLeft,
            maxHeight: finalMaxHeight,
            transform: finalTransform
        });

    }, [x, y]);

    // Close on click outside (checking both main popover and conflict popup)
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            const clickedMain = popoverRef.current && popoverRef.current.contains(target);
            const clickedConflict = conflictRef.current && conflictRef.current.contains(target);

            if (!clickedMain && !clickedConflict) {
                onClose();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);


    const renderConflictPopup = () => {
        if (!collisionData || !onResolveConflict) return null;

        const mainPopoverWidth = 250;
        const conflictWidth = 280;
        const gap = 10;
        const windowWidth = window.innerWidth;
        const scrollBarWidth = 20; // Safety margin for scrollbar
        const edgeBuffer = 10;

        // Default: Position to the right
        let conflictLeft = style.left + mainPopoverWidth + gap;

        // Check availability on the right (with safety buffer)
        if (conflictLeft + conflictWidth > windowWidth - scrollBarWidth) {
            // Not enough space on right, try left
            const leftPosition = style.left - conflictWidth - gap;

            // If we have space on left (or at least more than right/screen squeeze), use left
            // We usually have space on left if we are on Saturday column
            conflictLeft = leftPosition;

            // Double check: if leftPosition is off-screen left (e.g. huge zoom or narrow window), clamp to 10px
            if (conflictLeft < edgeBuffer) {
                conflictLeft = edgeBuffer;
            }
        }

        return (
            <PopoverContainer
                ref={conflictRef}
                style={{
                    top: style.top,
                    left: conflictLeft,
                    transform: style.transform,
                    width: conflictWidth,
                    zIndex: 1001,
                    height: 'fit-content',
                    minHeight: 'auto'
                }}
                onClick={e => e.stopPropagation()}
            >
                <ConflictHeader>
                    <span>Conflit: {collisionData.teamName}</span>
                    <IconButton onClick={onShowHelp} title="Aide / Détails">
                        <HiQuestionMarkCircle size={20} />
                    </IconButton>
                </ConflictHeader>

                <ConflictContainer>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.2rem' }}>
                        {collisionData.employeeName} est déjà assigné.
                    </div>

                    {collisionData.canCheckOut && (
                        <ConflictOption onClick={() => onResolveConflict('checkout')}>
                            <div className="icon"><HiClock size={18} /></div>
                            <div className="text">
                                <span className="label">Check-out ({collisionData.teamName})</span>
                                <span className="sub">Finir à {collisionData.clickedTime}</span>
                            </div>
                            <HiArrowRight size={14} color="var(--color-text-tertiary)" />
                        </ConflictOption>
                    )}

                    {collisionData.canCheckIn && (
                        <ConflictOption onClick={() => onResolveConflict('checkin')}>
                            <div className="icon"><HiClock size={18} /></div>
                            <div className="text">
                                <span className="label">Check-in</span>
                                <span className="sub">Commencer à {collisionData.clickedTime}</span>
                            </div>
                            <HiArrowRight size={14} color="var(--color-text-tertiary)" />
                        </ConflictOption>
                    )}


                </ConflictContainer>
            </PopoverContainer>
        );
    };

    return (
        <>
            {/* Main Assignment List */}
            <PopoverContainer
                ref={popoverRef}
                style={{
                    top: style.top,
                    left: style.left,
                    maxHeight: style.maxHeight,
                    transform: style.transform
                }}
                onClick={e => e.stopPropagation()}
            >
                <Header>Assigner Équipe</Header>
                <List maxHeight="300px">
                    {teams.map(t => {
                        const isSelected = assignedIds.includes(t.id);
                        return (
                            <Item
                                key={t.id}
                                color={t.color || "#3b82f6"}
                                isSelected={isSelected}
                                onClick={() => onToggle(t.id, 'team')}
                            >
                                <span>{t.name}</span>
                            </Item>
                        );
                    })}
                </List>

                {employees.length > 0 && (
                    <>
                        <Header style={{ marginTop: '0.5rem' }}>Individuel</Header>
                        <List>
                            {employees.map(e => {
                                const isSelected = assignedIds.includes(e.id);
                                return (
                                    <Item
                                        key={e.id}
                                        color={"#10b981"} // Generic green for employees
                                        isSelected={isSelected}
                                        onClick={() => onToggle(e.id, 'employee')}
                                    >
                                        <span>{e.name}</span>
                                    </Item>
                                );
                            })}
                        </List>
                    </>
                )}
            </PopoverContainer>

            {/* Side-by-side Conflict Popup */}
            {renderConflictPopup()}
        </>
    );
}
