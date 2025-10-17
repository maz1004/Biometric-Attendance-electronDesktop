import {
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
  ReactElement,
} from "react";
import { createPortal } from "react-dom";
import { HiXMark } from "react-icons/hi2";
import styled from "styled-components";

const StyledModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--color-grey-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 3.2rem 4rem;
  transition: all 0.5s;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: var(--backdrop-color);
  backdrop-filter: blur(4px);
  z-index: 1000;
  transition: all 0.5s;
`;

const Button = styled.button`
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

type ModalContextValue = {
  openName: string;
  open: (name: string) => void;
  close: () => void;
};

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

type ModalProps = { children: ReactNode };

function Modal({ children }: ModalProps) {
  const [openName, setOpenName] = useState("");

  const close = () => setOpenName("");
  const open = (name: string) => setOpenName(name);

  return (
    <ModalContext.Provider value={{ open, close, openName }}>
      {children}
    </ModalContext.Provider>
  );
}

type OpenProps = {
  children: ReactElement;
  opens: string;
};

function Open({ children, opens }: OpenProps) {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("Modal.Open must be used within <Modal>");
  const { open } = ctx;

  return cloneElement(children, {
    onClick: () => open(opens),
  });
}

type WindowProps = {
  children: ReactElement<{ onCloseModal?: () => void }>;
  name: string;
};

function Window({ children, name }: WindowProps) {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("Modal.Window must be used within <Modal>");
  const { openName, close } = ctx;

  const ref = useRef<HTMLDivElement | null>(null);

  // Inline outside-click handler (replaces custom hook)
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node | null;
      if (ref.current && target && !ref.current.contains(target)) {
        close();
      }
    }
    document.addEventListener("click", handleClick, false);
    return () => document.removeEventListener("click", handleClick, false);
  }, [close]);

  if (name !== openName) return null;

  return createPortal(
    <Overlay>
      <StyledModal ref={ref}>
        <Button onClick={close}>
          <HiXMark />
        </Button>
        <div>{cloneElement(children, { onCloseModal: close })}</div>
      </StyledModal>
    </Overlay>,
    document.body
  );
}

Modal.Open = Open;
Modal.Window = Window;
export default Modal;
