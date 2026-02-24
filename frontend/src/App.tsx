import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import SOCDashboard from "./pages/SOCDashboard";

const queryClient = new QueryClient();

const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) => {
  const token = localStorage.getItem("ztg_token");
  const role = localStorage.getItem("ztg_role");

  if (!token) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(role || "")) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
  path="/dashboard"
  element={
    <ProtectedRoute allowedRoles={["user"]}>
      <EmployeeDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/soc"
  element={
    <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
      <SOCDashboard />
    </ProtectedRoute>
  }
/>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
