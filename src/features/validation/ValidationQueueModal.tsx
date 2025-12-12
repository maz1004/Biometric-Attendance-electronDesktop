import styled from "styled-components";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { HiX, HiCheck, HiTrash } from "react-icons/hi";
import { getPendingValidations, approveValidation, rejectValidation, ManualValidationRequest } from "../../services/validation";
import { getUsers } from "../../services/users";
import Spinner from "../../ui/Spinner";
import toast from "react-hot-toast";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 2000;
`;

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--color-bg-elevated);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  width: 90%;
  max-width: 80rem;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  z-index: 2001;
`;

const Header = styled.div`
  padding: 2.4rem;
  border-bottom: 1px solid var(--color-border-card);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 0.4rem;
  cursor: pointer;
  
  & svg {
    width: 2.4rem;
    height: 2.4rem;
    color: var(--color-grey-500);
  }
`;

const Content = styled.div`
  padding: 2.4rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
`;

const RequestCard = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 2.4rem;
  padding: 1.6rem;
  border: 1px solid var(--color-border-card);
  border-radius: var(--border-radius-md);
  background-color: var(--color-bg-main);
`;

const ImageContainer = styled.div`
  width: 150px;
  height: 150px;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  background-color: var(--color-grey-100);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const InfoColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const InfoRow = styled.div`
  display: flex;
  gap: 0.8rem;
  align-items: center;
  font-size: 1.4rem;
`;

const Label = styled.span`
  font-weight: 600;
  color: var(--color-grey-600);
`;

const Value = styled.span`
  color: var(--color-grey-900);
`;

const Select = styled.select`
  padding: 0.8rem;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-bg-elevated);
  width: 100%;
  max-width: 300px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1.2rem;
  margin-top: auto;
`;

const Button = styled.button<{ $variant: "approve" | "reject" }>`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 1.6rem;
  border: none;
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  cursor: pointer;
  color: white;
  background-color: ${p => p.$variant === "approve" ? "var(--color-green-600)" : "var(--color-red-600)"};

  &:hover {
    background-color: ${p => p.$variant === "approve" ? "var(--color-green-700)" : "var(--color-red-700)"};
  }
`;

function ValidationItem({
    request,
    users,
    onApprove,
    onReject
}: {
    request: ManualValidationRequest;
    users: any[];
    onApprove: (id: string, userId: string) => void;
    onReject: (id: string) => void;
}) {
    const [selectedUser, setSelectedUser] = useState(request.user_id || "");

    const identifiedUser = users.find(u => u.id === request.user_id);

    return (
        <RequestCard>
            <ImageContainer>
                <img src={`data:image/jpeg;base64,${request.captured_image}`} alt="Captured" />
            </ImageContainer>

            <InfoColumn>
                <InfoRow>
                    <Label>Date:</Label>
                    <Value>{new Date(request.submission_timestamp).toLocaleString()}</Value>
                </InfoRow>
                <InfoRow>
                    <Label>Appareil:</Label>
                    <Value>{request.device_info.name}</Value>
                </InfoRow>
                <InfoRow>
                    <Label>IA Confiance:</Label>
                    <Value>{(request.similarity_score * 100).toFixed(1)}%</Value>
                </InfoRow>
                <InfoRow>
                    <Label>Identifié comme:</Label>
                    <Value>{identifiedUser ? `${identifiedUser.first_name} ${identifiedUser.last_name}` : "Non identifié"}</Value>
                </InfoRow>

                <div style={{ marginTop: "1.2rem" }}>
                    <Label style={{ display: "block", marginBottom: "0.4rem" }}>Assigner à l'employé:</Label>
                    <Select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                    >
                        <option value="">Sélectionner un employé...</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.first_name} {user.last_name}
                            </option>
                        ))}
                    </Select>
                </div>

                <ActionButtons>
                    <Button $variant="approve" onClick={() => onApprove(request.id, selectedUser)} disabled={!selectedUser}>
                        <HiCheck /> Valider
                    </Button>
                    <Button $variant="reject" onClick={() => onReject(request.id)}>
                        <HiTrash /> Rejeter
                    </Button>
                </ActionButtons>
            </InfoColumn>
        </RequestCard>
    );
}

export default function ValidationQueueModal({ onClose }: { onClose: () => void }) {
    const queryClient = useQueryClient();

    const { data: requests, isLoading: isLoadingRequests } = useQuery({
        queryKey: ["pendingValidations"],
        queryFn: getPendingValidations,
    });

    const { data: usersData, isLoading: isLoadingUsers } = useQuery({
        queryKey: ["users"],
        queryFn: () => getUsers({ limit: 1000 }), // Fetch all users for dropdown
    });

    const users = usersData?.users || [];

    const approveMutation = useMutation({
        mutationFn: ({ id, userId }: { id: string; userId: string }) =>
            approveValidation(id, "current-admin-uuid", userId),
        onSuccess: () => {
            toast.success("Validation approuvée");
            queryClient.invalidateQueries({ queryKey: ["pendingValidations"] });
            queryClient.invalidateQueries({ queryKey: ["validationCount"] });
        },
        onError: () => toast.error("Erreur lors de la validation"),
    });

    const rejectMutation = useMutation({
        mutationFn: (id: string) => rejectValidation(id, "current-admin-uuid", "Rejeté manuellement"),
        onSuccess: () => {
            toast.success("Validation rejetée");
            queryClient.invalidateQueries({ queryKey: ["pendingValidations"] });
            queryClient.invalidateQueries({ queryKey: ["validationCount"] });
        },
        onError: () => toast.error("Erreur lors du rejet"),
    });

    if (isLoadingRequests || isLoadingUsers) return <Spinner />;

    return (
        <Overlay>
            <Modal>
                <Header>
                    <Title>File d'attente de validation ({requests?.length || 0})</Title>
                    <CloseButton onClick={onClose}>
                        <HiX />
                    </CloseButton>
                </Header>

                <Content>
                    {requests?.length === 0 ? (
                        <p>Aucune demande en attente.</p>
                    ) : (
                        requests?.map(req => (
                            <ValidationItem
                                key={req.id}
                                request={req}
                                users={users}
                                onApprove={(id, userId) => approveMutation.mutate({ id, userId })}
                                onReject={(id) => rejectMutation.mutate(id)}
                            />
                        ))
                    )}
                </Content>
            </Modal>
        </Overlay>
    );
}
