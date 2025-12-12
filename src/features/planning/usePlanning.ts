import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPlanningDashboard,
  getTeams,
  getUsers,
  createShift as apiCreateShift,
  updateShift as apiUpdateShift,
  deleteShift as apiDeleteShift,
  createTeam as apiCreateTeam,
  updateTeam as apiUpdateTeam,
  deleteTeam as apiDeleteTeam,
  assignUserToShift as apiAssignUserToShift,
  type UpdateShiftCommand,
  type UpdateTeamCommand,
} from "../../services";
import toast from "react-hot-toast";
import {
  DayKey,
  EmployeeMini,
  PlanningState,
  Shift,
  Team,
  WeekKey,
} from "./PlanningTypes";

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

  /* ===== QUERY ===== */
  const { data: planningData, isLoading: isLoadingPlanning } = useQuery({
    queryKey: ["planning", week],
    queryFn: () => getPlanningDashboard(),
  });

  const { data: teamsData, isLoading: isLoadingTeams } = useQuery({
    queryKey: ["teams"],
    queryFn: getTeams,
  });

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users", "employee"],
    queryFn: () => getUsers({ role: "employee", limit: 100 }),
  });

  const isLoading = isLoadingPlanning || isLoadingTeams || isLoadingUsers;

  // Transform API data to internal state format
  const state: PlanningState = useMemo(() => {
    // Transform shifts array to records
    const shiftsRecord: Record<string, Shift> = {};
    if (planningData?.active_shifts && Array.isArray(planningData.active_shifts)) {
      planningData.active_shifts.forEach((s: any) => {
        shiftsRecord[s.id] = {
          id: s.id,
          name: s.name,
          start: s.start_time,
          end: s.end_time,
          daysActive: s.days_of_week as DayKey[],
          teamIds: s.team_id ? [s.team_id] : [],
          extraMemberIds: [], // Backend doesn't support individual assignments on shift object yet
        };
      });
    }

    // Transform teams
    const teamsRecord: Record<string, Team> = {};
    if (teamsData?.teams) {
      teamsData.teams.forEach((t: any) => {
        teamsRecord[t.id] = {
          id: t.id,
          name: t.name,
          color: "var(--color-brand-500)", // Default color
          memberIds: [], // We would need to fetch members for each team or map from users
        };
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
  }, [planningData, teamsData, usersData, week]);

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
    // Implement copy week logic if backend supports it, or just nav
    gotoNextWeek();
    toast("Week copied (simulation)");
  }

  /* ===== MUTATIONS ===== */
  const { mutate: createTeam } = useMutation({
    mutationFn: apiCreateTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planning"] });
      toast.success("Team created");
    },
    onError: () => toast.error("Failed to create team"),
  });

  const { mutate: updateTeam } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamCommand }) =>
      apiUpdateTeam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planning"] });
      toast.success("Team updated");
    },
    onError: () => toast.error("Failed to update team"),
  });

  const { mutate: deleteTeam } = useMutation({
    mutationFn: apiDeleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planning"] });
      toast.success("Team deleted");
    },
    onError: () => toast.error("Failed to delete team"),
  });

  const { mutate: createShift } = useMutation({
    mutationFn: apiCreateShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planning"] });
      toast.success("Shift created");
    },
    onError: () => toast.error("Failed to create shift"),
  });

  const { mutate: updateShift } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateShiftCommand }) =>
      apiUpdateShift(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planning"] });
      toast.success("Shift updated");
    },
    onError: () => toast.error("Failed to update shift"),
  });

  const { mutate: deleteShift } = useMutation({
    mutationFn: apiDeleteShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planning"] });
      toast.success("Shift deleted");
    },
    onError: () => toast.error("Failed to delete shift"),
  });

  const { mutate: assignUserToShift } = useMutation({
    mutationFn: apiAssignUserToShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planning"] });
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

  // For counts / grid rendering we don't expand all names. We compute counts per cell.
  function expandShiftMembers(sh: Shift): string[] {
    const fromTeams = sh.teamIds.flatMap((tid) => teams[tid]?.memberIds ?? []);
    return [...new Set([...fromTeams, ...sh.extraMemberIds])];
  }

  // Conflicts: employee in more than one active shift in same day.
  const dayConflicts = useMemo(() => {
    const conflicts: Record<DayKey, Set<string>> = {
      0: new Set(),
      1: new Set(),
      2: new Set(),
      3: new Set(),
      4: new Set(),
      5: new Set(),
      6: new Set(),
    };
    const arr = Object.values(shifts);
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const a = arr[i],
          b = arr[j];
        const overlapDays = a.daysActive.filter((d) =>
          b.daysActive.includes(d)
        ) as DayKey[];
        if (!overlapDays.length) continue;
        const empsA = expandShiftMembers(a);
        const both = empsA.filter((eid) => expandShiftMembers(b).includes(eid));
        if (!both.length) continue;
        overlapDays.forEach((d) =>
          both.forEach((eid) => conflicts[d].add(eid))
        );
      }
    }
    return conflicts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shifts, teams]); // employees not needed for conflicts

  return {
    state,
    employees,
    teams,
    shifts,
    // week
    setWeek,
    gotoPrevWeek,
    gotoNextWeek,
    copyWeekForward,
    // teams
    createTeam,
    updateTeam,
    deleteTeam,
    // shifts
    createShift,
    updateShift,
    deleteShift,
    assignUserToShift,
    // helpers
    expandShiftMembers,
    dayConflicts,
    isLoading,
  };
}
