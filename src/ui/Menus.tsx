import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { HiEllipsisVertical } from "react-icons/hi2";
import styled from "styled-components";

const Menu = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const StyledToggle = styled.button`
  background: none;
  border: none;
  padding: 0.4rem;
  border-radius: var(--border-radius-sm);
  border-radius: var(--border-radius-sm);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: var(--color-grey-100);
  }

  & svg {
    width: 2.4rem;
    height: 2.4rem;
    color: var(--color-grey-700);
  }
`;

type Position = { x: number; y: number };

const StyledList = styled.ul<{ position: Position }>`
  position: fixed;

  background-color: var(--color-grey-0);
  box-shadow: var(--shadow-md);
  border-radius: var(--border-radius-md);

  right: ${(props) => props.position.x}px;
  top: ${(props) => props.position.y}px;
  z-index: 2000;
`;

const StyledButton = styled.button`
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 1.2rem 2.4rem;
  font-size: 1.4rem;
  transition: all 0.2s;

  display: flex;
  align-items: center;
  gap: 1.6rem;

  &:hover {
    background-color: var(--color-grey-50);
  }

  & svg {
    width: 1.6rem;
    height: 1.6rem;
    color: var(--color-grey-400);
    transition: all 0.3s;
  }
`;

type MenuContextValue = {
  openId: string;
  close: () => void;
  open: (id: string) => void;
  position: Position | null;
  setPosition: React.Dispatch<React.SetStateAction<Position | null>>;
};

const MenuContext = createContext<MenuContextValue | undefined>(undefined);

type MenusProps = { children: React.ReactNode };

function Menus({ children }: MenusProps) {
  const [openId, setOpenId] = useState("");
  const [position, setPosition] = useState<Position | null>(null);
  const close = () => setOpenId("");
  const open = setOpenId;

  return (
    <MenuContext.Provider
      value={{ openId, close, open, position, setPosition }}
    >
      {children}
    </MenuContext.Provider>
  );
}

type ToggleProps = { id: string; children?: React.ReactNode };

function Toggle({ id, children }: ToggleProps) {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("Menus.Toggle must be used within <Menus>");

  const { openId, close, open, setPosition } = ctx;

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    const btn = (e.target as HTMLElement).closest("button");
    if (!btn) return;

    const rect = btn.getBoundingClientRect();

    setPosition({
      x: window.innerWidth - rect.width - rect.x,
      y: 8 + rect.height + rect.y,
    });

    openId === "" || openId !== id ? open(id) : close();
  }

  return (
    <StyledToggle onClick={handleClick}>
      {children || <HiEllipsisVertical />}
    </StyledToggle>
  );
}

type ListProps = { id: string; children: React.ReactNode };

function List({ id, children }: ListProps) {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("Menus.List must be used within <Menus>");

  const { openId, position, close } = ctx;

  // replace custom useOutSideClick with inline logic
  const ref = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node | null;
      if (ref.current && target && !ref.current.contains(target)) {
        close();
      }
    }
    // capture = false to let inner clicks register first
    document.addEventListener("click", handleClick, false);
    return () => document.removeEventListener("click", handleClick, false);
  }, [close]);

  if (openId !== id || !position) return null;

  return createPortal(
    <StyledList position={position} ref={ref}>
      {children}
    </StyledList>,
    document.body
  );
}

type ButtonProps = {
  onClick?: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
};

function Button({ onClick, children, icon }: ButtonProps) {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("Menus.Button must be used within <Menus>");
  const { close } = ctx;

  function handleClick() {
    onClick?.();
    close();
  }

  return (
    <li>
      <StyledButton onClick={handleClick}>
        {icon}
        <span>{children}</span>
      </StyledButton>
    </li>
  );
}

Menus.Menu = Menu as unknown as React.FC<{ children: React.ReactNode }>;
Menus.Toggle = Toggle;
Menus.List = List;
Menus.Button = Button;

export default Menus;
