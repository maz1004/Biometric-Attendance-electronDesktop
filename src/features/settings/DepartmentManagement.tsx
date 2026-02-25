import styled from "styled-components";
import { useDepartments, useCreateDepartment, useDeleteDepartment } from "../employees/useDepartments";
import Spinner from "../../ui/Spinner";
import Button from "../../ui/Button";
import { HiPlus, HiTrash } from "react-icons/hi2";
import { useState } from "react";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import Table from "../../ui/Table";
import ConfirmDelete from "../../ui/ConfirmDelete";
import Modal from "../../ui/Modal";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export default function DepartmentManagement() {
    const { departments, isLoading } = useDepartments();
    const { createDepartment, isCreating } = useCreateDepartment();
    const { deleteDepartment, isDeleting } = useDeleteDepartment();
    const [showAddForm, setShowAddForm] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");

    if (isLoading) return <Spinner />;

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName) return;
        createDepartment(
            { name: newName, description: newDesc },
            {
                onSuccess: () => {
                    setShowAddForm(false);
                    setNewName("");
                    setNewDesc("");
                },
            }
        );
    };

    return (
        <Container>
            <Header>
                <h2 style={{ fontSize: "1.8rem", fontWeight: 600 }}>Départements</h2>
                {!showAddForm && (
                    <Button size="small" onClick={() => setShowAddForm(true)}>
                        <HiPlus /> Nouveau Département
                    </Button>
                )}
            </Header>

            {showAddForm && (
                <Form type="regular" onSubmit={handleAdd}>
                    <FormRow label="Nom">
                        <Input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            disabled={isCreating}
                            required
                        />
                    </FormRow>
                    <FormRow label="Description">
                        <Input
                            type="text"
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            disabled={isCreating}
                        />
                    </FormRow>
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                        <Button variation="secondary" type="reset" onClick={() => setShowAddForm(false)}>
                            Annuler
                        </Button>
                        <Button disabled={isCreating}>Créer</Button>
                    </div>
                </Form>
            )}

            <Table columns="1.5fr 2fr 0.5fr">
                <Table.Header>
                    <div>Nom</div>
                    <div>Description</div>
                    <div></div>
                </Table.Header>
                <Table.Body
                    data={departments || []}
                    render={(dept) => (
                        <Table.Row key={dept.id}>
                            <div style={{ fontWeight: 600 }}>{dept.name}</div>
                            <div>{dept.description}</div>
                            <Modal>
                                <Modal.Open opens="delete-dept">
                                    <Button size="small" variation="danger">
                                        <HiTrash />
                                    </Button>
                                </Modal.Open>
                                <Modal.Window name="delete-dept">
                                    <ConfirmDelete
                                        resourceName={`département ${dept.name}`}
                                        onConfirm={() => deleteDepartment(dept.id)}
                                        onCloseModal={() => { }} // Sera injecté par Modal
                                        disabled={isDeleting}
                                    />
                                </Modal.Window>
                            </Modal>
                        </Table.Row>
                    )}
                />
            </Table>
        </Container>
    );
}
