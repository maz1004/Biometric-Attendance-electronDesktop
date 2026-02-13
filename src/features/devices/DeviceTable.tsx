import { useState } from "react";
import styled from "styled-components";
import { Device } from "./DeviceTypes";
import { HiArrowPath, HiTrash, HiCpuChip, HiUserPlus, HiShieldExclamation, HiNoSymbol } from "react-icons/hi2";
import { useDeviceControl } from "../../hooks/useDeviceControl";
import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import Modal from "../../ui/Modal";
import ConfirmDelete from "../../ui/ConfirmDelete";
import ConflictResolutionModal from "./ConflictResolutionModal";
import BlockIPModal from "./BlockIPModal";
import ControlledModal from "../../ui/ControlledModal";
import { useTranslation } from "react-i18next";

const Badge = styled.span<{ $s: string }>`
  display: inline-block;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
  
  color: ${(p) => {
    switch (p.$s) {
      case "online": return "#15803d"; // green-700
      case "offline": return "#374151"; // gray-700
      case "trusted": return "#15803d";
      case "pending_auth": return "#b45309"; // amber-700
      case "conflict": return "#b91c1c"; // red-700
      case "blocked": return "#991b1b"; // red-800
      case "blacklisted": return "#000000";
      default: return "#4b5563";
    }
  }};
  background: ${(p) => {
    switch (p.$s) {
      case "online": return "#dcfce7"; // green-100
      case "offline": return "#f3f4f6"; // gray-100
      case "trusted": return "#dcfce7";
      case "pending_auth": return "#fef3c7"; // amber-100
      case "conflict": return "#fee2e2"; // red-100
      case "blocked": return "#fecaca"; // red-200
      case "blacklisted": return "#e5e7eb";
      default: return "#f3f4f6";
    }
  }};
  border: 1px solid ${(p) => {
    switch (p.$s) {
      case "online": return "transparent";
      case "offline": return "#e5e7eb";
      case "pending_auth": return "#fde68a"; // amber-200
      case "conflict": return "#fecaca"; // red-200
      default: return "transparent";
    }
  }};
`;

const SecondaryText = styled.div`
  font-size: 1.2rem;
  color: var(--color-grey-500);
`;

const DeviceName = styled.div`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-900);
`;

function DeviceRow({
  d,
  onOpenResolve,
  onOpenBlock,
  onDelete
}: {
  d: Device;
  onOpenResolve: (d: Device) => void;
  onOpenBlock: (d: Device) => void;
  onDelete: (id: string) => void;
}) {
  const { handleSetMode, handleSync, loading } = useDeviceControl();
  const { t, i18n } = useTranslation();

  return (
    <Table.Row>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
        <DeviceName>{d.name}</DeviceName>
        <SecondaryText>{d.ip ?? t("devices.modals.details.values.unknown")}</SecondaryText>
      </div>

      <div>{d.location ?? "—"}</div>

      <div style={{ display: "flex", gap: "0.5rem", flexDirection: "column", alignItems: "flex-start" }}>
        <Badge $s={d.status}>{t(`devices.status.${d.status}`)}</Badge>
        {d.trustStatus !== "trusted" && (
          <Badge $s={d.trustStatus}>
            {t(`devices.status.${d.trustStatus}`)}
          </Badge>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
        <span>{new Date(d.lastSyncISO).toLocaleDateString(i18n.language)}</span>
        <SecondaryText>{new Date(d.lastSyncISO).toLocaleTimeString(i18n.language)}</SecondaryText>
      </div>

      <div>
        {d.currentMode === "recognition"
          ? t("devices.mode.recognition")
          : d.currentMode === "enrollment"
            ? t("devices.mode.enrollment")
            : t("devices.mode.idle")}
      </div>

      <div>{d.version ?? "1.0.0"}</div>

      <div>
        <Modal>
          <Menus.Menu>
            <Menus.Toggle id={d.id} />

            <Menus.List id={d.id}>
              <Menus.Button icon={<HiArrowPath />} onClick={() => handleSync(d.id)}>
                {t("devices.actions.sync")}
              </Menus.Button>

              {d.currentMode !== "recognition" && (
                <Menus.Button icon={<HiCpuChip />} onClick={() => handleSetMode(d.id, "recognition")}>
                  {t("devices.actions.switch_recognition")}
                </Menus.Button>
              )}

              {d.currentMode !== "enrollment" && (
                <Menus.Button icon={<HiUserPlus />} onClick={() => handleSetMode(d.id, "enrollment")}>
                  {t("devices.actions.switch_enrollment")}
                </Menus.Button>
              )}

              {(d.trustStatus === "conflict" || d.trustStatus === "pending_auth") && (
                <Menus.Button icon={<HiShieldExclamation />} onClick={() => onOpenResolve(d)}>
                  {t("devices.actions.resolve")}
                </Menus.Button>
              )}

              <Menus.Button icon={<HiNoSymbol />} onClick={() => onOpenBlock(d)}>
                {t("devices.actions.blacklist")}
              </Menus.Button>

              <Modal.Open opens="delete-device">
                <Menus.Button icon={<HiTrash />}>{t("devices.actions.delete")}</Menus.Button>
              </Modal.Open>
            </Menus.List>
          </Menus.Menu>

          <Modal.Window name="delete-device">
            <ConfirmDelete
              resourceName={`${t("devices.table.device")} ${d.name}`}
              onConfirm={() => onDelete(d.id)}
              disabled={loading}
              onCloseModal={() => { }}
            />
          </Modal.Window>
        </Modal>
      </div>
    </Table.Row>
  );
}

export default function DeviceTable({
  devices,
  onResolve,
  onBlock,
  onDelete,
  isLoading
}: {
  devices: Device[];
  onResolve: (id: string, resolution: "approve_replacement" | "block_device") => void;
  onBlock: (ip: string, reason: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}) {
  const [conflictDevice, setConflictDevice] = useState<Device | null>(null);
  const [blockDevice, setBlockDevice] = useState<Device | null>(null);
  const { t } = useTranslation();

  const handleOpenResolve = (d: Device) => setConflictDevice(d);
  const handleOpenBlock = (d: Device) => setBlockDevice(d);

  return (
    <>
      <Menus>
        <Table columns="1.8fr 1.2fr 0.8fr 1.2fr 1.2fr 0.8fr 3.2rem">
          <Table.Header>
            <div>{t("devices.table.device")}</div>
            <div>{t("devices.table.location")}</div>
            <div>{t("devices.table.status")}</div>
            <div>{t("devices.last_sync")}</div>
            <div>{t("devices.table.mode")}</div>
            <div>{t("devices.table.version")}</div>
            <div></div>
          </Table.Header>

          <Table.Body
            data={devices}
            render={(d) => (
              <DeviceRow
                key={d.id}
                d={d}
                onOpenResolve={handleOpenResolve}
                onOpenBlock={handleOpenBlock}
                onDelete={onDelete}
              />
            )}
          />
        </Table>
      </Menus>

      <ControlledModal
        isOpen={!!conflictDevice}
        onClose={() => setConflictDevice(null)}
      >
        {conflictDevice && (
          <ConflictResolutionModal
            device={conflictDevice}
            onClose={() => setConflictDevice(null)}
            onResolve={(id, res) => {
              onResolve(id, res);
              setConflictDevice(null);
            }}
            isLoading={!!isLoading}
          />
        )}
      </ControlledModal>

      <ControlledModal
        isOpen={!!blockDevice}
        onClose={() => setBlockDevice(null)}
      >
        {blockDevice && (
          <BlockIPModal
            device={blockDevice}
            onClose={() => setBlockDevice(null)}
            onBlock={(ip, reason) => {
              onBlock(ip, reason);
              setBlockDevice(null);
            }}
            isLoading={!!isLoading}
          />
        )}
      </ControlledModal>
    </>
  );
}
