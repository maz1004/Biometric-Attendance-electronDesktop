import styled from "styled-components";
import { useDevices } from "./useDevices";
import { getDeviceStatusColor, formatLastSeen } from "../../services/devices";
import Button from "../../ui/Button";
import Spinner from "../../ui/Spinner";
import { HiOutlineTrash, HiOutlineArrowPath, HiOutlinePower } from "react-icons/hi2";

const Container = styled.div`
  background: var(--color-bg-elevated);
  padding: 2.4rem;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-border-card);
  display: grid;
  gap: 1.6rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-text-strong);
`;

const DeviceList = styled.div`
  display: grid;
  gap: 1.2rem;
`;

const DeviceCard = styled.div`
  background: var(--color-bg-main);
  padding: 1.6rem;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-border-card);
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1.6rem;
  align-items: center;
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
`;

export default function DeviceManagement() {
    const { isLoading, devices, removeDevice, resyncDevice, isResyncing } = useDevices();

    if (isLoading) return <Spinner />;

    return (
        <Container>
            <Header>
                <Title>🖥️ Device Management</Title>
                <div style={{ fontSize: '1.2rem', color: 'var(--color-text-dim)' }}>
                    {devices.length} device{devices.length !== 1 ? 's' : ''} registered
                </div>
            </Header>

            {devices.length === 0 ? (
                <EmptyState>
                    No devices registered yet. Devices will appear here automatically via mDNS discovery.
                </EmptyState>
            ) : (
                <DeviceList>
                    {devices.map((device) => {
                        const status = getDeviceStatusColor(device.last_seen);

                        return (
                            <DeviceCard key={device.id}>
                                <DeviceInfo>
                                    <DeviceName>
                                        {device.name}
                                        <StatusBadge status={status}>
                                            {status}
                                        </StatusBadge>
                                    </DeviceName>
                                    <DeviceDetails>
                                        <span>Type: {device.type}</span>
                                        <span>IP: {device.ip_address}</span>
                                        <span>Last sync: {formatLastSeen(device.last_seen)}</span>
                                    </DeviceDetails>
                                </DeviceInfo>

                                <Actions>
                                    <Button
                                        size="small"
                                        variation="secondary"
                                        onClick={() => resyncDevice(device.id)}
                                        disabled={isResyncing}
                                    >
                                        <HiOutlineArrowPath /> Resync
                                    </Button>
                                    <Button
                                        size="small"
                                        variation="secondary"
                                        disabled
                                    >
                                        <HiOutlinePower /> Restart
                                    </Button>
                                    <Button
                                        size="small"
                                        variation="danger"
                                        onClick={() => {
                                            if (window.confirm(`Remove device "${device.name}"?`)) {
                                                removeDevice(device.id);
                                            }
                                        }}
                                    >
                                        <HiOutlineTrash />
                                    </Button>
                                </Actions>
                            </DeviceCard>
                        );
                    })}
                </DeviceList>
            )}
        </Container>
    );
}
