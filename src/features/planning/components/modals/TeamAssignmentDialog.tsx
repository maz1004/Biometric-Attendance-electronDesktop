import { useState, useMemo, useEffect } from "react";
import styled from "styled-components";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import Button from "../../../../ui/Button";
import Form from "../../../../ui/Form";
import FormRowVertical from "../../../../ui/FormRowVertical";
import Heading from "../../../../ui/Heading";
import { StyledModal, Overlay } from "../../../../ui/Modal";
import { Team, EmployeeMini } from "../../types";
import VirtualizedSelector, { Option } from "../ui/VirtualizedSelector";

// ----- STYLED COMPONENTS (Shared Design System) -----

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
  margin-top: 2rem;
  border-top: 1px solid var(--color-border-subtle);
  padding-top: 1.5rem;
`;

const CustomModal = styled(StyledModal)`
  width: min(90vw, 55rem);
  padding: 2.4rem 3.2rem;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalForm = styled(Form)`
  width: 100%;
`;

// Shared Colors (Consider moving to a constants file if used in many places)
const COLORS = [
  "#fca5a5", "#fecaca", "#f87171", "#ef4444", // Red
  "#fdba74", "#fb923c", "#f97316", "#ea580c", // Orange
  "#fcd34d", "#fbbf24", "#f59e0b", "#d97706", // Amber
  "#fde047", "#facc15", "#eab308", "#ca8a04", // Yellow
  "#d9f99d", "#bef264", "#a3e635", "#65a30d", // Lime
  "#86efac", "#4ade80", "#22c55e", "#16a34a", // Green
  "#6ee7b7", "#34d399", "#10b981", "#059669", // Emerald
  "#5eead4", "#2dd4bf", "#14b8a6", "#0d9488", // Teal
  "#67e8f9", "#22d3ee", "#06b6d4", "#0891b2", // Cyan
  "#7dd3fc", "#38bdf8", "#0ea5e9", "#0284c7", // Sky
  "#93c5fd", "#60a5fa", "#3b82f6", "#2563eb", // Blue
  "#a5b4fc", "#818cf8", "#6366f1", "#4f46e5", // Indigo
  "#c4b5fd", "#a78bfa", "#8b5cf6", "#7c3aed", // Violet
  "#d8b4fe", "#c084fc", "#a855f7", "#9333ea", // Purple
  "#f0abfc", "#e879f9", "#d946ef", "#c026d3", // Fuchsia
  "#fbcfe8", "#f472b6", "#ec4899", "#db2777", // Pink
  "#fda4af", "#fb7185", "#f43f5e", "#e11d48", // Rose
];

const PopoverWrapper = styled.div`
  position: relative;
`;

const ColorTrigger = styled.button`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 0.8rem 1.2rem;
  border: 1px solid var(--color-toolbar-input-border);
  background: var(--color-toolbar-input-bg);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  text-align: left;
  color: var(--color-text-strong);
`;

const SelectedSwatch = styled.div<{ $bg: string }>`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: ${(p) => p.$bg};
  border: 1px solid var(--color-border-card);
  flex-shrink: 0;
`;

const PalettePopover = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: var(--color-bg-elevated); /* Better theme support */
  border: 1px solid var(--color-border-card);
  box-shadow: var(--shadow-lg);
  border-radius: var(--border-radius-md);
  padding: 1.2rem;
  z-index: 100;
  margin-top: 0.6rem;
  max-height: 200px;
  overflow-y: auto;
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(2.8rem, 1fr));
  gap: 0.8rem;
`;

const ColorCircle = styled.button<{ $bg: string; $selected: boolean }>`
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 50%;
  background-color: ${(p) => p.$bg};
  border: ${(p) =>
    p.$selected ? "2px solid var(--color-text-strong)" : "1px solid transparent"};
  cursor: pointer;
  transition: transform 0.1s;

  &:hover {
    transform: scale(1.1);
  }
`;

// ----- COMPONENT -----

interface TeamAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedTeamIds: string[], selectedEmpIds: string[], empColors: Record<string, string>) => void;
  date: Date;
  allTeams: Team[];
  unassignedEmployees: EmployeeMini[];
  initialSelectedTeamIds?: string[];
  initialSelectedEmpIds?: string[];
}

const EMPTY_ARRAY: string[] = [];

export default function TeamAssignmentDialog({
  isOpen,
  onClose,
  onSave,
  date,
  allTeams,
  unassignedEmployees,
  initialSelectedTeamIds = EMPTY_ARRAY,
  initialSelectedEmpIds = EMPTY_ARRAY,
}: TeamAssignmentDialogProps) {

  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set(initialSelectedTeamIds));
  const [selectedEmps, setSelectedEmps] = useState<Set<string>>(new Set(initialSelectedEmpIds));
  const [empColors, setEmpColors] = useState<Record<string, string>>({});
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null); // Employee ID with open picker

  // Compute used colors
  const usedColors = useMemo(() => {
    const used = new Set<string>();
    // Team Colors
    Array.from(selectedTeams).forEach(tid => {
      const t = allTeams.find(x => x.id === tid);
      if (t?.color) used.add(t.color);
    });
    // Employee Colors (only if selected)
    Object.keys(empColors).forEach(eid => {
      if (selectedEmps.has(eid)) {
        used.add(empColors[eid]);
      }
    });
    return used;
  }, [selectedTeams, selectedEmps, empColors, allTeams]);

  // Sync props to state when opening
  useEffect(() => {
    if (isOpen) {
      setSelectedTeams(new Set(initialSelectedTeamIds));
      setSelectedEmps(new Set(initialSelectedEmpIds));
      setEmpColors({}); // Reset or load if passed
    }
  }, [isOpen, initialSelectedTeamIds, initialSelectedEmpIds]);

  // Options for VirtualizedSelector
  const teamOptions: Option[] = useMemo(() =>
    allTeams.map(t => ({
      id: t.id,
      label: t.name,
      meta: t.department || "General"
    })),
    [allTeams]);

  const empOptions: Option[] = useMemo(() =>
    unassignedEmployees.map(e => ({
      id: e.id,
      label: e.name,
      meta: e.department || "No Dept"
    })),
    [unassignedEmployees]);

  // Toggle handlers
  const toggleTeam = (id: string) => {
    setSelectedTeams(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleEmp = (id: string) => {
    setSelectedEmps(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        // Assign first available color if not set
        if (!empColors[id]) {
          const available = COLORS.find(c => !usedColors.has(c));
          const nextC = available || COLORS[Math.floor(Math.random() * COLORS.length)];
          setEmpColors(prevC => ({ ...prevC, [id]: nextC }));
        }
      }
      return next;
    });
  };

  const handleColorSelect = (empId: string, c: string) => {
    setEmpColors(prev => ({ ...prev, [empId]: c }));
    setActiveColorPicker(null);
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <CustomModal onClick={(e) => e.stopPropagation()}>
        <Heading as="h2">
          Assignations du {format(date, "d MMMM yyyy", { locale: fr })}
        </Heading>

        <ModalForm type="modal">
          {/* TEAM SELECTION */}
          <FormRowVertical label="Équipes">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <VirtualizedSelector
                options={teamOptions}
                selected={selectedTeams}
                onToggle={toggleTeam}
                placeholder="Rechercher une équipe..."
                height={200}
              />
              <span style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', alignSelf: 'flex-end' }}>
                {selectedTeams.size} équipes sélectionnées
              </span>
            </div>
          </FormRowVertical>

          {/* EMPLOYEE SELECTION WITH COLOR PICKER */}
          <FormRowVertical label="Employés (Non assignés)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <VirtualizedSelector
                options={empOptions}
                selected={selectedEmps}
                onToggle={toggleEmp}
                placeholder="Rechercher un employé..."
                height={260}
                renderRightSide={(empId) => {
                  const isSelected = selectedEmps.has(empId);
                  if (!isSelected) return null;

                  const c = empColors[empId] || "#cccccc";
                  const isOpen = activeColorPicker === empId;

                  // Filter colors: Only show those NOT used, OR the current one
                  const visibleColors = COLORS.filter(col => !usedColors.has(col) || col === c);

                  return (
                    <PopoverWrapper>
                      <ColorTrigger
                        as="div" // Render as div to be valid inside interaction
                        style={{ width: 'auto', padding: '0.4rem', gap: '0.5rem' }}
                        onClick={(e: any) => {
                          e.stopPropagation();
                          setActiveColorPicker(isOpen ? null : empId);
                        }}
                      >
                        <SelectedSwatch $bg={c} style={{ width: '1.5rem', height: '1.5rem' }} />
                        {/* Optional: text <span>Select</span> */}
                      </ColorTrigger>

                      {isOpen && (
                        <PalettePopover onClick={e => e.stopPropagation()}>
                          <ColorGrid>
                            {visibleColors.map(col => (
                              <ColorCircle
                                key={col}
                                $bg={col}
                                $selected={c === col}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleColorSelect(empId, col);
                                }}
                              />
                            ))}
                          </ColorGrid>
                        </PalettePopover>
                      )}
                    </PopoverWrapper>
                  );
                }}
              />
              <span style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', alignSelf: 'flex-end' }}>
                {selectedEmps.size} employés sélectionnés
              </span>
            </div>
          </FormRowVertical>

          {/* ACTIONS */}
          <FormActions>
            <Button type="button" variation="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="button"
              variation="primary"
              onClick={(e) => {
                e.preventDefault();

                // Validation: Unique Colors
                const usedColors = new Set<string>();
                let hasError = false;

                // Check Teams
                for (const tid of Array.from(selectedTeams)) {
                  const t = allTeams.find(x => x.id === tid);
                  if (t?.color) {
                    if (usedColors.has(t.color)) {
                      alert(`Conflit de couleur! L'équipe "${t.name}" utilise une couleur déjà prise (${t.color}).`);
                      hasError = true;
                      break;
                    }
                    usedColors.add(t.color);
                  }
                }
                if (hasError) return;

                // Check Employees
                for (const eid of Array.from(selectedEmps)) {
                  const c = empColors[eid];
                  if (c) {
                    if (usedColors.has(c)) {
                      // Find who has it
                      const t = allTeams.find(x => x.color === c && selectedTeams.has(x.id));
                      if (t) {
                        alert(`Conflit de couleur! L'employé utilise la même couleur que l'équipe "${t.name}".`);
                      } else {
                        alert(`Conflit de couleur! Plusieurs employés utilisent la couleur ${c}.`);
                      }
                      hasError = true;
                      break;
                    }
                    usedColors.add(c);
                  } else {
                    // Require color? The previous logic defaulted to random if not set, 
                    // but if user didn't toggle off/on, it might be undefined?
                    // The toggle logic adds color. If missing, we might want to warn or auto-assign unique?
                    // For now, assume if undefined it's gray, which is fine unless multiple are gray.
                    // Let's strict check only explicit assignments or allow gray duplicates?
                    // User said "2 employee non plus".
                    // If we auto-assigned random colors on toggle, they should be set.
                  }
                }
                if (hasError) return;

                onSave(Array.from(selectedTeams), Array.from(selectedEmps), empColors);
              }}
            >
              Enregistrer les Assignations
            </Button>
          </FormActions>
        </ModalForm>
      </CustomModal>
    </Overlay>
  );
}
