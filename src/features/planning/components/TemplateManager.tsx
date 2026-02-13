
import styled from 'styled-components';
import { WeeklyTemplate } from '../types';
import { HiPlus, HiPencil, HiArchiveBox, HiMinus, HiCog6Tooth } from 'react-icons/hi2';
import { useState } from 'react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border-element);
  padding: 1rem;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-text-main);
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid ${p => p.$active ? 'var(--color-primary)' : 'var(--color-border-element)'};
  background: ${p => p.$active ? 'var(--color-primary-light)' : 'transparent'};
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  color: ${p => p.$active ? 'var(--color-primary)' : 'var(--color-text-secondary)'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-primary);
  }
`;

const ManageButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.6rem;
  border: 1px solid ${p => p.$active ? 'var(--color-red-500)' : 'var(--color-border-element)'};
  background: ${p => p.$active ? 'var(--color-red-100)' : 'transparent'};
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  color: ${p => p.$active ? 'var(--color-red-600)' : 'var(--color-text-secondary)'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
`;

const Carousel = styled.div`
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  overflow-y: visible;
  padding: 10px 0 10px 0; /* Extra padding for wiggle animation */
  margin: -10px 0; /* Compensate visually */
  
  /* Hide scrollbar */
  &::-webkit-scrollbar { display: none; }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const ActionButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-element);
  border-radius: 4px;
  padding: 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: var(--color-bg-hover);
    border-color: var(--color-primary);
  }
`;

const DeleteBadge = styled.button`
  position: absolute;
  top: -6px;
  left: -6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ef4444;
  border: 2px solid var(--color-bg-card);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  animation: wiggle 0.3s ease-in-out;
  transition: transform 0.15s;

  &:hover {
    transform: scale(1.2);
    background: #dc2626;
  }

  @keyframes wiggle {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-3deg); }
    75% { transform: rotate(3deg); }
  }
`;

const TemplateCard = styled.div<{ $isActive: boolean; $color?: string; $isArchived?: boolean; $isManaging?: boolean }>`
  min-width: 160px;
  padding: 0.75rem;
  border-radius: var(--border-radius-md);
  background: ${p => p.$isArchived ? 'var(--color-grey-100)' : 'var(--color-bg-card)'};
  border: 1px solid ${props => props.$isActive ? (props.$color || 'var(--color-primary)') : 'var(--color-border-element)'};
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  box-shadow: ${props => props.$isActive ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'};
  position: relative;
  overflow: visible;
  opacity: ${p => p.$isArchived ? 0.6 : 1};

  /* Wiggle animation in manage mode */
  ${p => p.$isManaging && `
    animation: cardWiggle 0.15s ease-in-out infinite alternate;
    @keyframes cardWiggle {
      0% { transform: rotate(-0.5deg); }
      100% { transform: rotate(0.5deg); }
    }
  `}

  &:hover {
    border-color: ${props => props.$color || 'var(--color-primary)'};
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  &:hover ${ActionButton} {
    opacity: 1;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background-color: ${p => p.$color || 'var(--color-primary)'};
    opacity: ${p => p.$isActive ? 1 : 0.5};
    transition: opacity 0.2s;
  }

  .name {
    font-weight: 600;
    color: var(--color-text-main);
    font-size: 0.9rem;
    padding-right: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  .desc {
    font-size: 0.8rem;
    color: var(--color-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const ArchivedBadge = styled.span`
  background: var(--color-grey-400);
  color: white;
  font-size: 0.65rem;
  padding: 0 0.25rem;
  border-radius: 2px;
  font-weight: 500;
`;

const AddCard = styled.div`
  min-width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--color-border-element);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
    background: var(--color-bg-hover);
  }
`;

interface TemplateManagerProps {
  templates: WeeklyTemplate[];
  selectedTemplateId: string | null;
  onSelectTemplate: (template: WeeklyTemplate) => void;
  onCreateTemplate: () => void;
  onEditTemplate?: (template: WeeklyTemplate) => void;
  onDeleteTemplate?: (template: WeeklyTemplate) => void; // NEW
}

export default function TemplateManager({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onCreateTemplate,
  onEditTemplate,
  onDeleteTemplate
}: TemplateManagerProps) {
  const [showArchived, setShowArchived] = useState(false);
  const [isManaging, setIsManaging] = useState(false);

  // Separate active and archived templates
  const activeTemplates = templates.filter(t => !(t as any).is_archived);
  const archivedTemplates = templates.filter(t => (t as any).is_archived);

  const displayedTemplates = showArchived
    ? [...activeTemplates, ...archivedTemplates]
    : activeTemplates;

  return (
    <Container>
      <HeaderRow>
        <h3>Modèles d'Emploi du Temps</h3>
        <HeaderActions>
          {archivedTemplates.length > 0 && (
            <ToggleButton
              $active={showArchived}
              onClick={() => setShowArchived(!showArchived)}
              title={showArchived ? "Masquer les modèles archivés" : "Afficher les modèles archivés"}
            >
              <HiArchiveBox size={12} />
              {archivedTemplates.length} archivé{archivedTemplates.length > 1 ? 's' : ''}
            </ToggleButton>
          )}
          {onDeleteTemplate && (
            <ManageButton
              $active={isManaging}
              onClick={() => setIsManaging(!isManaging)}
              title={isManaging ? "Terminer" : "Gérer les modèles"}
            >
              <HiCog6Tooth size={12} />
              {isManaging ? 'Terminé' : 'Gérer'}
            </ManageButton>
          )}
        </HeaderActions>
      </HeaderRow>

      <Carousel>
        {!isManaging && (
          <AddCard onClick={onCreateTemplate} title="Créer un nouveau modèle">
            <HiPlus size={24} />
          </AddCard>
        )}

        {displayedTemplates.map(shift => {
          const isArchived = (shift as any).is_archived;
          return (
            <TemplateCard
              key={shift.id}
              $isActive={shift.id === selectedTemplateId}
              $color={shift.color}
              $isArchived={isArchived}
              $isManaging={isManaging}
              onClick={() => !isManaging && onSelectTemplate(shift)}
            >
              {/* iOS-style delete badge */}
              {isManaging && onDeleteTemplate && (
                <DeleteBadge
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTemplate(shift);
                  }}
                  title="Supprimer ce modèle"
                >
                  <HiMinus size={12} color="white" strokeWidth={3} />
                </DeleteBadge>
              )}

              <div className="name">
                {shift.name}
                {isArchived && <ArchivedBadge>Archivé</ArchivedBadge>}
              </div>
              <div className="desc">{shift.description || "Aucune description"}</div>

              {onEditTemplate && !isManaging && (
                <ActionButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditTemplate(shift);
                  }}
                  title="Modifier le modèle"
                >
                  <HiPencil size={14} color="var(--color-text-main)" />
                </ActionButton>
              )}
            </TemplateCard>
          );
        })}
      </Carousel>
    </Container>
  );
}
