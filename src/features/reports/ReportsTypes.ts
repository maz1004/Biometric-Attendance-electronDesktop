// Backend supports: 'attendance' | 'performance' | 'planning' | 'summary'
export type ReportType = 'attendance' | 'performance' | 'planning' | 'summary';
export type ReportPeriod = 'day' | 'week' | 'month' | 'year';

export interface ReportFilterState {
    type: ReportType;
    period: ReportPeriod;
    dateRange: {
        start: Date;
        end: Date;
    };
    department: string;
}

export interface ReportSummary {
    totalEmployees: number;
    present: number;
    absent: number;
    late: number;
    presenceRate: number;
}
