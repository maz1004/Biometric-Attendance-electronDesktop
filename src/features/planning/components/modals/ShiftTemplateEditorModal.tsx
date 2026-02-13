import { useState, useEffect } from "react";
import styled from "styled-components";
import Button from "../../../../ui/Button";
import Form from "../../../../ui/Form";
import FormRowVertical from "../../../../ui/FormRowVertical";
import Heading from "../../../../ui/Heading";
import { StyledModal, Overlay } from "../../../../ui/Modal";
import { Shift, WeeklyTemplate } from "../../types";

// ----- STYLED COMPONENTS -----

const CustomModal = styled(StyledModal)`
  width: min(95vw, 42rem); 
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
  padding: 2.4rem; /* Increased padding */
  overflow-y: auto;
  overflow-x: hidden;
`;

const ModalForm = styled(Form)`
  width: 100%; /* Force full width to respect parent padding */
  font-size: 1.4rem;
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
  width: 2.5rem; /* Larger touch target */
  height: 2.5rem;
  border-radius: 50%;
  background-color: ${(p) => p.$bg};
  border: ${(p) => p.$selected ? "3px solid var(--color-grey-800)" : "1px solid var(--color-grey-200)"};
  cursor: pointer;
  transition: transform 0.1s, border-color 0.2s;
  flex-shrink: 0; /* Prevent shrinking */
  
  &:hover { transform: scale(1.1); }
`;

const ColorGrid = styled.div`
  display: flex;
  flex-wrap: nowrap; /* Prevent wrapping */
  gap: 0.8rem;
  margin-top: 0.5rem;
  overflow-x: auto; /* Horizontal Scroll */
  padding: 0.5rem;
  margin-left: -0.5rem; /* Negative margin to align with padding */
  width: calc(100% + 1rem); /* Compensate padding */
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--color-grey-300);
    border-radius: 3px;
  }
`;

// ----- TYPES & LOGIC -----

interface ShiftTemplateEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    shift?: Shift | WeeklyTemplate;
    onSave: (updatedShift: Partial<Shift> & Partial<WeeklyTemplate> & { color?: string }) => void;
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
        description: "",
        color: COLORS[0],
    };

    const targetShift = shift || defaultShift;

    // Form State
    const [name, setName] = useState(targetShift.name || "");
    const [description, setDescription] = useState(targetShift.description || "");
    const [color, setColor] = useState((targetShift as Shift).color || COLORS[0]);

    useEffect(() => {
        if (isOpen) {
            const current = shift || defaultShift;
            setName(current.name || "");
            setDescription(current.description || "");
            setColor((current as Shift).color || COLORS[0]);
        }
    }, [isOpen, shift]);

    const handleSave = () => {
        onSave({
            name,
            description,
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
                    <ModalForm type="modal">
                        <FormRowVertical label="Nom du modèle">
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="input"
                                autoFocus
                                style={{
                                    width: '100%',
                                    maxWidth: '100%',
                                    boxSizing: 'border-box',
                                    background: 'var(--color-bg-input)',
                                    color: 'var(--color-text-main)',
                                    padding: '0.8rem',
                                    border: '1px solid var(--color-border-input)',
                                    borderRadius: 'var(--border-radius-sm)',
                                    outline: 'none',
                                    fontSize: '1rem'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--color-border-input)'}
                            />
                        </FormRowVertical>

                        <FormRowVertical label="Description">
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Description du modèle (optionnel)"
                                rows={3}
                                style={{
                                    width: '100%',
                                    maxWidth: '100%',
                                    boxSizing: 'border-box',
                                    background: 'var(--color-bg-input)',
                                    color: 'var(--color-text-main)',
                                    padding: '0.8rem',
                                    border: '1px solid var(--color-border-input)',
                                    borderRadius: 'var(--border-radius-sm)',
                                    resize: 'vertical',
                                    fontFamily: 'inherit',
                                    outline: 'none',
                                    fontSize: '1rem'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--color-border-input)'}
                            />
                        </FormRowVertical>

                        <FormRowVertical label="Couleur">
                            <ColorGrid>
                                {COLORS.map(c => (
                                    <ColorCircle
                                        key={c} $bg={c} $selected={color === c}
                                        onClick={() => setColor(c)} type="button"
                                        title={c}
                                    />
                                ))}
                            </ColorGrid>
                        </FormRowVertical>
                    </ModalForm>
                </ModalContent>

                <ModalFooter>
                    <Button variation="secondary" onClick={onClose}>Annuler</Button>
                    <Button variation="primary" onClick={handleSave}>Enregistrer</Button>
                </ModalFooter>
            </CustomModal>
        </Overlay>
    );
}
