// AppLayout.jsx
import { Outlet } from "react-router-dom";
import Header from "./Header";
import styled from "styled-components";
import SideBar from "./SideBar";

const HEADER_H = "6.4rem";

const StyledAppLayout = styled.div`
  display: grid;
  grid-template-columns: 26rem 1fr;
  grid-template-rows: ${HEADER_H} 1fr; /* header + content */
  height: 100dvh;
`;

const HeaderRow = styled(Header)`
  grid-column: 1 / -1; /* span both columns */
`;

const Main = styled.main`
  background-color: var(--color-grey-50);
  padding: 4.8rem 4% 6.4rem; /* fix 4%.8rem → 4.8rem */
  overflow: auto;
  min-height: 0; /* important for grid scrolling */
`;

const Container = styled.div`
  max-width: 120rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 3.2rem;
`;

export default function AppLayout() {
  return (
    <StyledAppLayout>
      <HeaderRow />
      <SideBar />
      <Main>
        <Container>
          <Outlet />
        </Container>
      </Main>
    </StyledAppLayout>
  );
}
