import React, { createContext, useContext, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
    connectWebSocket,
    disconnectWebSocket,
    onNotification,
    getUnreadCount,
    getNotifications, // Added import
    markAsRead as apiMarkAsRead,
    markAllAsRead as apiMarkAllAsRead,
    deleteNotification as apiDeleteNotification
} from "../services/notifications";
import { Notification } from "../services/types/api-types";
import { useAuth } from "../features/authentication/useAuth";

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    addNotification: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, token } = useAuth();
    const queryClient = useQueryClient();

    // We rely on React Query for the source of truth, no separate state needed for list
    // unless we want to prepend realtime ones instantly (optimistic).
    // For now, invalidating queries on WS event is safer and "fast enough".

    // Fetch initial unread count
    const { data: unreadData } = useQuery({
        queryKey: ["notifications", "unread"],
        queryFn: getUnreadCount,
        enabled: isAuthenticated,
    });

    // Fetch initial notifications list
    const { data: notificationsData } = useQuery({
        queryKey: ["notifications", "list"],
        queryFn: () => getNotifications(1, 20),
        enabled: isAuthenticated,
    });

    const unreadCount = unreadData?.count || 0;
    const notifications = notificationsData?.data || [];

    useEffect(() => {
        // console.log("[NotificationContext] Auth State:", { isAuthenticated, hasToken: !!token });
        // console.log("[NotificationContext] Unread Data:", unreadData);
        // console.log("[NotificationContext] Notifications Data:", notificationsData);
        // console.log("[NotificationContext] Notifications List:", notifications);
    }, [isAuthenticated, token, unreadData, notificationsData, notifications]);

    // WebSocket connection
    useEffect(() => {
        if (isAuthenticated && token) {
            connectWebSocket(token);

            const cleanup = onNotification((notification) => {
                // Invalidate queries to refresh lists/counts from server
                // This ensures we get the persisted state
                queryClient.invalidateQueries({ queryKey: ["notifications"] });

                // Show toast
                toast(notification.message, {
                    icon: notification.type === 'error' ? '🔴' : notification.type === 'warning' ? '⚠️' : 'ℹ️',
                    duration: 4000,
                });
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
    }, [queryClient]);

    const deleteNotification = useCallback(async (id: string) => {
        await apiDeleteNotification(id);
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }, [queryClient]);

    const addNotification = useCallback((_notification: Notification) => {
        // Manually adding is less critical if we invalidate, but we can keep it for optimistic updates if we wanted.
        // For now, just invalidate to be safe.
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }, [queryClient]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            deleteNotification,
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
