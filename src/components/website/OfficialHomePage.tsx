import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  Layers,
  Lock,
  LogIn,
  LogOut,
  Presentation as PresentationIcon,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import heroImg from "@/assets/images/hero_ai_workshop_1795338779605.jpg";
import govTrackImg from "@/assets/images/track_governance_blueprint_1795338778462.jpg";
import engTrackImg from "@/assets/images/track_engineering_harness_1795338777589.jpg";
import { useAuth } from "@/context/authContextCore";
import { COURSE_LABS, COURSE_MODULES, COURSE_TRACKS } from "@/data/courseCurriculum";
import { M13_GOV_SIMULATION_DISCLAIMER } from "@/data/courseWorkspaceStore";
import {
  fetchCatalog,
  submitInquiry,
  type CatalogResponse,
} from "@/lib/apiClient";

interface OfficialHomePageProps {
  onEnterWorkspace: (moduleId?: string) => void;
  onEnterSlides: (moduleId?: string) => void;
  onOpenBilling: () => void;
  onOpenCohortPanel: () => void;
  onOpenInstructorCockpit: () => void;
  onOpenAdminConsole: () => void;
}

const VERIFIED_CASE_STUDIES = [
  {
    id: "himcm",
    code: "CASE 01",
    title: "HiMCM #19243 数模实战",
    domain: "竞赛建模与可验证推理",
    summary:
      "将问题拆解、参数敏感性脚本与论文图表核验串联为 SDD（Spec-Driven）工作流，以可复跑脚本替代一次性问答拼凑。",
    modulesUsed: "M1 · M2 · M5 · M11",
  },
  {
    id: "novel",
    code: "CASE 02",
    title: "AI Novel Studio",
    domain: "长程创作状态机与上下文工程",
    summary:
      "用长程 Harness 与结构化状态文件追踪人物设定、章节冲突与版本回滚，解决长文本生成中的上下文漂移与遗忘。",
    modulesUsed: "M2 · M4 · M8 · M12",
  },
  {
    id: "medical-geo",
    code: "CASE 03",
    title: "医疗公司 GEO 系统",
    domain: "强合规领域知识库与权限隔离",
    summary:
      "采用 Pre-filter 元数据鉴权 + 来源可溯引用机制，严格约束医学科普与营销内容的知识边界与人工复核门禁。",
    modulesUsed: "M4 · M11 · M12 · M13-Gov",
  },
  {
    id: "ece-brain",
    code: "CASE 04",
    title: "ECE-Brain-Meeting",
    domain: "科研团队多模态会议与协作工作流",
    summary:
      "沉淀团队 .cursor/rules 与 MCP 工具链，把实验室周会录音、文献笔记与待办实验自动结构化为可检索知识包。",
    modulesUsed: "M4 · M6 · M9 · M12",
  },
  {
    id: "philosophy",
    code: "CASE 05",
    title: "哲学研究平台",
    domain: "人文文献索引与引文核验工作台",
    summary:
      "针对跨语种一手原典构建分级 KB 与反幻觉引用检查，确保生成论点均附带章节出处与版本核验标记。",
    modulesUsed: "M2 · M10 · M12 · M13-Eng",
  },
];

function formatCents(cents: number): string {
  return `¥${(cents / 100).toLocaleString("zh-CN", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  })}`;
}

export default function OfficialHomePage({
  onEnterWorkspace,
  onEnterSlides,
  onOpenBilling,
  onOpenCohortPanel,
  onOpenInstructorCockpit,
  onOpenAdminConsole,
}: OfficialHomePageProps) {
  const { session, loading: authLoading, signInWithGoogle, signOutUser } = useAuth();
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [selectedTrackKey, setSelectedTrackKey] = useState<"gov" | "eng">("eng");

  // Lead Inquiry form state
  const [inqName, setInqName] = useState("");
  const [inqContact, setInqContact] = useState("");
  const [inqOrg, setInqOrg] = useState("");
  const [inqType, setInqType] = useState<"cohort" | "enterprise" | "school">("cohort");
  const [inqMessage, setInqMessage] = useState("");
  const [inqSubmitting, setInqSubmitting] = useState(false);
  const [inqStatus, setInqStatus] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let active = true;
    fetchCatalog()
      .then((res) => {
        if (active) setCatalog(res);
      })
      .catch(() => {
        // Fallback to static curriculum definitions cleanly if server offline
      });
    return () => {
      active = false;
    };
  }, [session?.hasPaidAccess]);

  const selfPacedProduct = catalog?.products.find((p) => p.productType === "self_paced");
  const cohortProduct = catalog?.products.find((p) => p.productType === "cohort_mentored");
  const activeCohort = catalog?.activeCohorts[0];
  const hasPaidAccess = Boolean(session?.hasPaidAccess || catalog?.hasPaidAccess);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInqStatus(null);
    setInqSubmitting(true);
    try {
      await submitInquiry({
        name: inqName,
        contact: inqContact,
        organization: inqOrg,
        inquiryType: inqType,
        message: inqMessage,
      });
      setInqStatus({
        ok: true,
        text: "咨询信息已登记，教务老师将在 1 个工作日内通过预留方式联系您。",
      });
      setInqName("");
      setInqContact("");
      setInqOrg("");
      setInqMessage("");
    } catch (err) {
      setInqStatus({
        ok: false,
        text: err instanceof Error ? err.message : "提交失败，请检查填写内容后重试。",
      });
    } finally {
      setInqSubmitting(false);
    }
  };

  const modulesList =
    catalog?.curriculum?.modules ??
    COURSE_MODULES.map((m) => ({
      ...m,
      isFreeTrial: m.id === "m1",
      unlocked: m.id === "m1" || hasPaidAccess,
    }));

  return (
    <div className="min-h-screen bg-[#020205] text-slate-200 selection:bg-gemini-cyan/30 selection:text-white">
      {/* 3-Zone Single-Row Sticky Navigation */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#05070e]/92 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left Zone: Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gemini-cyan to-gemini-purple flex items-center justify-center text-slate-950 font-mono font-bold text-sm shrink-0">
              AI
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-white tracking-tight truncate">
                AI Coding 确定性研发学院
              </div>
              <div className="text-[11px] font-mono text-slate-400 truncate hidden sm:block">
                AI-First Engineering · 14 Modules · 20 Labs
              </div>
            </div>
          </div>

          {/* Center Zone: Section Anchors */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300">
            <a href="#paradigm" className="hover:text-gemini-cyan transition-colors">
              范式对比
            </a>
            <a href="#dual-track" className="hover:text-gemini-cyan transition-colors">
              双轨路径
            </a>
            <a href="#curriculum" className="hover:text-gemini-cyan transition-colors">
              课程大纲
            </a>
            <a href="#cases" className="hover:text-gemini-cyan transition-colors">
              实战案例
            </a>
            <a href="#pricing" className="hover:text-gemini-cyan transition-colors">
              订阅与带班
            </a>
            <a href="#inquiry" className="hover:text-gemini-cyan transition-colors">
              咨询报名
            </a>
          </nav>

          {/* Right Zone: Auth + Workspace CTAs */}
          <div className="flex items-center gap-2 shrink-0">
            {session ? (
              <>
                {session.isAdmin && (
                  <button
                    type="button"
                    onClick={onOpenAdminConsole}
                    className="hidden md:inline-flex px-2.5 py-1.5 rounded-lg border border-amber-400/40 bg-amber-500/10 text-amber-200 text-xs font-medium hover:bg-amber-500/20 cursor-pointer"
                  >
                    教务后台
                  </button>
                )}
                {(session.isInstructorOrTa || session.isAdmin) && (
                  <button
                    type="button"
                    onClick={onOpenInstructorCockpit}
                    className="hidden md:inline-flex px-2.5 py-1.5 rounded-lg border border-gemini-purple/50 bg-gemini-purple/15 text-purple-100 text-xs font-medium hover:bg-gemini-purple/25 cursor-pointer"
                  >
                    教师批改台
                  </button>
                )}
                {session.cohortEnrolled && (
                  <button
                    type="button"
                    onClick={onOpenCohortPanel}
                    className="hidden sm:inline-flex px-2.5 py-1.5 rounded-lg border border-emerald-400/40 bg-emerald-500/10 text-emerald-200 text-xs font-medium hover:bg-emerald-500/20 cursor-pointer"
                  >
                    我的班级
                  </button>
                )}
                <button
                  type="button"
                  onClick={onOpenBilling}
                  className="px-2.5 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs text-slate-200 inline-flex items-center gap-1.5 cursor-pointer"
                  title={`已登录：${session.user.email}`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-gemini-cyan" />
                  <span className="max-w-[110px] truncate hidden sm:inline">
                    {session.user.displayName || session.user.email}
                  </span>
                  <span className="font-mono text-[10px] text-gemini-cyan">
                    {hasPaidAccess ? "已开通" : "免费体验"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => void signOutUser()}
                  aria-label="退出登录"
                  className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={authLoading}
                onClick={() => void signInWithGoogle()}
                className="px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-medium text-white inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-3.5 h-3.5 text-gemini-cyan" />
                <span>账号登录</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onEnterWorkspace("m1")}
              className="px-3.5 py-1.5 rounded-lg bg-gemini-cyan text-slate-950 font-semibold text-xs hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>{hasPaidAccess ? "进入课程工作台" : "M1 免费试学"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section (Split Editorial + Visual Asset) */}
      <section className="relative overflow-hidden border-b border-white/10 cyber-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="text-xs font-mono text-gemini-cyan tracking-wide">
              AI-FIRST ENGINEERING ACADEMY · CURRICULUM 2026.11
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              从“靠手感写代码”
              <br />
              走向<span className="text-gemini-cyan">可验证的 AI 研发体系</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              面向希望真正驾驭 AI 工程化交付的独立开发者、产品经理、研发团队与高校学员。通过
              14 个递进模块、20 个内置交互沙盘与能力证据门禁，打通{" "}
              <span className="text-white font-medium">
                上下文工程 · 规则契约 · 自动化自愈 · 双轨 Capstone 验收
              </span>{" "}
              全链路，提供自助学习账号与深度小班实战两种培养路径。
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onEnterWorkspace("m1")}
                className="px-5 py-3 rounded-xl bg-gemini-cyan text-slate-950 font-semibold text-sm hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer"
              >
                <span>立即免费试学 M1 完整样板</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#pricing"
                className="px-5 py-3 rounded-xl border border-white/20 bg-white/[0.04] hover:bg-white/[0.08] text-sm font-medium text-white inline-flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4 text-gemini-purple" />
                <span>对比自助订阅与老师带班</span>
              </a>
              <button
                type="button"
                onClick={() => onEnterSlides("m1")}
                className="px-4 py-3 rounded-xl border border-white/10 text-xs font-mono text-slate-300 hover:text-white hover:bg-white/5 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <PresentationIcon className="w-4 h-4 text-gemini-cyan" />
                <span>课堂幻灯片模式</span>
              </button>
            </div>

            <dl className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 max-w-xl">
              <div>
                <dt className="text-[11px] font-mono text-slate-400">结构化模块</dt>
                <dd className="text-xl font-bold font-mono text-white tabular-nums mt-0.5">
                  14 Modules
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-mono text-slate-400">实时交互沙盘</dt>
                <dd className="text-xl font-bold font-mono text-gemini-cyan tabular-nums mt-0.5">
                  20 Labs
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-mono text-slate-400">结课验证分支</dt>
                <dd className="text-xl font-bold font-mono text-purple-300 tabular-nums mt-0.5">
                  Gov / Eng
                </dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden border border-white/15 bg-[#090d18] shadow-2xl">
              <div className="aspect-video w-full overflow-hidden bg-gradient-to-br from-[#0b1120] to-[#130d24]">
                <img
                  src={heroImg}
                  alt="AI Coding 确定性研发工程工作台全景图"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-4 py-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                <span>课程交互体系：Plan Mode · .cursor/rules · MCP · DoD · Dual Eval</span>
                <span className="text-gemini-cyan">支持云端进度同步与作业验收</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Paradigm Shift Comparison */}
      <section id="paradigm" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        <div className="space-y-2 max-w-3xl">
          <div className="text-xs font-mono text-gemini-cyan">PARADIGM SHIFT</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            为什么大多数人用 AI 写代码越写越乱，而工程团队能用它稳定交付？
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            差距不在提示词花哨与否，而在于是否把一次性聊天升级为“先契约、再上下文切片、用规则约束、靠 DoD 验收”的工程闭环。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-white/10 bg-[#090c14] space-y-4">
            <div className="text-xs font-mono text-slate-400">
              传统试错式（Vibe Chat）· 高返工路径
            </div>
            <h3 className="text-lg font-bold text-white">无约束对话拼凑，复杂度一上升即失控</h3>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="font-mono text-rose-400 mt-0.5">01</span>
                <span>跳过需求澄清与边界契约，直接让模型“全量生成”，前后端字段频繁对不上。</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-mono text-rose-400 mt-0.5">02</span>
                <span>缺乏项目级 Rules 与 DoD 门禁，AI 容易用静默降级、跳过断言来“凑绿灯”。</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-mono text-rose-400 mt-0.5">03</span>
                <span>知识散落在聊天窗口里，换新对话就重复踩坑，无法沉淀为团队资产。</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl border border-gemini-cyan/40 bg-[#0a1220] space-y-4">
            <div className="text-xs font-mono text-gemini-cyan">
              AI-FIRST ENGINEERING · 本课程确定性交付路径
            </div>
            <h3 className="text-lg font-bold text-white">四层闭环体系，让 AI 产出具备可审计证据</h3>
            <ul className="space-y-2.5 text-sm text-slate-200">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Spec &amp; Context First</strong>：Plan Mode 先行对齐 Schema 与鉴权边界，精确管理 Token 切片。
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Rules + MCP + DoD</strong>：把团队规范固化成 `.mdc` 规则与终端自愈命令，拒绝虚假通过。
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Dual Capstone 能力验收</strong>：通过阶段测验、技能诊断与指导老师人工评审，发放可验证技能档案。
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Interactive Dual-Track Persona Router */}
      <section id="dual-track" className="border-y border-white/10 bg-[#060912]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="text-xs font-mono text-gemini-purple">DUAL-TRACK ARCHITECTURE</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                两条主线，匹配不同背景学习者的真实交付目标
              </h2>
            </div>

            <div className="inline-flex p-1 rounded-xl bg-[#0d1322] border border-white/15">
              <button
                type="button"
                onClick={() => setSelectedTrackKey("eng")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  selectedTrackKey === "eng"
                    ? "bg-gemini-cyan text-slate-950"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                工程与全栈开发线 (M13-Eng)
              </button>
              <button
                type="button"
                onClick={() => setSelectedTrackKey("gov")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  selectedTrackKey === "gov"
                    ? "bg-amber-400 text-slate-950"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                产品与无代码治理线 (M13-Gov)
              </button>
            </div>
          </div>

          {selectedTrackKey === "eng" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 rounded-2xl border border-emerald-400/30 bg-[#0b101d]">
              <div className="lg:col-span-5 aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-[#090d16]">
                <img
                  src={engTrackImg}
                  alt="M13-Eng 生产级工程与 Agent Harness 主线示意图"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="lg:col-span-7 space-y-4">
                <div className="text-xs font-mono text-emerald-300">
                  M1 → M3 → M4 → M5 → M8 长程 Harness → M12 运行时 KB → M13-Eng Capstone
                </div>
                <h3 className="text-2xl font-bold text-white">
                  独立开发者 / 研发团队 / 计算机专业学生：生产级 Agent 与全栈工程交付
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  围绕前后端鉴权隔离、PostgreSQL Schema 演进、长程 Coding Harness（Initializer + Coding Loop + Worktree）、运行时 ACL Pre-filter 检索隔离与自动化测试门禁，完整交付可上线运行的 AI 应用。
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="font-mono text-gemini-cyan">核心能力门禁</div>
                    <div className="text-slate-200 mt-1">后端鉴权与 Webhook 验签证据</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="font-mono text-gemini-cyan">核心沙盘演练</div>
                    <div className="text-slate-200 mt-1">Bugbot · Worktree · ACL RAG</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="font-mono text-gemini-cyan">结课产物</div>
                    <div className="text-slate-200 mt-1">带 Dual Eval 报告的可部署仓库</div>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onEnterWorkspace("m1")}
                    className="px-4 py-2 rounded-xl bg-emerald-400 text-slate-950 font-semibold text-xs hover:opacity-90 cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>从 M1 开始工程路径试学</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 rounded-2xl border border-amber-400/35 bg-[#12101a]">
              <div className="lg:col-span-5 aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-[#0d0b14]">
                <img
                  src={govTrackImg}
                  alt="M13-Gov 无代码 Agent 产品与治理主线示意图"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="lg:col-span-7 space-y-4">
                <div className="text-xs font-mono text-amber-300">
                  M1 → M2 → M4 规则规范 → M11 Agent 蓝图与 PRD → M13-Gov 治理 Capstone
                </div>
                <h3 className="text-2xl font-bold text-white">
                  产品经理 / 非技术背景创始人：AI 产品架构、需求契约与治理评审
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  不强求手写后端代码，重点培养“把模糊需求写成可执行双 PRD、划定人工审批阈值、识别工具调用越权、审阅 Agent 运行轨迹并做上线把关”的核心产品架构师能力。
                </p>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/35 text-xs text-amber-100 leading-relaxed">
                  {M13_GOV_SIMULATION_DISCLAIMER}
                </div>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => onEnterWorkspace("m1")}
                    className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-semibold text-xs hover:opacity-90 cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>从 M1 开始产品架构试学</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Curriculum Blueprint (14 Modules × 20 Labs) */}
      <section id="curriculum" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-mono text-gemini-cyan">CURRICULUM ARCHITECTURE</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              三阶段 14 模块完整课程体系（M1 开放免费试学）
            </h2>
          </div>
          <div className="text-xs font-mono text-slate-400 tabular-nums">
            共 {modulesList.length} 模块 · {COURSE_LABS.length} 交互沙盘 · 双层能力先修 DAG
          </div>
        </div>

        <div className="space-y-8">
          {COURSE_TRACKS.map((track) => {
            const trackMods = modulesList.filter((m) => m.trackId === track.id);
            return (
              <div key={track.id} className="space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2 pb-2 border-b border-white/10">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-gemini-cyan" />
                    <span>{track.title}</span>
                  </h3>
                  <span className="text-xs text-slate-400">{track.subtitle}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trackMods.map((mod) => {
                    const isFree = mod.isFreeTrial || mod.id === "m1";
                    const canOpen = isFree || hasPaidAccess;
                    return (
                      <article
                        key={mod.id}
                        className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                          isFree
                            ? "border-gemini-cyan/50 bg-[#0c1424]"
                            : "border-white/10 bg-[#090d16]"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2 text-[11px] font-mono tabular-nums">
                            <span className="text-gemini-cyan font-semibold">{mod.code}</span>
                            <span className="text-slate-400">
                              {mod.estimatedMinutes} 分钟 · {mod.slideCount} 屏 ·{" "}
                              {isFree ? (
                                <span className="text-emerald-300 font-semibold">免费试学</span>
                              ) : canOpen ? (
                                <span className="text-emerald-300">已解锁</span>
                              ) : (
                                <span className="text-slate-400 inline-flex items-center gap-1">
                                  <Lock className="w-3 h-3" /> 会员解锁
                                </span>
                              )}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white leading-snug">
                            {mod.title.replace(/^Module\s+[\w-]+:\s*/i, "")}
                          </h4>
                          <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                            {mod.learningObjectives[0]}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 text-[11px]">
                          <span className="text-slate-400 truncate">{mod.audience}</span>
                          <button
                            type="button"
                            onClick={() =>
                              canOpen ? onEnterWorkspace(mod.id) : onOpenBilling()
                            }
                            className={`font-mono font-semibold shrink-0 cursor-pointer ${
                              canOpen
                                ? "text-gemini-cyan hover:underline"
                                : "text-purple-300 hover:text-white"
                            }`}
                          >
                            {isFree ? "立即试学 →" : canOpen ? "进入学习 →" : "开通解锁 →"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5 Verified Case Studies */}
      <section id="cases" className="border-y border-white/10 bg-[#060912]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-8">
          <div className="space-y-2 max-w-3xl">
            <div className="text-xs font-mono text-gemini-cyan">VERIFIED CASE STUDIES</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              源自真实科研、竞赛与产业实践的 5 个代表性案例
            </h2>
            <p className="text-sm text-slate-300">
              课程方法论直接提炼自一线交付场景，而非抽象概念空谈。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {VERIFIED_CASE_STUDIES.map((cs) => (
              <article
                key={cs.id}
                className="p-5 rounded-xl border border-white/10 bg-[#0b101d] flex flex-col justify-between gap-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-gemini-cyan">{cs.code}</span>
                    <span className="text-slate-400">{cs.domain}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{cs.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{cs.summary}</p>
                </div>
                <div className="pt-2 border-t border-white/10 text-[11px] font-mono text-purple-200">
                  对应课程链路：{cs.modulesUsed}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing & Delivery Plans: Self-Serve vs Mentored Cohort */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        <div className="space-y-2 max-w-3xl">
          <div className="text-xs font-mono text-gemini-purple">ACCOUNTS &amp; COHORT PLANS</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            两类账号服务模式：自主按节奏精进，或加入小班由老师批改带教
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            所有账号均可在工作台免费体验 M1 完整模块；付费权益在角色（Learner / Instructor）、商品与班级报名（Cohort）上彻底解耦。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Self-Serve Card */}
          <div className="p-6 rounded-2xl border border-white/15 bg-[#0b0f19] flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-gemini-cyan">
                  SELF-PACED PASS · 账号自助学习
                </span>
                <BookOpen className="w-4 h-4 text-gemini-cyan" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {selfPacedProduct?.title || "AI Coding 全课自助畅学卡"}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {selfPacedProduct?.description ||
                    "解锁 M1–M13-Eng 全部 14 模块课程单元、20 个内置交互沙盘、服务端测验判分、云端进度同步与个人知识库沉淀。"}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {(
                  selfPacedProduct?.prices ?? [
                    { id: 1, label: "月卡体验", amountCents: 12900, durationDays: 30 },
                    { id: 2, label: "季卡进阶", amountCents: 32900, durationDays: 90 },
                    { id: 3, label: "年卡完整版", amountCents: 69900, durationDays: 365 },
                  ]
                ).map((pr) => (
                  <div
                    key={pr.id}
                    className="p-3 rounded-xl border border-white/10 bg-white/[0.03] text-center"
                  >
                    <div className="text-[11px] text-slate-400">{pr.label}</div>
                    <div className="text-lg font-bold font-mono text-white tabular-nums mt-0.5">
                      {formatCents(pr.amountCents)}
                    </div>
                  </div>
                ))}
              </div>

              <ul className="space-y-2 text-xs text-slate-200 pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>解锁全部 14 模块（含 M11–M13-Gov/Eng）与 20 个交互沙盘</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>云端进度同步（unit_progress）、服务端测验判分与薄弱点定位</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>服务端 AI Bugbot 评审与知识库备课助手（按日配额防护）</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <Sparkles className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>不包含人工逐份作业批改与固定期次小班督学</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={onOpenBilling}
              className="w-full py-3 rounded-xl bg-white text-slate-950 font-semibold text-sm hover:bg-slate-200 transition-colors cursor-pointer"
            >
              {hasPaidAccess ? "查看账号权益 / 兑换码升级" : "立即订阅 / 兑换激活码"}
            </button>
          </div>

          {/* Mentored Cohort Card */}
          <div className="p-6 rounded-2xl border border-gemini-purple/50 bg-[#100e1c] flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-purple-200">
                  MENTORED COHORT · 教师深度指导小班
                </span>
                <Users className="w-4 h-4 text-gemini-purple" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {cohortProduct?.title || "AI Coding 深度指导实战营"}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {cohortProduct?.description ||
                    "含全课自助权限 + 专属期次小班课表、里程碑打卡、指导老师与助教人工代码/PRD 批改、退回重交与技能核验认证。"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-gemini-purple/35 bg-white/[0.04] flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-purple-200 font-semibold">
                    {activeCohort ? `${activeCohort.title} (${activeCohort.code})` : "深度小班期次"}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5 tabular-nums">
                    {activeCohort
                      ? `周期 ${activeCohort.startDate} 至 ${activeCohort.endDate} · 限 ${activeCohort.maxSeats} 席`
                      : "4~6 周实战节奏 · 里程碑作业人工审校"}
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono text-white tabular-nums">
                  {cohortProduct?.prices?.[0]
                    ? formatCents(cohortProduct.prices[0].amountCents)
                    : "¥2,499"}
                </div>
              </div>

              <ul className="space-y-2 text-xs text-slate-200 pt-1">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>包含「自助畅学版」全部 14 模块、沙盘与服务端 AI 评测配额</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>里程碑作业提交（自动附带静态自检快照），教师严格分班人工审校</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>支持「打回修改 → 重交复审 → 授予可验证 SkillGrant 能力认证」</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gemini-cyan shrink-0" />
                  <span>支持高阶产品/治理分支（M13-Gov）与全栈工程分支（M13-Eng）双轨结课</span>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onOpenBilling}
                className="py-3 rounded-xl bg-gemini-purple text-white font-semibold text-xs sm:text-sm hover:opacity-90 transition-opacity cursor-pointer"
              >
                预约席位 / 激活入班码
              </button>
              <a
                href="#inquiry"
                className="py-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-center text-white font-medium text-xs sm:text-sm"
              >
                咨询企业内训 / 班期详情
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Inquiry Form */}
      <section id="inquiry" className="border-t border-white/10 bg-[#060912]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-6">
          <div className="space-y-2 text-center">
            <div className="text-xs font-mono text-gemini-cyan">COHORT &amp; TEAM INQUIRY</div>
            <h2 className="text-2xl font-bold text-white">
              预约下一期深度指导班，或申请团队 / 高校合作试点
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              留言将实时写入后端咨询队列，由负责教务管理员统一跟进。
            </p>
          </div>

          <form
            onSubmit={handleInquirySubmit}
            className="p-6 rounded-2xl border border-white/12 bg-[#0b0f19] space-y-4 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-slate-300 font-medium">姓名 / 称呼 *</label>
                <input
                  type="text"
                  required
                  value={inqName}
                  onChange={(e) => setInqName(e.target.value)}
                  placeholder="例如：张同学 / 李架构师"
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white focus:outline-none focus:border-gemini-cyan"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-300 font-medium">邮箱或微信号 *</label>
                <input
                  type="text"
                  required
                  value={inqContact}
                  onChange={(e) => setInqContact(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white focus:outline-none focus:border-gemini-cyan"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-300 font-medium">咨询方向</label>
                <select
                  value={inqType}
                  onChange={(e) =>
                    setInqType(e.target.value as "cohort" | "enterprise" | "school")
                  }
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white focus:outline-none focus:border-gemini-cyan"
                >
                  <option value="cohort">个人报名深度指导小班</option>
                  <option value="enterprise">企业研发团队内训定制</option>
                  <option value="school">高校实验室 / 课程合作</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-300 font-medium">所在团队 / 学校（选填）</label>
              <input
                type="text"
                value={inqOrg}
                onChange={(e) => setInqOrg(e.target.value)}
                placeholder="公司名称、独立工作室或高校院系"
                className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white focus:outline-none focus:border-gemini-cyan"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-300 font-medium">需求与目标说明 *</label>
              <textarea
                rows={3}
                required
                value={inqMessage}
                onChange={(e) => setInqMessage(e.target.value)}
                placeholder="请简述您当前背景、期望达到的项目交付目标或团队人数..."
                className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white focus:outline-none focus:border-gemini-cyan"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="text-xs">
                {inqStatus && (
                  <span
                    className={
                      inqStatus.ok ? "text-emerald-300 font-medium" : "text-rose-300 font-medium"
                    }
                  >
                    {inqStatus.text}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={inqSubmitting}
                className="px-5 py-2.5 rounded-xl bg-gemini-cyan text-slate-950 font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{inqSubmitting ? "提交中..." : "提交咨询意向"}</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-white/10 py-8 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-slate-300 font-medium">
              AI Coding 确定性研发学院 · 课程版本 2026.11
            </div>
            <div>{M13_GOV_SIMULATION_DISCLAIMER}</div>
          </div>
          <div className="flex items-center gap-4 font-mono">
            <button
              type="button"
              onClick={() => onEnterWorkspace("m1")}
              className="hover:text-gemini-cyan cursor-pointer"
            >
              进入学习工作台
            </button>
            <button
              type="button"
              onClick={() => onEnterSlides("m1")}
              className="hover:text-gemini-cyan cursor-pointer"
            >
              Reveal 课件模式
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
