import React from "react";
import styled from "styled-components";
import { UserReportData, DailyReportRecord } from "../../../services/types/api-types";
import { HiCheckCircle, HiXCircle, HiCalendar, HiExclamationCircle } from "react-icons/hi";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
  width: 100%;
  color: var(--color-grey-800);
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  background: var(--color-grey-0);
  padding: 2.4rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  gap: 2.4rem;
  align-items: center;
`;

const AvatarPlaceholder = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: var(--color-brand-100);
  color: var(--color-brand-700);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.2rem;
  font-weight: 700;
  margin: 0 auto;
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;

  h2 {
    font-size: 2.4rem;
    font-weight: 700;
    color: var(--color-grey-900);
    margin: 0;
  }

  p {
    font-size: 1.4rem;
    color: var(--color-grey-600);
    margin: 0;
  }

  .badge {
    display: inline-flex;
    padding: 0.4rem 0.8rem;
    border-radius: 9999px;
    background-color: var(--color-grey-100);
    font-size: 1.2rem;
    font-weight: 600;
    width: fit-content;
  }
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.6rem;
`;

const StatCard = styled.div<{ $color?: string }>`
  background: var(--color-grey-0);
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  border-top: 4px solid ${props => props.$color || "var(--color-brand-500)"};

  .title {
    font-size: 1.3rem;
    color: var(--color-grey-500);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .value {
    font-size: 2.8rem;
    font-weight: 700;
    color: var(--color-grey-900);
    display: flex;
    align-items: baseline;
    gap: 0.4rem;

    span {
      font-size: 1.4rem;
      font-weight: 500;
      color: var(--color-grey-400);
    }
  }
`;

const TableContainer = styled.div`
  background: var(--color-grey-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
`;

const TableHeader = styled.div`
  padding: 1.6rem 2.4rem;
  background-color: var(--color-grey-50);
  border-bottom: 1px solid var(--color-grey-200);
  font-weight: 600;
  font-size: 1.6rem;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 1.2rem 2.4rem;
    text-align: left;
    border-bottom: 1px solid var(--color-grey-100);
  }

  th {
    color: var(--color-grey-500);
    font-weight: 600;
    font-size: 1.2rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  td {
    font-size: 1.4rem;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 1.2rem;
  border-radius: 9999px;
  font-size: 1.2rem;
  font-weight: 600;

  ${props => {
    switch (props.$status.toLowerCase()) {
      case 'present': return `background-color: var(--color-green-100); color: var(--color-green-700);`;
      case 'absent': return `background-color: var(--color-red-100); color: var(--color-red-700);`;
      case 'weekend': return `background-color: var(--color-silver-100); color: var(--color-silver-700);`;
      case 'holiday': return `background-color: var(--color-indigo-100); color: var(--color-indigo-700);`;
      default: return `background-color: var(--color-amber-100); color: var(--color-amber-700);`; // Exceptions/Leaves
    }
  }}
`;

interface PersonalEmployeeHTMLPreviewProps {
  data: UserReportData;
  period: string;
}

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleDateString("fr-FR", { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTime = (dateString?: string) => {
  if (!dateString) return "--:--";
  const d = new Date(dateString);
  return d.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' });
};

export const PersonalEmployeeHTMLPreview: React.FC<PersonalEmployeeHTMLPreviewProps> = ({ data, period }) => {
  if (!data) return null;

  return (
    <Container>
      <ProfileGrid>
        <div>
          <AvatarPlaceholder>
            {data.user_name.charAt(0).toUpperCase()}
          </AvatarPlaceholder>
        </div>
        <ProfileInfo>
          <h2>{data.user_name}</h2>
          <p>{data.profession || 'Employé régulier'}</p>
          <div style={{ display: 'flex', gap: '1.6rem', marginTop: '0.4rem', color: 'var(--color-grey-500)', fontSize: '1.3rem' }}>
            {data.email && <span>{data.email}</span>}
            {data.phone && <span>• {data.phone}</span>}
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.8rem' }}>
            <span className="badge">{data.department || 'Département Global'}</span>
            <span className="badge" style={{ background: 'var(--color-brand-100)', color: 'var(--color-brand-700)' }}>
              Efficacité: {data.efficiency_score.toFixed(1)}%
            </span>
          </div>
        </ProfileInfo>
      </ProfileGrid>

      <CardsGrid>
        <StatCard $color="var(--color-blue-700)">
          <span className="title">Temps de Travail</span>
          <div className="value">{data.total_work_hours.split('h')[0]}<span>h {data.total_work_hours.split('h')[1]}</span></div>
        </StatCard>
        <StatCard $color="var(--color-green-700)">
          <span className="title">Jours Présents</span>
          <div className="value">{data.present_days}<span> jours</span></div>
        </StatCard>
        <StatCard $color="var(--color-amber-700)">
          <span className="title">Retards</span>
          <div className="value">{data.late_arrivals}<span> jours</span></div>
        </StatCard>
        <StatCard $color="var(--color-red-700)">
          <span className="title">Absences (Non Justifiées)</span>
          <div className="value">{data.absent_days}<span> jours</span></div>
        </StatCard>
      </CardsGrid>

      <TableContainer>
        <TableHeader>
          Bilan Quotidien - {period}
        </TableHeader>
        <div style={{ overflowX: 'auto' }}>
          <StyledTable>
            <thead>
              <tr>
                <th>Date</th>
                <th>Statut</th>
                <th>Entrée</th>
                <th>Sortie</th>
                <th>Durée</th>
                <th>Observations / Justificatif</th>
              </tr>
            </thead>
            <tbody>
              {data.daily_records?.map((record: DailyReportRecord, index: number) => {
                let icon = null;
                if (record.status === 'Present') icon = <HiCheckCircle />;
                else if (record.status === 'Absent') icon = <HiXCircle />;
                else if (record.status === 'Weekend') icon = <HiCalendar />;
                else icon = <HiExclamationCircle />;

                return (
                  <tr key={index}>
                    <td><strong>{formatDate(record.date)}</strong></td>
                    <td>
                      <StatusBadge $status={record.status}>
                        {icon} {record.status}
                      </StatusBadge>
                    </td>
                    <td>{formatTime(record.check_in)}</td>
                    <td>{formatTime(record.check_out)}</td>
                    <td>{record.work_duration_hours > 0 ? `${Math.floor(record.work_duration_hours)}h${Math.round((record.work_duration_hours % 1) * 60).toString().padStart(2, '0')}` : "-"}</td>
                    <td style={{ color: 'var(--color-grey-500)', fontSize: '1.2rem' }}>
                      {record.is_late && <span style={{ color: '#d97706', marginRight: '8px', fontWeight: 600 }}>[RETARD]</span>}
                      {record.is_early_departure && <span style={{ color: '#d97706', marginRight: '8px', fontWeight: 600 }}>[DÉPART ANTICIPÉ]</span>}
                      {record.justification || "-"}
                    </td>
                  </tr>
                );
              })}
              {(!data.daily_records || data.daily_records.length === 0) && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3.2rem', color: 'var(--color-grey-400)' }}>
                    Aucune donnée quotidienne disponible.
                  </td>
                </tr>
              )}
            </tbody>
          </StyledTable>
        </div>
      </TableContainer>
    </Container>
  );
};
