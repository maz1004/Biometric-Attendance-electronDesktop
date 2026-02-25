import { useState } from "react";
import styled from "styled-components";
import Button from "../../../ui/Button";
import Heading from "../../../ui/Heading";
import Input from "../../../ui/Input";
import { GeneratedReport } from "../../../services/types/api-types";
import SpinnerMini from "../../../ui/SpinnerMini";

const Form = styled.form`
  width: 50rem;
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const Label = styled.label`
  font-weight: 500;
  font-size: 1.4rem;
  color: var(--color-text-strong);
`;

const StyledInput = styled(Input)`
    width: 100%;
    padding: 1.2rem;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
  margin-top: 1.2rem;
`;

interface RenameReportFormProps {
    report: GeneratedReport;
    onConfirm: (payload: { id: string; newName: string }) => Promise<void>;
    onCloseModal?: () => void;
    isRenaming: boolean;
}

function RenameReportForm({ report, onConfirm, onCloseModal, isRenaming }: RenameReportFormProps) {
    const [name, setName] = useState(report.file_name);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        await onConfirm({ id: report.id, newName: name });
        onCloseModal?.();
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Heading as="h3">Renommer le rapport</Heading>

            <Field>
                <Label htmlFor="name">Nom du fichier</Label>
                <StyledInput
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isRenaming}
                    autoFocus
                />
            </Field>

            <Actions>
                <Button variation="secondary" type="button" onClick={() => onCloseModal?.()} disabled={isRenaming}>
                    Annuler
                </Button>
                <Button type="submit" disabled={isRenaming}>
                    {isRenaming ? <SpinnerMini /> : "Renommer"}
                </Button>
            </Actions>
        </Form>
    );
}

export default RenameReportForm;
