import { useState } from "react";
import styled from "styled-components";
import { HiChevronDown, HiChevronUp } from "react-icons/hi2";
import useOutSideClick from "../hooks/useOutSideClick";

const StyledSelectMenu = styled.div`
  position: relative;
`;

const Toggle = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-sm);
  padding: 0.75rem 1.2rem;
  font-size: 1.35rem;
  color: var(--color-grey-900);
  cursor: pointer;

  &:hover {
     border-color: var(--color-brand-600);
  }
  
  /* Override global button:has(svg) { line-height: 0 } */
  line-height: 1.5;
`;

const List = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ScrollableList = styled.ul`
  max-height: 25rem;
  overflow-y: auto;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1.2rem;
  border: none;
  border-bottom: 1px solid var(--color-grey-200);
  background-color: transparent;
  color: var(--color-grey-900);
  font-size: 1.35rem;

  &:focus {
    outline: none;
    background-color: var(--color-grey-50);
  }
`;

const Item = styled.li<{ $active: boolean }>`
  padding: 0.8rem 1.2rem;
  font-size: 1.35rem;
  color: var(--color-grey-900);
  cursor: pointer;
  background-color: ${({ $active }) => $active ? "var(--color-grey-100)" : "transparent"};

  &:hover {
    background-color: var(--color-brand-50);
    color: var(--color-brand-700);
  }
`;

type Option = {
    value: string;
    label: string;
};

interface SelectMenuProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    width?: string;
}

export default function SelectMenu({ options, value, onChange, width = "18rem" }: SelectMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const ref = useOutSideClick<HTMLDivElement>(() => setIsOpen(false));

    const currentLabel = options.find((o) => o.value === value)?.label || value;

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    function handleSelect(val: string) {
        onChange(val);
        setIsOpen(false);
        setSearchQuery(""); // clear search on select
    }

    return (
        <StyledSelectMenu ref={ref} style={{ width }}>
            <Toggle onClick={() => setIsOpen((open) => !open)} type="button">
                <span style={{ flex: 1, textAlign: "left", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentLabel}</span>
                {isOpen ? <HiChevronUp size={16} /> : <HiChevronDown size={16} />}
            </Toggle>

            {isOpen && (
                <List>
                    <SearchInput
                        type="text"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                    />
                    <ScrollableList>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <Item
                                    key={opt.value}
                                    $active={opt.value === value}
                                    onClick={() => handleSelect(opt.value)}
                                >
                                    {opt.label}
                                </Item>
                            ))
                        ) : (
                            <Item $active={false} style={{ color: 'var(--color-grey-400)', cursor: 'default' }}>Aucun résultat</Item>
                        )}
                    </ScrollableList>
                </List>
            )}
        </StyledSelectMenu>
    );
}
