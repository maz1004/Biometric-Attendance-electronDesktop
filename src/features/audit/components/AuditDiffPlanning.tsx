import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const TimelineRow = styled.div<{ $changed: boolean }>`
  display: grid;
  grid-template-columns: 1fr auto 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 0.8rem 1rem;
  border-radius: var(--border-radius-sm);
  border-left: 4px solid ${({ $changed }) => $changed ? '#f59e0b' : 'var(--color-grey-200)'};
  background: ${({ $changed }) => $changed ? '#fffbeb' : 'var(--color-grey-50)'};
`;

const DateRange = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--color-grey-700);
`;

const ModelTag = styled.span<{ $variant?: 'before' | 'after' | 'same' }>`
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: var(--border-radius-sm);
  font-size: 1.1rem;
  font-weight: 600;
  ${({ $variant }) => {
        if ($variant === 'before') return `
      background-color: #fef2f2;
      color: #dc2626;
      text-decoration: line-through;
    `;
        if ($variant === 'after') return `
      background-color: #f0fdf4;
      color: #16a34a;
    `;
        return `
      background-color: var(--color-grey-100);
      color: var(--color-grey-600);
    `;
    }}
`;

const Arrow = styled.span`
  color: var(--color-grey-400);
  font-size: 1.4rem;
`;

const Badge = styled.span<{ $type: 'holiday' | 'exception' | 'overwrite' }>`
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: var(--border-radius-sm);
  font-size: 1rem;
  font-weight: 500;
  margin-left: 0.4rem;
  ${({ $type }) => {
        if ($type === 'holiday') return `background: #dbeafe; color: #2563eb;`;
        if ($type === 'exception') return `background: #fef3c7; color: #d97706;`;
        return `background: #fce7f3; color: #be185d;`;
    }}
`;

const EmptyMsg = styled.span`
  color: var(--color-grey-400);
  font-style: italic;
  font-size: 1.2rem;
  padding: 0.5rem;
`;

interface PlanningEntry {
    start_date?: string;
    end_date?: string;
    model_name?: string;
    model_id?: string;
    type?: 'normal' | 'holiday' | 'exception' | 'overwrite';
}

interface PlanningData {
    entries?: PlanningEntry[];
    assignments?: PlanningEntry[];
}

interface AuditDiffPlanningProps {
    beforeData: string;
    afterData: string;
}

function getEntries(data: PlanningData): PlanningEntry[] {
    return data.entries || data.assignments || [];
}

function formatDate(d?: string): string {
    if (!d) return '—';
    try {
        return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return d;
    }
}

export default function AuditDiffPlanning({ beforeData, afterData }: AuditDiffPlanningProps) {
    let before: PlanningData = {};
    let after: PlanningData = {};

    try { before = JSON.parse(beforeData); } catch { /* empty */ }
    try { after = JSON.parse(afterData); } catch { /* empty */ }

    const beforeEntries = getEntries(before);
    const afterEntries = getEntries(after);

    // Support ASSIGNMENT_BATCH_CREATE summary format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const batchAfter = after as any;
    if (batchAfter.success_count !== undefined) {
        const title = batchAfter.min_date === batchAfter.max_date
            ? `Assignation par lot le ${batchAfter.min_date}`
            : `Assignation par lot du ${batchAfter.min_date} au ${batchAfter.max_date}`;

        return (
            <Container>
                <div style={{ padding: '1.2rem', background: 'var(--color-grey-50)', borderRadius: 'var(--border-radius-sm)', borderLeft: '4px solid #10b981' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--color-grey-800)', marginBottom: '0.4rem' }}>{title}</div>
                    <div style={{ color: 'var(--color-grey-600)', fontSize: '1.2rem' }}>
                        <span style={{ color: '#16a34a', fontWeight: 600 }}>{batchAfter.success_count} assignations créées</span>
                        {batchAfter.failed_count > 0 && <span style={{ color: '#dc2626', marginLeft: '1rem' }}>({batchAfter.failed_count} échecs ignorés)</span>}
                    </div>
                </div>
            </Container>
        );
    }

    // Match entries by date range
    const allDateRanges = new Map<string, { before?: PlanningEntry; after?: PlanningEntry }>();

    beforeEntries.forEach(e => {
        const key = `${e.start_date}_${e.end_date}`;
        allDateRanges.set(key, { ...allDateRanges.get(key), before: e });
    });

    afterEntries.forEach(e => {
        const key = `${e.start_date}_${e.end_date}`;
        allDateRanges.set(key, { ...allDateRanges.get(key), after: e });
    });

    const entries = Array.from(allDateRanges.entries());

    if (entries.length === 0) {
        return <EmptyMsg>Aucune donnée de planning disponible</EmptyMsg>;
    }

    return (
        <Container>
            {entries.map(([key, { before: b, after: a }]) => {
                const changed = JSON.stringify(b) !== JSON.stringify(a);
                const beforeModel = b?.model_name || b?.model_id || '—';
                const afterModel = a?.model_name || a?.model_id || '—';
                const dateStart = formatDate(b?.start_date || a?.start_date);
                const dateEnd = formatDate(b?.end_date || a?.end_date);
                const afterType = a?.type;

                return (
                    <TimelineRow key={key} $changed={changed}>
                        <DateRange>
                            📅 {dateStart} → {dateEnd}
                        </DateRange>
                        <ModelTag $variant={changed ? 'before' : 'same'}>
                            {beforeModel}
                        </ModelTag>
                        {changed && (
                            <>
                                <Arrow>→</Arrow>
                                <div>
                                    <ModelTag $variant="after">{afterModel}</ModelTag>
                                    {afterType === 'holiday' && <Badge $type="holiday">Congé</Badge>}
                                    {afterType === 'exception' && <Badge $type="exception">Exception</Badge>}
                                    {afterType === 'overwrite' && <Badge $type="overwrite">Overwrite</Badge>}
                                </div>
                            </>
                        )}
                        {!changed && (
                            <>
                                <span></span>
                                <span style={{ color: 'var(--color-grey-400)', fontSize: '1.1rem' }}>Inchangé</span>
                            </>
                        )}
                    </TimelineRow>
                );
            })}
        </Container>
    );
}
