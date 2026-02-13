import React from "react";
import styled from "styled-components";

const StyledSelect = styled.select<{ $variant?: "white" | "default" }>`
  font-size: 1.4rem;
  padding: 0.8rem 1.2rem;
  border: 1px solid
    ${(props) =>
    props.$variant === "white"
      ? "var(--color-grey-100)"
      : "var(--color-toolbar-input-border)"};
  border-radius: var(--border-radius-sm);
  background-color: var(--color-toolbar-input-bg);
  color: var(--color-text-strong);
  font-weight: 500;
  box-shadow: var(--shadow-sm);

  /* Ensure options inherit the dark background in some browsers */
  & option {
    background-color: var(--color-toolbar-input-bg);
    color: var(--color-text-strong);
  }
`;
export type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: SelectOption[];
  variant?: "white" | "default";
};

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, value, onChange, variant, ...props }, ref) => {
    return (
      <StyledSelect
        ref={ref}
        $variant={variant}
        value={value}
        onChange={onChange}
        {...props}
      >
        {options.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </StyledSelect>
    );
  }
);

export default Select;
