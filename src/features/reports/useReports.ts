import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    generateReport,
    getReportsHistory,
    deleteReport,
    downloadReportFile,
    saveReport,
    renameReport
} from "../../services/reports";
import { ReportData } from "../../services/types/api-types";
import toast from "react-hot-toast";

// Report parameters type
export interface ReportParams {
    start_date: string; // ISO 8601
    end_date: string; // ISO 8601
    type?: 'attendance' | 'planning' | 'summary' | 'personal_employee';
    department?: string;
    employee_id?: string;
    team_ids?: string[];
    user_ids?: string[];
    site_id?: string;
}

export function useReports() {
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const queryClient = useQueryClient();

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

    const { mutateAsync: save, isPending: isSaving } = useMutation({
        mutationFn: ({ file, metadata }: { file: Blob, metadata: any }) => saveReport(file, metadata),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reports-history'] });
            toast.success("Rapport enregistré dans l'historique");
        },
        onError: (err) => {
            console.error(err);
            toast.error("Erreur lors de l'enregistrement");
        }
    });

    return {
        generate,
        isGenerating,
        reportData,
        save,
        isSaving
    };
}

export function useReportsHistory(page: number, limit: number, filters: { type?: string, start_date?: string, end_date?: string, genre?: string, employee_id?: string, model_ids?: string[] }) {
    const queryClient = useQueryClient();

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['reports-history', page, limit, filters],
        queryFn: () => getReportsHistory({ page, limit, ...filters }),
    });

    const { mutate: removeReport } = useMutation({
        mutationFn: deleteReport,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reports-history'] });
            toast.success("Rapport supprimé");
        },
        onError: () => toast.error("Erreur lors de la suppression"),
    });

    const { mutate: download } = useMutation({
        mutationFn: ({ id, filename }: { id: string, filename: string }) => downloadReportFile(id, filename),
        onError: () => toast.error("Erreur lors du téléchargement"),
    });

    const { mutateAsync: rename, isPending: isRenaming } = useMutation({
        mutationFn: ({ id, newName }: { id: string, newName: string }) => renameReport(id, newName),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reports-history'] });
            toast.success("Rapport renommé");
        },
        onError: () => toast.error("Erreur lors du renommage"),
    });

    return {
        reports: data?.data || [],
        total: data?.meta.total || 0,
        isLoading,
        isError,
        error,
        removeReport,
        download,
        rename,
        isRenaming
    };
}
