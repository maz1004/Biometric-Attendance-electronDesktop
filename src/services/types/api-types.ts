// Complete TypeScript types matching Backend API specification
// Base URL: http://localhost:8080/api/v1

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

export interface LoginRequest {
    email: string;
    password?: string; // Optional for employees (biometric)
}

export interface RegisterRequest {
    email: string;
    password: string; // min 8 chars
    first_name: string; // min 2, max 50
    last_name: string; // min 2, max 50
    role: 'admin' | 'employee';
    phone_number?: string;
    date_of_birth?: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    data?: {
        token: string;
        user: UserResponse;
    };
}

export interface UserResponse {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'rh' | 'employee';
    department?: string;
    phone_number: string;
    date_of_birth?: string;
    hire_date?: string;
    is_active: boolean;
    is_admin: boolean;
    enrolled: boolean;
    stats?: UserAttendanceStats;
    profile_photo?: string;
    cv_url?: string;
    created_at: string;
    updated_at: string;
    last_login?: string;
}

// ============================================================================
// USER MANAGEMENT TYPES
// ============================================================================

export interface GetUsersResponse {
    users: UserResponse[];
    total: number;
    page: number;
    limit: number;
}

export interface CreateAdminRequest {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role: 'admin' | 'rh';
    department?: string;
    phone_number?: string;
    hire_date?: string; // ISO 8601
    is_active?: boolean;
}

export interface CreateEmployeeRequest {
    first_name: string;
    last_name: string;
    email: string;
    department?: string;
    phone_number?: string;
    hire_date?: string;
    is_active?: boolean;
}

export interface UpdateUserRequest {
    first_name?: string;
    last_name?: string;
    email?: string;
    role?: 'admin' | 'rh' | 'employee';
    department?: string;
    phone_number?: string;
    date_of_birth?: string; // ISO 8601
    is_active?: boolean;
    permissions?: string[];
    created_at?: string;
    updated_at?: string;
}

export interface UserStatus {
    user_id: string;
    is_active: boolean;
    last_login?: string;
    login_count: number;
    status: 'online' | 'offline' | 'away';
    permissions: string[];
    created_at: string;
    updated_at: string;
}

export interface UserActivity {
    id: string;
    user_id: string;
    action: string; // 'login', 'logout', 'checkin', 'checkout'
    description: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
}

// ... (previous content)
export interface UserActivityResponse {
    activities: UserActivity[];
    total: number;
    page: number;
    limit: number;
}

export interface MonthlyComparison {
    punctuality_delta: number;
    absence_delta: number;
    late_delta: number;
}

export interface UserAttendanceStats {
    user_id: string;
    period: string;
    total_days: number;
    present_days: number;
    absent_days: number;
    late_days: number;
    punctuality_rate: number;
    absence_rate: number;
    late_rate: number;
    monthly_comparison: MonthlyComparison;
}

// ============================================================================
// ATTENDANCE TYPES
// ============================================================================

export interface CheckInRequest {
    user_id: string;
    shift_id: string;
    check_in_time?: string; // ISO 8601, default: now
    notes?: string;
}

export interface CheckInResponse {
    success: boolean;
    user_shift_id: string;
    check_in_time: string;
    punctuality_score: number; // 0-100
    status: string; // 'on_time', 'late', 'early'
    message: string;
}

export interface CheckOutRequest {
    user_id: string;
    shift_id: string;
    check_out_time?: string;
    notes?: string;
}

export interface CheckOutResponse {
    success: boolean;
    user_shift_id: string;
    check_out_time: string;
    actual_duration: number; // seconds
    status: string;
    message: string;
}

export interface AttendanceRecord {
    id: string;
    user_id: string;
    shift_id: string;
    check_in_time: string;
    check_out_time?: string;
    status: string;
    punctuality_score: number;
    notes: string;
    created_at: string;
}

export interface AttendanceHistory {
    records: AttendanceRecord[];
    total: number;
}

export interface AttendanceStatus {
    user_id: string;
    current_shift?: {
        shift_id: string;
        shift_name: string;
        check_in_time: string;
        status: string;
    };
    is_checked_in: boolean;
    last_check_in?: string;
    last_check_out?: string;
}

// ============================================================================
// PLANNING TYPES (Teams & Shifts)
// ============================================================================

export interface TeamResponse {
    id: string;
    name: string;
    description: string;
    department: string;
    manager_id: string;
    manager_name?: string;
    is_active: boolean;
    shifts_count: number;
    members_count: number;
    created_at: string;
    updated_at: string;
}

export interface TeamsListResponse {
    teams: TeamResponse[];
    total: number;
}

export interface TeamMember {
    user_id: string;
    user_name: string;
    email: string;
    role: string;
    shifts_count: number;
    is_active: boolean;
}

export interface TeamMembersResponse {
    members: TeamMember[];
    total: number;
}

export interface ShiftResponse {
    id: string;
    name: string;
    description: string;
    start_time: string; // ISO 8601
    end_time: string;
    days_of_week: number[]; // 0=Sunday, 1=Monday, ...
    team_id: string;
    team_name?: string;
    is_active: boolean;
    max_members: number;
    current_members: number;
    created_at: string;
    updated_at: string;
}

export interface ShiftsListResponse {
    shifts: ShiftResponse[];
    total: number;
}

export interface UserShiftResponse {
    id: string;
    user_id: string;
    user_name?: string;
    shift_id: string;
    shift_name?: string;
    assigned_at: string;
    assigned_by: string;
    is_active: boolean;
    notes: string;
    created_at: string;
    updated_at: string;
}

export interface UserShiftsResponse {
    shifts: UserShiftResponse[];
    total: number;
}

export interface PlanningStatsResponse {
    total_teams: number;
    active_teams: number;
    total_shifts: number;
    active_shifts: number;
    total_assignments: number;
    active_assignments: number;
    total_users: number;
    assigned_users: number;
}

export interface TeamCoverage {
    team_id: string;
    team_name: string;
    coverage_percentage: number;
    assigned_members: number;
    total_capacity: number;
}

export interface PlanningDashboardResponse {
    stats: PlanningStatsResponse;
    active_shifts: ShiftResponse[];
    upcoming_shifts: ShiftResponse[];
    team_coverage: TeamCoverage[];
}

export interface CreateShiftCommand {
    name: string;
    description?: string;
    start_time: string; // ISO 8601
    end_time: string;
    days_of_week: number[]; // [1,2,3,4,5] for Mon-Fri
    team_id: string;
    max_members: number; // min 1
}

export interface UpdateShiftCommand {
    name?: string;
    description?: string;
    start_time?: string;
    end_time?: string;
    days_of_week?: number[];
    max_members?: number;
    is_active?: boolean;
}

export interface AssignUserToShiftCommand {
    user_id: string;
    shift_id: string;
    assigned_by: string;
    notes?: string;
}

export interface UnassignUserFromShiftCommand {
    user_id: string;
    shift_id: string;
}

export interface CreateTeamCommand {
    name: string;
    description?: string;
    department: string;
    manager_id: string;
}

export interface UpdateTeamCommand {
    name?: string;
    description?: string;
    department?: string;
    manager_id?: string;
    is_active?: boolean;
}

// ============================================================================
// BIOMETRIC TYPES
// ============================================================================

export interface BiometricEnrollRequest {
    user_id: string;
    face_image?: string; // base64
    iris_image?: string; // base64
    eye_type?: 'left' | 'right';
}

export interface BiometricEnrollResponse {
    success: boolean;
    message: string;
    face_enrollment_id?: string;
    iris_enrollment_id?: string;
    quality_score?: number;
}

export interface BiometricRecognizeRequest {
    face_image?: string; // base64
    iris_image?: string;
    threshold?: number; // 0.0-1.0
}

export interface BiometricRecognizeResponse {
    success: boolean;
    user_id?: string;
    confidence: number;
    match_type: 'face' | 'iris' | 'fusion';
    message: string;
}

export interface QualityCheckRequest {
    image: string; // base64
    type: 'face' | 'iris';
}

export interface QualityCheckResponse {
    quality_score: number; // 0-100
    is_acceptable: boolean;
    issues: string[];
    recommendations: string[];
}

// ============================================================================
// REPORTS TYPES
// ============================================================================

export interface ReportSummary {
    total_users: number;
    total_work_days: number;
    average_attendance_rate: number;
    total_late_arrivals: number;
    total_absences: number;
}

export interface UserReportData {
    user_id: string;
    user_name: string;
    department: string;
    efficiency_score: number;
    attendance_rate: number;
    present_days: number;
    absent_days: number;
    late_arrivals: number;
    early_departures: number;
    total_work_hours: string;
}

export interface ReportData {
    generated_at: string;
    period: string;
    summary: ReportSummary;
    users: UserReportData[];
}

export type ReportType = 'attendance' | 'performance' | 'planning' | 'summary';
export type ReportPeriod = 'day' | 'week' | 'month' | 'year';

export interface ReportFilterState {
    type: ReportType;
    period: ReportPeriod;
    dateRange: {
        start: Date;
        end: Date;
    };
    department: string;
}

export interface ExportReportParams {
    start_date: string;
    end_date: string;
    format: 'pdf' | 'excel';
    type?: string;
    department?: string;
}

// ============================================================================
// NOTIFICATIONS TYPES
// ============================================================================

export interface Notification {
    id: string;
    user_id: string;
    type: string; // 'info', 'warning', 'error', 'success'
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    read_at?: string;
}

export interface NotificationsResponse {
    data: Notification[];
    total: number;
    unread_count: number;
}

export interface UnreadCountResponse {
    count: number;
}

// ============================================================================
// DEVICES TYPES (mDNS Discovery)
// ============================================================================

export interface Device {
    id: string;
    name: string;
    type: 'mobile' | 'desktop' | 'tablet';
    ip_address: string;
    mac_address: string;
    is_active: boolean;
    is_authorized: boolean;
    location?: string;
    last_seen: string;
    created_at: string;
}

export interface DevicesResponse {
    devices: Device[];
    total: number;
}

export interface RegisterDeviceRequest {
    name: string;
    type: 'mobile' | 'desktop' | 'tablet';
    ip_address: string;
    mac_address: string;
}

// ============================================================================
// MOBILE INTEGRATION TYPES
// ============================================================================

export interface PendingEnrollmentRequest {
    user_id: string;
    device_id: string;
    face_image: string; // base64
    metadata?: any;
}

export interface PendingEnrollment {
    id: string;
    user_id: string;
    device_id: string;
    status: 'pending' | 'validated' | 'rejected';
    created_at: string;
    validated_at?: string;
    validated_by?: string;
}

export interface PendingEnrollmentsResponse {
    enrollments: PendingEnrollment[];
    total: number;
}

export interface ValidateEnrollmentRequest {
    approved: boolean;
    notes?: string;
}

export interface CreateMassEnrollmentSession {
    name: string;
    description?: string;
    expected_count: number;
}

export interface MassEnrollmentSession {
    id: string;
    name: string;
    status: 'active' | 'completed' | 'cancelled';
    progress: number; // 0-100
    enrolled_count: number;
    expected_count: number;
    created_at: string;
}

// ============================================================================
// SYSTEM & HEALTH TYPES
// ============================================================================

export interface HealthResponse {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    service: string;
}

export interface StatsOverview {
    total_users: number;
    active_users: number;
    total_attendance_today: number;
    total_shifts: number;
    [key: string]: number; // Additional stats
}

// ============================================================================
// WEBSOCKET TYPES
// ============================================================================

export interface WebSocketMessage {
    type: 'notification' | 'update' | 'ping';
    data: any;
    timestamp: string;
}

// ============================================================================
// MANUAL VALIDATION
// ============================================================================

export interface ManualValidationRequest {
    id: string;
    employee_id: string | null;
    photo_url: string;
    timestamp: string;
    status: 'pending' | 'validated' | 'rejected';
    recognized_name?: string; // For display purposes if recognition had a partial match
}

export interface GetValidationQueueResponse {
    requests: ManualValidationRequest[];
    count: number;
}

export interface ValidateRequest {
    request_id: string;
    employee_id: string; // The employee this scan belongs to
    action: 'validate' | 'reject';
}
// ============================================================================
// ATTENDANCE JUSTIFICATION TYPES
// ============================================================================

export interface Justification {
    id: string;
    user_id: string;
    attendance_date: string; // YYYY-MM-DD
    reason: string;
    document_url?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    created_at: string;
    updated_at: string;
}

export interface JustifyAbsenceRequest {
    date: string; // YYYY-MM-DD
    reason: string;
    doc_data?: string; // Base64
    file_name?: string;
}
