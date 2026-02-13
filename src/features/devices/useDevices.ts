import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Capture, Device as UIDevice, DevicesFilters, QueueFilters } from "./DeviceTypes";
import {
  getPendingEnrollments,
  validateEnrollment,
  getDevices,
  resolveConflict,
  blockIP,
  updateDeviceDetails,
  deleteDevice,
  syncDevice
} from "../../services/devices";
import { Device as APIDevice } from "../../services/types/api-types";
import {
  getPendingValidations,
  approveValidation,
  rejectValidation
} from "../../services/validation";
import { getUsers } from "../../services/users";
import toast from "react-hot-toast";


const PLACEHOLDER =
  "https://images.unsplash.com/photo-1544006659-f0b21884ce1d?w=640&q=60&auto=format&fit=crop";

const INIT_DEV_FILTERS: DevicesFilters = {
  q: "",
  status: "all",
  sort: "lastsync-new",
};
const INIT_Q_FILTERS: QueueFilters = {
  device: "all",
  liveness: "all",
  scoreMin: 0.0,
  status: "pending",
};

export function useDevices() {
  const queryClient = useQueryClient();
  const [devFilters, setDevFilters] = useState<DevicesFilters>(INIT_DEV_FILTERS);
  const [qFilters, setQFilters] = useState<QueueFilters>(INIT_Q_FILTERS);

  // 1. Fetch Devices
  const { data: apiDevices = [], isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const res = await getDevices();
      return Array.isArray(res) ? res : [];
    },
    refetchInterval: 30000,
  });

  // Map APIDevice to UIDevice
  const devices: UIDevice[] = useMemo(() => {
    return Array.isArray(apiDevices) ? apiDevices.map((d: APIDevice) => ({
      id: d.id,
      name: d.name || "Unknown Device",
      location: d.location || "Unknown Location",
      status: d.status || (d.is_active ? "online" : "offline"),
      // isAuthorized removed from UI types
      trustStatus: d.trust_status,
      conflictId: d.conflict_id,
      blockedReason: d.blocked_reason,
      blockedBy: d.blocked_by,

      lastSyncISO: d.last_seen || new Date().toISOString(),
      ip: d.ip_address,
      mobileIP: d.mobile_ip,
      version: d.version || "1.0.0",
      currentMode: (d.current_mode as any) || undefined
    })) : [];
  }, [apiDevices]);

  // 2. Fetch Enrollments (Queue)
  const { data: apiEnrollments = [] } = useQuery({
    queryKey: ['enrollments', 'pending'],
    queryFn: async () => {
      const res = await getPendingEnrollments();
      return Array.isArray(res) ? res : (res.data as any)?.enrollments || [];
    },
    refetchInterval: 15000,
  });

  // 3. Fetch Attendance Validations (Queue)
  const { data: apiValidations = [] } = useQuery({
    queryKey: ['validations', 'pending'],
    queryFn: async () => {
      const res = await getPendingValidations();
      return Array.isArray(res) ? res : (res as any).data || [];
    },
    refetchInterval: 15000,
  });

  // 4. Fetch Users for Name Resolution
  const { data: apiUsersResponse } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers({ limit: 1000 }),
    staleTime: 5 * 60 * 1000,
  });

  const userMap = useMemo(() => {
    const map = new Map<string, string>();
    if (apiUsersResponse?.users) {
      apiUsersResponse.users.forEach((u: any) => {
        map.set(u.id, `${u.first_name} ${u.last_name}`);
      });
    }
    return map;
  }, [apiUsersResponse]);

  // Map and Merge into Capture[]
  const captures: Capture[] = useMemo(() => {
    const enrolls: Capture[] = Array.isArray(apiEnrollments) ? apiEnrollments.map((e: any) => ({
      id: e.id,
      deviceId: e.device_id || "unknown",
      tsISO: e.created_at,
      employeeNameGuess: e.user_name || "Unknown User",
      score: e.quality_score || 1.0,
      liveness: "pass",
      status: e.status || "pending",
      imageUrl: e.face_image || PLACEHOLDER,
      source: "enrollment",
    })) : [];

    // Map manual validations (attendance)
    const atts: Capture[] = Array.isArray(apiValidations) ? apiValidations.map((v: any) => {
      // Try to find device by name in device_info, or metadata, or fallback
      let devName = v.device_info?.name;
      // Check metadata safely
      if (!devName) {
        const meta = v.metadata || {};
        if (meta.source === "mobile_sync" || meta.type === "CHECK_IN") {
          devName = "Mobile App";
        }
      }

      const matchingDevice = devices.find(d => d.name === devName);
      // If we found a matching device, use its ID. If not, use the name as the ID (e.g. "Mobile App")
      const deviceIdToUse = matchingDevice?.id || (devName ? devName : "unknown");

      const userName = v.user_id ? userMap.get(v.user_id) : undefined;
      const fallbackName = v.user_id ? `User ${v.user_id.slice(0, 8)}...` : "Unknown User";

      return {
        id: v.id,
        deviceId: deviceIdToUse,
        tsISO: v.submission_timestamp,
        employeeNameGuess: userName || fallbackName,
        employeeId: v.user_id,
        score: v.similarity_score,
        liveness: "pass",
        status: "pending",
        imageUrl: v.captured_image ? `data:image/jpeg;base64,${v.captured_image}` : PLACEHOLDER,
        source: "attendance"
      };
    }) : [];

    return [...enrolls, ...atts];
  }, [apiEnrollments, apiValidations, devices, userMap]);

  // Devices list filtering
  const filteredDevices = useMemo(() => {
    const rows = devices.filter((d) => {
      if (devFilters.status !== "all" && d.status !== devFilters.status)
        return false;
      if (devFilters.q) {
        const hay = `${d.name} ${d.location ?? ""} ${d.ip ?? ""}`.toLowerCase();
        if (!hay.includes(devFilters.q.toLowerCase())) return false;
      }
      return true;
    });
    switch (devFilters.sort) {
      case "name-az":
        rows.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-za":
        rows.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "lastsync-old":
        rows.sort((a, b) => a.lastSyncISO.localeCompare(b.lastSyncISO));
        break;
      default:
        rows.sort((a, b) => b.lastSyncISO.localeCompare(a.lastSyncISO));
    }
    return rows;
  }, [devices, devFilters]);

  // Validation queue filtering
  const queue = useMemo(() => {
    return captures.filter((c) => {
      if (qFilters.device !== "all" && c.deviceId !== qFilters.device)
        return false;
      if (qFilters.status !== "all" && c.status !== qFilters.status)
        return false;
      if (
        qFilters.liveness !== "all" &&
        (c.liveness ?? "unknown") !== qFilters.liveness
      )
        return false;
      if (typeof c.score === "number" && c.score < qFilters.scoreMin)
        return false;
      return true;
    });
  }, [captures, qFilters]);

  // Mutations
  const { mutate: validateEnrollmentMutation } = useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) =>
      validateEnrollment(id, approved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast.success("Enrôlement traité");
    },
    onError: () => toast.error("Erreur traitement enrôlement")
  });

  const { mutate: validateAttendanceMutation } = useMutation({
    mutationFn: ({ id, approved, userId }: { id: string; approved: boolean, userId?: string }) => {
      if (approved) {
        return approveValidation(id, "current-admin", userId);
      } else {
        return rejectValidation(id, "current-admin", "Rejected from Devices");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['validations'] });
      toast.success("Validation traitée");
    },
    onError: () => toast.error("Erreur traitement validation")
  });

  function setCaptureStatus(id: string, status: "accepted" | "rejected") {
    // Find item to check source
    const item = captures.find(c => c.id === id);
    if (!item) return;

    if (item.source === "enrollment") {
      validateEnrollmentMutation({ id, approved: status === "accepted" });
    } else {
      const userId = item.employeeId || undefined;
      validateAttendanceMutation({ id, approved: status === "accepted", userId: userId });
    }
  }

  // TODO: Add activate/deactivate mutations if UI supports it

  const { mutate: resolveConflictMutation } = useMutation({
    mutationFn: ({ id, resolution }: { id: string, resolution: 'approve_replacement' | 'block_device' | 'blacklist_device' }) =>
      resolveConflict(id, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success("Device conflict resolved");
    },
    onError: () => toast.error("Error resolving conflict"),
  });

  const { mutate: blockIPMutation } = useMutation({
    mutationFn: ({ ip, reason }: { ip: string, reason: string }) =>
      blockIP(ip, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success("IP Blacklisted");
    },
    onError: () => toast.error("Error blacklisting IP"),
  });

  const { mutate: updateDetailsMutation } = useMutation({
    mutationFn: ({ id, name, location }: { id: string; name: string; location: string }) =>
      updateDeviceDetails(id, name, location),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success("Device details updated");
    },
    onError: () => toast.error("Error updating device"),
  });

  const { mutate: removeDeviceMutation } = useMutation({
    mutationFn: (id: string) => deleteDevice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success("Device removed");
    },
    onError: () => toast.error("Error removing device"),
  });

  const { mutate: resyncDeviceMutation, isPending: isResyncing } = useMutation({
    mutationFn: (id: string) => syncDevice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success("Sync command sent");
    },
    onError: () => toast.error("Error syncing device"),
  });

  return {
    isLoading,
    // state
    devices: filteredDevices,
    allDevices: devices,
    devFilters,
    qFilters,
    queue,
    // actions
    setDevFilters,
    setQFilters,
    setCaptureStatus,
    resolveConflict: resolveConflictMutation,
    blockIP: blockIPMutation,
    updateDeviceDetails: updateDetailsMutation,
    removeDevice: removeDeviceMutation,
    resyncDevice: resyncDeviceMutation,
    isResyncing
  };
}
