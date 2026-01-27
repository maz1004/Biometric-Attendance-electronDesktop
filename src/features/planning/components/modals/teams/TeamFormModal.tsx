import { useMemo, useState } from "react";
import styled from "styled-components";
import Button from "../../../../../ui/Button";
import Input from "../../../../../ui/Input";
import Form from "../../../../../ui/Form";

import FormRowVertical from "../../../../../ui/FormRowVertical";
import Heading from "../../../../../ui/Heading";
import { StyledModal, Overlay } from "../../../../../ui/Modal";
import { EmployeeMini, Team } from "../../../types";
import VirtualizedSelector, { Option } from "../../ui/VirtualizedSelector";

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
  margin-top: 1.2rem;
`;

const SmallModal = styled(StyledModal)`
  width: min(90vw, 45rem);
  padding: 2.4rem 3.2rem;
`;

const FullWidthInput = styled(Input)`
  width: 100%;
  box-sizing: border-box;
`;

const ModalForm = styled(Form)`
  width: 100%;
`;

// Refined Tailwind-like pastel colors (Distinct set)
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
  background-color: #fff;
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

export default function TeamFormModal(props: {
  initial?: Team;
  employees: Record<string, EmployeeMini>;
  onCloseModal: () => void;
  onSave: (data: Omit<Team, "id"> & { id?: string }) => void;
}) {
  const [name, setName] = useState(props.initial?.name ?? "");
  const [dept, setDept] = useState(props.initial?.department ?? "");
  const [color, setColor] = useState(props.initial?.color ?? COLORS[42]); // Default blue-ish
  const [showPalette, setShowPalette] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(props.initial?.memberIds ?? [])
  );

  const options: Option[] = useMemo(
    () =>
      Object.values(props.employees).map((e) => ({
        id: e.id,
        label: e.name,
        meta: e.department,
      })),
    [props.employees]
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  return (
    <Overlay onClick={props.onCloseModal}>
      <SmallModal onClick={(e) => e.stopPropagation()}>
        <Heading as="h2">
          {props.initial ? "Edit Team" : "Create Team"}
        </Heading>

        <ModalForm type="modal">
          <FormRowVertical label="Name">
            <FullWidthInput
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Team name"
            />
          </FormRowVertical>

          <FormRowVertical label="Department">
            <FullWidthInput
              type="text"
              id="department"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              placeholder="IT, HR, Sales..."
            />
          </FormRowVertical>

          <FormRowVertical label="Color">
            <PopoverWrapper>
              <ColorTrigger
                type="button"
                onClick={() => setShowPalette(!showPalette)}
              >
                <SelectedSwatch $bg={color} />
                <span>{color}</span>
              </ColorTrigger>

              {showPalette && (
                <PalettePopover>
                  <ColorGrid>
                    {COLORS.map((c) => (
                      <ColorCircle
                        key={c}
                        type="button"
                        $bg={c}
                        $selected={color === c}
                        onClick={() => {
                          setColor(c);
                          setShowPalette(false);
                        }}
                        title={c}
                      />
                    ))}
                  </ColorGrid>
                </PalettePopover>
              )}
            </PopoverWrapper>
          </FormRowVertical>

          <FormRowVertical label="Members">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <VirtualizedSelector
                options={options}
                selected={selected}
                onToggle={toggle}
                placeholder="Search users…"
                height={260}
              />
              <span style={{ fontSize: '1.2rem', color: 'var(--color-grey-500)' }}>
                {selected.size} selected
              </span>
            </div>
          </FormRowVertical>

          <FormActions>
            <Button variation="secondary" onClick={props.onCloseModal}>
              Cancel
            </Button>
            <Button
              variation="primary"
              onClick={() => {
                props.onSave({
                  id: props.initial?.id,
                  name,
                  department: dept,
                  color,
                  memberIds: Array.from(selected),
                });
                props.onCloseModal();
              }}
            >
              Save
            </Button>
          </FormActions>
        </ModalForm>
      </SmallModal>
    </Overlay>
  );
}
