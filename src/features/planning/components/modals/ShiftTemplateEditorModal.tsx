import { useState, useEffect } from "react";
import styled from "styled-components";
import Button from "../../../../ui/Button";
import Form from "../../../../ui/Form";
import FormRowVertical from "../../../../ui/FormRowVertical";
import Heading from "../../../../ui/Heading";
import { StyledModal, Overlay } from "../../../../ui/Modal";
import { Shift } from "../../types";

// ----- STYLED COMPONENTS -----

const CustomModal = styled(StyledModal)`
  width: min(90vw, 30rem); 
  display: flex;
  flex-direction: column;
  padding: 0;
  border-radius: var(--border-radius-lg);
`;

const ModalHeader = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--color-border-subtle);
  background: var(--color-bg-card);
`;

const ModalContent = styled.div`
  flex: 1;
  padding: 2rem;
`;

const ModalFooter = styled.div`
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--color-border-subtle);
  background: var(--color-bg-card);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

// Shared Colors 
// Shared Colors 
// EXCLUDED: Red (#ef4444) reserved for Exceptions (Leaves)
// EXCLUDED: Yellow/Amber (#f59e0b) reserved for Holidays
const COLORS = [
    "#fca5a5", "#fecaca", "#f87171", // Red variants (kept light ones?) - User said "remove these colors". I will remove the main reserved ones.
    // Red removed: #ef4444
    "#fdba74", "#fb923c", "#f97316", "#ea580c", // Orange
    // Amber/Yellow removed: #f59e0b
    "#fcd34d", "#fbbf24", "#d97706", // Remaining Amber
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
].filter(c => c !== '#ef4444' && c !== '#f59e0b');


const ColorCircle = styled.button<{ $bg: string; $selected: boolean }>`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: ${(p) => p.$bg};
  border: ${(p) => p.$selected ? "2px solid var(--color-text-main)" : "1px solid transparent"};
  cursor: pointer;
  transition: transform 0.1s;
  &:hover { transform: scale(1.1); }
`;

const ColorGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

// ----- TYPES & LOGIC -----

interface ShiftTemplateEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    shift?: Shift;
    onSave: (updatedShift: Partial<Shift>) => void;
}

export default function ShiftTemplateEditorModal({
    isOpen,
    onClose,
    shift,
    onSave
}: ShiftTemplateEditorModalProps) {

    // Defaults
    const defaultShift: Partial<Shift> = {
        name: "Nouveau Modèle",
        color: COLORS[0],
    };

    const targetShift = shift || defaultShift;

    // Form State
    const [name, setName] = useState(targetShift.name || "");
    const [color, setColor] = useState(targetShift.color || COLORS[0]);

    useEffect(() => {
        if (isOpen) {
            const current = shift || defaultShift;
            setName(current.name || "");
            setColor(current.color || COLORS[0]);
        }
    }, [isOpen, shift]);

    const handleSave = () => {
        onSave({
            name,
            color,
        });
    };

    if (!isOpen) return null;

    return (
        <Overlay onClick={onClose}>
            <CustomModal onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <Heading as="h2">{shift ? "Modifier Modèle" : "Créer Modèle"}</Heading>
                </ModalHeader>

                <ModalContent>
                    <Form type="regular">
                        <FormRowVertical label="Nom du modèle">
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="input"
                                autoFocus
                                style={{
                                    width: '100%',
                                    background: 'var(--color-bg-input)',
                                    color: 'var(--color-text-main)',
                                    padding: '0.6rem',
                                    border: '1px solid var(--color-border-input)',
                                    borderRadius: 'var(--border-radius-sm)'
                                }}
                            />
                        </FormRowVertical>

                        <FormRowVertical label="Couleur">
                            <ColorGrid>
                                {COLORS.slice(0, 16).map(c => (
                                    <ColorCircle
                                        key={c} $bg={c} $selected={color === c}
                                        onClick={() => setColor(c)} type="button"
                                    />
                                ))}
                            </ColorGrid>
                        </FormRowVertical>
                    </Form>
                </ModalContent>

                <ModalFooter>
                    <Button variation="secondary" onClick={onClose}>Annuler</Button>
                    <Button variation="primary" onClick={handleSave}>Enregistrer</Button>
                </ModalFooter>
            </CustomModal>
        </Overlay>
    );
}
