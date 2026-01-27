import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";

import AppLayout from "./ui/AppLayout";
import ProtectedRoute from "./ui/ProtectedRoute";

import { DarkModeProvider } from "./context/DarkModeContext";
import { NotificationProvider } from "./context/NotificationContext";
import { GlobalStyles } from "./styles/GlobalStyles";
import PageNotFound from "./pages/PageNotFound";
import Login from "./pages/Login";
import Account from "./pages/Account";
import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Planning from "./pages/Planning";
import Reports from "./pages/Reports";
import Devices from "./pages/Devices";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000 },
  },
});

// Configure Main Router
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate replace to="dashboard" /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "users", element: <Users /> },
      { path: "settings", element: <Settings /> },
      { path: "account", element: <Account /> },
      { path: "employees", element: <Employees /> },
      { path: "attendance", element: <Attendance /> },
      { path: "planning", element: <Planning /> },
      { path: "reports", element: <Reports /> },
      { path: "devices", element: <Devices /> },
    ],
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "*",
    element: <PageNotFound />,
  },
]);

function App() {
  return (
    <DarkModeProvider>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <GlobalStyles />
        <NotificationProvider>
          <RouterProvider router={router} />
        </NotificationProvider>

        <Toaster
          position="top-center"
          gutter={12}
          containerStyle={{ margin: "8px" }}
          toastOptions={{
            success: { duration: 3000 },
            error: { duration: 5000 },
            style: {
              fontSize: "16px",
              maxWidth: "500px",
              backgroundColor: "var(--color-grey-0)",
              color: "var(--color-grey-700)",
            },
          }}
        />
      </QueryClientProvider>
    </DarkModeProvider>
  );
}

export default App;
