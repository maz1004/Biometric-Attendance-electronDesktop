import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Team, EmployeeMini, UserShift } from "../../types";
import { PlanningService } from "../../../../services/planning";
import { getSettings } from "../../../../services/settings"; // Import Settings Service
import TeamAssignmentDialog from "../modals/TeamAssignmentDialog";

interface DayAssignmentOrchestratorProps {
    date: Date;
    onClose: () => void;
    teams: Team[];
    employees: EmployeeMini[];
}

export default function DayAssignmentOrchestrator({
    date,
    onClose,
    teams,
    employees
}: DayAssignmentOrchestratorProps) {
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(true);
    const [assignments, setAssignments] = useState<UserShift[]>([]);
    const [initialTeamIds, setInitialTeamIds] = useState<string[]>([]);
    const [initialEmpIds, setInitialEmpIds] = useState<string[]>([]);

    const dateStr = format(date, 'yyyy-MM-dd');

    // 0. Fetch Settings for Defaults
    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: getSettings,
        staleTime: 5 * 60 * 1000 // 5 mins
    });

    const defaultStartTime = settings?.planning_day_start?.substring(0, 5) || "08:00";
    const defaultEndTime = settings?.planning_day_end?.substring(0, 5) || "17:00";

    // 1. Fetch Assignments for this SPECIFIC date
    useEffect(() => {
        let mounted = true;

        async function load() {
            try {
                console.log(`[DayAssignment] Fetching assignments for ${dateStr}...`);
                const res = await PlanningService.getAssignments(dateStr, dateStr);
                const data = res.data || [];

                if (mounted) {
                    setAssignments(data);

                    // Filter Logic
                    const tIds = data
                        .filter(s => !s.userId && !!s.teamId) // Team Schedule (if any)
                        .map(s => s.teamId!);

                    const eIds = data
                        .filter(s => !!s.userId) // User Schedule
                        .map(s => s.userId);

                    setInitialTeamIds(tIds);
                    setInitialEmpIds(eIds);
                    setIsLoading(false);
                }
            } catch (e) {
                console.error("Failed to load assignments", e);
                if (mounted) setIsLoading(false);
            }
        }

        load();

        return () => { mounted = false; };
    }, [dateStr]);

    const handleSave = async (selectedTeamIds: string[], selectedEmpIds: string[]) => {
        try {
            // --- 1. TEAMS LOGIC ---
            const addedTeams = selectedTeamIds.filter(id => !initialTeamIds.includes(id));
            const removedTeams = initialTeamIds.filter(id => !selectedTeamIds.includes(id));

            // A. Remove Teams
            if (removedTeams.length > 0) {
                console.log(`[DayAssignment] Removing ${removedTeams.length} teams...`);
                // Find Team Assignments (where userId is null/empty)
                const deletions = assignments
                    .filter(s => (s.teamId && removedTeams.includes(s.teamId)) && !s.userId)
                    .map(s => PlanningService.deleteAssignment(s.id));
                await Promise.all(deletions);
            }

            // B. Add Teams (Use Global Settings Defaults)
            if (addedTeams.length > 0) {
                console.log(`[DayAssignment] Adding ${addedTeams.length} teams...`);
                const newTeamAssignments = addedTeams.map(tid => ({
                    date: dateStr,
                    start_time: defaultStartTime,
                    end_time: defaultEndTime,
                    assigned_id: tid,
                    assigned_type: 'team'
                }));

                await PlanningService.createAssignmentsBatch({
                    assignments: newTeamAssignments,
                    overwrite: false
                });
            }

            // --- 2. EMPLOYEES LOGIC ---
            const addedEmps = selectedEmpIds.filter(id => !initialEmpIds.includes(id));
            const removedEmps = initialEmpIds.filter(id => !selectedEmpIds.includes(id));

            // A. Remove Employees
            if (removedEmps.length > 0) {
                console.log(`[DayAssignment] Removing ${removedEmps.length} employees...`);
                const deletions = assignments
                    .filter(s => s.userId && removedEmps.includes(s.userId))
                    .map(s => PlanningService.deleteAssignment(s.id));
                await Promise.all(deletions);
            }

            // B. Add Employees (Smart Time Inheritance)
            if (addedEmps.length > 0) {
                console.log(`[DayAssignment] Adding ${addedEmps.length} employees...`);

                const newAssignments = addedEmps.map(empId => {
                    // Try to find Employee's Team
                    const empTeam = teams.find(t => t.memberIds.includes(empId));

                    let startTime = defaultStartTime;
                    let endTime = defaultEndTime;

                    // Helper: Parse time string "08:00:00" -> "08:00"
                    const formatTime = (t?: string) => t ? t.substring(0, 5) : undefined;

                    if (empTeam) {
                        // Check if this Team has a schedule on this day?
                        const existingTeamSchedule = assignments.find(s => s.teamId === empTeam.id && !s.userId);
                        if (existingTeamSchedule) {
                            if (existingTeamSchedule.startTime) startTime = formatTime(existingTeamSchedule.startTime)!;
                            if (existingTeamSchedule.endTime) endTime = formatTime(existingTeamSchedule.endTime)!;
                        } else if (addedTeams.includes(empTeam.id)) {
                            // Inherit from just-added team defaults
                            startTime = defaultStartTime;
                            endTime = defaultEndTime;
                        }
                    }

                    return {
                        date: dateStr,
                        start_time: startTime,
                        end_time: endTime,
                        assigned_id: empId,
                        assigned_type: 'employee'
                    };
                });

                await PlanningService.createAssignmentsBatch({
                    assignments: newAssignments,
                    overwrite: false
                });
            }

            alert("Assignations mises à jour avec succès !");
            queryClient.invalidateQueries({ queryKey: ["assignments"] });
            queryClient.invalidateQueries({ queryKey: ["shifts"] });
            onClose();

        } catch (e: any) {
            console.error("Error saving assignments:", e);
            alert("Erreur lors de la sauvegarde: " + e.message);
        }
    };

    if (isLoading) return null; // Or Spinner

    return (
        <TeamAssignmentDialog
            isOpen={true}
            date={date}
            onClose={onClose}
            allTeams={teams}
            unassignedEmployees={employees}
            initialSelectedTeamIds={initialTeamIds}
            initialSelectedEmpIds={initialEmpIds}
            onSave={handleSave}
        />
    );
}
