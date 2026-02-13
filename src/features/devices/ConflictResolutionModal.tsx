import styled from "styled-components";
import Button from "../../ui/Button";
import Heading from "../../ui/Heading";
import { Device } from "./DeviceTypes";
import { HiExclamationTriangle } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
  max-width: 50rem;
`;

const WarningBox = styled.div`
  background-color: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 8px;
  padding: 1.6rem;
  display: flex;
  gap: 1.2rem;
  align-items: flex-start;
  color: #991b1b;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.8rem 0;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.span`
  font-weight: 500;
  color: #4b5563;
`;

const Value = styled.span`
  color: #111827;
  font-family: monospace;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
  margin-top: 1.2rem;
`;

type Props = {
    device: Device;
    onClose: () => void;
    onResolve: (id: string, resolution: "approve_replacement" | "block_device") => void;
    isLoading: boolean;
};

export default function ConflictResolutionModal({ device, onClose, onResolve, isLoading }: Props) {
    const { t } = useTranslation();
    const isConflict = !!device.conflictId || device.trustStatus === 'conflict';

    return (
        <ModalContainer>
            <Heading as="h2">
                {isConflict ? t("devices.modals.conflict.title_resolve") : t("devices.modals.conflict.title_auth")}
            </Heading>

            {isConflict ? (
                <WarningBox>
                    <HiExclamationTriangle size={32} />
                    <div>
                        <strong>{t("devices.modals.conflict.alert_conflict")}</strong>
                        <p>
                            {t("devices.modals.conflict.text_conflict")}
                        </p>
                    </div>
                </WarningBox>
            ) : (
                <WarningBox style={{ backgroundColor: '#fefce8', borderColor: '#fde047', color: '#854d0e' }}>
                    <HiExclamationTriangle size={32} />
                    <div>
                        <strong>{t("devices.modals.conflict.alert_auth")}</strong>
                        <p>
                            {t("devices.modals.conflict.text_auth")}
                        </p>
                    </div>
                </WarningBox>
            )}

            <div>
                <Heading as="h3">{t("devices.modals.conflict.details_title")}</Heading>
                <InfoRow>
                    <Label>{t("devices.modals.conflict.labels.name")}</Label>
                    <Value>{device.name}</Value>
                </InfoRow>
                <InfoRow>
                    <Label>{t("devices.modals.conflict.labels.ip")}</Label>
                    <Value>{device.ip}</Value>
                </InfoRow>
                <InfoRow>
                    <Label>{t("devices.modals.conflict.labels.mac")}</Label>
                    <Value>{device.id}</Value>
                </InfoRow>
                <InfoRow>
                    <Label>{t("devices.modals.conflict.labels.trust_status")}</Label>
                    <Value style={{ color: "orange" }}>
                        {t(`devices.status.${device.trustStatus}`)}
                    </Value>
                </InfoRow>
            </div>

            <ButtonGroup>
                <Button variation="secondary" onClick={onClose} disabled={isLoading}>
                    {t("common.cancel")}
                </Button>
                <Button
                    variation="danger"
                    onClick={() => onResolve(device.id, "block_device")}
                    disabled={isLoading}
                >
                    {t("devices.modals.conflict.btns.block")}
                </Button>
                <Button
                    variation="primary"
                    onClick={() => onResolve(device.id, "approve_replacement")}
                    disabled={isLoading}
                >
                    {isConflict ? t("devices.modals.conflict.btns.approve") : t("devices.modals.conflict.btns.authorize")}
                </Button>
            </ButtonGroup>
        </ModalContainer>
    );
}
