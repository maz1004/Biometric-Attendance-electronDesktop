import React, { useEffect, useState } from "react";
import styled, { keyframes, css } from "styled-components";
import { HiDocumentText } from "react-icons/hi2";

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(10px) translateX(-50%); }
  to { opacity: 1; transform: translateY(0) translateX(-50%); }
`;

// "Suction" animation (reverse of slide/scale)
const suckUp = keyframes`
   0% { opacity: 1; transform: translateY(0) translateX(-50%) scale(1); }
   100% { opacity: 0; transform: translateY(-20px) translateX(-50%) scale(0.8); }
`;

const PopoverContainer = styled.div<{ $exiting: boolean }>`
  position: absolute;
  /* Centered relative to the nearest positioned ancestor (Card) */
  bottom: -10px; /* Adjust based on card height, making it overlap slightly or push down */
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  
  background-color: var(--color-grey-800);
  color: var(--color-grey-100);
  padding: 1.2rem;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  width: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  pointer-events: auto; /* Allow hovering the popover itself */

  ${props => !props.$exiting && css`
      animation: ${slideUp} 0.3s ease-out forwards;
  `}

  ${props => props.$exiting && css`
      animation: ${suckUp} 0.3s ease-in forwards;
  `}

  /* Arrow */
  &::before {
    content: "";
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid var(--color-grey-800);
  }
`;

const MiniDoc = styled.div`
  background: white;
  width: 60px;
  height: 85px;
  border-radius: 2px;
  position: relative;
  opacity: 0.9;
`;

const DocLine = styled.div<{ width: string; top: string }>`
  position: absolute;
  left: 10%;
  height: 2px;
  background: #ccc;
  width: ${props => props.width};
  top: ${props => props.top};
`;

interface HoverPreviewProps {
    title: string;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

export const HoverPreviewPopover: React.FC<HoverPreviewProps> = ({ title, onMouseEnter, onMouseLeave }) => {
    // We handle the "exiting" state in the parent mostly, 
    // but here we render content.
    // Actually, the parent controls rendering, so we just need to style it.
    // The parent (QuickReportCard) will toggle the 'exiting' prop on the wrapper usually,
    // or we mount/unmount. 
    // If we unmount, we can't play exit animation easily without a Transition group or logic.
    // Simplified approach: Parent passes `isExiting`.

    return (
        <PopoverContainer $exiting={false} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            <MiniDoc>
                <div style={{ background: 'var(--color-brand-500)', height: '10px', width: '100%', opacity: 0.5 }}></div>
                <DocLine width="60%" top="20px" />
                <DocLine width="80%" top="28px" />
                <DocLine width="80%" top="36px" />
                <DocLine width="50%" top="44px" />
            </MiniDoc>
            <span style={{ fontSize: '1rem', fontWeight: 600 }}>{title}</span>
        </PopoverContainer>
    );
};
