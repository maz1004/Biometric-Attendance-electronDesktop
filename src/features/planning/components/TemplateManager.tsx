
import styled from 'styled-components';
import { Shift } from '../types';
import { HiPlus } from 'react-icons/hi2';

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

const Carousel = styled.div`
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  
  /* Hide scrollbar */
  &::-webkit-scrollbar { display: none; }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const TemplateCard = styled.div<{ isActive: boolean; color?: string }>`
  min-width: 180px;
  padding: 0.75rem;
  border-radius: var(--border-radius-md);
  background: var(--color-bg-card);
  border: 1px solid ${props => props.isActive ? (props.color || 'var(--color-primary)') : 'var(--color-border-element)'};
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  box-shadow: ${props => props.isActive ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'};
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: ${props => props.color || 'var(--color-primary)'};
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background-color: ${p => p.color || 'var(--color-primary)'};
    opacity: ${p => p.isActive ? 1 : 0.5};
    transition: opacity 0.2s;
  }


  .name {
    font-weight: 600;
    color: var(--color-text-main);
    font-size: 0.9rem;
  }
  
  .desc {
    font-size: 0.8rem;
    color: var(--color-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
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
  templates: Shift[];
  selectedTemplateId: string | null;
  onSelectTemplate: (shift: Shift) => void;
  onCreateTemplate: () => void;
}

export default function TemplateManager({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onCreateTemplate
}: TemplateManagerProps) {
  return (
    <Container>
      <HeaderRow>
        <h3>Modèles d'Emploi du Temps</h3>
      </HeaderRow>

      <Carousel>
        <AddCard onClick={onCreateTemplate} title="Créer un nouveau modèle">
          <HiPlus size={24} />
        </AddCard>

        {templates.map(shift => (
          <TemplateCard
            key={shift.id}
            isActive={shift.id === selectedTemplateId}
            color={shift.color}
            onClick={() => onSelectTemplate(shift)}
          >
            <div className="name">{shift.name}</div>
            <div className="desc">{shift.description || "Aucune description"}</div>
          </TemplateCard>
        ))}
      </Carousel>
    </Container>
  );
}
