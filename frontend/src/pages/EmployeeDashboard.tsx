import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Shield, Loader2, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { accessApi } from "@/lib/api";

const EmployeeDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    risk_score: number;
    decision: string;
    message: string;
  } | null>(null);
  const [error, setError] = useState("");

  const handleAccess = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await accessApi.accessSensitive();
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Access request failed");
    } finally {
      setLoading(false);
    }
  };

  const getDecisionConfig = (decision: string) => {
    switch (decision) {
      case "ALLOW":
        return { icon: ShieldCheck, color: "text-success", bg: "bg-success/10 border-success/20", label: "Access Granted" };
      case "MFA_REQUIRED":
        return { icon: ShieldAlert, color: "text-warning", bg: "bg-warning/10 border-warning/20", label: "MFA Required" };
      case "BLOCK":
        return { icon: ShieldX, color: "text-destructive", bg: "bg-destructive/10 border-destructive/20", label: "Access Blocked" };
      default:
        return { icon: Shield, color: "text-muted-foreground", bg: "bg-muted", label: decision };
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Employee Access Portal</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Request access to sensitive resources with real-time risk assessment
            </p>
          </div>

          {/* Access Button Card */}
          <div className="glass-card p-8 text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Sensitive Resource Access</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Your access will be evaluated by the Zero Trust engine in real-time
            </p>
            <button
              onClick={handleAccess}
              disabled={loading}
              className="px-8 py-3 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-all inline-flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Evaluating...
                </>
              ) : (
                "Access Sensitive Resource"
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="glass-card p-4 border-destructive/30 bg-destructive/5 mb-6">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="glass-card p-6 space-y-6">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Risk Assessment Result
              </h3>

              {/* Decision Banner */}
              {(() => {
                const config = getDecisionConfig(result.decision);
                const Icon = config.icon;
                return (
                  <div className={`p-4 rounded-md border ${config.bg} flex items-center gap-4`}>
                    <Icon className={`w-8 h-8 ${config.color}`} />
                    <div>
                      <p className={`text-lg font-bold ${config.color}`}>{result.decision}</p>
                      <p className="text-xs text-muted-foreground">{config.label}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-md bg-secondary border border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Risk Score</p>
                  <p className="text-3xl font-bold font-mono text-foreground">{result.risk_score}</p>
                </div>
                <div className="p-4 rounded-md bg-secondary border border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Message</p>
                  <p className="text-sm text-foreground mt-1">{result.message}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
