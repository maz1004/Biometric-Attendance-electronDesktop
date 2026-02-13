import styled from "styled-components";

const StyledSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 4.8rem;
  height: 2.8rem;
`;

const Input = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: var(--color-brand-600);
  }

  &:focus + span {
    box-shadow: 0 0 1px var(--color-brand-600);
  }

  &:checked + span:before {
    transform: translateX(2rem);
  }

  &:disabled + span {
    background-color: var(--color-grey-200);
    cursor: not-allowed;
  }
`;

const Slider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-grey-300);
  transition: .4s;
  border-radius: 34px;

  &:before {
    position: absolute;
    content: "";
    height: 2rem;
    width: 2rem;
    left: 0.4rem;
    bottom: 0.4rem;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }
`;

type SwitchProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    id?: string;
};

function Switch({ checked, onChange, disabled, id }: SwitchProps) {
    return (
        <StyledSwitch htmlFor={id}>
            <Input
                type="checkbox"
                id={id}
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
            />
            <Slider />
        </StyledSwitch>
    );
}

export default Switch;
