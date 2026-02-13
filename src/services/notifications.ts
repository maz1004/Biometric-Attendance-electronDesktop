import { apiClient as api } from "./api";
import { API_BASE_URL, API_VERSION } from "./config/api";
import { Notification, NotificationsResponse, UnreadCountResponse } from "./types/api-types";

// HTTP Endpoints
export const getNotifications = async (page = 1, limit = 20): Promise<NotificationsResponse> => {
    const response = await api.get<NotificationsResponse>("/notifications", {
        params: { page, limit },
    });
    return response.data;
};

export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
    const response = await api.get<UnreadCountResponse>("/notifications/unread-count");
    return response.data;
};

export const markAsRead = async (id: string): Promise<void> => {
    await api.put(`/notifications/${id}/read`);
};

export const markAllAsRead = async (): Promise<void> => {
    await api.put("/notifications/mark-all-read");
};

export const deleteNotification = async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`);
};

// WebSocket
let ws: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;

type NotificationHandler = (notification: Notification) => void;
const handlers: Set<NotificationHandler> = new Set();

export const connectWebSocket = (token: string) => {
    if (ws) return;

    // Adjust WS URL based on API_BASE_URL (replace http with ws)
    const wsUrl = API_BASE_URL.replace(/^http/, "ws") + API_VERSION + "/notifications/ws";

    // Append token as query param if needed, or send in header (WS standard usually query param)
    // The requirement says "Auth : Token JWT dans query param ou header."
    // Browser WebSocket API doesn't support headers, so query param it is.
    ws = new WebSocket(`${wsUrl}?token=${token}`);

    ws.onopen = () => {
        // console.log("Notification WebSocket connected");
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === "notification" || data.type === "attendance_update") {
                handlers.forEach((handler) => handler(data.payload || data));
            }
        } catch (err) {
            console.error("Failed to parse WebSocket message", err);
        }
    };

    ws.onclose = () => {
        // console.log("Notification WebSocket disconnected");
        ws = null;
        // Simple reconnect logic
        reconnectTimeout = setTimeout(() => {
            connectWebSocket(token);
        }, 5000);
    };

    ws.onerror = (err) => {
        console.error("Notification WebSocket error", err);
        ws?.close();
    };
};

export const disconnectWebSocket = () => {
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
    }
    if (ws) {
        ws.onclose = null; // Prevent reconnect
        ws.close();
        ws = null;
    }
};

export const onNotification = (handler: NotificationHandler) => {
    handlers.add(handler);
    return () => handlers.delete(handler);
};
