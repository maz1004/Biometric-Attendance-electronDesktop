import { useState } from "react";
import styled from "styled-components";
import Button from "../../ui/Button";
import { Employee } from "./EmployeeTypes";
import AutoCaptureFaceOnly from "./AutoCaptureFaceOnly";

const ModalContent = styled.div`
  width: min(90vw, 480px);
  max-height: 90vh;
  overflow-y: auto;

  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);

  display: grid;
  gap: 1.6rem;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.2rem;
`;

const Avatar = styled.img`
  width: 4.8rem;
  height: 4.8rem;
  border-radius: 50%;
  object-fit: cover;
  background-color: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--color-toolbar-input-border);
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.2;
`;

const Name = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-text-strong);
`;

const Meta = styled.div`
  font-size: 1.2rem;
  color: var(--color-text-dim);
  font-weight: 400;
`;

const Body = styled.div`
  display: grid;
  gap: 1.2rem;
`;

const Note = styled.div`
  font-size: 1.2rem;
  line-height: 1.4;
  color: var(--color-text-dim);
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.8rem;
`;

export type EnrollFaceModalProps = {
  employee: Employee;
  onCloseModal: () => void;
  onEnrollConfirm: (args: { employeeId: string; imageBase64: string }) => void;
};

export default function EnrollFaceModal({
  employee,
  onCloseModal,
  onEnrollConfirm,
}: EnrollFaceModalProps): JSX.Element {
  // when AutoCaptureFaceOnly succeeds, we store the captured frame here
  const [snap, setSnap] = useState<string>("");

  return (
    <ModalContent>
      {/* Header: employee identity */}
      <Header>
        <Avatar src={employee.avatar} alt={employee.firstName} />
        <TitleBlock>
          <Name>
            Enroll {employee.firstName} {employee.lastName}
          </Name>
          <Meta>
            {employee.id} • {employee.department} •{" "}
            {employee.role === "manager" ? "Manager" : "Employee"}
          </Meta>
        </TitleBlock>
      </Header>

      {/* Body: camera + instructions */}
      <Body>
        <AutoCaptureFaceOnly
          onAutoCapture={(imgBase64) => {
            // imgBase64 is a data URL "data:image/jpeg;base64,..."
            setSnap(imgBase64);
          }}
        />

        <Note>
          We’ll automatically capture when we detect exactly one face, centered
          and stable. Keep your face clearly visible, no mask, good lighting.
        </Note>
      </Body>

      {/* Footer: actions */}
      <Footer>
        <Button
          variation="secondary"
          size="small"
          type="button"
          onClick={onCloseModal}
        >
          Cancel
        </Button>

        <Button
          variation="primary"
          size="small"
          type="button"
          disabled={!snap}
          onClick={() => {
            if (!snap) return;
            onEnrollConfirm({
              employeeId: employee.id,
              imageBase64: snap,
            });
            onCloseModal();
          }}
        >
          Save enrollment
        </Button>
      </Footer>
    </ModalContent>
  );
}
