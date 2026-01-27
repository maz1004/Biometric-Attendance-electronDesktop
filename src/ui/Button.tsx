import styled, { css } from "styled-components";

const sizes = {
  small: css`
    font-size: 1.2rem;
    padding: 0.4rem 0.8rem;
    text-transform: uppercase;
    font-weight: 600;
    text-align: center;
  `,
  medium: css`
    font-size: 1.4rem;
    padding: 1.2rem 1.6rem;
    font-weight: 500;
  `,
  large: css`
    font-size: 1.6rem;
    padding: 1.2rem 2.4rem;
    font-weight: 500;
  `,
};

const variations = {
  primary: css`
    color: var(--color-brand-50);
    background-color: var(--color-brand-600);

    &:hover {
      background-color: var(--color-brand-700);
    }
  `,
  secondary: css`
    color: var(--color-grey-600);
    background: var(--color-grey-0);
    border: 1px solid var(--color-grey-200);

    &:hover {
      background-color: var(--color-grey-50);
    }
  `,
  danger: css`
    color: var(--color-red-100);
    background-color: var(--color-red-700);

    &:hover {
      background-color: var(--color-red-800);
    }
  `,
  requestChange: css`
    color: var(--color-amber-100);
    background-color: var(--color-amber-700);

    &:hover {
      background-color: var(--color-amber-800);
    }
  `,
};

type ButtonProps = {
  variation?: keyof typeof variations;
  size?: keyof typeof sizes;
};

const StyledButton = styled.button<{ $variation?: keyof typeof variations; $size?: keyof typeof sizes }>`
  border: none;
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-sm);
  
  /* Flex layout for generic button content */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;

  ${(props) => sizes[props.$size ?? "medium"]}
  ${(props) => variations[props.$variation ?? "primary"]}
`;

export default function Button({
  variation = "primary",
  size = "medium",
  ...props
}: React.ComponentProps<"button"> & ButtonProps) {
  return <StyledButton $variation={variation} $size={size} {...props} />;
}
