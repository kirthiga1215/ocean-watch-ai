import { Activity, Layers } from "lucide-react";
import { useDatasetDashboard } from "@/hooks/useDatasetDashboard";

const LeftPanel = () => {
  const { data } = useDatasetDashboard();

  return (
    <div className="glass-card glow-border p-5 w-64 flex flex-col gap-5 animate-fade-in">
      <h2 className="text-xs font-semibold tracking-widest uppercase text-primary">
        Plastic Density
      </h2>

      {/* Heat Scale Legend */}
      <div className="flex items-center gap-3">
        <div className="w-4 h-40 rounded-full overflow-hidden relative">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, hsl(217 91% 60%), hsl(48 96% 53%), hsl(0 84% 60%))",
            }}
          />
        </div>
        <div className="flex flex-col justify-between h-40 text-xs font-mono text-muted-foreground">
          <span>High</span>
          <span>Medium</span>
          <span>Low</span>
        </div>
      </div>

      {/* Info Cards */}
      <div className="space-y-3">
        <div className="glass-card p-3 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center">
            <Layers className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Cluster Count
            </p>
            <p className="text-lg font-semibold font-mono text-foreground">
              {data?.summary.cluster_count ?? "-"}
            </p>
          </div>
        </div>

        <div className="glass-card p-3 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center">
            <Activity className="h-4 w-4 text-heat-medium" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Density Level
            </p>
            <p className="text-lg font-semibold text-heat-medium font-mono">
              {data?.summary.density_level ?? "-"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-border/50">
        <p className="text-[10px] text-muted-foreground font-mono">
          Last scan: <span className="text-primary">{data?.summary.last_scan ?? "-"}</span>
        </p>
      </div>
    </div>
  );
};

export default LeftPanel;
