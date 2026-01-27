import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { Team, UpdateTeamCommand, EmployeeMini } from "../../types";
import VirtualizedSelector from "../ui/VirtualizedSelector";
import Button from "../../../../ui/Button"; // Design System Button
import { addMemberToTeam, removeMemberFromTeam } from "../../../../services/planning";

import {
  HiPencil,
  HiTrash,
  HiPlus,
  HiUserGroup,
  HiCheck,
  HiXMark,
  HiChevronDown,
  HiChevronUp
} from "react-icons/hi2";

// --- STYLED COMPONENTS ---

const PanelContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background: var(--color-grey-0);
  border-bottom: 1px solid var(--color-border-subtle);
  width: 100%;
  overflow-x: auto;
  min-height: 50px;
  
  &::-webkit-scrollbar { height: 4px; }
  &::-webkit-scrollbar-thumb { background: var(--color-grey-300); border-radius: 2px; }
`;

const Title = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  white-space: nowrap;
  margin-right: 0.5rem;
`;

const Separator = styled.div`
  width: 1px;
  height: 24px;
  background: var(--color-border-element);
`;

const TeamList = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
`;

const TeamChip = styled.div<{ $selected: boolean; $color: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  background: ${props => props.$selected ? props.$color : "var(--color-bg-card)"};
  border: 1px solid ${props => props.$selected ? props.$color : "var(--color-border-element)"};
  color: ${props => props.$selected ? "#ffffff" : "var(--color-text-primary)"};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  position: relative;

  &:hover {
    border-color: ${props => props.$color};
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }
`;

const ColorDot = styled.div<{ $color: string; $inverse?: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$inverse ? "white" : props.$color};
`;

const IconButton = styled.button`
  border: none;
  background: transparent;
  color: inherit;
  font-size: 0.9rem;
  padding: 2px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  opacity: 0.6;
  margin-left: 4px;
  &:hover { opacity: 1; background: rgba(255,255,255,0.2); }
`;

const AddButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px dashed var(--color-border-element);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-secondary);
  background: transparent;
  &:hover { border-color: var(--color-primary); color: var(--color-primary); }
`;

// --- MODAL STYLES ---
const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000;
  display: flex; align-items: center; justify-content: center;
`;
const ModalContent = styled.div`
  background: white; padding: 1.5rem; border-radius: 8px; width: 450px;
  display: flex; flex-direction: column; gap: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  max-height: 90vh;
  overflow-y: auto;
`;
const ModalHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  h4 { margin: 0; font-size: 1.1rem; }
`;
const InputGroup = styled.div`
  display: flex; flex-direction: column; gap: 4px;
`;
const Input = styled.input`
  width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;
`;
const ColorPickerRow = styled.div`
  display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px;
`;
const PRESET_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b",
  "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#64748b"
];
const ModalActions = styled.div`
  display: flex; justify-content: flex-end; gap: 8px; margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border-subtle);
`;

const MembersSection = styled.div`
  display: flex; flex-direction: column; gap: 0.5rem;
  padding: 1rem 0;
  border-top: 1px solid var(--color-border-subtle);
  border-bottom: 1px solid var(--color-border-subtle);
`;
const SectionHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  cursor: pointer;
  user-select: none;
  padding: 0.5rem 0;
  &:hover { opacity: 0.8; }
`;
const MemberSelectorWrapper = styled.div`
  height: 300px;
  border: 1px solid var(--color-border-element);
  border-radius: 4px;
`;

// --- COMPONENT ---

interface OperationalTeamsPanelProps {
  teams: Team[];
  employees: Record<string, EmployeeMini>;
  selectedTeamIds: string[];
  onToggleSelect: (id: string) => void;
  onUpdateTeam: (id: string, data: UpdateTeamCommand) => void;
  onDeleteTeam?: (id: string) => void; // Optional if unused
  onAddTeam: () => void;
}

export default function OperationalTeamsPanel({
  teams,
  employees,
  selectedTeamIds,
  onToggleSelect,
  onUpdateTeam,

  onAddTeam
}: OperationalTeamsPanelProps) {

  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; color: string; display_order: number }>({ name: "", color: "", display_order: 0 });
  const [showMemberManager, setShowMemberManager] = useState(false);

  // Sort teams
  const sortedTeams = [...teams].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  // Prepare Employee Options for VirtualizedSelector
  const empOptions = useMemo(() => {
    return Object.values(employees).map(e => ({
      id: e.id,
      label: e.name,
      meta: e.department
      // Avatar not supported by Option type as per VirtualizedSelector definition
    }));
  }, [employees]);

  const openEdit = (t: Team, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTeam(t);
    setEditForm({
      name: t.name,
      color: t.color || "#3b82f6",
      display_order: t.display_order || 0
    });
    setShowMemberManager(false);
  };

  const handleSave = () => {
    if (!editingTeam) return;
    onUpdateTeam(editingTeam.id, {
      name: editForm.name,
      color: editForm.color,
      display_order: Number(editForm.display_order)
    });
    setEditingTeam(null);
  };

  const handleDelete = () => {
    if (!editingTeam) return;
    if (confirm("Voulez-vous vraiment supprimer cette équipe (Soft Delete) ?")) {
      onUpdateTeam(editingTeam.id, { is_active: false });
      setEditingTeam(null);
    }
  };

  const handleToggleMember = async (userId: string) => {
    if (!editingTeam) return;
    const isMember = editingTeam.memberIds?.includes(userId);

    // Optimistic Update locally
    let newMemberIds = [...(editingTeam.memberIds || [])];

    try {
      if (isMember) {
        await removeMemberFromTeam(editingTeam.id, userId);
        newMemberIds = newMemberIds.filter(id => id !== userId);
      } else {
        await addMemberToTeam(editingTeam.id, userId);
        newMemberIds.push(userId);
      }

      // Update Local State so UI reflects change immediately
      setEditingTeam({
        ...editingTeam,
        memberIds: newMemberIds
      });

    } catch (e) {
      console.error("Failed to update team member", e);
      alert("Erreur lors de la mise à jour des membres. Vérifiez la console.");
    }
  };

  return (
    <PanelContainer>
      <Title>Équipes</Title>
      <Separator />

      <TeamList>
        {sortedTeams.map(t => {
          const isSelected = selectedTeamIds.includes(t.id);
          const isActive = t.is_active !== false;
          if (!isActive) return null;

          return (
            <TeamChip
              key={t.id}
              $selected={isSelected}
              $color={t.color || "#ccc"}
              onClick={() => onToggleSelect(t.id)}
            >
              {!isSelected && <ColorDot $color={t.color || "#ccc"} />}
              <span>{t.name}</span>
              <IconButton onClick={(e) => openEdit(t, e)} title="Modifier">
                <HiPencil />
              </IconButton>
            </TeamChip>
          );
        })}
        <AddButton onClick={onAddTeam} title="Nouvelle Équipe">
          <HiPlus />
        </AddButton>
      </TeamList>

      {/* EDIT MODAL */}
      {editingTeam && (
        <ModalOverlay onClick={() => setEditingTeam(null)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <h4>Modifier l'équipe</h4>
              <Button variation="secondary" size="small" onClick={() => setEditingTeam(null)}>
                <HiXMark size={20} />
              </Button>
            </ModalHeader>

            <InputGroup>
              <label>Nom</label>
              <Input
                value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
              />
            </InputGroup>

            <InputGroup>
              <label>Couleur</label>
              <ColorPickerRow>
                {PRESET_COLORS.map(c => (
                  <ColorDot
                    key={c}
                    $color={c}
                    style={{
                      width: 24, height: 24, cursor: 'pointer',
                      border: editForm.color === c ? '2px solid black' : 'none',
                      transform: editForm.color === c ? 'scale(1.1)' : 'scale(1)'
                    }}
                    onClick={() => setEditForm({ ...editForm, color: c })}
                  />
                ))}
              </ColorPickerRow>
            </InputGroup>

            <InputGroup>
              <label>Ordre d'affichage</label>
              <Input
                type="number"
                value={editForm.display_order}
                onChange={e => setEditForm({ ...editForm, display_order: Number(e.target.value) })}
                style={{ width: '100px' }}
              />
            </InputGroup>

            {/* Members Management Section */}
            <MembersSection>
              <SectionHeader onClick={() => setShowMemberManager(!showMemberManager)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HiUserGroup size={18} color="var(--color-text-secondary)" />
                  <span style={{ fontWeight: 500 }}>
                    Membres ({editingTeam.memberIds?.length || 0})
                  </span>
                </div>
                {showMemberManager ? <HiChevronUp /> : <HiChevronDown />}
              </SectionHeader>

              {showMemberManager && (
                <>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                    Sélectionnez les employés à ajouter à cette équipe.
                  </p>
                  <MemberSelectorWrapper>
                    <VirtualizedSelector
                      options={empOptions}
                      selected={new Set(editingTeam.memberIds || [])}
                      onToggle={handleToggleMember}
                      height={300}
                    />
                  </MemberSelectorWrapper>
                </>
              )}
            </MembersSection>

            <ModalActions>
              {/* Design System Danger Button */}
              <Button variation="danger" onClick={handleDelete}>
                <HiTrash /> Supprimer
              </Button>

              {/* Design System Primary Button */}
              <Button variation="primary" onClick={handleSave}>
                <HiCheck /> Enregistrer
              </Button>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}

    </PanelContainer>
  );
}
