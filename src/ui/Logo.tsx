import styled, { keyframes, css } from "styled-components";
import { useDarkMode } from "../context/DarkModeContext";

const moveUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(3rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const StyledLogo = styled.div<{ type?: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;

  ${(props) =>
    props.type === "login" &&
    css`
      animation: ${moveUp} 0.8s ease-out;
    `}
`;

const Img = styled.img<{ type?: string }>`
  height: ${(props) => (props.type === "login" ? "20rem" : "12rem")};
  width: auto;
`;

const PxText = styled.span<{ type?: string }>`
  font-size: ${(props) => (props.type === "login" ? "2.4rem" : "1.6rem")};
  font-weight: 700;
  line-height: 1;
  margin-top: ${(props) => (props.type === "login" ? "-1.8rem" : "-1.2rem")};
  color: var(--color-grey-900);
  text-transform: uppercase;
  letter-spacing: 1px;
`;

interface LogoProps {
  type?: "login";
}

function Logo({ type }: LogoProps) {
  const { isDarkMode } = useDarkMode();
  const src = `${isDarkMode ? "/logo-dark.png" : "/logo-light.png"}`;
  return (
    <StyledLogo type={type}>
      <Img src={src} alt="Logo" type={type} />
      <PxText type={type}>PX</PxText>
    </StyledLogo>
  );
}

export default Logo;
