import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  CreateTeamCommand,
  UpdateTeamCommand
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

  const { data: teamsData, isLoading: isLoadingTeams } = useQuery({
    queryKey: ["teams"],
    queryFn: PlanningService.getTeams,
  });

  const { data: assignmentsData, isLoading: isLoadingAssignments } = useQuery({
    queryKey: ["assignments", week],
    queryFn: () => PlanningService.getAssignments(week, iso(weekEnd)),
    // Re-fetch when assigning users
  });

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users", "employee"],
    queryFn: () => getUsers({ limit: 1000 }), // Increased limit and removed role filter
  });

  const { data: settingsData } = useQuery({
    queryKey: ["settings"],
    queryFn: () => import("../../../services/settings").then(m => m.getSettings()),
  });


  const userShifts: UserShift[] = assignmentsData?.data || [];

  // Transform API data to internal state format
  const state: PlanningState = useMemo(() => {
    // Transform shifts array to records
    const shiftsRecord: Record<string, Shift> = {};
    if (shiftsData) {
      shiftsData.forEach((s) => {
        shiftsRecord[s.id] = s;
      });
    }

    // Transform teams
    // API returns { teams: [...] } or just array depending on my services fix?
    // In planning.ts I returned `res.data`. If backend returns { data: [] } then planning.ts should handle it.
    // Let's assume teamsData is the array or {teams: []}.
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

  const { mutate: createTeam } = useMutation({
    mutationFn: (data: CreateTeamCommand) => PlanningService.createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Team created");
    },
    onError: () => toast.error("Failed to create team"),
  });

  const { mutate: updateTeam } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamCommand }) =>
      PlanningService.updateTeam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Team updated");
    },
    onError: () => toast.error("Failed to update team"),
  });

  const { mutate: deleteTeam } = useMutation({
    mutationFn: PlanningService.deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Team deleted");
    },
    onError: () => toast.error("Failed to delete team"),
  });

  const { mutate: assignUserToShift } = useMutation({
    mutationFn: PlanningService.assignUserToShift,
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      toast.success("User assigned to shift");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to assign user");
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["shifts"] }); // CRITICAL: Batch might create new shift templates!
      toast.success("Assignments batch created");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to batch assign");
    },
  });

  return {
    state,
    employees,
    teams,
    shifts,
    userShifts,

    // New Data
    holidays: holidaysData || [],
    exceptions: exceptionsData || [],
    schedules: effectiveSchedules || [],
    settings: settingsData, // Expose Global Settings

    // week
    setWeek,
    gotoPrevWeek,
    gotoNextWeek,
    copyWeekForward,
    // mutations
    createShift,
    updateShift,
    deleteShift,
    createTeam,
    updateTeam,
    deleteTeam,
    assignUserToShift,
    createAssignmentsBatch,
    createHoliday,
    deleteHoliday,
    createException,
    createSchedule,
    // helpers
    expandShiftMembers,
    dayConflicts,
    isLoading,
  };
}
