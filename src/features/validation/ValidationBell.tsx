import { useState } from "react";
import styled from "styled-components";
import { HiBell } from "react-icons/hi2";
import { useQuery } from "@tanstack/react-query";
import { getValidationCount } from "../../services/validation";
import ValidationQueueModal from "./ValidationQueueModal";

const BellContainer = styled.div`
  position: relative;
  cursor: pointer;
  padding: 0.8rem;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--color-grey-100);
  }

  & svg {
    width: 2.4rem;
    height: 2.4rem;
    color: var(--color-grey-600);
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  background-color: var(--color-red-500);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  border: 2px solid var(--color-bg-main);
`;

export default function ValidationBell() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: count = 0 } = useQuery({
    queryKey: ["validationCount"],
    queryFn: getValidationCount,
    refetchInterval: 30000, // Poll every 30s
  });

  return (
    <>
      <BellContainer onClick={() => setIsOpen(true)}>
        <HiBell />
        {count > 0 && <Badge>{count}</Badge>}
      </BellContainer>

      {isOpen && <ValidationQueueModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
