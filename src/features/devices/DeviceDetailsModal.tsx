import styled from "styled-components";
import { format } from "date-fns";
import * as locales from "date-fns/locale";
import { HiXMark, HiServer, HiDeviceTablet, HiMapPin, HiCpuChip, HiSignal } from "react-icons/hi2";
import { Device } from "./DeviceTypes";
import { createPortal } from "react-dom";
import { Overlay, StyledModal } from "../../ui/Modal";
import { useTranslation } from "react-i18next";

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--color-grey-500);
  cursor: pointer;
  padding: 0.4rem;
  border-radius: var(--border-radius-sm);
  transition: all 0.2s;

  &:hover {
    background-color: var(--color-grey-100);
    color: var(--color-grey-800);
  }

  & svg {
    width: 2.4rem;
    height: 2.4rem;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1.2rem;
  background: var(--color-grey-50);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-100);
`;

const GroupLabel = styled.h4`
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-dim);
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const DetailRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const Label = styled.span`
  font-size: 1.2rem;
  color: var(--color-text-secondary);
`;

const Value = styled.span`
  font-size: 1.4rem;
  font-weight: 500;
  color: var(--color-text-strong);
  font-family: monospace;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.4rem 1rem;
  border-radius: 999px;
  font-size: 1.2rem;
  font-weight: 600;
  text-transform: capitalize;
  
  ${p => p.status === 'online' && `background: var(--color-green-100); color: var(--color-green-700);`}
  ${p => p.status === 'offline' && `background: var(--color-yellow-100); color: var(--color-yellow-700);`}
  ${p => p.status === 'error' && `background: var(--color-red-100); color: var(--color-red-700);`}
`;

interface DeviceDetailsModalProps {
  device: Device;
  onClose: () => void;
}

export default function DeviceDetailsModal({ device, onClose }: DeviceDetailsModalProps) {
  const { t, i18n } = useTranslation();
  // Map i18n codes to date-fns locales
  const getLocale = (lng: string) => {
    if (lng === 'ar') return locales.ar;
    if (lng === 'kab') return (locales as any).kab || locales.fr; // Fallback to fr for kab if not in date-fns
    if (lng === 'en') return locales.enUS;
    return locales.fr;
  }
  const dateLoc = getLocale(i18n.language);

  return createPortal(
    <Overlay onClick={onClose}>
      <StyledModal style={{ maxWidth: '600px', width: '100%' }} onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <Title>
            <HiDeviceTablet />
            {device.name}
            <StatusBadge status={device.status}>{t(`devices.status.${device.status}`)}</StatusBadge>
          </Title>
          <CloseButton onClick={onClose}>
            <HiXMark />
          </CloseButton>
        </ModalHeader>

        <ContentGrid>
          {/* Network Info */}
          <Group>
            <GroupLabel><HiServer /> {t("devices.modals.details.headers.network")}</GroupLabel>
            <DetailRow>
              <Label>{t("devices.modals.details.labels.kiosk_ip")}</Label>
              <Value>{device.ip || "—"}</Value>
            </DetailRow>
            <DetailRow>
              <Label>{t("devices.modals.details.labels.tablet_ip")}</Label>
              <Value>{device.mobileIP || "—"}</Value>
            </DetailRow>
            <DetailRow>
              <Label>{t("devices.modals.details.labels.mac")}</Label>
              <Value>{device.id}</Value>
            </DetailRow>
          </Group>

          {/* System Info */}
          <Group>
            <GroupLabel><HiCpuChip /> {t("devices.modals.details.headers.system")}</GroupLabel>
            <DetailRow>
              <Label>{t("devices.modals.details.labels.version")}</Label>
              <Value>{device.version || t("devices.modals.details.values.unknown")}</Value>
            </DetailRow>
            <DetailRow>
              <Label>{t("devices.modals.details.labels.current_mode")}</Label>
              <Value>{device.currentMode ? t(`devices.mode.${device.currentMode}`) : t("devices.mode.recognition")}</Value>
            </DetailRow>
            <DetailRow>
              <Label>{t("devices.modals.details.labels.trust_status")}</Label>
              <Value style={{
                color: device.trustStatus === 'trusted' ? 'var(--color-green-600)' : 'var(--color-yellow-600)'
              }}>
                {t(`devices.status.${device.trustStatus}`).toUpperCase()}
              </Value>
            </DetailRow>
          </Group>

          {/* Location & Time */}
          <Group>
            <GroupLabel><HiMapPin /> {t("devices.modals.details.headers.deployment")}</GroupLabel>
            <DetailRow>
              <Label>{t("devices.modals.details.labels.location")}</Label>
              <Value style={{ fontFamily: 'inherit' }}>{device.location || t("devices.modals.details.values.unassigned")}</Value>
            </DetailRow>
          </Group>

          <Group>
            <GroupLabel><HiSignal /> {t("devices.modals.details.headers.activity")}</GroupLabel>
            <DetailRow>
              <Label>{t("devices.modals.details.labels.last_seen")}</Label>
              <Value style={{ fontFamily: 'inherit' }}>
                {device.lastSyncISO
                  ? format(new Date(device.lastSyncISO), "Pp", { locale: dateLoc })
                  : t("devices.modals.details.values.never")}
              </Value>
            </DetailRow>
          </Group>
        </ContentGrid>
      </StyledModal>
    </Overlay>,
    document.body
  );
}
