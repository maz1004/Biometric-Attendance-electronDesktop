import styled, { keyframes } from "styled-components";
import Button from "../../../../ui/Button";
import { HiCheck, HiXMark } from "react-icons/hi2";

const slideUp = keyframes`
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const ToolbarContainer = styled.div`
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-bg-elevated);
  padding: 1rem 2rem;
  border-radius: 999px;
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  z-index: 1000;
  border: 1px solid var(--color-border-card);
  animation: ${slideUp} 0.3s cubic-bezier(0.16, 1, 0.3, 1);
`;

const Message = styled.span`
  font-weight: 500;
  color: var(--color-text-strong);
  font-size: 1.4rem;
`;

interface ActionToolbarProps {
    onSave: () => void;
    onCancel: () => void;
    isSaving?: boolean;
}

export default function ActionToolbar({ onSave, onCancel, isSaving }: ActionToolbarProps) {
    return (
        <ToolbarContainer>
            <Message>Unsaved changes</Message>
            <div style={{ display: "flex", gap: "0.8rem" }}>
                <Button variation="secondary" onClick={onCancel} disabled={isSaving}>
                    <HiXMark /> Cancel
                </Button>
                <Button variation="primary" onClick={onSave} disabled={isSaving}>
                    <HiCheck /> Save Changes
                </Button>
            </div>
        </ToolbarContainer>
    );
}
