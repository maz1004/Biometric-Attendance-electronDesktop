import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addWeeks } from "date-fns";
import { PlanningService } from "../../../services/planning";
import { getUsers } from "../../../services/users";
import toast from "react-hot-toast";
import {
  DayKey,
  EmployeeMini,
  PlanningState,
  Shift,
  Team,
  WeekKey,
  UserShift,
  CreateShiftDTO,
  UpdateShiftCommand,
  ViewContext
} from "../types";

/* ---------- utils ---------- */
function mondayOf(d: Date) {
  const day = (d.getDay() || 7) - 1; // Mon=0..Sun=6
  const m = new Date(d);
  m.setDate(d.getDate() - day);
  m.setHours(0, 0, 0, 0);
  return m;
}
function iso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function usePlanning() {
  const queryClient = useQueryClient();
  const [week, setWeekState] = useState<WeekKey>(iso(mondayOf(new Date())));

  // New: Context State
  const [viewContext, setViewContext] = useState<ViewContext>({ type: 'GLOBAL_DEFAULT' });

  const weekStart = useMemo(() => new Date(week), [week]);
  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    return d;
  }, [weekStart]);

  /* ===== QUERY ===== */
  const { data: shiftsData, isLoading: isLoadingShifts } = useQuery({
    queryKey: ["shifts", week],
    queryFn: () => PlanningService.getShifts(week),
  });

  const { data: templatesData, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["templates"],
    queryFn: PlanningService.getTemplates,
  });

  const { data: teamsData, isLoading: isLoadingTeams } = useQuery({
    queryKey: ["teams"],
    queryFn: PlanningService.getTeams,
  });

  // Context-Driven Assignments Query
  const { data: assignmentsData, isLoading: isLoadingAssignments } = useQuery<UserShift[]>({
    queryKey: ["assignments", week, viewContext],
    queryFn: async () => {
      const start = week;
      const end = iso(weekEnd);

      if (viewContext.type === 'TEAM') {
        const res = await PlanningService.fetchAssignmentsBatch({
          team_id: viewContext.teamId,
          start_date: start,
          end_date: end
        });
        return res.data;
      } else if (viewContext.type === 'USER_LIST') {
        const res = await PlanningService.fetchAssignmentsBatch({
          user_ids: viewContext.userIds,
          start_date: start,
          end_date: end
        });
        return res.data;
      } else {
        const res = await PlanningService.getAssignments(start, end);
        return res.data;
      }
    }
  });

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users", "employee"],
    queryFn: () => getUsers({ limit: 1000 }), // Increased limit and removed role filter
    staleTime: 5 * 60 * 1000,
  });

  const { data: settingsData } = useQuery({
    queryKey: ["settings"],
    queryFn: () => import("../../../services/settings").then(m => m.getSettings()),
    staleTime: 5 * 60 * 1000,
  });


  const userShifts: UserShift[] = useMemo(() => {
    if (!Array.isArray(assignmentsData)) return [];
    // Deduplicate by ID just in case
    const unique = new Map();
    assignmentsData.forEach(a => unique.set(a.id, a));
    if (unique.size !== assignmentsData.length) {
      console.warn(`[usePlanning] Found ${assignmentsData.length - unique.size} duplicate assignments!`);
    }
    // DEBUG: Check assignment structure
    const firstAss = Array.from(unique.values())[0];
    if (firstAss) {
      console.log(`[usePlanning] Debug First Assignment: ID=${firstAss.id} ShiftID=${firstAss.shiftId} Start=${firstAss.startTime} End=${firstAss.endTime}`);
    }
    return Array.from(unique.values());
  }, [assignmentsData]);

  // Transform API data to internal state format
  const state: PlanningState = useMemo(() => {
    // Transform shifts array to records
    const shiftsRecord: Record<string, Shift> = {};

    // 1. Add active week shifts
    if (shiftsData) {
      shiftsData.forEach((s) => {
        shiftsRecord[s.id] = s;
      });
    }

    // 2. Add templates (as they act as shifts for assignments)
    // This ensures Lookups in PlanningEngine work even if the specific shift instance isn't in 'shiftsData'
    if (templatesData) {
      templatesData.forEach((t) => {
        // If template already exists as a shift (rare conflict), shift data takes precedence? 
        // No, usually we want the detailed template definition if the shift one is partial.
        // But let's assume keys are unique or we want to ensure availability.
        if (!shiftsRecord[t.id]) {
          shiftsRecord[t.id] = t as unknown as Shift; // Template structure is compatible with Shift for engine purposes
        }
      });
    }

    // Transform teams
    const teamsList = Array.isArray(teamsData) ? teamsData : (teamsData as any)?.teams || (teamsData as any)?.data || [];
    const teamsRecord: Record<string, Team> = {};
    if (Array.isArray(teamsList)) {
      teamsList.forEach((t: Team) => {
        teamsRecord[t.id] = t;
      });
    }

    // Transform employees
    const employeesRecord: Record<string, EmployeeMini> = {};
    if (usersData?.users) {
      usersData.users.forEach((u: any) => {
        employeesRecord[u.id] = {
          id: u.id,
          name: `${u.first_name} ${u.last_name}`,
          avatar: `https://ui-avatars.com/api/?name=${u.first_name}+${u.last_name}&background=random`,
          department: u.department,
        };
      });
    } else if (Array.isArray(usersData)) {
      usersData.forEach((u: any) => {
        employeesRecord[u.id] = {
          id: u.id,
          name: `${u.first_name} ${u.last_name}`,
          avatar: `https://ui-avatars.com/api/?name=${u.first_name}+${u.last_name}&background=random`,
          department: u.department,
        };
      });
    }

    return {
      week,
      employees: employeesRecord,
      teams: teamsRecord,
      shifts: shiftsRecord,
    };

  }, [shiftsData, teamsData, usersData, week]);

  const isLoading = isLoadingShifts || isLoadingTeams || isLoadingUsers || isLoadingAssignments;

  /* ===== week nav ===== */
  function setWeek(newWeek: WeekKey) {
    setWeekState(newWeek);
  }
  function gotoPrevWeek() {
    const d = new Date(week);
    d.setDate(d.getDate() - 7);
    setWeek(iso(d) as WeekKey);
  }
  function gotoNextWeek() {
    const d = new Date(week);
    d.setDate(d.getDate() + 7);
    setWeek(iso(d) as WeekKey);
  }
  function copyWeekForward() {
    gotoNextWeek();
    toast("Week copied (simulation)");
  }

  /* ===== MUTATIONS ===== */
  const { mutate: createShift } = useMutation({
    mutationFn: (data: any) => PlanningService.createShift(data as CreateShiftDTO), // Cast for now
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      toast.success("Shift created");
    },
    onError: () => toast.error("Failed to create shift"),
  });

  const { mutate: updateShift } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateShiftCommand }) =>
      PlanningService.updateShift(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      toast.success("Shift updated");
    },
    onError: () => toast.error("Failed to update shift"),
  });

  const { mutate: deleteShift } = useMutation({
    mutationFn: PlanningService.deleteShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      toast.success("Shift deleted");
    },
    onError: () => toast.error("Failed to delete shift"),
  });

  /* ===== TEMPLATE MUTATIONS ===== */
  const { mutate: createTemplate } = useMutation({
    mutationFn: (data: any) => PlanningService.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      // Delayed refetch: backend syncTemplateToSchedules runs async (~1-3s)
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["assignments"] });
        queryClient.invalidateQueries({ queryKey: ["shifts"] });
      }, 2000);
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["assignments"] });
        queryClient.invalidateQueries({ queryKey: ["shifts"] });
      }, 5000);
      toast.success("Modèle créé");
    },
    onError: () => toast.error("Erreur lors de la création du modèle"),
  });

  const { mutate: updateTemplate } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => PlanningService.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      // Delayed refetch: backend syncTemplateToSchedules runs async (~1-3s)
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["assignments"] });
        queryClient.invalidateQueries({ queryKey: ["shifts"] });
      }, 2000);
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["assignments"] });
        queryClient.invalidateQueries({ queryKey: ["shifts"] });
      }, 5000);
      toast.success("Modèle mis à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour du modèle"),
  });

  const { mutate: deleteTemplate } = useMutation({
    mutationFn: PlanningService.deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Modèle supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression du modèle"),
  });

  /* ===== TEAM MUTATIONS ===== */
  const { mutate: createTeam } = useMutation({
    mutationFn: PlanningService.createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Équipe créée avec succès");
    },
    onError: () => toast.error("Erreur lors de la création de l'équipe"),
  });

  const { mutate: updateTeam } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => PlanningService.updateTeam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Équipe mise à jour avec succès");
    },
    onError: () => toast.error("Erreur lors de la mise à jour de l'équipe"),
  });

  const { mutate: deleteTeam } = useMutation({
    mutationFn: PlanningService.deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Équipe supprimée avec succès");
    },
    onError: () => toast.error("Erreur lors de la suppression de l'équipe"),
  });

  const { mutateAsync: addMemberToTeam } = useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) => PlanningService.addMemberToTeam(teamId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["assignments"] }); // Auto-sync
    },
    onError: () => toast.error("Erreur lors de l'ajout du membre"),
  });

  const { mutateAsync: removeMemberFromTeam } = useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) => PlanningService.removeMemberFromTeam(teamId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["assignments"] }); // Auto-sync
    },
    onError: () => toast.error("Erreur lors du retrait du membre"),
  });

  /* ===== helpers ===== */
  const employees = state.employees;
  const teams = state.teams;
  const shifts = state.shifts;

  // Conflicts: employee in more than one active shift in same day.
  const dayConflicts = useMemo(() => {
    // Basic conflict detection logic can be reimplemented here if needed
    // based on userShifts (assignments).
    // For now returning empty.
    const conflicts: Record<DayKey, Set<string>> = {
      0: new Set(), 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set(), 5: new Set(), 6: new Set(),
    };
    return conflicts;
  }, []);

  function expandShiftMembers(sh: Shift): string[] {
    // Find assignments for this shift
    // Filter userShifts where shiftId == sh.id
    return userShifts.filter(u => u.shiftId === sh.id && u.isActive).map(u => u.userId);
  }

  /* ===== NEW QUERIES (Holidays, Exceptions, Schedules) ===== */
  const { data: holidaysData } = useQuery({
    queryKey: ["holidays"],
    queryFn: PlanningService.getHolidays,
  });

  const { data: exceptionsData } = useQuery({
    queryKey: ["exceptions", week],
    queryFn: () => PlanningService.getExceptions({ start_date: week, end_date: iso(weekEnd) }),
  });

  const { data: effectiveSchedules } = useQuery({
    queryKey: ["schedules", week],
    queryFn: () => PlanningService.getSchedules(week, iso(weekEnd)),
    // This fetches the raw list of schedules which can be Team or User specific
  });

  /* ===== NEW MUTATIONS ===== */

  const { mutate: createSchedule } = useMutation({
    mutationFn: PlanningService.createSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Schedule assigned");
    },
    onError: () => toast.error("Failed to assign schedule"),
  });

  /* ===== BATCH MUTATION ===== */
  const { mutate: createAssignmentsBatch } = useMutation({
    mutationFn: (data: { assignments: any[]; overwrite?: boolean }) =>
      PlanningService.createAssignmentsBatch(data),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["shifts"] }); // CRITICAL: Batch might create new shift templates!

      const msg = res?.data?.message || "Assignments batch created";
      if (res?.status === 207) {
        toast(msg, { icon: '⚠️', duration: 7000 });
      } else {
        toast.success(msg);
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to batch assign");
    },
  });

  const { mutate: createHoliday } = useMutation({
    mutationFn: PlanningService.createHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      toast.success("Holiday created");
    },
    onError: () => toast.error("Failed to create holiday"),
  });

  const { mutate: deleteHoliday } = useMutation({
    mutationFn: PlanningService.deleteHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      toast.success("Holiday deleted");
    },
    onError: () => toast.error("Failed to delete holiday"),
  });

  const { mutate: createException } = useMutation({
    mutationFn: PlanningService.createException,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exceptions"] });
      toast.success("Exception created");
    },
    onError: () => toast.error("Failed to create exception"),
  });

  const { mutate: updateException } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => PlanningService.updateException(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exceptions"] });
      toast.success("Exception updated");
    },
    onError: () => toast.error("Failed to update exception"),
  });

  const { mutate: deleteException } = useMutation({
    mutationFn: PlanningService.deleteException,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exceptions"] });
      toast.success("Exception deleted");
    },
    onError: () => toast.error("Failed to delete exception"),
  });

  return {
    state,
    employees,
    teams,
    shifts,
    templates: templatesData || [],
    isLoadingTemplates,
    userShifts,

    // New Data
    holidays: holidaysData || [],
    exceptions: exceptionsData || [],
    schedules: effectiveSchedules || [],

    // week
    gotoPrevWeek,
    gotoNextWeek,
    copyWeekForward,
    // Context
    viewContext,
    setViewContext,

    // Actions
    createShift,
    updateShift,
    deleteShift,
    createSchedule,
    createAssignmentsBatch,
    createHoliday,
    deleteHoliday,
    createException,
    updateException,
    deleteException,
    addMemberToTeam,
    removeMemberFromTeam,

    // Templates
    createTemplate,
    updateTemplate,
    deleteTemplate,

    // Teams
    createTeam,
    updateTeam,
    deleteTeam,

    // Navigation
    nextWeek: () => setWeekState(iso(addWeeks(new Date(week), 1))),
    prevWeek: () => setWeekState(iso(addWeeks(new Date(week), -1))),
    setWeek: (d: Date) => setWeekState(iso(mondayOf(d))),

    // Settings
    settings: settingsData,

    // helpers
    expandShiftMembers,
    dayConflicts,
    isLoading,
  };
}
