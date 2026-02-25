import { useState } from "react";
import styled from "styled-components";
import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import Spinner from "../../ui/Spinner";
import Pagination from "../../ui/Pagination";
import { useReportsHistory } from "./useReports";
import { GeneratedReport } from "../../services/types/api-types";
import { useSearchParams } from "react-router-dom";
import { HiTrash, HiArrowDownTray, HiCalendarDays, HiDocumentText } from "react-icons/hi2";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Heading from "../../ui/Heading";
import Row from "../../ui/Row";
import ConfirmDelete from "../../ui/ConfirmDelete";
import Modal from "../../ui/Modal";
import { HiPencil } from "react-icons/hi2";
import RenameReportForm from "./components/RenameReportForm";

const Container = styled.div`
  margin-top: 3.2rem;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  padding-bottom: 30vh;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1.2rem;
  align-items: center;
  flex-wrap: wrap;
  padding: 1.2rem;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
`;

const Select = styled.select`
  border: 1px solid var(--color-grey-300);
  background-color: var(--color-grey-0);
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1.2rem;
  box-shadow: var(--shadow-sm);
  font-size: 1.4rem;
  color: var(--color-grey-700);

  &:focus {
    outline: none;
    border-color: var(--color-brand-600);
  }
`;

const Label = styled.label`
    font-size: 1.4rem;
    font-weight: 500;
    color: var(--color-grey-600);
`;

interface ReportsHistoryTableProps {
    onPreview?: (report: GeneratedReport) => void;
}

function ReportsHistoryTable({ onPreview }: ReportsHistoryTableProps) {
    const [searchParams] = useSearchParams();
    const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

    const [type, setType] = useState<string>("all");
    const [month, setMonth] = useState<string>(String(new Date().getMonth() + 1));
    const [year, setYear] = useState<string>(String(new Date().getFullYear()));

    // Calculate dates
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (year !== "all") {
        const y = parseInt(year);
        if (month && month !== "all") {
            const m = parseInt(month) - 1;
            const start = new Date(y, m, 1);
            const end = new Date(y, m + 1, 0); // Last day of month
            startDate = format(start, 'yyyy-MM-dd');
            endDate = format(end, 'yyyy-MM-dd');
        } else {
            const start = new Date(y, 0, 1);
            const end = new Date(y, 11, 31);
            startDate = format(start, 'yyyy-MM-dd');
            endDate = format(end, 'yyyy-MM-dd');
        }
    }

    const { reports, total, isLoading, removeReport, download, rename, isRenaming } = useReportsHistory(page, 10, {
        type: type === "all" ? undefined : type,
        start_date: startDate,
        end_date: endDate
    });

    const years = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i));
    const months = [
        { value: "1", label: "Janvier" },
        { value: "2", label: "Février" },
        { value: "3", label: "Mars" },
        { value: "4", label: "Avril" },
        { value: "5", label: "Mai" },
        { value: "6", label: "Juin" },
        { value: "7", label: "Juillet" },
        { value: "8", label: "Août" },
        { value: "9", label: "Septembre" },
        { value: "10", label: "Octobre" },
        { value: "11", label: "Novembre" },
        { value: "12", label: "Décembre" },
    ];

    if (isLoading) return <Spinner />;

    return (
        <Container>
            <Row type="horizontal">
                <Heading as="h2">Historique des Rapports</Heading>
            </Row>

            <FilterBar>
                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                    <HiCalendarDays />
                    <Label>Année:</Label>
                    <Select value={year} onChange={(e) => setYear(e.target.value)}>
                        <option value="all">Toutes</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </Select>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                    <Label>Mois:</Label>
                    <Select value={month} onChange={(e) => setMonth(e.target.value)} disabled={year === "all"}>
                        <option value="all">Tous</option>
                        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </Select>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginLeft: "auto" }}>
                    <HiDocumentText />
                    <Label>Type:</Label>
                    <Select value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="all">Tous les types</option>
                        <option value="daily">Journalier</option>
                        <option value="weekly">Hebdomadaire</option>
                        <option value="monthly">Mensuel</option>
                    </Select>
                </div>
            </FilterBar>

            <Menus>
                <Table columns="1.5fr 1fr 1fr 1fr 1fr 0.5fr">
                    <Table.Header>
                        <div>Fichier</div>
                        <div>Période</div>
                        <div>Type</div>
                        <div>Généré le</div>
                        <div>Filtres</div>
                        <div>Actions</div>
                    </Table.Header>

                    {!reports || reports.length === 0 ? (
                        <Table.Row>
                            <div style={{
                                gridColumn: '1 / -1',
                                padding: '4rem 2rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '1.2rem',
                                color: 'var(--color-grey-500)'
                            }}>
                                <HiDocumentText style={{ fontSize: '4.8rem', opacity: 0.5 }} />
                                <div style={{ fontSize: '1.6rem', fontWeight: 500 }}>
                                    Aucun rapport trouvé
                                </div>
                                <div style={{ fontSize: '1.4rem', maxWidth: '400px', textAlign: 'center' }}>
                                    Générez un rapport manuellement via l'onglet "Rapides" ou "avancé", ou attendez la génération automatique planifiée.
                                </div>
                            </div>
                        </Table.Row>
                    ) : (
                        <Table.Body<GeneratedReport>
                            data={reports}
                            render={(report) => (
                                <Table.Row
                                    key={report.id}
                                    onClick={() => onPreview?.(report)}
                                    style={{ cursor: onPreview ? 'pointer' : 'default' }}
                                >
                                    <div style={{ fontWeight: 500 }}>{report.file_name}</div>
                                    <div>
                                        {format(new Date(report.period_start), 'dd/MM/yyyy')} - {format(new Date(report.period_end), 'dd/MM/yyyy')}
                                    </div>
                                    <div style={{ textTransform: 'capitalize' }}>
                                        {report.type === 'daily' ? 'Journalier' :
                                            report.type === 'weekly' ? 'Hebdo' :
                                                report.type === 'monthly' ? 'Mensuel' : report.type}
                                    </div>
                                    <div>{format(new Date(report.generated_at), 'dd/MM/yyyy HH:mm', { locale: fr })}</div>
                                    <div style={{ fontSize: '1.2rem', color: 'var(--color-grey-500)' }}>
                                        {report.filter_tags}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.4rem' }} onClick={(e) => e.stopPropagation()}>
                                        <Modal>
                                            <Menus.Menu>
                                                <Menus.Toggle id={report.id} />
                                                <Menus.List id={report.id}>
                                                    <Menus.Button
                                                        icon={<HiArrowDownTray />}
                                                        onClick={() => download({ id: report.id, filename: report.file_name })}
                                                    >
                                                        Télécharger
                                                    </Menus.Button>

                                                    <Modal.Open opens="rename-report">
                                                        <Menus.Button icon={<HiPencil />}>Renommer</Menus.Button>
                                                    </Modal.Open>

                                                    <Modal.Open opens="delete-report">
                                                        <Menus.Button icon={<HiTrash />}>Supprimer</Menus.Button>
                                                    </Modal.Open>
                                                </Menus.List>
                                            </Menus.Menu>

                                            <Modal.Window name="rename-report">
                                                <RenameReportForm
                                                    report={report}
                                                    onConfirm={rename}
                                                    isRenaming={isRenaming}
                                                />
                                            </Modal.Window>

                                            <Modal.Window name="delete-report">
                                                <ConfirmDelete
                                                    resourceName="rapport"
                                                    onConfirm={() => removeReport(report.id)}
                                                    disabled={false}
                                                    onCloseModal={() => { }}
                                                />
                                            </Modal.Window>
                                        </Modal>
                                    </div>
                                </Table.Row>
                            )}
                        />
                    )}

                    <Table.Footer>
                        <Pagination count={total} />
                    </Table.Footer>
                </Table>
            </Menus>
        </Container>
    );
}

export default ReportsHistoryTable;
