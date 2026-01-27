import styled from "styled-components";
import { Employee } from "./EmployeeTypes";
import Heading from "../../ui/Heading";
import Button from "../../ui/Button";
import { HiOutlineBriefcase, HiOutlineUserCircle, HiDocumentText } from "react-icons/hi2";
import { useUserUpload } from "../../hooks/useUserUpload";
import { useRef } from "react";
import EfficiencyBadge from "./components/EfficiencyBadge";
import AvatarUploader from "./components/AvatarUploader";
import { EmployeeExportButton } from "./components/EmployeeExportButton";

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

const ActionButtons = styled.div`
  display: flex;
  gap: 1.2rem;
  margin-top: 1.2rem;
`;

type EmployeeProfileModalProps = {
  employee: Employee;
  onClose?: () => void;
};

function EmployeeProfileModal({ employee }: EmployeeProfileModalProps) {
  const { firstName, lastName, department, role, avatar, stats, id } = employee;
  const { uploadPhoto, uploadCV, uploading } = useUserUpload();
  const cvInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (file: File | null) => {
    if (file) {
      uploadPhoto(id, file);
    }
  };

  const handleCVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      uploadCV(id, e.target.files[0]);
    }
  };

  return (
    <div style={{ minWidth: "60rem" }}>
      <Heading as="h2">Profil Employé</Heading>

      <StyledProfile>
        <AvatarSection>
          <AvatarUploader
            defaultImage={avatar}
            onImageChanged={handleAvatarChange}
            disabled={uploading}
          />
          <Heading as="h3">{`${firstName} ${lastName}`}</Heading>
          <EfficiencyBadge score={stats?.efficiencyScore ?? 0} />
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

          <ActionButtons>
            <Button
              variation="secondary"
              size="small"
              onClick={() => cvInputRef.current?.click()}
              disabled={uploading}
            >
              <HiDocumentText /> Upload CV
            </Button>
            <input
              type="file"
              ref={cvInputRef}
              style={{ display: 'none' }}
              accept=".pdf,.doc,.docx"
              onChange={handleCVChange}
            />
            <EmployeeExportButton employeeId={employee.id} />
          </ActionButtons>

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
