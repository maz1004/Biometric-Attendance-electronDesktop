import { useState } from "react";
import { createPortal } from "react-dom";
import { HiXMark } from "react-icons/hi2";
import styled, { keyframes } from "styled-components";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { HiArrowUpTray, HiEye } from "react-icons/hi2";
import toast from "react-hot-toast";

import Button from "../../ui/Button";
import Spinner from "../../ui/Spinner";
import SpinnerMini from "../../ui/SpinnerMini";
import { getHistory } from "../../services/attendance";
import { getJustifications, justifyAbsence } from "../../services/employees";
import { Employee } from "./EmployeeTypes";
import { API_BASE_URL } from "../../services/config/api";

const Container = styled.div`
  width: 800px;
  height: 600px;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  
  h2 {
    font-size: 2rem;
    font-weight: 600;
  }
`;

const TableContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-sm);

  /* Custom Scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: var(--color-grey-100);
  }
  &::-webkit-scrollbar-thumb {
    background: var(--color-grey-300);
    border-radius: 4px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 1.4rem;

  th {
    text-align: left;
    padding: 1.2rem;
    background: var(--color-grey-50);
    color: var(--color-grey-600);
    font-weight: 600;
    position: sticky;
    top: 0;
    z-index: 10;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }

  td {
    padding: 1.2rem;
    border-bottom: 1px solid var(--color-grey-100);
    color: var(--color-grey-600);
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const Badge = styled.span<{ status: "justified" | "unjustified" | "pending" }>`
  padding: 0.4rem 0.8rem;
  border-radius: 100px;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => props.status === "justified" && `
    background: var(--color-green-100);
    color: var(--color-green-700);
  `}
  
  ${props => props.status === "unjustified" && `
    background: var(--color-red-100);
    color: var(--color-red-700);
  `}

  ${props => props.status === "pending" && `
    background: var(--color-yellow-100);
    color: var(--color-yellow-700);
  `}
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: var(--color-brand-600);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    text-decoration: underline;
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  animation: ${fadeIn} 0.3s ease-out;
  z-index: 99999;
  animation: ${fadeIn} 0.3s ease-out;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  background: none;
  border: none;
  color: var(--color-grey-500);
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 50%;
  &:hover {
    background: var(--color-grey-100);
    color: var(--color-grey-700);
  }
`;

const ModalContent = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);
  padding: 3.2rem;
  width: 50rem;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  animation: ${slideUp} 0.4s cubic-bezier(0.21, 1.02, 0.73, 1);
  position: relative;
  
  h3 {
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--color-grey-800);
  }

  label {
    font-size: 1.4rem;
    font-weight: 500;
    color: var(--color-grey-700);
  }
`;

const TextArea = styled.textarea`
  padding: 0.8rem 1.2rem;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-grey-0);
  color: var(--color-grey-700);
  box-shadow: var(--shadow-sm);
  width: 100%;
  resize: vertical;
  min-height: 8rem;

  &:focus {
    outline: 2px solid var(--color-brand-600);
    outline-offset: -1px;
  }
`;

const FileInput = styled.input`
  font-size: 1.4rem;
  color: var(--color-grey-500);

  &::file-selector-button {
    font: inherit;
    font-weight: 500;
    padding: 0.8rem 1.2rem;
    margin-right: 1.2rem;
    border-radius: var(--border-radius-sm);
    border: none;
    color: var(--color-brand-50);
    background-color: var(--color-brand-600);
    cursor: pointer;
    transition: color 0.2s, background-color 0.2s;

    &:hover {
      background-color: var(--color-brand-700);
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
  margin-top: 1.2rem;
`;

const PreviewContainer = styled.div`
  width: 100%;
  height: 300px;
  background: var(--color-grey-50);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
`;

interface AbsenceHistoryViewProps {
    employee: Employee;
    onCloseModal?: () => void;
}

export default function AbsenceHistoryView({ employee, onCloseModal }: AbsenceHistoryViewProps) {
    const queryClient = useQueryClient();
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [justificationFile, setJustificationFile] = useState<File | null>(null);
    const [justificationReason, setJustificationReason] = useState("");
    const [isJustifyModalOpen, setIsJustifyModalOpen] = useState(false);

    // For Viewing Justification
    const [viewJustification, setViewJustification] = useState<any | null>(null);

    // Fetch Attendance History (last 30 days default)
    const { data: history, isLoading: isLoadingHistory } = useQuery({
        queryKey: ['attendanceHistory', employee.id],
        queryFn: () => getHistory({
            user_id: employee.id,
            start_date: subDays(new Date(), 30).toISOString(),
            end_date: new Date().toISOString()
        })
    });

    // Fetch Justifications
    const { data: justifications, isLoading: isLoadingJustifs } = useQuery({
        queryKey: ['justifications', employee.id],
        queryFn: () => getJustifications(employee.id)
    });

    const { mutate: submitJustification, isPending: isSubmitting } = useMutation({
        mutationFn: async () => {
            if (!selectedDate || !justificationFile || !justificationReason) return;

            const reader = new FileReader();
            return new Promise((resolve, reject) => {
                reader.onload = async () => {
                    try {
                        const base64 = reader.result?.toString().split(',')[1];
                        await justifyAbsence(employee.id, {
                            date: selectedDate,
                            reason: justificationReason,
                            doc_data: base64,
                            file_name: justificationFile.name
                        });
                        resolve(true);
                    } catch (e) {
                        reject(e);
                    }
                };
                reader.readAsDataURL(justificationFile);
            });
        },
        onSuccess: () => {
            toast.success("Justification sent successfully");
            queryClient.invalidateQueries({ queryKey: ['justifications'] });
            setIsJustifyModalOpen(false);
            setJustificationFile(null);
            setJustificationReason("");
        },
        onError: (err: any) => toast.error("Failed: " + err.message)
    });

    if (isLoadingHistory || isLoadingJustifs) return <Spinner />;

    // Merge Data: Generate daily records and identify absences
    const records = history?.records || [];

    // Generate dates for the period (last 30 days or since creation)
    const today = new Date();
    // Use createdAt if more recent than 30 days ago to avoid false absences before hire
    const hireDate = employee?.createdAt ? new Date(employee.createdAt) : subDays(today, 30);
    const thirtyDaysAgo = subDays(today, 30);

    // Start date is the later of: 30 days ago OR hire date
    let startDate = hireDate > thirtyDaysAgo ? hireDate : thirtyDaysAgo;

    // Ensure we don't start in the future (sanity check)
    if (startDate > today) startDate = today;

    // Helper to check if a date has a record
    const hasRecordForDate = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return records.some((r: any) => {
            const rDate = r.check_in_time || r.date;
            return rDate?.startsWith(dateStr);
        });
    };

    // Helper: isWeekend (0 = Sunday, 6 = Saturday)
    const isWeekend = (date: Date) => {
        const day = date.getDay();
        return day === 0 || day === 6;
    };

    const absentRecords = [];

    // Iterate from Start Date to Yesterday (Today is not an absence yet unless over)
    // We iterate up to today included to show today's absence if relevant
    const tempDate = new Date(startDate);

    while (tempDate <= today) {
        // Skip future dates if any
        if (tempDate > today) break;

        // Skip weekends for absence calculation (assuming standard M-F work week)
        if (!isWeekend(tempDate)) {
            // Check if we have a record
            if (!hasRecordForDate(tempDate)) {
                const dateStr = format(tempDate, 'yyyy-MM-dd');
                // Only add if it's strictly in the past, OR if it's today and late in the day (optional logic, sticking to past/today)
                // For simplicity, we flag all non-records as potential absences
                absentRecords.push({
                    date: dateStr,
                    status: 'absent',
                    type: 'No Show'
                });
            }
        }

        // Next day
        tempDate.setDate(tempDate.getDate() + 1);
    }

    // Reverse to show newest first
    absentRecords.reverse();

    const getJustificationForDate = (date: string) => {
        // Robust comparison: check YYYY-MM-DD
        // API returns PascalCase (Go defaults) but frontend types might be snake_case
        return justifications?.find((j: any) => {
            const rawDate = j.AttendanceDate || j.attendance_date;
            if (!rawDate) return false;

            const jDate = rawDate.includes('T')
                ? rawDate.split('T')[0]
                : rawDate;

            return jDate === date;
        });
    };

    return (
        <Container>
            <Header>
                <h2>Absence History</h2>
                <Button variation="secondary" size="small" onClick={onCloseModal}>Back</Button>
            </Header>

            <TableContainer>
                <Table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {absentRecords.length === 0 ? (
                            <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>No absences detected in this period.</td></tr>
                        ) : (
                            absentRecords.map((record: any) => {
                                const dateStr = record.date;
                                const justif = getJustificationForDate(dateStr);

                                return (
                                    <tr
                                        key={dateStr}
                                        onClick={() => justif && setViewJustification(justif)}
                                        style={{
                                            cursor: justif ? 'pointer' : 'default',
                                            transition: 'background-color 0.2s'
                                        }}
                                        className={justif ? "hover:bg-gray-50" : ""}
                                        onMouseEnter={(e) => {
                                            if (justif) e.currentTarget.style.backgroundColor = 'var(--color-grey-50)';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (justif) e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        <td>{format(new Date(dateStr), 'dd MMM yyyy')}</td>
                                        <td>{record.type}</td>
                                        <td>
                                            {justif ? (
                                                <Badge status="justified">Justified</Badge>
                                            ) : (
                                                <Badge status="unjustified">Unjustified</Badge>
                                            )}
                                        </td>
                                        <td>
                                            {justif ? (
                                                <ActionButton type="button" onClick={(e) => {
                                                    e.stopPropagation(); // Prevent double trigger
                                                    setViewJustification(justif);
                                                }}>
                                                    <HiEye /> View Details
                                                </ActionButton>
                                            ) : (
                                                <ActionButton type="button" onClick={(e) => {
                                                    e.stopPropagation(); // Prevent row click if we add one later for non-justified
                                                    setSelectedDate(dateStr);
                                                    setIsJustifyModalOpen(true);
                                                }}>
                                                    <HiArrowUpTray /> Justify
                                                </ActionButton>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </Table>
            </TableContainer>

            {isJustifyModalOpen && createPortal(
                <ModalOverlay>
                    <ModalContent onMouseDown={(e) => e.stopPropagation()}>
                        <CloseButton onClick={() => setIsJustifyModalOpen(false)}>
                            <HiXMark size={24} />
                        </CloseButton>
                        <h3>Justify Absence: {selectedDate}</h3>

                        <div>
                            <label>Reason</label>
                            <TextArea
                                value={justificationReason}
                                onChange={e => setJustificationReason(e.target.value)}
                                placeholder="Explain the reason for absence..."
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.8rem' }}>Document (Image/PDF)</label>
                            <FileInput
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) => setJustificationFile(e.target.files?.[0] || null)}
                            />
                        </div>

                        <ButtonGroup>
                            <Button variation="secondary" onClick={() => setIsJustifyModalOpen(false)}>Cancel</Button>
                            <Button
                                onClick={() => submitJustification()}
                                disabled={isSubmitting || !justificationFile || !justificationReason}
                            >
                                {isSubmitting ? <SpinnerMini /> : "Submit"}
                            </Button>
                        </ButtonGroup>
                    </ModalContent>
                </ModalOverlay>,
                document.body
            )}

            {viewJustification && createPortal(
                <ModalOverlay>
                    <ModalContent onMouseDown={(e) => e.stopPropagation()}>
                        <CloseButton onClick={() => setViewJustification(null)}>
                            <HiXMark size={24} />
                        </CloseButton>
                        <h3>Justification Details</h3>

                        <div>
                            <label>Date</label>
                            <div style={{ fontWeight: 600, fontSize: '1.6rem' }}>
                                {format(new Date(viewJustification.AttendanceDate || viewJustification.attendance_date), 'dd MMM yyyy')}
                            </div>
                        </div>

                        <div>
                            <label>Reason</label>
                            <div style={{
                                background: 'var(--color-grey-50)',
                                padding: '1rem',
                                borderRadius: 'var(--border-radius-sm)',
                                border: '1px solid var(--color-grey-200)'
                            }}>
                                {viewJustification.Reason || viewJustification.reason}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.8rem' }}>Document</label>
                            <PreviewContainer>
                                {(() => {
                                    const rawUrl = viewJustification.DocumentURL || viewJustification.document_url || '';
                                    const fullUrl = rawUrl.startsWith('http') ? rawUrl : `${API_BASE_URL}${rawUrl}`;

                                    return fullUrl.toLowerCase().endsWith('.pdf') ? (
                                        <object data={fullUrl} type="application/pdf" width="100%" height="100%">
                                            <div style={{ padding: '2rem', textAlign: 'center' }}>
                                                <p>Preview not available.</p>
                                                <a href={fullUrl} target="_blank" rel="noopener noreferrer">Click here to view PDF</a>
                                            </div>
                                        </object>
                                    ) : (
                                        <img src={fullUrl} alt="Justification Proof" />
                                    );
                                })()}
                            </PreviewContainer>
                            <div style={{ marginTop: '0.8rem', textAlign: 'right' }}>
                                {(() => {
                                    const rawUrl = viewJustification.DocumentURL || viewJustification.document_url || '';
                                    const fullUrl = rawUrl.startsWith('http') ? rawUrl : `${API_BASE_URL}${rawUrl}`;

                                    return (
                                        <a
                                            href={fullUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: 'var(--color-brand-600)', fontWeight: 600, fontSize: '1.2rem', textDecoration: 'underline' }}
                                        >
                                            Download / Open Full
                                        </a>
                                    );
                                })()}
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button variation="secondary" onClick={() => setViewJustification(null)}>Close</Button>
                        </div>
                    </ModalContent>
                </ModalOverlay>,
                document.body
            )}
        </Container>
    );
}
