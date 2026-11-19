import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Gauge,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import {
  computeDevEfficiencyScore,
  probeServerHealth,
  subscribeTelemetry,
  type TelemetrySnapshot,
} from "@/lib/performanceTelemetry";
import { stopRevealKey, stopRevealWheel } from "@/components/sandboxes/revealEvents";

interface SidebarPerformanceMonitorProps {
  completedModulesCount: number;
  totalModulesCount: number;
  sidebarOpen: boolean;
}

export default function SidebarPerformanceMonitor({
  completedModulesCount,
  totalModulesCount,
  sidebarOpen,
}: SidebarPerformanceMonitorProps) {
  const [snapshot, setSnapshot] = useState<TelemetrySnapshot | null>(null);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [probing, setProbing] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = subscribeTelemetry((next) => {
      setSnapshot(next);
    });
    return unsubscribe;
  }, []);

  const scoreData = useMemo(() => {
    if (!snapshot) {
      return { totalScore: 0, modulePoints: 0, practicePoints: 0, aiPoints: 0 };
    }
    return computeDevEfficiencyScore({
      completedModulesCount,
      totalModulesCount,
      snapshot,
    });
  }, [completedModulesCount, totalModulesCount, snapshot]);

  const handleManualProbe = async () => {
    setProbing(true);
    await probeServerHealth();
    setProbing(false);
  };

  if (!snapshot) return null;

  const latencyValue = snapshot.lastInteractionMs;
  const latencyLabel =
    latencyValue === 0
      ? "待采样"
      : latencyValue <= 16
      ? "极速 <16ms"
      : latencyValue <= 50
      ? "流畅"
      : "偏高";

  const latencyTone =
    latencyValue === 0
      ? "text-slate-300"
      : latencyValue <= 16
      ? "text-emerald-300"
      : latencyValue <= 50
      ? "text-gemini-cyan"
      : "text-amber-300";

  const aiDisplay =
    snapshot.aiTotalCalls > 0 && snapshot.aiSuccessRate !== null
      ? `${snapshot.aiSuccessRate}%`
      : snapshot.serverHealthy
      ? snapshot.hasGeminiKey
        ? "100%"
        : "受限"
      : snapshot.serverHealthy === false
      ? "离线"
      : "检测中";

  const aiSubLabel =
    snapshot.aiTotalCalls > 0
      ? `${snapshot.aiSuccessCalls}/${snapshot.aiTotalCalls} 次调用${
          snapshot.lastAiLatencyMs ? ` · ${snapshot.lastAiLatencyMs}ms` : ""
        }`
      : snapshot.serverHealthy
      ? snapshot.hasGeminiKey
        ? "Gemini 就绪 · 待调用"
        : "未配置 API Key"
      : "连接校验中";

  const aiHealthy =
    snapshot.aiTotalCalls > 0
      ? (snapshot.aiSuccessRate ?? 0) >= 80
      : Boolean(snapshot.serverHealthy && snapshot.hasGeminiKey);

  // When sidebar is collapsed, render compact floating dock at bottom-left of viewport
  const wrapperClassName = sidebarOpen
    ? "mx-2.5 mb-2.5 rounded-2xl bg-[#0b1120]/95 backdrop-blur-xl border border-gemini-cyan/30 shadow-[0_12px_32px_rgba(0,0,0,0.65)] shrink-0"
    : "fixed left-3 bottom-3 z-40 w-60 rounded-2xl bg-[#0b1120]/95 backdrop-blur-xl border border-gemini-cyan/30 shadow-[0_12px_32px_rgba(0,0,0,0.75)]";

  return (
    <section
      aria-label="实时性能与开发效能监控"
      onWheel={stopRevealWheel}
      onKeyDown={stopRevealKey}
      className={wrapperClassName}
    >
      {/* Floating Card Header */}
      <div className="px-3 py-2 flex items-center justify-between gap-2 border-b border-white/10">
        <div className="flex items-center gap-1.5 min-w-0">
          <Gauge className="w-3.5 h-3.5 text-gemini-cyan shrink-0" />
          <span className="text-[11px] font-mono font-semibold text-white truncate">
            效能监控浮窗
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleManualProbe}
            disabled={probing}
            title="实时探测服务端 /api/health 与响应延迟"
            aria-label="实时探测服务端健康状态"
            className="p-1 rounded-md text-slate-400 hover:text-gemini-cyan hover:bg-white/10 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${probing ? "animate-spin text-gemini-cyan" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            title={collapsed ? "展开性能监控面板" : "折叠性能监控面板"}
            aria-label={collapsed ? "展开性能监控面板" : "折叠性能监控面板"}
            aria-expanded={!collapsed}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Compact Summary Row when Collapsed */}
      {collapsed ? (
        <div className="px-3 py-2 flex items-center justify-between gap-2 text-[10.5px] font-mono tabular-nums">
          <span className={latencyTone}>
            {latencyValue > 0 ? `${latencyValue}ms` : "0.0ms"}
          </span>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <span className={aiHealthy ? "text-emerald-300" : "text-amber-300"}>
            AI {aiDisplay}
          </span>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <span className="text-gemini-purple font-bold">{scoreData.totalScore} 分</span>
        </div>
      ) : (
        <div className="p-3 space-y-2.5 text-xs tabular-nums">
          {/* Row 1: Interaction Response Time & AI API Success Rate */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-xl bg-black/45 border border-white/8">
              <div className="flex items-center justify-between gap-1 text-[10px] text-slate-400">
                <span className="inline-flex items-center gap-1 truncate">
                  <Activity className="w-3 h-3 text-gemini-cyan shrink-0" />
                  <span>交互响应</span>
                </span>
              </div>
              <div className={`text-sm font-black font-mono mt-0.5 ${latencyTone}`}>
                {latencyValue > 0 ? `${latencyValue} ms` : "-- ms"}
              </div>
              <div className="text-[9.5px] font-mono text-slate-400 truncate mt-0.5">
                {latencyLabel}
                {snapshot.avgInteractionMs > 0 ? ` · 均 ${snapshot.avgInteractionMs}ms` : ""}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-black/45 border border-white/8">
              <div className="flex items-center justify-between gap-1 text-[10px] text-slate-400">
                <span className="inline-flex items-center gap-1 truncate">
                  <Sparkles className="w-3 h-3 text-gemini-purple shrink-0" />
                  <span>AI 成功率</span>
                </span>
                {aiHealthy ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                ) : (
                  <ShieldAlert className="w-3 h-3 text-amber-400 shrink-0" />
                )}
              </div>
              <div
                className={`text-sm font-black font-mono mt-0.5 ${
                  aiHealthy ? "text-emerald-300" : "text-amber-300"
                }`}
              >
                {aiDisplay}
              </div>
              <div className="text-[9.5px] font-mono text-slate-400 truncate mt-0.5">
                {aiSubLabel}
              </div>
            </div>
          </div>

          {/* Row 2: Accumulated Dev Efficiency Score */}
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-gemini-purple/30 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10.5px] font-medium text-slate-200 inline-flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>开发效能分数</span>
              </span>
              <span className="text-sm font-black font-mono text-gemini-cyan">
                {scoreData.totalScore}
                <span className="text-[10px] font-normal text-slate-400"> / 100</span>
              </span>
            </div>

            <div
              className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={scoreData.totalScore}
              aria-label="当前已积累开发效能分数"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-gemini-cyan via-emerald-400 to-gemini-purple transition-all duration-300"
                style={{ width: `${scoreData.totalScore}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-400">
              <span>模块 {scoreData.modulePoints}</span>
              <span>·</span>
              <span>沙盘 {scoreData.practicePoints}</span>
              <span>·</span>
              <span>AI 协同 {scoreData.aiPoints}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
