import styled from "styled-components";
import Table from "../../ui/Table";
import Tag from "../../ui/Tag";
import { AuditLog } from "../../services/types/api-types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const ClickableRow = styled.div`
  cursor: pointer;
  transition: background-color 0.15s;

  &:hover {
    background-color: var(--color-grey-50);
  }
`;

const getActionColor = (action: string): "blue" | "green" | "silver" | "yellow" | "red" | "indigo" | "cyan" => {
    if (action.startsWith('CREATE') || action === 'DEVICE_REGISTER' || action.endsWith('_CREATE')) return 'green';
    if (action.startsWith('UPDATE') || action.startsWith('TOGGLE') || action.startsWith('RESET') || action === 'REPORT_RENAME') return 'blue';
    if (action.startsWith('DELETE') || action === 'DEVICE_BLACKLISTED' || action.endsWith('_DELETE')) return 'red';
    if (action === 'LOGIN') return 'indigo';
    if (action === 'LOGOUT') return 'silver';
    if (action === 'LOGIN_FAILED') return 'yellow';
    if (action.startsWith('ATTENDANCE')) return 'cyan';
    if (action.startsWith('MODEL') || action.startsWith('TEAM')) return 'indigo';
    if (action.startsWith('ASSIGNMENT')) return 'blue';
    if (action.startsWith('PLANNING')) return 'yellow';
    if (action.startsWith('DEVICE')) return 'cyan';
    if (action.startsWith('REPORT')) return 'yellow';
    if (action.startsWith('SETTINGS')) return 'blue';
    return 'silver';
};

const getActionLabel = (action: string): string => {
    const map: Record<string, string> = {
        'CREATE_ADMIN': 'Créer Admin',
        'CREATE_EMPLOYEE': 'Créer Employé',
        'UPDATE_USER': 'Modifier Utilisateur',
        'DELETE_USER': 'Supprimer Utilisateur',
        'TOGGLE_STATUS': 'Basculer Statut',
        'RESET_PASSWORD': 'Réinitialiser MDP',
        'CREATE_DEPARTMENT': 'Créer Département',
        'DELETE_DEPARTMENT': 'Supprimer Département',
        'MODEL_CREATE': 'Créer Modèle',
        'MODEL_UPDATE': 'Modifier Modèle',
        'MODEL_DELETE': 'Supprimer Modèle',
        'TEAM_CREATE': 'Créer Équipe',
        'TEAM_UPDATE': 'Modifier Équipe',
        'TEAM_DELETE': 'Supprimer Équipe',
        'LOGIN': 'Connexion',
        'LOGOUT': 'Déconnexion',
        'LOGIN_FAILED': 'Échec Connexion',
        'REPORT_GENERATE': 'Générer Rapport',
        'REPORT_UPDATE': 'Modifier Rapport',
        'REPORT_DELETE': 'Supprimer Rapport',
        'REPORT_RENAME': 'Renommer Rapport',
        'ATTENDANCE_VALIDATE': 'Valider Présence',
        'ATTENDANCE_REJECT': 'Rejeter Présence',
        'ATTENDANCE_CREATE_JUSTIFICATION': 'Créer Justificatif',
        'ATTENDANCE_UPDATE_JUSTIFICATION': 'Modifier Justificatif',
        'ATTENDANCE_DELETE_JUSTIFICATION': 'Supprimer Justificatif',
        'DEVICE_REGISTER': 'Enregistrer Device',
        'DEVICE_UPDATE': 'Modifier Device',
        'DEVICE_DELETE': 'Supprimer Device',
        'DEVICE_BLACKLISTED': 'Blacklister Device',
        'DEVICE_WHITELISTED': 'Whitelister Device',
        'SETTINGS_UPDATE': 'Modifier Paramètres',
        'TEAM_ADD_MEMBER': 'Ajouter Membre (Équipe)',
        'TEAM_REMOVE_MEMBER': 'Retirer Membre (Équipe)',
        'ASSIGNMENT_CREATE': 'Créer Assignation',
        'ASSIGNMENT_DELETE': 'Supprimer Assignation',
        'ASSIGNMENT_BATCH_CREATE': 'Assignation (Lot)',
        'PLANNING_CREATE_EXCEPTION': 'Créer Exception',
        'PLANNING_DELETE_EXCEPTION': 'Supprimer Exception',
        'PLANNING_CREATE_HOLIDAY': 'Créer Férié',
        'PLANNING_DELETE_HOLIDAY': 'Supprimer Férié',
    };
    return map[action] || action;
};

interface AuditLogTableProps {
    logs: AuditLog[];
    onRowClick?: (log: AuditLog) => void;
}

export default function AuditLogTable({ logs, onRowClick }: AuditLogTableProps) {
    return (
        <Table columns="1.5fr 1.5fr 1fr 1fr 2fr">
            <Table.Header>
                <div>Date</div>
                <div>Acteur</div>
                <div>Action</div>
                <div>Cible</div>
                <div>Description</div>
            </Table.Header>
            <Table.Body<AuditLog>
                data={logs}
                render={(log) => (
                    <ClickableRow key={log.id} onClick={() => onRowClick?.(log)}>
                        <Table.Row>
                            <div style={{ fontSize: '1.3rem' }}>
                                {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: fr })}
                            </div>
                            <div style={{ fontWeight: 500 }}>{log.actor_name || '—'}</div>
                            <div>
                                <Tag type={getActionColor(log.action)}>
                                    {getActionLabel(log.action)}
                                </Tag>
                            </div>
                            <div style={{ fontSize: '1.2rem', color: 'var(--color-grey-500)' }}>
                                {log.target_type ? `${log.target_type}` : '—'}
                            </div>
                            <div style={{
                                fontSize: '1.3rem',
                                color: 'var(--color-grey-600)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {log.description || '—'}
                            </div>
                        </Table.Row>
                    </ClickableRow>
                )}
            />
        </Table>
    );
}
