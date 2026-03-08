import { useState } from "react";
import styled from "styled-components";
import { HiChevronDown, HiChevronUp, HiCheck, HiOutlineQuestionMarkCircle } from "react-icons/hi2";
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

const ScrollableList = styled.ul`
  max-height: 25rem;
  overflow-y: auto;
`;

const Item = styled.li<{ $active: boolean; $hasWarning?: boolean }>`
  padding: 0.8rem 1.2rem;
  font-size: 1.35rem;
  color: ${({ $hasWarning }) => $hasWarning ? "var(--color-red-700)" : "var(--color-grey-900)"};
  cursor: pointer;
  background-color: ${({ $active, $hasWarning }) => $active ? ($hasWarning ? "var(--color-red-50)" : "var(--color-grey-100)") : "transparent"};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: ${({ $active, $hasWarning }) => $active && $hasWarning ? "1px solid var(--color-red-400)" : "1px solid transparent"};
  border-radius: var(--border-radius-sm);
  margin: 0.2rem 0.4rem;

  &:hover {
    background-color: ${({ $hasWarning }) => $hasWarning ? "var(--color-red-100)" : "var(--color-brand-50)"};
    color: ${({ $hasWarning }) => $hasWarning ? "var(--color-red-800)" : "var(--color-brand-700)"};
  }
`;

const HeaderActions = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.8rem 1.2rem;
  background: var(--color-grey-50);
  border-bottom: 1px solid var(--color-grey-200);
`;

const ActionBtn = styled.button`
  background: none;
  border: none;
  color: var(--color-brand-600);
  font-size: 1.2rem;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

type Option = {
    value: string;
    label: string;
    hasWarning?: boolean;
    warningMessage?: string;
};

interface MultiSelectMenuProps {
    options: Option[];
    values: string[];
    onChange: (values: string[]) => void;
    width?: string;
    placeholder?: string;
}

export default function MultiSelectMenu({ options, values, onChange, width = "18rem", placeholder = "Sélectionner..." }: MultiSelectMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const ref = useOutSideClick<HTMLDivElement>(() => setIsOpen(false));

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    function toggleOption(val: string) {
        if (values.includes(val)) {
            onChange(values.filter(v => v !== val));
        } else {
            onChange([...values, val]);
        }
    }

    function selectAll() {
        const visibleValues = filteredOptions.map(o => o.value);
        const newValues = Array.from(new Set([...values, ...visibleValues]));
        onChange(newValues);
    }

    function clearAll() {
        if (searchQuery) {
            const visibleSet = new Set(filteredOptions.map(o => o.value));
            onChange(values.filter(v => !visibleSet.has(v)));
        } else {
            onChange([]);
        }
    }

    return (
        <StyledSelectMenu ref={ref} style={{ width }}>
            <Toggle onClick={() => setIsOpen((open) => !open)} type="button">
                <span style={{ textAlign: "left", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {values.length === 0 ? placeholder : `${values.length} sélectionné(s)`}
                </span>
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
                    <HeaderActions>
                        <ActionBtn type="button" onClick={(e) => { e.stopPropagation(); selectAll(); }}>Tout</ActionBtn>
                        <ActionBtn type="button" onClick={(e) => { e.stopPropagation(); clearAll(); }}>Aucun</ActionBtn>
                    </HeaderActions>
                    <ScrollableList>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => {
                                const isSelected = values.includes(opt.value);
                                return (
                                    <Item
                                        key={opt.value}
                                        $active={isSelected}
                                        $hasWarning={opt.hasWarning}
                                        title={opt.hasWarning && isSelected ? opt.warningMessage : undefined}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleOption(opt.value);
                                        }}
                                    >
                                        <span>{opt.label}</span>
                                        {isSelected && opt.hasWarning ? (
                                            <HiOutlineQuestionMarkCircle size={20} color="var(--color-red-600)" />
                                        ) : isSelected ? (
                                            <HiCheck size={16} color="var(--color-brand-600)" />
                                        ) : null}
                                    </Item>
                                );
                            })
                        ) : (
                            <Item $active={false} style={{ color: 'var(--color-grey-400)', cursor: 'default' }}>Aucun résultat</Item>
                        )}
                    </ScrollableList>
                </List>
            )}
        </StyledSelectMenu>
    );
}
