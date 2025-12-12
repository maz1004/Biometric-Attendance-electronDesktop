import styled from "styled-components";
import { Employee } from "./EmployeeTypes";
import Heading from "../../ui/Heading";
import { HiOutlineBriefcase, HiOutlineUserCircle } from "react-icons/hi";

const StyledProfile = styled.div`
  display: grid;
  grid-template-columns: 20rem 1fr;
  gap: 3.2rem;
  padding: 2.4rem 0;
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.6rem;
`;

const Avatar = styled.img`
  width: 16rem;
  height: 16rem;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--color-brand-100);
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  font-size: 1.6rem;
  color: var(--color-grey-600);

  & svg {
    width: 2.4rem;
    height: 2.4rem;
    color: var(--color-brand-600);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.6rem;
  margin-top: 2.4rem;
  padding-top: 2.4rem;
  border-top: 1px solid var(--color-grey-200);
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  padding: 1.6rem;
  background-color: var(--color-grey-50);
  border-radius: var(--border-radius-md);
`;

const StatValue = styled.span`
  font-size: 2.4rem;
  font-weight: 700;
  color: var(--color-brand-600);
`;

const StatLabel = styled.span`
  font-size: 1.2rem;
  text-transform: uppercase;
  color: var(--color-grey-500);
  font-weight: 600;
`;

type EmployeeProfileModalProps = {
    employee: Employee;
    onClose?: () => void;
};

function EmployeeProfileModal({ employee }: EmployeeProfileModalProps) {
    const { firstName, lastName, department, role, avatar, stats } = employee;

    return (
        <div style={{ minWidth: "60rem" }}>
            <Heading as="h2">Profil Employé</Heading>
            <StyledProfile>
                <AvatarSection>
                    <Avatar
                        src={avatar || "/default-user.jpg"}
                        alt={`${firstName} ${lastName}`}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "/default-user.jpg";
                        }}
                    />
                    <Heading as="h3">{`${firstName} ${lastName}`}</Heading>
                </AvatarSection>

                <InfoSection>
                    <InfoRow>
                        <HiOutlineBriefcase />
                        <span>
                            {department} - {role}
                        </span>
                    </InfoRow>
                    <InfoRow>
                        <HiOutlineUserCircle />
                        <span>{employee.status === "active" ? "Actif" : "Inactif"}</span>
                    </InfoRow>

                    <StatsGrid>
                        <StatItem>
                            <StatValue>{stats?.presenceRatePct ?? 0}%</StatValue>
                            <StatLabel>Présence</StatLabel>
                        </StatItem>
                        <StatItem>
                            <StatValue>{stats?.lateCount30d ?? 0}</StatValue>
                            <StatLabel>Retards (30j)</StatLabel>
                        </StatItem>
                        <StatItem>
                            <StatValue>{stats?.absenceCount30d ?? 0}</StatValue>
                            <StatLabel>Absences (30j)</StatLabel>
                        </StatItem>
                    </StatsGrid>
                </InfoSection>
            </StyledProfile>
        </div>
    );
}

export default EmployeeProfileModal;
