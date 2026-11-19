export interface AiCallRecord {
  endpoint: string;
  ok: boolean;
  latencyMs: number;
  timestamp: number;
}

export interface TelemetrySnapshot {
  lastInteractionMs: number;
  avgInteractionMs: number;
  interactionCount: number;
  aiTotalCalls: number;
  aiSuccessCalls: number;
  aiSuccessRate: number | null;
  lastAiLatencyMs: number | null;
  serverHealthy: boolean | null;
  hasGeminiKey: boolean;
  sandboxActionsCount: number;
}

type Listener = (snapshot: TelemetrySnapshot) => void;

const SANDBOX_ACTIONS_STORAGE_KEY = "cursor_course_sandbox_actions_v1";

function loadPersistedSandboxActions(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(SANDBOX_ACTIONS_STORAGE_KEY);
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

function savePersistedSandboxActions(count: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SANDBOX_ACTIONS_STORAGE_KEY, String(count));
  } catch {
    // Ignore storage quota issues
  }
}

const state: TelemetrySnapshot = {
  lastInteractionMs: 0,
  avgInteractionMs: 0,
  interactionCount: 0,
  aiTotalCalls: 0,
  aiSuccessCalls: 0,
  aiSuccessRate: null,
  lastAiLatencyMs: null,
  serverHealthy: null,
  hasGeminiKey: false,
  sandboxActionsCount: loadPersistedSandboxActions(),
};

const recentInteractionLatencies: number[] = [];
const listeners = new Set<Listener>();

function emit() {
  const snapshot: TelemetrySnapshot = { ...state };
  listeners.forEach((listener) => listener(snapshot));
}

export function subscribeTelemetry(listener: Listener): () => void {
  listeners.add(listener);
  listener({ ...state });
  return () => {
    listeners.delete(listener);
  };
}

export function recordInteractionLatency(durationMs: number, countAsSandboxAction = false) {
  const clamped = Math.max(0.4, Math.min(2000, Number(durationMs.toFixed(1))));
  recentInteractionLatencies.push(clamped);
  if (recentInteractionLatencies.length > 20) {
    recentInteractionLatencies.shift();
  }
  const sum = recentInteractionLatencies.reduce((a, b) => a + b, 0);

  state.lastInteractionMs = clamped;
  state.avgInteractionMs = Number((sum / recentInteractionLatencies.length).toFixed(1));
  state.interactionCount += 1;

  if (countAsSandboxAction) {
    state.sandboxActionsCount += 1;
    savePersistedSandboxActions(state.sandboxActionsCount);
  }
  emit();
}

export function recordAiApiCall(record: Omit<AiCallRecord, "timestamp">) {
  state.aiTotalCalls += 1;
  if (record.ok) {
    state.aiSuccessCalls += 1;
  }
  state.aiSuccessRate = Math.round((state.aiSuccessCalls / state.aiTotalCalls) * 100);
  state.lastAiLatencyMs = Math.round(record.latencyMs);
  state.sandboxActionsCount += 2; // AI-assisted workflow action contributes extra mastery weight
  savePersistedSandboxActions(state.sandboxActionsCount);
  emit();
}

export function setServerHealthStatus(healthy: boolean, hasGeminiKey: boolean) {
  state.serverHealthy = healthy;
  state.hasGeminiKey = hasGeminiKey;
  emit();
}

export function resetSandboxTelemetryScore() {
  state.sandboxActionsCount = 0;
  savePersistedSandboxActions(0);
  emit();
}

export async function probeServerHealth(): Promise<{ ok: boolean; hasGeminiKey: boolean }> {
  const start = performance.now();
  try {
    const res = await fetch("/api/health");
    const elapsed = performance.now() - start;
    recordInteractionLatency(elapsed, false);
    if (!res.ok) {
      setServerHealthStatus(false, false);
      return { ok: false, hasGeminiKey: false };
    }
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      hasGeminiKey?: boolean;
    };
    const ok = Boolean(data.ok);
    const hasKey = Boolean(data.hasGeminiKey);
    setServerHealthStatus(ok, hasKey);
    return { ok, hasGeminiKey: hasKey };
  } catch {
    setServerHealthStatus(false, false);
    return { ok: false, hasGeminiKey: false };
  }
}

export function computeDevEfficiencyScore(params: {
  completedModulesCount: number;
  totalModulesCount: number;
  snapshot: TelemetrySnapshot;
}): {
  totalScore: number;
  modulePoints: number;
  practicePoints: number;
  aiPoints: number;
} {
  const { completedModulesCount, totalModulesCount, snapshot } = params;
  // 1. Curriculum Mastery (up to 45 pts)
  const modulePoints =
    totalModulesCount > 0
      ? Math.round((completedModulesCount / totalModulesCount) * 45)
      : 0;

  // 2. Interactive Sandbox Practice (up to 35 pts, saturates smoothly around 35 actions)
  const practicePoints = Math.min(35, Math.round(snapshot.sandboxActionsCount * 1.4));

  // 3. AI Collaboration & System Readiness (up to 20 pts)
  let aiPoints = 0;
  if (snapshot.aiTotalCalls > 0) {
    const rate = snapshot.aiSuccessRate ?? 0;
    aiPoints = Math.round((rate / 100) * 16) + Math.min(4, snapshot.aiTotalCalls);
  } else if (snapshot.serverHealthy && snapshot.hasGeminiKey) {
    aiPoints = 8; // Ready baseline before first AI call
  }

  const totalScore = Math.min(100, modulePoints + practicePoints + aiPoints);
  return { totalScore, modulePoints, practicePoints, aiPoints };
}
