import styled from "styled-components";
import { useDepartments, useCreateDepartment, useDeleteDepartment, useUpdateDepartment } from "../employees/useDepartments";
import { useEmployees } from "../employees/useEmployees";
import Spinner from "../../ui/Spinner";
import Button from "../../ui/Button";
import { HiPlus, HiTrash, HiMagnifyingGlass, HiEllipsisVertical, HiPencilSquare, HiChevronDown, HiChevronUp } from "react-icons/hi2";
import { useState, useMemo } from "react";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import ConfirmDelete from "../../ui/ConfirmDelete";
import Modal from "../../ui/Modal";
import Menus from "../../ui/Menus";
import Select from "../../ui/Select";
import { useUpdateEmployee } from "../employees/useEmployees";
import type { Department } from "../../services";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  position: relative;
`;

const DropdownContent = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-md);
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin-top: 0.4rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background-color: var(--color-grey-50);
  border: 1px solid var(--color-border-card);
  padding: 0.4rem 0.8rem;
  border-radius: var(--border-radius-sm);

  svg {
    width: 1.6rem;
    height: 1.6rem;
    color: var(--color-grey-500);
  }

  input {
    border: none;
    background: transparent;
    font-size: 1.2rem;
    color: var(--color-text-main);
    width: 100%;

    &:focus {
      outline: none;
    }
  }
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  max-height: 250px;
  overflow-y: auto;
  padding-right: 0.8rem;
`;

const ListItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-bg-elevated);
  padding: 0.8rem 1.2rem;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;

  &:hover {
    box-shadow: var(--shadow-md);
  }
`;

const DeptInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;

  h4 {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--color-text-strong);
    margin: 0;
  }

  p {
    font-size: 1.1rem;
    color: var(--color-text-secondary);
    margin: 0;
  }
`;

const MembersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 1rem;
  background-color: var(--color-grey-50);
  padding: 1.2rem;
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-border-subtle);
  max-height: 200px;
  overflow-y: auto;

  h5 {
    font-size: 1.4rem;
    margin: 0 0 0.4rem 0;
    color: var(--color-text-strong);
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.8rem 0;
      border-bottom: 1px solid var(--color-border-tiny);
      &:last-child {
        border-bottom: none;
      }
    }
  }
`;

export default function DepartmentManagement() {
    const { departments, isLoading } = useDepartments();
    const { createDepartment, isCreating } = useCreateDepartment();
    const { deleteDepartment, isDeleting } = useDeleteDepartment();
    const { updateDepartment, isUpdating } = useUpdateDepartment();
    const { employees, isLoading: isLoadingEmployees } = useEmployees({ limit: 1000 });

    const [searchTerm, setSearchTerm] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const filteredDepartments = useMemo(() => {
        if (!departments) return [];
        if (!searchTerm) return departments;
        return departments.filter(
            (d) =>
                d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [departments, searchTerm]);

    // Compute department members mapping
    const deptMembers = useMemo(() => {
        const map: Record<string, any[]> = {};
        if (employees) {
            employees.forEach((emp: any) => {
                if (emp.department) {
                    if (!map[emp.department]) map[emp.department] = [];
                    map[emp.department].push(emp);
                }
            });
        }
        return map;
    }, [employees]);

    if (isLoading || isLoadingEmployees) return <Spinner />;

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
            <div
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.8rem 1.2rem',
                    backgroundColor: 'var(--color-grey-0)',
                    border: '1px solid var(--color-grey-300)',
                    borderRadius: 'var(--border-radius-sm)',
                    cursor: 'pointer'
                }}
            >
                <span style={{ fontSize: '1.4rem', color: 'var(--color-text-main)' }}>
                    {departments ? `${departments.length} département(s) configuré(s)` : 'Chargement...'}
                </span>
                {isOpen ? <HiChevronUp size={20} color="var(--color-grey-500)" /> : <HiChevronDown size={20} color="var(--color-grey-500)" />}
            </div>

            {isOpen && (
                <DropdownContent>
                    <Header>
                        {departments && departments.length > 0 && (
                            <SearchContainer style={{ flex: 1 }}>
                                <HiMagnifyingGlass />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </SearchContainer>
                        )}
                        {(!departments || departments.length === 0) && <div style={{ flex: 1 }} />}

                        {!showAddForm && (
                            <Button size="small" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAddForm(true); }}>
                                <HiPlus /> Nouveau
                            </Button>
                        )}
                    </Header>

                    {showAddForm && (
                        <div style={{ background: 'var(--color-grey-50)', padding: '1.2rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--color-border-card)' }}>
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
                        </div>
                    )}

                    <Menus>
                        <ListContainer>
                            {filteredDepartments.map((dept) => (
                                <ListItem key={dept.id}>
                                    <Modal>
                                        <div style={{ display: "flex", alignItems: "center", gap: "1.6rem" }}>
                                            <Menus.Menu>
                                                <Menus.Toggle id={dept.id}>
                                                    <HiEllipsisVertical />
                                                </Menus.Toggle>
                                                <Menus.List id={dept.id}>
                                                    <Modal.Open opens="edit-dept">
                                                        <Menus.Button icon={<HiPencilSquare />}>Modifier</Menus.Button>
                                                    </Modal.Open>

                                                    <Modal.Open opens="delete-dept">
                                                        <Menus.Button icon={<HiTrash />}>Supprimer</Menus.Button>
                                                    </Modal.Open>
                                                </Menus.List>
                                            </Menus.Menu>

                                            <DeptInfo>
                                                <h4>{dept.name}</h4>
                                                <p>{dept.description || "Aucune description"}</p>
                                                <p style={{ fontSize: "1.1rem", fontStyle: "italic", marginTop: "0.2rem" }}>
                                                    {deptMembers[dept.name]?.length || 0} membre(s)
                                                </p>
                                            </DeptInfo>
                                        </div>

                                        {/* Edit Modal */}
                                        <Modal.Window name="edit-dept">
                                            <EditDepartmentForm
                                                department={dept}
                                                allDepartments={departments || []}
                                                members={deptMembers[dept.name] || []}
                                                onUpdate={(data) => updateDepartment({ id: dept.id, data })}
                                                isUpdating={isUpdating}
                                            />
                                        </Modal.Window>

                                        {/* Delete Confirmation */}
                                        <Modal.Window name="delete-dept">
                                            <ConfirmDelete
                                                resourceName={`département ${dept.name}`}
                                                onConfirm={() => deleteDepartment(dept.id)}
                                                disabled={isDeleting}
                                                onCloseModal={() => { }} // Injected by Modal
                                            />
                                        </Modal.Window>
                                    </Modal>
                                </ListItem>
                            ))}

                            {filteredDepartments.length === 0 && searchTerm && (
                                <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: "2rem" }}>
                                    Aucun département trouvé
                                </p>
                            )}
                        </ListContainer>
                    </Menus>
                </DropdownContent>
            )}
        </Container>
    );
}

// Edit Form Component extracted for state isolation
function EditDepartmentForm({
    department,
    allDepartments,
    members,
    onUpdate,
    isUpdating,
    onCloseModal
}: {
    department: Department;
    allDepartments: Department[];
    members: any[];
    onUpdate: (data: { name: string, description: string }) => void;
    isUpdating: boolean;
    onCloseModal?: () => void;
}) {
    const [name, setName] = useState(department.name);
    const [description, setDescription] = useState(department.description || "");
    const { updateEmployee, isUpdating: isUpdatingEmployee } = useUpdateEmployee();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!name.trim()) return;
        onUpdate({ name, description });
        onCloseModal?.();
    };

    return (
        <div style={{ padding: "1.2rem", width: "550px", maxWidth: "90vw" }}>
            <h3 style={{ marginBottom: "2rem", fontSize: "1.8rem" }}>Modifier le Département</h3>
            <Form type="modal" onSubmit={handleSubmit} style={{ width: "100%", padding: "0 1rem" }}>
                <FormRow label="Nom">
                    <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isUpdating}
                        required
                    />
                </FormRow>
                <FormRow label="Description">
                    <Input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isUpdating}
                    />
                </FormRow>

                {/* Affichage des membres */}
                <MembersList>
                    <h5>Membres associés ({members.length})</h5>
                    {members.length > 0 ? (
                        <ul>
                            {members.map(m => (
                                <li key={m.id}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                        <span style={{ fontSize: "1.3rem", fontWeight: 500, color: "var(--color-text-strong)" }}>
                                            {m.first_name} {m.last_name}
                                        </span>
                                        <span style={{ fontSize: "1.1rem", color: "var(--color-text-dim)" }}>
                                            {m.email}
                                        </span>
                                    </div>
                                    <Select
                                        value={department.name}
                                        options={allDepartments.map(d => ({ value: d.name, label: d.name }))}
                                        onChange={(e) => {
                                            const newDept = e.target.value;
                                            if (newDept !== department.name) {
                                                updateEmployee({ id: m.id, data: { department: newDept } });
                                            }
                                        }}
                                        disabled={isUpdatingEmployee}
                                        style={{ width: '140px', fontSize: '1.2rem', padding: '0.6rem' }}
                                    />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ fontSize: "1.2rem", color: "var(--color-text-dim)" }}>Aucun membre dans ce département.</p>
                    )}
                </MembersList>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "2rem" }}>
                    <Button variation="secondary" type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCloseModal?.(); }} disabled={isUpdating}>
                        Annuler
                    </Button>
                    <Button type="submit" disabled={isUpdating}>
                        Enregistrer
                    </Button>
                </div>
            </Form>
        </div>
    );
}
