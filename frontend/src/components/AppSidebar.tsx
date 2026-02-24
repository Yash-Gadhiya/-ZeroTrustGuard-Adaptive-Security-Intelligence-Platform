import { useNavigate, useLocation } from "react-router-dom";
import {
  Shield,
  LayoutDashboard,
  Activity,
  AlertTriangle,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  // Load role from localStorage
  useEffect(() => {
    const storedRole = localStorage.getItem("ztg_role");
    setRole(storedRole);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("ztg_token");
    localStorage.removeItem("ztg_role");
    navigate("/login");
  };

  // 🔥 Role-based navigation items
  const navItems =
    role === "admin" || role === "super_admin"
      ? [
          { title: "SOC Dashboard", path: "/soc", icon: AlertTriangle },
          { title: "Activity Logs", path: "/soc?tab=logs", icon: Activity },
        ]
      : [
          { title: "Employee Access", path: "/dashboard", icon: LayoutDashboard },
        ];

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-foreground tracking-tight">
              ZeroTrustGuard
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Threat Protection
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path.split("?")[0];

          return (
            <button
              key={item.title}
              onClick={() => navigate(item.path.split("?")[0])}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
}