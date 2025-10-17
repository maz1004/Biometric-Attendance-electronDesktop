import React from "react";
import styled from "styled-components";

const StyledSelect = styled.select<{ $variant?: "white" | "default" }>`
  font-size: 1.4rem;
  padding: 0.8rem 1.2rem;
  border: 1px solid
    ${(props) =>
      props.$variant === "white"
        ? "var(--color-grey-100)"
        : "var(--color-grey-300)"};
  border-radius: var(--border-radius-sm);
  background-color: var(--color-grey-0);
  font-weight: 500;
`;
export type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: SelectOption[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  variant?: "white" | "default";
};

function Select({ options, value, onChange, variant, ...props }: SelectProps) {
  return (
    <StyledSelect $variant={variant} value={value} onChange={onChange} {...props}>
      {options.map((option) => (
        <option value={option.value} key={option.value}>
          {option.label}
        </option>
      ))}
    </StyledSelect>
  );
}

export default Select;
