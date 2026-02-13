import styled from "styled-components";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";

const Container = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  
  &:hover span {
    visibility: visible;
    opacity: 1;
    transition-delay: 0.2s;
  }
`;

const IconWrapper = styled.div`
  color: var(--color-brand-600);
  cursor: help;
  display: flex;
  align-items: center;
  transition: color 0.3s;

  &:hover {
    color: var(--color-brand-700);
  }
  
  & svg {
    width: 2.2rem;
    height: 2.2rem;
  }
`;

const TooltipText = styled.span`
  visibility: hidden;
  width: 280px;
  background-color: var(--color-grey-800);
  color: var(--color-grey-0);
  text-align: center;
  border-radius: var(--border-radius-md);
  padding: 1rem;
  position: absolute;
  z-index: 100;
  bottom: 135%;
  left: 50%;
  margin-left: -140px;
  opacity: 0;
  transition: opacity 0.3s;
  
  /* Text Styles */
  font-size: 1.2rem;
  font-weight: 500;
  line-height: 1.4;
  box-shadow: var(--shadow-lg);

  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -6px;
    border-width: 6px;
    border-style: solid;
    border-color: var(--color-grey-800) transparent transparent transparent;
  }
`;

type TooltipProps = {
    text: string;
};

function Tooltip({ text }: TooltipProps) {
    return (
        <Container>
            <IconWrapper>
                <HiOutlineQuestionMarkCircle />
            </IconWrapper>
            <TooltipText>{text}</TooltipText>
        </Container>
    );
}

export default Tooltip;
