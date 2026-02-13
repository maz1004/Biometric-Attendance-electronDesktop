import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { HiUserAdd, HiCalendar, HiClipboardList } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

const StyledQuickActions = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 2.4rem;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
`;

const Title = styled.h3`
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--color-grey-800);
  margin-bottom: 0.8rem;
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.2rem;
`;

const ActionCard = styled.button`
  background: linear-gradient(135deg, #4F9CF9 0%, #3B82F6 100%);
  border: none;
  border-radius: var(--border-radius-md);
  padding: 2rem 1.6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(79, 156, 249, 0.2);

  &:hover {
    background: linear-gradient(135deg, #5BA4FA 0%, #4F9CF9 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(79, 156, 249, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 3.2rem;
    height: 3.2rem;
    color: white;
  }

  span {
    color: white;
    font-size: 1.4rem;
    font-weight: 500;
    text-align: center;
  }
`;

function QuickActions() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <StyledQuickActions>
      <Title>⚡ {t("dashboard.quick_actions.title")}</Title>
      <ActionButtons>
        <ActionCard onClick={() => navigate("/employees")}>
          <HiUserAdd />
          <span>{t("dashboard.quick_actions.add_employee")}</span>
        </ActionCard>
        <ActionCard onClick={() => navigate("/planning")}>
          <HiCalendar />
          <span>{t("dashboard.quick_actions.view_planning")}</span>
        </ActionCard>
        <ActionCard onClick={() => navigate("/attendance")}>
          <HiClipboardList />
          <span>{t("dashboard.quick_actions.todays_attendance")}</span>
        </ActionCard>
      </ActionButtons>
    </StyledQuickActions>
  );
}

export default QuickActions;
