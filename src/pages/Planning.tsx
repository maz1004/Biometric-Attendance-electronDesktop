import styled from "styled-components";
import PlanningLayout from "../features/planning/layouts/PlanningLayout";

const PageContainer = styled.div`
  height: calc(100vh - 4rem); /* Header offset */
  padding: 1rem;
  background: var(--color-bg-app);
`;

export default function Planning() {
  return (
    <PageContainer>
      <PlanningLayout />
    </PageContainer>
  );
}
