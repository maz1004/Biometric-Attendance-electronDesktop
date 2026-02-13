import styled from "styled-components";
import Table from "../../ui/Table";
import Modal from "../../ui/Modal";
import Menus from "../../ui/Menus";
import ConfirmDelete from "../../ui/ConfirmDelete";
import SecureImage from "../../ui/SecureImage";
import { HiPencil, HiTrash, HiUserPlus } from "react-icons/hi2";
import { Employee } from "./EmployeeTypes";
import CreateEmployeeForm from "./CreateEmployeeForm";
import EnrollFaceModal from "./EnrollFaceModal";
import EfficiencyBadge from "./components/EfficiencyBadge";
import UserDetailView from "./UserDetailView";
import AbsenceHistoryView from "./AbsenceHistoryView";
import { useDeleteEmployee, useEnrollFace } from "./useEmployees";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const NameBlock = styled.div`
  font-size: 1.4rem;
  line-height: 1.3;
  color: var(--color-text-dim);

  & .empName {
    font-weight: 600;
    color: var(--color-text-strong);
  }

  & .empId {
    font-size: 1.2rem;
    color: var(--color-text-dim);
    font-weight: 500;
  }
`;

const DeptRoleBlock = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.3;

  & .dept {
    font-size: 1.3rem;
    font-weight: 500;
    color: var(--color-text-strong);
  }

  & .role {
    font-size: 1.2rem;
    font-weight: 500;
    color: var(--color-text-dim);
  }
`;

const Badge = styled.span<{ $type?: "success" | "danger" | "muted" }>`
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: var(--border-radius-sm);
  font-size: 1.2rem;
  font-weight: 500;
  line-height: 1.2;
  text-transform: capitalize;

  ${({ $type }) => {
    if ($type === "success")
      return `
        background-color: var(--color-green-100);
        color: var(--color-green-700);
        border: 1px solid var(--color-green-300);
      `;
    if ($type === "danger")
      return `
        background-color: var(--color-red-100);
        color: var(--color-red-700);
        border: 1px solid var(--color-red-300);
      `;
    return `
        background-color: var(--color-grey-100);
        color: var(--color-grey-700);
        border: 1px solid var(--color-grey-300);
      `;
  }}
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, auto);
  gap: 0.8rem 1.2rem;
  font-size: 1.2rem;
  line-height: 1.2;
  color: var(--color-text-dim);

  & strong {
    font-weight: 600;
    color: var(--color-text-strong);
  }
`;

const AvatarImg = styled(SecureImage)`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-grey-200);
`;

const StyledTableRow = styled(Table.Row)`
  &:hover {
    background-color: var(--color-grey-100);
  }
`;

type EmployeeRowProps = {
  employee: Employee;
};

function EmployeeRow({ employee }: EmployeeRowProps): JSX.Element {
  const { deleteEmployee, isDeleting } = useDeleteEmployee();
  const { enrollFace, isEnrolling } = useEnrollFace();
  const { t } = useTranslation();

  const {
    id,
    firstName,
    lastName,
    department,
    role,
    enrolled,
    status,
    createdAt,
    stats,
    avatar,
  } = employee;

  const presence = stats?.presenceRatePct ?? 0;
  const late = stats?.lateCount30d ?? 0;
  const absent = stats?.absenceCount30d ?? 0;
  const efficiency = stats?.efficiencyScore ?? 0;

  // Use employee reference to trigger cache bust on invalidation
  const avatarSrc = useMemo(() => {
    if (!avatar) return null;
    return `${avatar}?t=${Date.now()}`;
  }, [employee, avatar]);

  return (
    <Modal>
      {/* We wrap the Row in Modal.Open to make it clickable */}
      <Modal.Open opens="view-detail-modal">
        <StyledTableRow role="button" style={{ cursor: "pointer" }}>
          <AvatarImg src={avatarSrc || "/default-user.jpg"} alt={`${firstName} ${lastName}`} />

          <NameBlock>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div className="empName">
                {firstName} {lastName}
              </div>
              <EfficiencyBadge score={efficiency} />
            </div>
            <div className="empId">{id}</div>
            <div
              style={{
                fontSize: "1.1rem",
                color: "var(--color-text-dim)",
              }}
            >
              {new Date(createdAt).toLocaleDateString("en-GB", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          </NameBlock>

          <DeptRoleBlock>
            <span className="dept">{department}</span>
            <span className="role">
              {role === "manager" ? t("employees.role.manager") : t("employees.role.employee")}
            </span>
          </DeptRoleBlock>

          <div>
            {enrolled ? (
              <Badge $type="success">{t("employees.status.enrolled")}</Badge>
            ) : (
              <Badge $type="danger">{t("employees.status.not_enrolled")}</Badge>
            )}
          </div>

          <div>
            {status === "active" ? (
              <Badge $type="success">{t("employees.status.active")}</Badge>
            ) : (
              <Badge $type="muted">{t("employees.status.inactive")}</Badge>
            )}
          </div>

          <StatsGrid>
            <div>
              <strong>{presence}%</strong> {t("employees.stats.presence")}
            </div>
            <div>
              <strong>{late}</strong> {t("employees.stats.late")}
            </div>
            <div>
              <strong>{absent}</strong> {t("employees.stats.absent")}
            </div>
          </StatsGrid>

          {/* Action Menu - prevent propagation to avoid opening Detail View */}
          <div onClick={(e) => e.stopPropagation()}>
            <Menus.Menu>
              <Menus.Toggle id={id} />

              <Menus.List id={id}>
                {!enrolled && (
                  <Modal.Open opens="enroll-face-modal">
                    <Menus.Button icon={<HiUserPlus />}>
                      {t("employees.actions.enroll_face")}
                    </Menus.Button>
                  </Modal.Open>
                )}

                <Modal.Open opens="edit-employee">
                  <Menus.Button icon={<HiPencil />}>{t("employees.actions.edit")}</Menus.Button>
                </Modal.Open>

                <Modal.Open opens="delete-employee-modal">
                  <Menus.Button icon={<HiTrash />}>{t("employees.actions.delete")}</Menus.Button>
                </Modal.Open>
              </Menus.List>
            </Menus.Menu>
          </div>
        </StyledTableRow>
      </Modal.Open>

      <Modal.Window name="edit-employee">
        <CreateEmployeeForm employeeToEdit={employee} />
      </Modal.Window>

      <Modal.Window name="enroll-face-modal">
        <EnrollFaceModal
          employee={employee}
          onCloseModal={() => { }}
          onEnrollConfirm={({ employeeId, imageBase64 }) => {
            enrollFace({ id: employeeId, template: imageBase64 });
          }}
        />
      </Modal.Window>

      <Modal.Window name="view-detail-modal">
        <UserDetailView employee={employee} />
      </Modal.Window>

      <Modal.Window name="absences-history-modal">
        <AbsenceHistoryView employee={employee} />
      </Modal.Window>

      <Modal.Window name="delete-employee-modal">
        <ConfirmDelete
          resourceName="employee"
          disabled={isDeleting}
          onConfirm={() => deleteEmployee(id)}
          onCloseModal={() => { }} // Modal handles this
        />
      </Modal.Window>
    </Modal>
  );
}

export default EmployeeRow;
