import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
    generateReport,
    exportReport,
    generateReportFilename,
    type ReportData,
} from "../../services/reports";
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
    const [lastParams, setLastParams] = useState<ReportParams | null>(null);

    const { mutate: generate, isPending: isGenerating } = useMutation({
        mutationFn: (params: ReportParams) => {
            setLastParams(params);
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

    const { mutate: download, isPending: isDownloading } = useMutation({
        mutationFn: async (format: "pdf" | "excel") => {
            if (!lastParams) throw new Error("No report generated yet");

            const blob = await exportReport({
                start_date: lastParams.start_date,
                end_date: lastParams.end_date,
                format,
                type: lastParams.type,
                department: lastParams.department,
            });

            // Download the file
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                generateReportFilename(
                    lastParams.type || 'report',
                    format,
                    lastParams.start_date,
                    lastParams.end_date
                )
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        },
        onSuccess: () => {
            toast.success("Report downloaded");
        },
        onError: () => {
            toast.error("Failed to download report");
        },
    });

    return {
        generate,
        isGenerating,
        reportData,
        download,
        isDownloading,
    };
}
