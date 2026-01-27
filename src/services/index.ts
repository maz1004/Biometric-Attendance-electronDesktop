// Export centralisé de tous les services
export * from './api';
export * from './auth';
export * from './biometric';
export * from './health';
export * from './reports';
export * from './types';
export * from './types/api-types';
export * from './config/api';

// Explicit exports to avoid naming conflicts
// Users service
export {
    getUsers,
    getUser,
    createAdmin,
    createEmployee as createUserEmployee,
    updateUser,
    deleteUser,
    activateUser,
    deactivateUser,
    getUserStatus as getUserStatusFromUsers,
    getUserActivity,
    getUserAttendanceStats,
    uploadUserPhoto,
    uploadUserCV,
} from './users';

// Attendance service
export {
    checkIn,
    checkOut,
    getHistory as getAttendanceHistory,
    getUserStatus as getAttendanceUserStatus,
} from './attendance';

// Planning service
export {
    getTeams,
    getTeam,
    getTeamMembers,
    createTeam,
    updateTeam,
    deleteTeam,
    getShifts,
    getShift,
    getUserShifts,
    createShift,
    updateShift,
    deleteShift,
    assignUserToShift,
    unassignUserFromShift,
    getDashboard as getPlanningDashboard,
} from './planning';

// Employees service (wrapper)
export {
    getEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    activateEmployee,
    deactivateEmployee,
    enrollFace,
} from './employees';

// Settings service
export {
    getSettings,
    updateSettings,
} from './settings';

// Devices service
export {
    getDevices,
    getDevice,
    registerDevice,
    updateDevice,
    deleteDevice,
    getDeviceStatusColor,
    formatLastSeen,
} from './devices';
