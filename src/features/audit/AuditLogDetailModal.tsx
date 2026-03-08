import styled from "styled-components";
import { AuditLog } from "../../services/types/api-types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { HiXMark } from "react-icons/hi2";
import Button from "../../ui/Button";
import AuditDiffUser from "./components/AuditDiffUser";
import AuditDiffTeam from "./components/AuditDiffTeam";
import AuditDiffModel from "./components/AuditDiffModel";
import AuditDiffPlanning from "./components/AuditDiffPlanning";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContainer = styled.div`
  background: var(--color-grey-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  width: 90%;
  max-width: 750px;
  max-height: 85vh;
  overflow-y: auto;
  padding: 2.4rem;
  position: relative;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
`;

const Title = styled.h3`
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-grey-800);
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-grey-500);
  padding: 0.4rem;

  &:hover {
    color: var(--color-grey-800);
  }
`;

const MetadataGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
  margin-bottom: 2rem;
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const MetaLabel = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-grey-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const MetaValue = styled.span`
  font-size: 1.4rem;
  color: var(--color-grey-800);
  word-break: break-all;
`;

const ActionBadge = styled.span<{ $color: string }>`
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: var(--border-radius-sm);
  font-size: 1.2rem;
  font-weight: 600;
  background-color: ${({ $color }) => $color}20;
  color: ${({ $color }) => $color};
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid var(--color-grey-200);
  margin: 1.6rem 0;
`;

const DataSection = styled.div`
  margin-bottom: 1.6rem;
`;

const DataTitle = styled.h4`
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-grey-700);
  margin-bottom: 0.8rem;
`;

const JsonBlock = styled.pre`
  background-color: var(--color-grey-50);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 1.2rem;
  font-size: 1.2rem;
  font-family: 'Courier New', monospace;
  color: var(--color-grey-800);
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
`;

const getActionColor = (action: string): string => {
    if (action.startsWith('CREATE') || action === 'DEVICE_REGISTER') return '#22c55e';
    if (action.startsWith('UPDATE') || action.startsWith('TOGGLE') || action.startsWith('RESET') || action === 'REPORT_RENAME') return '#3b82f6';
    if (action.startsWith('DELETE') || action === 'DEVICE_BLACKLISTED') return '#ef4444';
    if (action === 'LOGIN') return '#8b5cf6';
    if (action === 'LOGOUT') return '#6b7280';
    if (action === 'LOGIN_FAILED') return '#f59e0b';
    if (action.startsWith('ATTENDANCE')) return '#06b6d4';
    if (action.startsWith('MODEL') || action.startsWith('TEAM')) return '#ec4899';
    if (action.startsWith('DEVICE')) return '#14b8a6';
    if (action.startsWith('REPORT')) return '#f97316';
    if (action.startsWith('SETTINGS')) return '#6366f1';
    return '#6b7280';
};

function formatJson(str: string | undefined): string {
    if (!str) return 'N/A';
    try {
        return JSON.stringify(JSON.parse(str), null, 2);
    } catch {
        return str;
    }
}

/** Determine which visual diff component to render based on the action type */
function getDiffType(action: string): 'user' | 'team' | 'model' | 'planning' | 'generic' {
    if (action.startsWith('UPDATE_USER') || action.startsWith('CREATE_ADMIN') ||
        action.startsWith('CREATE_EMPLOYEE') || action.startsWith('TOGGLE_STATUS') ||
        action.startsWith('RESET_PASSWORD') || action.startsWith('DELETE_USER')) {
        return 'user';
    }
    if (action.startsWith('TEAM')) return 'team';
    if (action.startsWith('MODEL')) return 'model';
    if (action.startsWith('PLANNING') || action.startsWith('ASSIGN') || action.startsWith('SCHEDULE')) return 'planning';
    return 'generic';
}

interface AuditLogDetailModalProps {
    log: AuditLog;
    onClose: () => void;
}

export default function AuditLogDetailModal({ log, onClose }: AuditLogDetailModalProps) {
    const color = getActionColor(log.action);
    const hasBefore = log.before_data && log.before_data !== '' && log.before_data !== '{}';
    const hasAfter = log.after_data && log.after_data !== '' && log.after_data !== '{}';
    const hasData = hasBefore || hasAfter;
    const diffType = getDiffType(log.action);

    const renderDiffContent = () => {
        if (!hasData) return null;

        const beforeStr = log.before_data || '{}';
        const afterStr = log.after_data || '{}';

        switch (diffType) {
            case 'user':
                return (
                    <DataSection>
                        <DataTitle>📊 Changements</DataTitle>
                        <AuditDiffUser beforeData={beforeStr} afterData={afterStr} />
                    </DataSection>
                );
            case 'team':
                return (
                    <DataSection>
                        <DataTitle>👥 Modifications d'Équipe</DataTitle>
                        <AuditDiffTeam beforeData={beforeStr} afterData={afterStr} />
                    </DataSection>
                );
            case 'model':
                return (
                    <DataSection>
                        <DataTitle>📋 Modifications du Modèle</DataTitle>
                        <AuditDiffModel beforeData={beforeStr} afterData={afterStr} />
                    </DataSection>
                );
            case 'planning':
                return (
                    <DataSection>
                        <DataTitle>📅 Modifications du Planning</DataTitle>
                        <AuditDiffPlanning beforeData={beforeStr} afterData={afterStr} />
                    </DataSection>
                );
            default:
                // Generic JSON fallback
                return (
                    <>
                        {hasBefore && hasAfter ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                                <DataSection>
                                    <DataTitle>🔴 Avant</DataTitle>
                                    <JsonBlock>{formatJson(log.before_data)}</JsonBlock>
                                </DataSection>
                                <DataSection>
                                    <DataTitle>🟢 Après</DataTitle>
                                    <JsonBlock>{formatJson(log.after_data)}</JsonBlock>
                                </DataSection>
                            </div>
                        ) : (
                            <DataSection>
                                <DataTitle>{hasBefore ? '🔴 Données Avant' : '🟢 Données Après'}</DataTitle>
                                <JsonBlock>
                                    {formatJson(hasBefore ? log.before_data : log.after_data)}
                                </JsonBlock>
                            </DataSection>
                        )}
                    </>
                );
        }
    };

    return (
        <Overlay onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <Header>
                    <div>
                        <Title>Détail du Log d'Audit</Title>
                        <ActionBadge $color={color}>{log.action}</ActionBadge>
                    </div>
                    <CloseBtn onClick={onClose}>
                        <HiXMark size={24} />
                    </CloseBtn>
                </Header>

                <MetadataGrid>
                    <MetaItem>
                        <MetaLabel>Acteur</MetaLabel>
                        <MetaValue>{log.actor_name || log.actor_id}</MetaValue>
                    </MetaItem>
                    <MetaItem>
                        <MetaLabel>Date & Heure</MetaLabel>
                        <MetaValue>
                            {format(new Date(log.created_at), "dd MMMM yyyy 'à' HH:mm:ss", { locale: fr })}
                        </MetaValue>
                    </MetaItem>
                    <MetaItem>
                        <MetaLabel>Cible (ID)</MetaLabel>
                        <MetaValue>{log.target_id || '—'}</MetaValue>
                    </MetaItem>
                    <MetaItem>
                        <MetaLabel>Type Cible</MetaLabel>
                        <MetaValue>{log.target_type || '—'}</MetaValue>
                    </MetaItem>
                    <MetaItem>
                        <MetaLabel>Adresse IP</MetaLabel>
                        <MetaValue>{log.ip_address || '—'}</MetaValue>
                    </MetaItem>
                    <MetaItem>
                        <MetaLabel>User Agent</MetaLabel>
                        <MetaValue style={{ fontSize: '1.1rem' }}>
                            {log.user_agent || '—'}
                        </MetaValue>
                    </MetaItem>
                </MetadataGrid>

                {log.description && (
                    <>
                        <Divider />
                        <DataSection>
                            <DataTitle>Description</DataTitle>
                            <MetaValue>{log.description}</MetaValue>
                        </DataSection>
                    </>
                )}

                {hasData && (
                    <>
                        <Divider />
                        {renderDiffContent()}
                    </>
                )}

                <Divider />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variation="secondary" onClick={onClose}>Fermer</Button>
                </div>
            </ModalContainer>
        </Overlay>
    );
}
