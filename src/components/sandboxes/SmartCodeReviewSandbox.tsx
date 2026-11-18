import { useMemo, useState } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileCode2,
  ListChecks,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { stopRevealKey, stopRevealWheel } from "./revealEvents";

type RuleId =
  | "inj-auth"
  | "race-leak"
  | "error-boundary"
  | "perf-n1"
  | "secret-hygiene"
  | "type-test-rigor";

type PriorityLevel = "P0" | "P1" | "P2";
type StrictnessMode = "lenient" | "balanced" | "strict";

interface BugbotRule {
  id: RuleId;
  name: string;
  promptClause: string;
  keywords: string[];
}

interface SeededBug {
  id: string;
  line: number;
  ruleId: RuleId;
  basePriority: PriorityLevel;
  title: string;
  explanation: string;
  fixAction: string;
  estMinutes: number;
  minStrictness: StrictnessMode;
}

interface RepoSnippet {
  id: string;
  filePath: string;
  label: string;
  domain: string;
  lines: string[];
  bugs: SeededBug[];
}

const BUGBOT_RULES: BugbotRule[] = [
  {
    id: "inj-auth",
    name: "注入防御与服务端权威校验",
    promptClause: "拦截 SQL/命令拼接、XSS 以及直接使用客户端传入金额/权限",
    keywords: ["sql", "注入", "xss", "命令", "鉴权", "金额", "价格"],
  },
  {
    id: "race-leak",
    name: "并发竞态与资源生命周期守卫",
    promptClause: "检查无锁扣减、AbortController 缺失与未清理 setInterval",
    keywords: ["并发", "竞态", "锁", "abort", "定时器", "泄漏", "interval"],
  },
  {
    id: "error-boundary",
    name: "Fail-Closed 异常与零残留日志",
    promptClause: "严禁空 catch{} 吞错、生产 console.log 与未清理 TODO",
    keywords: ["catch", "异常", "日志", "console", "todo", "残留"],
  },
  {
    id: "perf-n1",
    name: "N+1 查询放大与重试风暴",
    promptClause: "识别循环内 await 数据库查询与缺少指数退避的重试逻辑",
    keywords: ["n+1", "性能", "循环", "查询", "重试", "退避"],
  },
  {
    id: "secret-hygiene",
    name: "密钥零硬编码与环境变量隔离",
    promptClause: "禁止源码明文密钥、前端暴露服务端 ENV 密钥",
    keywords: ["密钥", "key", "secret", "token", "环境变量", "env"],
  },
  {
    id: "type-test-rigor",
    name: "类型强约束与反测试作弊",
    promptClause: "拦截 as any 类型逃逸与 expect(true).toBe(true) 假断言",
    keywords: ["any", "类型", "测试", "断言", "expect", "skip"],
  },
];

const REPO_SNIPPETS: RepoSnippet[] = [
  {
    id: "checkout",
    filePath: "src/app/api/orders/checkout/route.ts",
    label: "支付结算 API",
    domain: "Next.js Route Handler",
    lines: [
      "export async function POST(req: Request) {",
      "  const body = await req.json();",
      "  const userId = body.userId;",
      "  // 1. 直接信任前端传入的 items.price 计算总额",
      "  const total = body.items.reduce((s, i) => s + i.price * i.qty, 0);",
      "  // 2. 拼接 SQL 且未加 balance >= total 行锁条件",
      "  await db.execute(`UPDATE wallets SET balance = balance - ${total} WHERE user_id = '${userId}'`);",
      "  try {",
      "    const details = await Promise.all(",
      "      body.items.map((i) => db.query.products.findFirst({ where: eq(products.id, i.id) }))",
      "    );",
      "    return Response.json({ ok: true, details });",
      "  } catch (err) {}",
      "  console.log('DEBUG secret:', process.env.STRIPE_SECRET_KEY, body);",
      "}",
    ],
    bugs: [
      {
        id: "ck-price",
        line: 5,
        ruleId: "inj-auth",
        basePriority: "P0",
        title: "客户端金额未回表校验（零元购风险）",
        explanation: "直接采信请求体中的 i.price 计算扣款总额，攻击者可篡改单价为 0 或负数。",
        fixAction: "改为按 productId 从数据库查询实时单价并在服务端重算 total。",
        estMinutes: 15,
        minStrictness: "lenient",
      },
      {
        id: "ck-sqli",
        line: 7,
        ruleId: "inj-auth",
        basePriority: "P0",
        title: "SQL 模板字符串拼接注入",
        explanation: "userId 与 total 直接拼入 db.execute 原生 SQL，存在高危注入风险。",
        fixAction: "使用参数化查询或 Drizzle ORM 条件更新。",
        estMinutes: 12,
        minStrictness: "lenient",
      },
      {
        id: "ck-race",
        line: 7,
        ruleId: "race-leak",
        basePriority: "P0",
        title: "并发扣款竞态（TOCTOU 透支）",
        explanation: "并发请求同时扣减余额时缺少 WHERE balance >= total 原子约束或事务锁。",
        fixAction: "在事务中使用原子条件更新并校验受影响行数。",
        estMinutes: 20,
        minStrictness: "balanced",
      },
      {
        id: "ck-n1",
        line: 10,
        ruleId: "perf-n1",
        basePriority: "P1",
        title: "Promise.all 循环单查引发 N+1 放大",
        explanation: "购物车包含 N 件商品时触发 N 次独立数据库往返查询，高并发下打满连接池。",
        fixAction: "合并为单条 WHERE id IN (...) 批量查询。",
        estMinutes: 10,
        minStrictness: "balanced",
      },
      {
        id: "ck-catch",
        line: 13,
        ruleId: "error-boundary",
        basePriority: "P1",
        title: "空 catch {} 静默吞没交易异常",
        explanation: "数据库更新或查询失败后未记录日志也未返回 500 错误，导致静默数据不一致。",
        fixAction: "记录结构化错误日志并返回明确的 500 JSON 错误响应。",
        estMinutes: 6,
        minStrictness: "lenient",
      },
      {
        id: "ck-secret",
        line: 14,
        ruleId: "secret-hygiene",
        basePriority: "P2",
        title: "日志明文打印 STRIPE_SECRET_KEY",
        explanation: "调试 console.log 残留且将服务端密钥写入可收集日志流中。",
        fixAction: "删除调试 console.log，敏感字段执行脱敏。",
        estMinutes: 4,
        minStrictness: "strict",
      },
    ],
  },
  {
    id: "quotes-hook",
    filePath: "src/hooks/usePortfolioStream.ts",
    label: "实时行情 Hook",
    domain: "React Custom Hook",
    lines: [
      "const PARTNER_API_KEY = 'sk-live-9481a2f09c33';",
      "export function usePortfolioStream(symbol: string, noteHtml: string) {",
      "  const [data, setData] = useState<any>(null);",
      "  useEffect(() => {",
      "    fetch(`/api/quotes?s=${symbol}&key=${PARTNER_API_KEY}`)",
      "      .then((r) => r.json()).then(setData);",
      "    const timer = setInterval(() => fetch(`/api/quotes?s=${symbol}`), 2000);",
      "  }, [symbol]);",
      "  // TODO: sanitize noteHtml before release",
      "  return { rows: (data as any)?.rows, html: noteHtml };",
      "}",
    ],
    bugs: [
      {
        id: "qh-secret",
        line: 1,
        ruleId: "secret-hygiene",
        basePriority: "P0",
        title: "客户端源码硬编码 sk-live 密钥",
        explanation: "密钥随前端打包产物下发浏览器，任何访客均可在 Bundle 中直接提取。",
        fixAction: "移除前端硬编码密钥，改为服务端 /api/quotes 代理注入。",
        estMinutes: 18,
        minStrictness: "lenient",
      },
      {
        id: "qh-race",
        line: 5,
        ruleId: "race-leak",
        basePriority: "P1",
        title: "快速切换 symbol 时异步竞态覆盖",
        explanation: "未传入 AbortController.signal，先发后至的旧响应会覆盖最新标的报价。",
        fixAction: "在 useEffect 清理函数中执行 controller.abort() 并忽略 AbortError。",
        estMinutes: 12,
        minStrictness: "balanced",
      },
      {
        id: "qh-leak",
        line: 7,
        ruleId: "race-leak",
        basePriority: "P0",
        title: "setInterval 未清理导致定时器泄漏",
        explanation: "每次 symbol 变化或组件卸载都会残留一个 2 秒轮询定时器，请求呈指数叠加。",
        fixAction: "在 useEffect 返回 cleanup 函数调用 clearInterval(timer)。",
        estMinutes: 8,
        minStrictness: "lenient",
      },
      {
        id: "qh-todo",
        line: 9,
        ruleId: "error-boundary",
        basePriority: "P2",
        title: "未清理 TODO 与 HTML 未净化透传",
        explanation: "将未做 XSS 净化的 noteHtml 直接透传渲染层，存在脚本注入风险。",
        fixAction: "移除 TODO 并接入 DOMPurify 或纯文本渲染。",
        estMinutes: 8,
        minStrictness: "strict",
      },
      {
        id: "qh-any",
        line: 10,
        ruleId: "type-test-rigor",
        basePriority: "P2",
        title: "多处使用 as any 绕过类型检查",
        explanation: "useState<any> 与 data as any 屏蔽了编译期空指针与字段拼写检查。",
        fixAction: "定义 QuoteStreamResponse 接口并显式收窄可空分支。",
        estMinutes: 10,
        minStrictness: "strict",
      },
    ],
  },
  {
    id: "worker",
    filePath: "src/services/webhookWorker.ts",
    label: "Webhook 执行器",
    domain: "Node.js Background Worker",
    lines: [
      "export async function runAgentSync(req: any, branchName: string) {",
      "  if (req.headers['x-sig'] == req.expectedSig) {",
      "    await exec(`git diff ${branchName}`);",
      "    for (let i = 0; i < 10; i++) {",
      "      await dispatchWebhook(req.jobs[i]);",
      "    }",
      "  }",
      "  // quick test guard",
      "  const verified = () => expect(true).toBe(true);",
      "  return { status: 'ok', verified };",
      "}",
    ],
    bugs: [
      {
        id: "wk-cmd",
        line: 3,
        ruleId: "inj-auth",
        basePriority: "P0",
        title: "Shell 命令拼接注入（RCE 高危）",
        explanation: "branchName 直接拼入 exec()，若包含分号或反引号可执行任意系统命令。",
        fixAction: "改用 execFile('git', ['diff', branchName]) 并校验分支名白名单。",
        estMinutes: 15,
        minStrictness: "lenient",
      },
      {
        id: "wk-sig",
        line: 2,
        ruleId: "inj-auth",
        basePriority: "P1",
        title: "非恒定时间签名比对与宽松相等 ==",
        explanation: "未使用 crypto.timingSafeEqual 且存在隐式类型转换风险，易受时序旁路攻击。",
        fixAction: "采用 Buffer.from + timingSafeEqual 校验并校验时间戳窗口。",
        estMinutes: 12,
        minStrictness: "balanced",
      },
      {
        id: "wk-retry",
        line: 5,
        ruleId: "perf-n1",
        basePriority: "P1",
        title: "串行无退避循环阻塞事件循环",
        explanation: "无超时与指数退避的串行循环调用，遇下游抖动将造成 Worker 队列雪崩。",
        fixAction: "接入受控并发与指数退避重试，超限后投递死信队列。",
        estMinutes: 14,
        minStrictness: "balanced",
      },
      {
        id: "wk-any",
        line: 1,
        ruleId: "type-test-rigor",
        basePriority: "P2",
        title: "入口参数 req: any 缺失 Schema 校验",
        explanation: "未对 Webhook Payload 进行 Zod 解析，畸形报文将在深层逻辑抛未捕获异常。",
        fixAction: "使用 Zod schema safeParse 入参并导出强类型。",
        estMinutes: 10,
        minStrictness: "strict",
      },
      {
        id: "wk-hack",
        line: 9,
        ruleId: "type-test-rigor",
        basePriority: "P1",
        title: "Test Reward Hacking 伪断言残留",
        explanation: "expect(true).toBe(true) 无法验证任何真实业务边界，会制造虚假绿灯。",
        fixAction: "替换为验证异常分支与真实签名拒绝行为的断言。",
        estMinutes: 10,
        minStrictness: "balanced",
      },
    ],
  },
];

const STRICTNESS_META: Record<
  StrictnessMode,
  { label: string; rank: number; note: string }
> = {
  lenient: { label: "宽松（仅 P0 阻塞）", rank: 1, note: "优先减少噪音，放过规范债与潜在竞态" },
  balanced: { label: "平衡（P0 + P1 高危）", rank: 2, note: "Cursor Bugbot 推荐：覆盖安全、竞态与 N+1" },
  strict: { label: "零容忍（7 Habits 全量）", rank: 3, note: "拦截 any 漂移、调试残留与全部规范债" },
};

const PRIORITY_ORDER: Record<PriorityLevel, number> = { P0: 0, P1: 1, P2: 2 };

const PRIORITY_STYLE: Record<
  PriorityLevel,
  { badge: string; label: string; border: string }
> = {
  P0: {
    badge: "bg-rose-500/20 text-rose-300 border-rose-400/50",
    label: "P0 阻塞级",
    border: "border-rose-400/40 bg-rose-500/8",
  },
  P1: {
    badge: "bg-amber-500/20 text-amber-300 border-amber-400/50",
    label: "P1 高危",
    border: "border-amber-400/35 bg-amber-500/8",
  },
  P2: {
    badge: "bg-gemini-cyan/15 text-gemini-cyan border-gemini-cyan/45",
    label: "P2 规范债",
    border: "border-gemini-cyan/35 bg-gemini-cyan/8",
  },
};

export default function SmartCodeReviewSandbox() {
  const [snippetId, setSnippetId] = useState<string>(REPO_SNIPPETS[0].id);
  const [activeRuleIds, setActiveRuleIds] = useState<RuleId[]>([
    "inj-auth",
    "race-leak",
    "error-boundary",
  ]);
  const [strictness, setStrictness] = useState<StrictnessMode>("balanced");
  const [customPrompt, setCustomPrompt] = useState<string>(
    "优先排查 SQL 注入、并发扣款竞态与 N+1 查询，按生产事故风险预测修复顺序。"
  );
  const [selectedBugId, setSelectedBugId] = useState<string | null>(null);

  const currentSnippet =
    REPO_SNIPPETS.find((s) => s.id === snippetId) ?? REPO_SNIPPETS[0];

  const toggleRule = (ruleId: RuleId) => {
    setActiveRuleIds((prev) =>
      prev.includes(ruleId) ? prev.filter((id) => id !== ruleId) : [...prev, ruleId]
    );
  };

  const applyPresetConfig = (mode: "security-only" | "balanced" | "full-7-habits") => {
    if (mode === "security-only") {
      setActiveRuleIds(["inj-auth", "secret-hygiene"]);
      setStrictness("lenient");
      setCustomPrompt("仅阻断注入漏洞与硬编码密钥，忽略代码风格与性能问题。");
    } else if (mode === "balanced") {
      setActiveRuleIds(["inj-auth", "race-leak", "error-boundary", "perf-n1"]);
      setStrictness("balanced");
      setCustomPrompt("优先排查 SQL 注入、并发扣款竞态与 N+1 查询，按生产事故风险预测修复顺序。");
    } else {
      setActiveRuleIds(BUGBOT_RULES.map((r) => r.id));
      setStrictness("strict");
      setCustomPrompt(
        "开启 Sonar 7 Habits 零容忍门禁：拦截注入、竞态、N+1、any 类型逃逸、TODO 与假测试。"
      );
    }
    setSelectedBugId(null);
  };

  // Real-time matching engine reacting to Prompt rule toggles, custom prompt keywords & strictness
  const analysis = useMemo(() => {
    const promptLower = customPrompt.toLowerCase();
    const currentStrictRank = STRICTNESS_META[strictness].rank;

    // Keywords typed into custom prompt also activate corresponding rules
    const keywordActivatedRules = new Set<RuleId>();
    for (const rule of BUGBOT_RULES) {
      if (rule.keywords.some((kw) => promptLower.includes(kw))) {
        keywordActivatedRules.add(rule.id);
      }
    }

    const effectiveRuleSet = new Set<RuleId>([
      ...activeRuleIds,
      ...keywordActivatedRules,
    ]);

    const detectedBugs: SeededBug[] = [];
    const missedBugs: SeededBug[] = [];

    for (const bug of currentSnippet.bugs) {
      const ruleActive = effectiveRuleSet.has(bug.ruleId);
      const reqRank = STRICTNESS_META[bug.minStrictness].rank;
      const strictnessPasses = currentStrictRank >= reqRank;

      if (ruleActive && strictnessPasses) {
        detectedBugs.push(bug);
      } else {
        missedBugs.push(bug);
      }
    }

    // Sort detected bugs by P0 -> P1 -> P2 then line number
    detectedBugs.sort((a, b) => {
      const pDiff = PRIORITY_ORDER[a.basePriority] - PRIORITY_ORDER[b.basePriority];
      return pDiff !== 0 ? pDiff : a.line - b.line;
    });

    const counts = {
      total: detectedBugs.length,
      possible: currentSnippet.bugs.length,
      p0: detectedBugs.filter((b) => b.basePriority === "P0").length,
      p1: detectedBugs.filter((b) => b.basePriority === "P1").length,
      p2: detectedBugs.filter((b) => b.basePriority === "P2").length,
      missed: missedBugs.length,
      totalEstMinutes: detectedBugs.reduce((acc, b) => acc + b.estMinutes, 0),
    };

    const recallPct = Math.round((counts.total / counts.possible) * 100);
    const gateVerdict =
      counts.p0 > 0
        ? { label: "阻断合并 (PR Blocked)", tone: "text-rose-300", icon: AlertOctagon }
        : counts.p1 > 0
        ? { label: "需高危修复后放行", tone: "text-amber-300", icon: AlertTriangle }
        : counts.missed > 0
        ? { label: "表面放行（存在漏检隐患）", tone: "text-amber-200", icon: ShieldAlert }
        : { label: "通过审查门禁", tone: "text-emerald-300", icon: CheckCircle2 };

    const bugByLine = new Map<number, SeededBug[]>();
    for (const b of detectedBugs) {
      const arr = bugByLine.get(b.line) ?? [];
      arr.push(b);
      bugByLine.set(b.line, arr);
    }

    const activeBug =
      detectedBugs.find((b) => b.id === selectedBugId) ?? detectedBugs[0] ?? null;

    return {
      detectedBugs,
      missedBugs,
      counts,
      recallPct,
      gateVerdict,
      bugByLine,
      keywordActivatedRules,
      activeBug,
    };
  }, [currentSnippet, activeRuleIds, strictness, customPrompt, selectedBugId]);

  const VerdictIcon = analysis.gateVerdict.icon;

  return (
    <div
      onWheel={stopRevealWheel}
      onKeyDown={stopRevealKey}
      className="max-w-6xl mx-auto w-full rounded-2xl bg-[#070b14]/95 border border-white/12 p-5 shadow-2xl flex flex-col gap-3"
    >
      {/* Top Header: Role Play Context + File Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <div className="text-[11px] font-mono text-gemini-cyan tracking-wide">
            Module 6 · Smart Code Review Sandbox · 扮演 Bugbot 配置 Prompt 规则
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mt-0.5">
            Smart Code Review Sandbox：Bugbot 规则配置与修复优先级预测
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {REPO_SNIPPETS.map((sn) => {
            const active = sn.id === snippetId;
            return (
              <button
                key={sn.id}
                type="button"
                onClick={() => {
                  setSnippetId(sn.id);
                  setSelectedBugId(null);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono border transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  active
                    ? "bg-gemini-cyan text-slate-950 border-gemini-cyan font-bold"
                    : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5 shrink-0" />
                <span>{sn.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 3-Column Interactive Arena */}
      <div className="grid grid-cols-12 gap-3.5 items-stretch text-xs">
        {/* Column 1 (4 cols): Bugbot Prompt Rules & Strictness Config */}
        <div className="col-span-4 p-3.5 rounded-xl bg-[#0b0f19] border border-white/10 flex flex-col justify-between gap-2.5">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-gemini-purple font-semibold inline-flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                <span>Bugbot Prompt 规则装配台</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                {activeRuleIds.length}/{BUGBOT_RULES.length} 已启用
              </span>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => applyPresetConfig("security-only")}
                className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/12 border border-white/10 text-[10px] font-mono text-slate-300 cursor-pointer whitespace-nowrap shrink-0"
              >
                仅安全基线
              </button>
              <button
                type="button"
                onClick={() => applyPresetConfig("balanced")}
                className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/12 border border-white/10 text-[10px] font-mono text-gemini-cyan cursor-pointer whitespace-nowrap shrink-0"
              >
                均衡推荐
              </button>
              <button
                type="button"
                onClick={() => applyPresetConfig("full-7-habits")}
                className="px-2 py-1 rounded-md bg-emerald-500/12 hover:bg-emerald-500/20 border border-emerald-400/35 text-[10px] font-mono text-emerald-300 cursor-pointer whitespace-nowrap shrink-0"
              >
                7 Habits 满配
              </button>
            </div>

            {/* 6 Rule Toggles */}
            <div className="space-y-1.5">
              {BUGBOT_RULES.map((rule) => {
                const checked = activeRuleIds.includes(rule.id);
                const keywordTriggered =
                  !checked && analysis.keywordActivatedRules.has(rule.id);
                return (
                  <button
                    key={rule.id}
                    type="button"
                    onClick={() => toggleRule(rule.id)}
                    className={`w-full p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                      checked
                        ? "bg-gemini-purple/14 border-gemini-purple/50 text-white"
                        : keywordTriggered
                        ? "bg-gemini-cyan/10 border-gemini-cyan/40 text-slate-200"
                        : "bg-white/[0.025] border-white/10 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] font-semibold">
                      <span className="truncate">{rule.name}</span>
                      <span className="text-[10px] font-mono shrink-0">
                        {checked ? "✓ 已挂载" : keywordTriggered ? "关键词命中" : "+ 启用"}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                      {rule.promptClause}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Strictness + Custom Prompt Directive */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between gap-1.5">
              {(["lenient", "balanced", "strict"] as StrictnessMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setStrictness(mode)}
                  className={`flex-1 py-1 px-1.5 rounded-md border text-[10px] font-mono transition-colors cursor-pointer whitespace-nowrap ${
                    strictness === mode
                      ? "bg-gemini-cyan text-slate-950 border-gemini-cyan font-bold"
                      : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {mode === "lenient" ? "宽松" : mode === "balanced" ? "平衡" : "零容忍"}
                </button>
              ))}
            </div>

            <div>
              <label
                htmlFor="bugbot-custom-prompt"
                className="block text-[10px] font-mono text-slate-400 mb-1"
              >
                自定义 Bugbot System Prompt（输入关键词可动态激活规则）：
              </label>
              <textarea
                id="bugbot-custom-prompt"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onKeyDown={stopRevealKey}
                onWheel={stopRevealWheel}
                rows={2}
                placeholder="例如：严查硬编码密钥、any 类型与空 catch..."
                className="w-full p-2 rounded-lg bg-black/50 border border-white/12 font-mono text-[10px] text-gemini-cyan focus:outline-none focus:border-gemini-cyan resize-none leading-snug"
              />
            </div>
          </div>
        </div>

        {/* Column 2 (4 cols): Simulated Repository Code View */}
        <div className="col-span-4 rounded-xl bg-[#0b0f19] border border-white/10 overflow-hidden flex flex-col">
          <div className="px-3 py-2 bg-white/[0.04] border-b border-white/10 flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] text-slate-200 truncate">
              {currentSnippet.filePath}
            </span>
            <span className="text-[10px] font-mono text-slate-400 shrink-0">
              {currentSnippet.domain}
            </span>
          </div>

          <div
            className="flex-1 p-2.5 overflow-y-auto font-mono text-[11px] space-y-0.5 leading-relaxed"
            onWheel={stopRevealWheel}
          >
            {currentSnippet.lines.map((lineText, index) => {
              const lineNumber = index + 1;
              const lineBugs = analysis.bugByLine.get(lineNumber) ?? [];
              const topBug = lineBugs[0];
              const isFocused = topBug && analysis.activeBug?.id === topBug.id;

              return (
                <div
                  key={lineNumber}
                  onClick={() => {
                    if (topBug) setSelectedBugId(topBug.id);
                  }}
                  className={`flex items-start gap-2 px-1.5 py-0.5 rounded transition-colors ${
                    topBug
                      ? isFocused
                        ? "bg-gemini-cyan/18 border border-gemini-cyan/45 cursor-pointer"
                        : topBug.basePriority === "P0"
                        ? "bg-rose-500/14 hover:bg-rose-500/20 cursor-pointer"
                        : topBug.basePriority === "P1"
                        ? "bg-amber-500/12 hover:bg-amber-500/18 cursor-pointer"
                        : "bg-gemini-cyan/10 hover:bg-gemini-cyan/16 cursor-pointer"
                      : "text-slate-300"
                  }`}
                >
                  <span className="w-4 text-right text-[10px] text-slate-500 select-none shrink-0 tabular-nums">
                    {lineNumber}
                  </span>
                  <span className="flex-1 break-all whitespace-pre-wrap text-[10.5px] text-slate-200">
                    {lineText}
                  </span>
                  {lineBugs.length > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0 whitespace-nowrap ${
                        PRIORITY_STYLE[topBug.basePriority].badge
                      }`}
                    >
                      {topBug.basePriority}
                      {lineBugs.length > 1 ? ` ×${lineBugs.length}` : ""}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="px-3 py-2 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>{STRICTNESS_META[strictness].note}</span>
          </div>
        </div>

        {/* Column 3 (4 cols): Real-Time Bug Count + Fix Priority Forecast */}
        <div className="col-span-4 flex flex-col justify-between gap-2.5">
          {/* Top KPI Summary Strip */}
          <div className="p-3 rounded-xl bg-[#0b0f19] border border-white/10 space-y-2.5 tabular-nums">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-gemini-cyan inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>AI 实时识别与门禁预测</span>
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold whitespace-nowrap ${analysis.gateVerdict.tone}`}
              >
                <VerdictIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{analysis.gateVerdict.label}</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-lg bg-black/45 border border-white/8">
                <div className="text-[10px] text-slate-400">识别 Bug 数量</div>
                <div className="text-xl font-black font-mono text-white mt-0.5">
                  {analysis.counts.total}
                  <span className="text-[10px] text-slate-400 font-normal">
                    {" "}
                    / {analysis.counts.possible} 项
                  </span>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-black/45 border border-white/8">
                <div className="text-[10px] text-slate-400">检出覆盖率</div>
                <div
                  className={`text-xl font-black font-mono mt-0.5 ${
                    analysis.recallPct >= 85
                      ? "text-emerald-300"
                      : analysis.recallPct >= 50
                      ? "text-amber-300"
                      : "text-rose-300"
                  }`}
                >
                  {analysis.recallPct}%
                </div>
              </div>

              <div className="p-2 rounded-lg bg-black/45 border border-white/8">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gemini-cyan" />
                  <span>预计修复</span>
                </div>
                <div className="text-xl font-black font-mono text-gemini-cyan mt-0.5">
                  {analysis.counts.totalEstMinutes}
                  <span className="text-[10px] text-slate-400 font-normal"> 分钟</span>
                </div>
              </div>
            </div>

            {/* P0 / P1 / P2 Distribution Bar */}
            <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-white/8">
              <span className="text-rose-300">P0 阻塞: {analysis.counts.p0}</span>
              <span className="text-amber-300">P1 高危: {analysis.counts.p1}</span>
              <span className="text-gemini-cyan">P2 规范债: {analysis.counts.p2}</span>
              <span className="text-slate-400">未覆盖漏检: {analysis.counts.missed}</span>
            </div>
          </div>

          {/* Priority Forecast Queue */}
          <div className="flex-1 p-3 rounded-xl bg-[#0b0f19] border border-white/10 flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <ListChecks className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>修复优先级预测队列（点击看修复方案）</span>
              </span>
            </div>

            {analysis.detectedBugs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-3 text-[11px] text-slate-400">
                <ShieldAlert className="w-5 h-5 text-amber-300 mb-1.5" />
                <span>当前 Prompt 规则过少，未能检出代码中的真实隐患。</span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  请尝试勾选左侧规则或在输入框加入“注入 / 竞态 / 密钥”。
                </span>
              </div>
            ) : (
              <div
                className="space-y-1.5 max-h-[168px] overflow-y-auto pr-0.5"
                onWheel={stopRevealWheel}
              >
                {analysis.detectedBugs.map((bug, idx) => {
                  const selected = analysis.activeBug?.id === bug.id;
                  const style = PRIORITY_STYLE[bug.basePriority];
                  return (
                    <button
                      key={bug.id}
                      type="button"
                      onClick={() => setSelectedBugId(bug.id)}
                      className={`w-full p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                        selected
                          ? style.border
                          : "bg-white/[0.02] border-white/8 hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-white truncate">
                          #{idx + 1} · L{bug.line} {bug.title}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded border text-[9px] font-mono shrink-0 whitespace-nowrap ${style.badge}`}
                        >
                          {style.label} · {bug.estMinutes}m
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Selected Bug Fix Suggestion */}
            {analysis.activeBug && (
              <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-gemini-cyan">
                  <span>
                    L{analysis.activeBug.line} 根因与 Bugbot 修复建议
                  </span>
                  <span className="tabular-nums">
                    预计耗时 {analysis.activeBug.estMinutes} 分钟
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-300 leading-snug">
                  {analysis.activeBug.explanation}
                </p>
                <div className="text-[10.5px] text-emerald-300 font-medium leading-snug">
                  建议动作：{analysis.activeBug.fixAction}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
