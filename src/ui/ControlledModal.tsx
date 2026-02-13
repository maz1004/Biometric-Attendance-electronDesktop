import { createPortal } from "react-dom";
import { HiXMark } from "react-icons/hi2";
import styled from "styled-components";
import { Overlay, StyledModal } from "./Modal";

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 0.4rem;
  border-radius: var(--border-radius-sm);
  transform: translateX(0.8rem);
  transition: all 0.2s;
  position: absolute;
  top: 1.2rem;
  right: 1.9rem;

  &:hover {
    background-color: var(--color-grey-100);
  }

  & svg {
    width: 2.4rem;
    height: 2.4rem;
    color: var(--color-grey-500);
  }
`;

type Props = {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

export default function ControlledModal({ isOpen, onClose, children }: Props) {
    if (!isOpen) return null;

    return createPortal(
        <Overlay>
            <StyledModal>
                <CloseButton onClick={onClose}>
                    <HiXMark />
                </CloseButton>
                <div>{children}</div>
            </StyledModal>
        </Overlay>,
        document.body
    );
}
