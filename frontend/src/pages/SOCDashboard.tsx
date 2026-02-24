import { useEffect, useState, useCallback } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { socApi } from "@/lib/api";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Alert {
  id: string;
  user_id: string;
  risk_score: number;
  status: string;
  created_at: string;
}

interface Log {
  id: string;
  user_id: string;
  action: string;
  ip_address: string;
  timestamp: string;
  risk_score?: number;
}

const CHART_COLORS = {
  ALLOW: "hsl(142, 71%, 45%)",
  MFA_REQUIRED: "hsl(45, 93%, 47%)",
  BLOCK: "hsl(0, 72%, 51%)",
};

const SOCDashboard = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [alertsRes, logsRes] = await Promise.all([
        socApi.getAlerts(),
        socApi.getLogs(),
      ]);
      setAlerts(alertsRes.data.alerts || alertsRes.data || []);
      setLogs(logsRes.data.logs || logsRes.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resolveAlert = async (id: string) => {
    setResolvingId(id);
    try {
      await socApi.updateAlert(id, "RESOLVED");
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "RESOLVED" } : a))
      );
    } catch {
      // silent
    } finally {
      setResolvingId(null);
    }
  };

  // Stats
  const totalAlerts = alerts.length;
  const openAlerts = alerts.filter((a) => a.status !== "RESOLVED").length;
  const resolvedAlerts = alerts.filter((a) => a.status === "RESOLVED").length;

  // Pie data - decision distribution from alerts status
  const statusCounts: Record<string, number> = {};
  alerts.forEach((a) => {
    statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
  });
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Bar data - risk score ranges
  const riskBuckets = [
    { range: "0-20", count: 0 },
    { range: "21-40", count: 0 },
    { range: "41-60", count: 0 },
    { range: "61-80", count: 0 },
    { range: "81-100", count: 0 },
  ];
 alerts.forEach((a) => {
  if (typeof a.risk_score === "number") {
    const idx = Math.min(Math.floor(a.risk_score / 20), 4);
    if (riskBuckets[idx]) {
      riskBuckets[idx].count++;
    }
  }
});

  const PIE_COLORS = ["hsl(210, 100%, 56%)", "hsl(142, 71%, 45%)", "hsl(45, 93%, 47%)", "hsl(0, 72%, 51%)", "hsl(190, 95%, 50%)"];

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">SOC Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Security Operations Center — Real-time threat monitoring
            </p>
          </div>
          <button
            onClick={fetchData}
            className="px-4 py-2 rounded-md bg-secondary border border-border text-sm text-foreground hover:bg-secondary/80 transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Alerts</p>
                    <p className="text-3xl font-bold font-mono text-foreground mt-1">{totalAlerts}</p>
                  </div>
                  <ShieldAlert className="w-8 h-8 text-primary opacity-50" />
                </div>
              </div>
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Open Alerts</p>
                    <p className="text-3xl font-bold font-mono text-warning mt-1">{openAlerts}</p>
                  </div>
                  <Clock className="w-8 h-8 text-warning opacity-50" />
                </div>
              </div>
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Resolved</p>
                    <p className="text-3xl font-bold font-mono text-success mt-1">{resolvedAlerts}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-success opacity-50" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
              <div className="glass-card p-6">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                  Alert Status Distribution
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "hsl(222, 47%, 9%)",
                        border: "1px solid hsl(222, 30%, 16%)",
                        borderRadius: "6px",
                        color: "hsl(210, 40%, 92%)",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-4 justify-center mt-2">
                  {pieData.map((entry, i) => (
                    <div key={entry.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      {entry.name} ({entry.value})
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                  Risk Score Distribution
                </h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={riskBuckets}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
                    <XAxis dataKey="range" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(222, 30%, 16%)" }} />
                    <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(222, 30%, 16%)" }} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(222, 47%, 9%)",
                        border: "1px solid hsl(222, 30%, 16%)",
                        borderRadius: "6px",
                        color: "hsl(210, 40%, 92%)",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(210, 100%, 56%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Alerts Table */}
            <div className="glass-card mb-8">
              <div className="p-4 border-b border-border flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <h3 className="text-sm font-medium text-foreground">Security Alerts</h3>
                <span className="text-xs text-muted-foreground ml-auto">{alerts.length} alerts</span>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Alert ID</th>
                      <th>User ID</th>
                      <th>Risk Score</th>
                      <th>Status</th>
                      <th>Created At</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map((alert) => (
                      <tr key={alert.id}>
                        <td>{alert.id}</td>
                        <td>{alert.user_id}</td>
                        <td>
                          <span
                            className={`font-semibold ${
                              alert.risk_score >= 80
                                ? "text-destructive"
                                : alert.risk_score >= 50
                                ? "text-warning"
                                : "text-success"
                            }`}
                          >
                            {alert.risk_score}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${
                              alert.status === "RESOLVED"
                                ? "bg-success/10 text-success"
                                : "bg-warning/10 text-warning"
                            }`}
                          >
                            <span
                              className={`pulse-dot ${
                                alert.status === "RESOLVED" ? "bg-success" : "bg-warning"
                              }`}
                            />
                            {alert.status}
                          </span>
                        </td>
                        <td>{new Date(alert.created_at).toLocaleString()}</td>
                        <td>
                          {alert.status !== "RESOLVED" && (
                            <button
                              onClick={() => resolveAlert(alert.id)}
                              disabled={resolvingId === alert.id}
                              className="px-3 py-1 rounded text-xs bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 disabled:opacity-50 transition-colors"
                            >
                              {resolvingId === alert.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                "Resolve"
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {alerts.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center text-muted-foreground py-8">
                          No alerts found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Activity Logs */}
            <div className="glass-card">
              <div className="p-4 border-b border-border flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-medium text-foreground">Activity Logs</h3>
                <span className="text-xs text-muted-foreground ml-auto">{logs.length} entries</span>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Log ID</th>
                      <th>User ID</th>
                      <th>Action</th>
                      <th>IP Address</th>
                      <th>Risk Score</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td>{log.id}</td>
                        <td>{log.user_id}</td>
                        <td>
                          <span className="text-foreground">{log.action}</span>
                        </td>
                        <td>{log.ip_address}</td>
                        <td>
                          {log.risk_score !== undefined ? (
                            <span
                              className={`font-semibold ${
                                log.risk_score >= 80
                                  ? "text-destructive"
                                  : log.risk_score >= 50
                                  ? "text-warning"
                                  : "text-success"
                              }`}
                            >
                              {log.risk_score}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center text-muted-foreground py-8">
                          No activity logs found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default SOCDashboard;
