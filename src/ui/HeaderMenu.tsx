import styled from "styled-components";
import { HiOutlineUser, HiOutlineMoon, HiOutlineSun, HiArrowRightOnRectangle } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import Menus from "./Menus";
import UserAvatar from "../features/authentication/UserAvatar";
import { useDarkMode } from "../context/DarkModeContext";
import { useLogout } from "../features/authentication/useLogout";
import SpinnerMini from "./SpinnerMini";
import { useTranslation } from "react-i18next";

const StyledHeaderMenu = styled.ul`
  display: flex;
  gap: 0.4rem;
`;

function HeaderMenu() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { logout, isLoading } = useLogout();
  const { t } = useTranslation();

  return (
    <StyledHeaderMenu>
      <Menus>
        <Menus.Menu>
          <Menus.Toggle id="user-menu">
            <UserAvatar showName={false} />
          </Menus.Toggle>

          <Menus.List id="user-menu">
            <Menus.Button
              icon={<HiOutlineUser />}
              onClick={() => navigate("/account")}
            >
              {t("header.profile")}
            </Menus.Button>

            <Menus.Button
              icon={isDarkMode ? <HiOutlineSun /> : <HiOutlineMoon />}
              onClick={toggleDarkMode}
            >
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </Menus.Button>

            <Menus.Button
              icon={isLoading ? <SpinnerMini /> : <HiArrowRightOnRectangle />}
              onClick={() => logout()}
            >
              {t("header.logout")}
            </Menus.Button>
          </Menus.List>
        </Menus.Menu>
      </Menus>
    </StyledHeaderMenu>
  );
}

export default HeaderMenu;
