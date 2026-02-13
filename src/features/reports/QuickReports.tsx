import { useState, useRef, useEffect } from "react";
import styled, { css, keyframes } from "styled-components";
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
import { HiCalendar, HiCalendarDays, HiClock } from "react-icons/hi2";
import Heading from "../../ui/Heading";
import { useReports } from "./useReports";
import { HoverPreviewPopover } from "./components/HoverPreviewPopover";
import { ReportActionPanel } from "./components/ReportActionPanel";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.6rem;
  margin-bottom: 2.4rem;
  position: relative;
`;

const Card = styled.div<{ $isActive: boolean }>`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.6rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;
  position: relative;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  ${props => props.$isActive && css`
    border-color: var(--color-brand-600);
    box-shadow: 0 0 0 2px var(--color-brand-600);
  `}
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  color: var(--color-brand-600);

  svg {
    width: 2.4rem;
    height: 2.4rem;
  }
`;

const CardTitle = styled.h3`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-800);
`;

const CardDescription = styled.p`
  font-size: 1.2rem;
  color: var(--color-grey-500);
  flex-grow: 1;
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(10px) translateX(-50%); }
  to { opacity: 1; transform: translateY(0) translateX(-50%); }
`;

const suckUp = keyframes`
   0% { opacity: 1; transform: translateY(0) translateX(-50%) scale(1); }
   100% { opacity: 0; transform: translateY(-20px) translateX(-50%) scale(0.8); }
`;

// Popover styled locally to handle exit animation class
const PopoverWrapper = styled.div<{ $exiting: boolean }>`
  position: absolute;
  top: calc(100% + 10px); /* Below the card */
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;

  /* Animation wrapper around the content */
  & > div { 
      ${props => !props.$exiting && css`animation: ${slideUp} 0.3s ease-out forwards;`}
      ${props => props.$exiting && css`animation: ${suckUp} 0.3s ease-in forwards;`}
  }
`;

type PeriodType = 'today' | 'week' | 'month';

interface QuickCardProps {
    period: PeriodType;
    icon: React.ReactNode;
    title: string;
    description: string;
    isActive: boolean;
    onClick: () => void;
}

const QuickCard = ({ period, icon, title, description, isActive, onClick }: QuickCardProps) => {
    const [showPopover, setShowPopover] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsExiting(false);
        setShowPopover(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => {
                setShowPopover(false);
                setIsExiting(false);
            }, 300);
        }, 1500);
    };

    return (
        <Card
            $isActive={isActive}
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {showPopover && (
                <PopoverWrapper
                    $exiting={isExiting}
                    onMouseEnter={handleMouseEnter} // Keep alive
                    onMouseLeave={handleMouseLeave}
                >
                    <HoverPreviewPopover
                        title={`Aperçu: ${title}`}
                        onMouseEnter={() => { }}
                        onMouseLeave={() => { }}
                    />
                </PopoverWrapper>
            )}
            <CardHeader>
                {icon}
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardDescription>{description}</CardDescription>
        </Card>
    );
};

export default function QuickReports() {
    const { generate, isGenerating, reportData } = useReports();
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodType | null>(null);

    // Effect to generate report when period is selected (Auto-Fetch for Preview)
    useEffect(() => {
        if (selectedPeriod) {
            handleGenerate(selectedPeriod);
        }
    }, [selectedPeriod]);

    const handleGenerate = (period: PeriodType) => {
        const now = new Date();
        let start, end;

        if (period === 'today') {
            start = startOfDay(now);
            end = endOfDay(now);
        } else if (period === 'week') {
            // Rolling 7 days
            start = new Date(now);
            start.setDate(now.getDate() - 6);
            start.setHours(0, 0, 0, 0);

            end = endOfDay(now);
        } else {
            start = startOfMonth(now);
            end = endOfMonth(now);
        }

        generate({
            type: 'summary',
            start_date: format(start, 'yyyy-MM-dd'),
            end_date: format(end, 'yyyy-MM-dd'),
            department: 'all'
        });
    };

    const getPanelTitle = () => {
        if (selectedPeriod === 'today') return "Rapport Aujourd'hui";
        if (selectedPeriod === 'week') return "Rapport Semaine";
        return "Rapport Mensuel";
    }

    return (
        <div>
            <Heading as="h2">Rapports Rapides</Heading>
            <p style={{ color: 'var(--color-grey-500)', marginBottom: '1.6rem' }}>
                Survolez pour un aperçu, cliquez pour configurer.
            </p>

            <Grid>
                <QuickCard
                    period="today"
                    icon={<HiClock />}
                    title="Aujourd'hui"
                    description="Présence et ponctualité jour J."
                    isActive={selectedPeriod === 'today'}
                    onClick={() => setSelectedPeriod(selectedPeriod === 'today' ? null : 'today')}
                />
                <QuickCard
                    period="week"
                    icon={<HiCalendarDays />}
                    title="Cette Semaine"
                    description="Vue d'ensemble Hebdomadaire."
                    isActive={selectedPeriod === 'week'}
                    onClick={() => setSelectedPeriod(selectedPeriod === 'week' ? null : 'week')}
                />
                <QuickCard
                    period="month"
                    icon={<HiCalendar />}
                    title="Ce Mois"
                    description="Bilan complet mensuel."
                    isActive={selectedPeriod === 'month'}
                    onClick={() => setSelectedPeriod(selectedPeriod === 'month' ? null : 'month')}
                />
            </Grid>

            {selectedPeriod && (
                <ReportActionPanel
                    title={getPanelTitle()}
                    description="Aperçu des données réelles. Vous pouvez télécharger le PDF ci-dessous."
                    onGenerate={() => handleGenerate(selectedPeriod)}
                    onCancel={() => setSelectedPeriod(null)}
                    isGenerating={isGenerating}
                    data={reportData}
                />
            )}
        </div>
    );
}
