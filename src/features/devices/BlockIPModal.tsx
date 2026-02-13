import { useState } from "react";
import styled from "styled-components";
import Button from "../../ui/Button";
import Heading from "../../ui/Heading";
import Input from "../../ui/Input";
import { Device } from "./DeviceTypes";
import { useTranslation } from "react-i18next";

const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
  max-width: 40rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
  margin-top: 1.2rem;
`;

const LabelInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const Label = styled.label`
  font-weight: 500;
  font-size: 1.4rem;
  color: var(--color-grey-700);
`;

type Props = {
    device: Device;
    onClose: () => void;
    onBlock: (ip: string, reason: string) => void;
    isLoading: boolean;
};

export default function BlockIPModal({ device, onClose, onBlock, isLoading }: Props) {
    const [reason, setReason] = useState("");
    const { t } = useTranslation();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason) return;
        if (device.ip) {
            onBlock(device.ip, reason);
        }
    };

    return (
        <ModalContainer>
            <Heading as="h2">{t("devices.modals.block.title")}</Heading>
            <p>
                {t("devices.modals.block.confirm_text", { ip: device.ip })}
            </p>

            <form onSubmit={handleSubmit}>
                <LabelInputContainer>
                    <Label htmlFor="reason">{t("devices.modals.block.reason_label")}</Label>
                    <Input
                        type="text"
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        disabled={isLoading}
                        autoFocus
                    />
                </LabelInputContainer>

                <ButtonGroup>
                    <Button variation="secondary" type="button" onClick={onClose} disabled={isLoading}>
                        {t("common.cancel")}
                    </Button>
                    <Button variation="danger" type="submit" disabled={isLoading}>
                        {t("devices.modals.block.confirm_btn")}
                    </Button>
                </ButtonGroup>
            </form>
        </ModalContainer>
    );
}
