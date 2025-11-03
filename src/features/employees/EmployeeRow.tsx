// src/features/employees/EmployeeRow.tsx
import styled from "styled-components";
import Table from "../../ui/Table";
import Modal from "../../ui/Modal";
import Menus from "../../ui/Menus";
import ConfirmDelete from "../../ui/ConfirmDelete";
import { HiPencil, HiTrash, HiUserPlus } from "react-icons/hi2";
import { Employee } from "./EmployeeTypes";
import CreateEmployeeForm from "./CreateEmployeeForm";
import EnrollFaceModal from "./EnrollFaceModal";

const AvatarImg = styled.img`
  display: block;
  width: 4.8rem;
  height: 4.8rem;
  border-radius: 50%;
  object-fit: cover;
  object-position: center;
  background-color: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--color-toolbar-input-border);
`;

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

type EmployeeRowProps = {
  employee: Employee;
};

function EmployeeRow({ employee }: EmployeeRowProps): JSX.Element {
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

  const presence = stats.presenceRatePct;
  const late = stats.lateCount30d;
  const absent = stats.absenceCount30d;

  return (
    <Table.Row>
      <AvatarImg src={avatar} alt={`${firstName} ${lastName}`} />

      <NameBlock>
        <div className="empName">
          {firstName} {lastName}
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
          {role === "manager" ? "Manager" : "Employee"}
        </span>
      </DeptRoleBlock>

      <div>
        {enrolled ? (
          <Badge $type="success">Enrolled</Badge>
        ) : (
          <Badge $type="danger">Not Enrolled</Badge>
        )}
      </div>

      <div>
        {status === "active" ? (
          <Badge $type="success">Active</Badge>
        ) : (
          <Badge $type="muted">Inactive</Badge>
        )}
      </div>

      <StatsGrid>
        <div>
          <strong>{presence}%</strong> presence
        </div>
        <div>
          <strong>{late}</strong> late
        </div>
        <div>
          <strong>{absent}</strong> absent
        </div>
      </StatsGrid>

      <div>
        <Modal>
          <Menus>
            <Menus.Menu>
              <Menus.Toggle id={id} />

              <Menus.List id={id}>
                {!enrolled && (
                  <Modal.Open opens="enroll-face">
                    <Menus.Button icon={<HiUserPlus />}>
                      Enroll face
                    </Menus.Button>
                  </Modal.Open>
                )}

                <Modal.Open opens="edit-employee">
                  <Menus.Button icon={<HiPencil />}>Edit</Menus.Button>
                </Modal.Open>

                <Modal.Open opens="delete-employee">
                  <Menus.Button icon={<HiTrash />}>Delete</Menus.Button>
                </Modal.Open>
              </Menus.List>
            </Menus.Menu>

            <Modal.Window name="edit-employee">
              <CreateEmployeeForm employeeToEdit={employee} />
            </Modal.Window>

            <Modal.Window name="delete-employee">
              <ConfirmDelete
                onCloseModal={() => {}}
                resourceName="employee"
                disabled={false}
                onConfirm={() => {
                  console.log("Delete employee", id);
                }}
              />
            </Modal.Window>

            {/* ENROLL FACE */}
            <Modal.Window name="enroll-face">
              <EnrollFaceModal
                employee={employee}
                onCloseModal={() => {
                  // Modal.Window injects onCloseModal automatically if you
                  // coded it that way. But we also pass a fallback noop
                }}
                onEnrollConfirm={({ employeeId, imageBase64 }) => {
                  console.log("EnrollConfirm →", {
                    employeeId,
                    imageBase64: imageBase64.slice(0, 50) + "...",
                  });
                }}
              />
            </Modal.Window>
          </Menus>
        </Modal>
      </div>
    </Table.Row>
  );
}

export default EmployeeRow;
