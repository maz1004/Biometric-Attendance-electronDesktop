export interface Exportable<T> {
    rows: T[];
    meta?: Record<string, unknown>;
}

export interface ColumnDefinition<T> {
    header: string;
    field?: keyof T;
    width?: string; // Percentage or fixed
    align?: 'left' | 'center' | 'right';
    format?: (value: any, row: T) => string | number;
    // For CSV specifically
    value?: (row: T) => string | number | boolean;
}

export interface ReportMeta {
    companyName: string;
    reportDate: string;
    reportType: string;
    period?: string;
    generatedBy?: string;
    [key: string]: unknown;
}

export interface BaseReportProps {
    title: string;
    subtitle?: string;
    meta: ReportMeta;
}
