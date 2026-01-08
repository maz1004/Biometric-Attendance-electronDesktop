import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
    connectWebSocket,
    disconnectWebSocket,
    onNotification,
    getUnreadCount,
    markAsRead as apiMarkAsRead,
    markAllAsRead as apiMarkAllAsRead
} from "../services/notifications";
import { Notification } from "../services/types/api-types";
import { useAuth } from "../features/authentication/useAuth"; // Assuming this exists or similar

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    addNotification: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, token } = useAuth(); // You might need to adjust this based on actual AuthContext
    const queryClient = useQueryClient();
    const [realtimeNotifications, setRealtimeNotifications] = useState<Notification[]>([]);

    // Fetch initial unread count
    const { data: unreadData } = useQuery({
        queryKey: ["notifications", "unread"],
        queryFn: getUnreadCount,
        enabled: isAuthenticated,
        refetchInterval: 60000, // Fallback polling
    });

    const unreadCount = unreadData?.count || 0;

    // WebSocket connection
    useEffect(() => {
        if (isAuthenticated && token) {
            connectWebSocket(token);

            const cleanup = onNotification((notification) => {
                setRealtimeNotifications((prev) => [notification, ...prev]);

                // Show toast
                toast(notification.message, {
                    icon: notification.type === 'error' ? '🔴' : notification.type === 'warning' ? '⚠️' : 'ℹ️',
                    duration: 4000,
                });

                // Invalidate queries to refresh lists/counts
                queryClient.invalidateQueries({ queryKey: ["notifications"] });
            });

            return () => {
                cleanup();
                disconnectWebSocket();
            };
        }
    }, [isAuthenticated, token, queryClient]);

    const markAsRead = useCallback(async (id: string) => {
        await apiMarkAsRead(id);
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }, [queryClient]);

    const markAllAsRead = useCallback(async () => {
        await apiMarkAllAsRead();
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        setRealtimeNotifications([]); // Clear realtime buffer if needed or merge logic
    }, [queryClient]);

    const addNotification = useCallback((notification: Notification) => {
        setRealtimeNotifications(prev => [notification, ...prev]);
    }, []);

    return (
        <NotificationContext.Provider value={{
            notifications: realtimeNotifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            addNotification
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
}
