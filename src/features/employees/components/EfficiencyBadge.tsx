import styled, { keyframes, css } from "styled-components";

const pulseRed = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
`;

const pulseOrange = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(249, 115, 22, 0); }
  100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
`;

const pulseGreen = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
`;

const BadgeContainer = styled.div<{ $score: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem 0.8rem;
  border-radius: 9999px;
  font-weight: 700;
  font-size: 1.2rem;
  color: white;
  min-width: 4rem;
  
  ${(p) => {
        if (p.$score < 50) {
            return css`
        background-color: #ef4444;
        animation: ${pulseRed} 2s infinite;
      `;
        } else if (p.$score < 75) {
            return css`
        background-color: #f97316;
        animation: ${pulseOrange} 2s infinite;
      `;
        } else {
            return css`
        background-color: #22c55e;
        animation: ${pulseGreen} 2s infinite;
      `;
        }
    }}
`;

type EfficiencyBadgeProps = {
    score: number;
};

export default function EfficiencyBadge({ score }: EfficiencyBadgeProps) {
    // Ensure score is valid
    const displayScore = Math.min(100, Math.max(0, Math.round(score)));

    return (
        <BadgeContainer $score={displayScore}>
            {displayScore}
        </BadgeContainer>
    );
}
