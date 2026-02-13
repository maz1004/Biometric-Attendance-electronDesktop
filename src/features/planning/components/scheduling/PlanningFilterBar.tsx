import styled from 'styled-components';
import { HiEye, HiEyeSlash } from 'react-icons/hi2';
import { useTranslation } from 'react-i18next';

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background-color: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border-element);
  font-size: 0.85rem;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ToggleButton = styled.button<{ $active: boolean; $color: string }>`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid ${p => p.$active ? p.$color : 'var(--color-border-element)'};
  background-color: ${p => p.$active ? `${p.$color}15` : 'transparent'};
  color: ${p => p.$active ? p.$color : 'var(--color-text-secondary)'};
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;

  &:hover {
    background-color: ${p => p.$active ? `${p.$color}25` : 'var(--color-bg-hover)'};
  }
`;

interface PlanningFilterBarProps {
    filters: {
        showShifts: boolean;
        showExceptions: boolean;
        showHolidays: boolean;
    };
    onFilterChange: (key: keyof PlanningFilterBarProps['filters'], value: boolean) => void;
}

export default function PlanningFilterBar({ filters, onFilterChange }: PlanningFilterBarProps) {
    const { t } = useTranslation();

    return (
        <Container>
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600, marginRight: '0.5rem' }}>{t("planning.filters.display_label")}:</span>

            <FilterGroup>
                <ToggleButton
                    $active={filters.showShifts}
                    $color="#3b82f6"
                    onClick={() => onFilterChange('showShifts', !filters.showShifts)}
                >
                    {filters.showShifts ? <HiEye /> : <HiEyeSlash />}
                    {t("planning.filters.show_shifts")}
                </ToggleButton>

                <ToggleButton
                    $active={filters.showExceptions}
                    $color="#f59e0b"
                    onClick={() => onFilterChange('showExceptions', !filters.showExceptions)}
                >
                    {filters.showExceptions ? <HiEye /> : <HiEyeSlash />}
                    {t("planning.filters.show_exceptions")}
                </ToggleButton>

                <ToggleButton
                    $active={filters.showHolidays}
                    $color="#ef4444"
                    onClick={() => onFilterChange('showHolidays', !filters.showHolidays)}
                >
                    {filters.showHolidays ? <HiEye /> : <HiEyeSlash />}
                    {t("planning.filters.show_holidays")}
                </ToggleButton>
            </FilterGroup>
        </Container>
    );
}
