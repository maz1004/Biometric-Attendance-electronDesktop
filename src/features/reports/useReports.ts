import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
    generateReport,
} from "../../services/reports";
import { ReportData } from "../../services/types/api-types";
import toast from "react-hot-toast";

// Report parameters type
export interface ReportParams {
    start_date: string; // ISO 8601
    end_date: string; // ISO 8601
    type?: 'attendance' | 'performance' | 'planning' | 'summary';
    department?: string;
}

export function useReports() {
    const [reportData, setReportData] = useState<ReportData | null>(null);

    const { mutate: generate, isPending: isGenerating } = useMutation({
        mutationFn: (params: ReportParams) => {
            return generateReport(params);
        },
        onSuccess: (data) => {
            setReportData(data);
            toast.success("Report generated successfully");
        },
        onError: (err) => {
            console.error(err);
            toast.error("Failed to generate report");
        },
    });

    return {
        generate,
        isGenerating,
        reportData,
    };
}
