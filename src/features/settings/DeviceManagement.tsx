import { useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { useDevices } from "../devices/useDevices";
import { getDeviceStatusColor, formatLastSeen } from "../../services/devices";
import Button from "../../ui/Button";
import Spinner from "../../ui/Spinner";
import { StyledModal, Overlay } from "../../ui/Modal";
import Input from "../../ui/Input";
import FormRow from "../../ui/FormRow";
import { HiOutlineTrash, HiOutlineArrowPath, HiOutlineCheck, HiOutlinePencilSquare, HiXMark, HiNoSymbol } from "react-icons/hi2";
import { Device } from "../devices/DeviceTypes";
import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import DeviceDetailsModal from "../devices/DeviceDetailsModal";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3.2rem;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.h4`
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
`;

const BlockedViewButton = styled.button`
  background: none;
  border: none;
  color: var(--color-red-700);
  font-size: 1.3rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.8rem;
  border-radius: var(--border-radius-sm);
  transition: all 0.2s;

  &:hover {
    text-decoration: underline;
    background-color: var(--color-red-100);
  }
`;

const DeviceList = styled.div`
  display: grid;
  gap: 1.2rem;
`;

const DeviceCard = styled.div<{ $isPending?: boolean }>`
  background: var(--color-grey-0);
  padding: 1.6rem;
  border-radius: var(--border-radius-md);
  border: 1px solid ${(p) => (p.$isPending ? "var(--color-yellow-500)" : "var(--color-border-card)")};
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1.6rem;
  align-items: center;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
  }
`;

const DeviceInfo = styled.div`
  display: grid;
  gap: 0.4rem;
`;

const DeviceName = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-text-strong);
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const DeviceDetails = styled.div`
  font-size: 1.2rem;
  color: var(--color-text-dim);
  display: flex;
  gap: 1.6rem;
  flex-wrap: wrap;
`;

const StatusBadge = styled.span<{ status: 'online' | 'offline' | 'error' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.2rem 0.8rem;
  border-radius: var(--border-radius-sm);
  font-size: 1.1rem;
  font-weight: 500;
  
  ${props => {
        switch (props.status) {
            case 'online':
                return `
          background: var(--color-green-100);
          color: var(--color-green-700);
        `;
            case 'offline':
                return `
          background: var(--color-yellow-100);
          color: var(--color-yellow-700);
        `;
            case 'error':
                return `
          background: var(--color-red-100);
          color: var(--color-red-700);
        `;
        }
    }}
  
  &::before {
    content: '';
    width: 0.6rem;
    height: 0.6rem;
    border-radius: 50%;
    background: currentColor;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 0.8rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--color-text-dim);
  background: var(--color-bg-elevated);
  border-radius: var(--border-radius-md);
  border: 1px dashed var(--color-border-card);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 0.4rem;
  border-radius: var(--border-radius-sm);
  transform: translateX(0.8rem);
  transition: all 0.2s;
  position: absolute;
  top: 1.2rem;
  right: 1.9rem;

  &:hover {
    background-color: var(--color-grey-100);
  }

  & svg {
    width: 2.4rem;
    height: 2.4rem;
    color: var(--color-grey-500);
  }
`;

function ModalWrapper({
    onClose,
    children,
    width = "400px"
}: {
    onClose: () => void;
    children: React.ReactNode;
    width?: string;
}) {
    return createPortal(
        <Overlay>
            <StyledModal style={{ maxWidth: width, width: '100%' }}>
                <CloseButton onClick={onClose}>
                    <HiXMark />
                </CloseButton>
                <div>{children}</div>
            </StyledModal>
        </Overlay>,
        document.body
    );
}

export default function DeviceManagement() {
    const {
        isLoading,
        devices,
        allDevices,
        removeDevice,
        resyncDevice,
        isResyncing,
        resolveConflict,
        updateDeviceDetails
    } = useDevices();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editLocation, setEditLocation] = useState("");
    const [showBlockedModal, setShowBlockedModal] = useState(false);
    const [selectedDetailDevice, setSelectedDetailDevice] = useState<Device | null>(null);

    if (isLoading) return <Spinner />;

    // Split devices
    const authorizedDevices = devices.filter(d => d.trustStatus === 'trusted');
    const pendingDevices = devices.filter(d => d.trustStatus === 'pending_auth' || d.trustStatus === 'conflict');
    const blockedDevices = allDevices.filter(d => d.trustStatus === 'blocked' || d.trustStatus === 'blacklisted');

    const handleEditClick = (d: Device) => {
        setEditingId(d.id);
        setEditName(d.name);
        setEditLocation(d.location || "");
    };

    const handleSaveEdit = () => {
        if (!editingId) return;
        updateDeviceDetails({ id: editingId, name: editName, location: editLocation });
        setEditingId(null);
    };

    return (
        <Container>
            {/* PENDING DEVICES */}
            {pendingDevices.length > 0 && (
                <Section>
                    <SectionTitle>⚠️ Pending Authorization ({pendingDevices.length})</SectionTitle>
                    <DeviceList>
                        {pendingDevices.map((device) => (
                            <DeviceCard key={device.id} $isPending>
                                <DeviceInfo>
                                    <DeviceName>
                                        {device.name}
                                        {device.trustStatus === 'conflict' ? (
                                            <span style={{ fontSize: '1.1rem', color: 'var(--color-red-700)', background: 'var(--color-red-100)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 'bold' }}>
                                                🚨 IP CONFLICT
                                            </span>
                                        ) : (
                                            <span style={{ fontSize: '1.1rem', color: 'var(--color-yellow-700)', background: 'var(--color-yellow-100)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                                                Waiting Approval
                                            </span>
                                        )}
                                    </DeviceName>
                                    <DeviceDetails>
                                        <span>MAC: {device.id}</span>
                                        <span>IP: {device.ip}</span>
                                        {device.trustStatus === 'conflict' && <span style={{ color: 'var(--color-red-600)' }}>Conflict with active socket!</span>}
                                        <span>Last seen: {formatLastSeen(device.lastSyncISO)}</span>
                                    </DeviceDetails>
                                </DeviceInfo>
                                <Actions>
                                    <Button
                                        size="small"
                                        onClick={() => resolveConflict({ id: device.id, resolution: 'approve_replacement' })}
                                        title={device.trustStatus === 'conflict' ? "Replace the old device with this one" : "Authorize this device"}
                                    >
                                        <HiOutlineCheck /> {device.trustStatus === 'conflict' ? "Replace Old" : "Authorize"}
                                    </Button>
                                    <Button
                                        size="small"
                                        variation="danger"
                                        onClick={() => {
                                            if (device.trustStatus === 'conflict') {
                                                if (window.confirm(`STRICT REJECT: This will BLACKLIST device "${device.name}" to prevent further conflicts.`)) {
                                                    resolveConflict({ id: device.id, resolution: 'blacklist_device' });
                                                }
                                            } else {
                                                if (window.confirm(`Reject and remove device "${device.name}"?`)) {
                                                    removeDevice(device.id);
                                                }
                                            }
                                        }}
                                        title={device.trustStatus === 'conflict' ? "Reject and Blacklist this new device" : "Reject request"}
                                    >
                                        <HiOutlineTrash /> {device.trustStatus === 'conflict' ? "Reject & Block" : "Reject"}
                                    </Button>
                                </Actions>
                            </DeviceCard>
                        ))}
                    </DeviceList>
                </Section>
            )}

            {/* AUTHORIZED DEVICES */}
            <Section>
                <SectionHeader>
                    <SectionTitle>✅ Authorized Devices ({authorizedDevices.length})</SectionTitle>
                    {blockedDevices.length > 0 && (
                        <BlockedViewButton onClick={() => setShowBlockedModal(true)}>
                            <HiNoSymbol />
                            Voir les appareils bloqués ({blockedDevices.length})
                        </BlockedViewButton>
                    )}
                </SectionHeader>

                {authorizedDevices.length === 0 ? (
                    <EmptyState>
                        No authorized devices. Connect a device to the network to see it appear in Pending list.
                    </EmptyState>
                ) : (
                    <DeviceList>
                        {authorizedDevices.map((device) => {
                            const status = getDeviceStatusColor(device.lastSyncISO);

                            return (
                                <DeviceCard
                                    key={device.id}
                                    onClick={() => setSelectedDetailDevice(device)}
                                >
                                    <DeviceInfo>
                                        <DeviceName>
                                            {device.name}
                                            <StatusBadge status={status}>
                                                {status}
                                            </StatusBadge>
                                        </DeviceName>
                                        <DeviceDetails>
                                            <span>Type: Mobile/Tablet</span>
                                            <span>Location: {device.location || "Not set"}</span>
                                            <span>Kiosk IP: {device.ip}</span>
                                            {device.mobileIP && <span>Tablet IP: {device.mobileIP}</span>}
                                            <span>Last sync: {formatLastSeen(device.lastSyncISO)}</span>
                                        </DeviceDetails>
                                    </DeviceInfo>

                                    <Actions onClick={e => e.stopPropagation()}>
                                        <Button
                                            variation="secondary"
                                            onClick={() => handleEditClick(device)}
                                            style={{ padding: '0.8rem 1.6rem', fontSize: '1.4rem' }}
                                        >
                                            <HiOutlinePencilSquare style={{ width: '2rem', height: '2rem' }} /> Edit
                                        </Button>
                                        <Button
                                            variation="secondary"
                                            onClick={() => resyncDevice(device.id)}
                                            disabled={isResyncing}
                                            style={{ padding: '0.8rem 1.6rem', fontSize: '1.4rem' }}
                                        >
                                            <HiOutlineArrowPath style={{ width: '2rem', height: '2rem' }} /> Sync
                                        </Button>
                                        <Button
                                            variation="danger"
                                            onClick={() => {
                                                if (window.confirm(`Remove device "${device.name}"?`)) {
                                                    removeDevice(device.id);
                                                }
                                            }}
                                            style={{
                                                backgroundColor: '#fca5a5',
                                                color: '#7f1d1d',
                                                border: 'none',
                                                padding: '0.8rem 1.2rem',
                                                fontSize: '1.4rem'
                                            }}
                                            title="Delete Device"
                                        >
                                            <HiOutlineTrash style={{ width: '2rem', height: '2rem' }} />
                                        </Button>
                                    </Actions>
                                </DeviceCard>
                            );
                        })}
                    </DeviceList>
                )}
            </Section>

            {/* EDIT MODAL */}
            {editingId && (
                <ModalWrapper onClose={() => setEditingId(null)}>
                    <div style={{ width: '100%', maxWidth: '400px' }}>
                        <h3 style={{ marginBottom: '2rem', fontSize: '1.8rem', fontWeight: 600 }}>Edit Device Details</h3>
                        <div style={{ display: 'grid', gap: '1.6rem' }}>
                            <FormRow label="Device Name">
                                <Input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    autoFocus
                                />
                            </FormRow>
                            <FormRow label="Location">
                                <Input
                                    value={editLocation}
                                    onChange={(e) => setEditLocation(e.target.value)}
                                    placeholder="e.g. Front Entrance"
                                />
                            </FormRow>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <Button variation="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                                <Button onClick={handleSaveEdit}>Save Changes</Button>
                            </div>
                        </div>
                    </div>
                </ModalWrapper>
            )}

            {/* BLOCKED DEVICES MODAL */}
            {showBlockedModal && (
                <ModalWrapper onClose={() => setShowBlockedModal(false)} width="800px">
                    <div>
                        <h3 style={{ marginBottom: '2rem', fontSize: '1.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-red-700)' }}>
                            <HiNoSymbol /> Blocked Devices & IPs
                        </h3>

                        <Menus>
                            <Table columns="1.5fr 1fr 1fr 1fr 0.5fr">
                                <Table.Header>
                                    <div>Device Name</div>
                                    <div>Kiosk IP</div>
                                    <div>Tablet IP</div>
                                    <div>Reason</div>
                                    <div>Actions</div>
                                </Table.Header>
                                <Table.Body
                                    data={blockedDevices}
                                    render={(d) => (
                                        <Table.Row key={d.id}>
                                            <div style={{ fontWeight: 600 }}>{d.name !== "Unknown Device" ? d.name : d.id}</div>
                                            <div style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>{d.ip}</div>
                                            <div style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>{d.mobileIP || "—"}</div>
                                            <div>{d.blockedReason || "—"}</div>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <Menus.Menu>
                                                    <Menus.Toggle id={d.id} />
                                                    <Menus.List id={d.id}>
                                                        <Menus.Button
                                                            icon={<HiOutlineCheck />}
                                                            onClick={() => {
                                                                if (window.confirm(`Unblock device "${d.name}" and restore to Trusted status?`)) {
                                                                    resolveConflict({ id: d.id, resolution: 'approve_replacement' });
                                                                }
                                                            }}
                                                        >
                                                            Unblock
                                                        </Menus.Button>
                                                        <Menus.Button
                                                            icon={<HiOutlineTrash />}
                                                            onClick={() => {
                                                                if (window.confirm(`DELETE device "${d.name}" and all data? This will also remove the IP blacklist entry.`)) {
                                                                    removeDevice(d.id);
                                                                }
                                                            }}
                                                        >
                                                            Delete
                                                        </Menus.Button>
                                                    </Menus.List>
                                                </Menus.Menu>
                                            </div>
                                        </Table.Row>
                                    )}
                                />
                            </Table>
                        </Menus>
                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <Button variation="secondary" onClick={() => setShowBlockedModal(false)}>Close</Button>
                        </div>
                    </div>
                </ModalWrapper>
            )}

            {/* DETAILED VIEW MODAL */}
            {selectedDetailDevice && (
                <DeviceDetailsModal
                    device={selectedDetailDevice}
                    onClose={() => setSelectedDetailDevice(null)}
                />
            )}
        </Container>
    );
}
