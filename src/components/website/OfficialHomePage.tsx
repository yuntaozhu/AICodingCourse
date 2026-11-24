import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  FlaskConical,
  FolderGit2,
  GraduationCap,
  Layers,
  Lock,
  Presentation as PresentationIcon,
  Send,
  ShieldCheck,
  Users,
} from "lucide-react";
import heroImg from "@/assets/images/hero_ai_workshop_1795338779605.jpg";
import govTrackImg from "@/assets/images/track_governance_blueprint_1795338778462.jpg";
import engTrackImg from "@/assets/images/track_engineering_harness_1795338777589.jpg";
import PlanPromptSandbox from "@/components/sandboxes/PlanPromptSandbox";
import { useAuth } from "@/context/authContextCore";
import { COURSE_MODULES, COURSE_TRACKS } from "@/data/courseCurriculum";
import { getFreeTrialModulePreview, getPublicCourseMetrics } from "@/data/courseMetrics";
import { M13_GOV_SIMULATION_DISCLAIMER } from "@/data/courseWorkspaceStore";
import { MODULE_QUIZZES } from "@/data/moduleQuizzes";
import {
  FIRST_HOUR_DEFAULT_CHECKLIST,
  GEO_EVIDENCE_LAB_DISCLAIMER,
  STANDARD_STARTER_KIT_TREE,
} from "@/data/projectTemplatesPublic";
import {
  fetchCatalog,
  previewM1QuizApi,
  submitInquiry,
  type CatalogResponse,
  type PreviewM1QuizResponse,
} from "@/lib/apiClient";
import WebsiteNavbar, { type WebsitePageRoute } from "./WebsiteNavbar";

interface OfficialHomePageProps {
  onNavigatePage: (page: WebsitePageRoute) => void;
  onEnterWorkspace: (moduleId?: string) => void;
  onEnterProjects?: () => void;
  onEnterSlides: (moduleId?: string) => void;
  onOpenBilling: () => void;
  onOpenCohortPanel: () => void;
  onOpenInstructorCockpit: () => void;
  onOpenAdminConsole: () => void;
}

const PAIN_POINTS = [
  {
    index: "01",
    title: "改动越改越乱，修好 A 页面却搞崩 B 接口",
    detail:
      "缺少范围边界与文件护栏，每次让 AI 重写都连带修改无关模块，项目很快退化成无法维护的拼凑代码。",
  },
  {
    index: "02",
    title: "AI 编造结果，甚至修改断言“凑绿灯”",
    detail:
      "模型遇到报错时会倾向于静默降级、硬编码假数据或跳过失败测试用例，表面看似跑通，实际埋下线上故障。",
  },
  {
    index: "03",
    title: "报错不会定位，只能把红色日志反复贴给模型",
    detail:
      "分不清问题出在前端请求、服务端鉴权、数据库 Schema 还是环境变量缺失，陷入无休止的盲目重试。",
  },
  {
    index: "04",
    title: "换个新对话就失忆，经验无法复用到下一个项目",
    detail:
      "规范与踩坑记录全部留在零散聊天窗口里，没有沉淀为仓库规则（.mdc）、验证清单与可核验交接物。",
  },
];

const SEVEN_STAGE_PIPELINE = [
  {
    step: "01",
    title: "真实业务任务",
    action: "锁定品牌监测、私有知识库或审核工作流等真实授权场景",
    artifact: "README.md 范围契约",
    modules: "M1 · Starter Kit",
  },
  {
    step: "02",
    title: "数据与权限边界",
    action: "划清角色权限、脱敏数据与目录修改白名单",
    artifact: "SPEC.md & 禁改清单",
    modules: "M2 · M9 · M11",
  },
  {
    step: "03",
    title: "规格与 Harness",
    action: "把系统约束写入可审查的规则契约与运行护栏",
    artifact: ".cursorrules 规则集",
    modules: "M4 · M8",
  },
  {
    step: "04",
    title: "AI 协作局部改动",
    action: "在受控文件白名单内草拟实现，审查每次 Diff 变更",
    artifact: "Diff 审查与变更切片",
    modules: "M3 · M6",
  },
  {
    step: "05",
    title: "测试、静态检查与 Eval",
    action: "服务端静态红线拦截 + 固定基准集自动化评测",
    artifact: "tests/ & eval/ 报告",
    modules: "M5 · M12 · M13-Eng",
  },
  {
    step: "06",
    title: "人工批准（HITL）",
    action: "教师审校与三锁门禁（测验+实操证据+人工批准）",
    artifact: "evidence/ 审签证据",
    modules: "M13-Gov / Cohort",
  },
  {
    step: "07",
    title: "可维护数字资产",
    action: "沉淀运维、权限、成本与人工接管说明书一键归档",
    artifact: "handoff.md 交接归档",
    modules: "M7 · Handoff",
  },
];

const VERIFIED_CASE_STUDIES = [
  {
    id: "novel",
    code: "CASE 01",
    title: "AI Novel Studio",
    background: "个人创作者 · 长程创作工具开发",
    scope: "多章节状态机、人物设定追踪与版本回滚面板",
    aiBoundary: "Cursor Agent 生成组件与状态逻辑 · 长程 Harness（M2/M4/M8）约束文件隔离",
    humanVerified: "创作者亲自核验章节状态回滚一致性、数据持久化与前端交互边界",
    modulesUsed: "M2 · M4 · M8 · M12",
  },
  {
    id: "medical-geo",
    code: "CASE 02",
    title: "医疗公司 GEO 系统",
    background: "业务合规团队 · 领域知识库检索原型",
    scope: "受限医学资料检索与内容生成工作台（含引用溯源锚点）",
    aiBoundary: "检索前强制 Pre-filter 元数据鉴权 · 仅引用活跃版本文档（M11/M12/M13-Gov）",
    humanVerified: "合规专员人工抽检越权拒绝、过期文档拦截与每条引文原始出处",
    modulesUsed: "M4 · M11 · M12 · M13-Gov",
  },
  {
    id: "philosophy",
    code: "CASE 03",
    title: "哲学研究平台",
    background: "非传统工程背景学者 · 原典文献索引工作台",
    scope: "跨语种文献整理、段落对照与防幻觉引文校验界面",
    aiBoundary: "M2 上下文降噪 + M10 组件规范 + M12 引用锚点检索框架",
    humanVerified: "研究者本人核对原典译名、卷次出处及无证据时的安全拒答行为",
    modulesUsed: "M2 · M10 · M12 · M13-Eng",
  },
  {
    id: "himcm",
    code: "CASE 04",
    title: "HiMCM #19243 数模工作流",
    background: "竞赛与 STEM 实践 · 参数敏感性脚本整理",
    scope: "将数学建模拆解为可复跑数据脚本与论文图表核验流程",
    aiBoundary: "AI 辅助生成清洗与绘图脚本 · 禁止代写论证或编造实验结论",
    humanVerified: "参赛学生核验数学假设、原始数据集口径与复跑输出图表一致",
    modulesUsed: "M1 · M2 · M5 · M11",
  },
  {
    id: "ece-brain",
    code: "CASE 05",
    title: "ECE-Brain-Meeting",
    background: "高校科研协作组 · 多模态组会纪要沉淀",
    scope: "会议纪要结构化、文献卡片索引与实验待办归档工作流",
    aiBoundary: "仓库共享 .cursor/rules 规范（M4）+ 检索前隔离（M12）",
    humanVerified: "团队成员确认实验参数与未发表敏感数据不进入公共索引",
    modulesUsed: "M4 · M6 · M9 · M12",
  },
];

const COMPARISON_ROWS = [
  {
    label: "适合人群",
    selfPaced: "时间碎片化、具备一定自驱力、希望按自己节奏系统学习并随时查资料的创作者与开发者",
    cohort: "希望在 4～6 周内有固定节奏、做出可展示作品并获得指导老师逐项点评与纠偏的学员",
  },
  {
    label: "核心内容与沙盘",
    selfPaced: "解锁全部 14 模块单元、20 个内置交互沙盘、测验判分与 Markdown 成果导出",
    cohort: "包含「自主畅学卡」全部内容与 AI 配额权限",
  },
  {
    label: "直播与班级节奏",
    selfPaced: "无固定开班周期，随时开通即刻按建议路径学习",
    cohort: "固定期次小班课表（如 COHORT-2026-Q4），含直播串讲与里程碑打卡节奏",
  },
  {
    label: "作业点评与认证",
    selfPaced: "依赖沙盘实时审计与服务端测验反馈，不含人工批改",
    cohort: "提交阶段作业与自检快照，教师分班人工审校，支持打回修改、重交与 SkillGrant 认证",
  },
  {
    label: "有效期与开班/退款",
    selfPaced: "月卡（30 天）/ 季卡（90 天）/ 年卡（365 天）可选，支持兑换码或订单结算",
    cohort: "按对应期次服务周期履约（当前支持入班码激活或提交预约咨询，名额满额即停招）",
  },
];

const HOME_FAQ_ITEMS = [
  {
    q: "零基础或非技术创作者能学会吗，需要什么前置基础？",
    a: "可以。本课程专门设计了「非技术创作者 / 产品架构线（M1 → M9 → M3 → M10 → M11 → M13-Gov）」，你不需要手写复杂后端框架，但需要具备基本电脑文件操作习惯，并愿意按照规则把需求边界写清楚、亲自核验运行结果。",
  },
  {
    q: "学习需要准备什么设备和 AI 订阅费用？",
    a: "一台能正常联网运行现代浏览器的电脑即可体验全部 14 模块讲义与 20 个交互沙盘。若在本地同步开发自己的真实项目，建议安装 Cursor（有免费额度，按需选择官方订阅）与 Node.js 环境。",
  },
  {
    q: "站内的 AI 辅助评测（如 Bugbot 演示）有配额或次数限制吗？",
    a: "有。为保障平台稳定性与公平使用，服务端 AI 辅助接口设置了按账号的每日调用配额防护；所有核心交互沙盘（如 Lab 01 提示词装配、Lab 03 MCP 审计等）也全部内置本地确定性规则引擎，无外部模型额度时依然可以完整演练。",
  },
  {
    q: "我上传的作业、笔记和附件如何处理，会有隐私风险吗？",
    a: "课程严格要求学员在提交作业截图、片段或模板时提前清理真实密钥（如 sk-/ghp_ 等）与敏感业务数据；小班作业按学员账号与所属期次分班隔离，只有授权的带班教师与管理员可查看审校，不会公开展示未获授权的学员仓库。",
  },
  {
    q: "会员有效期怎么算？目前如何开通与退换？",
    a: "自主畅学卡按所选周期（30 / 90 / 365 天）自激活当日起计算；当前平台支持邮箱账号登录后提交订单确认、或使用教务发放的兑换码即时激活。若在 7 日内未完成超过 2 个付费模块或未参与小班批改前对课程不满意，可通过页面底部咨询通道联系教务协助处理。",
  },
  {
    q: "我是家长（关注青少年科创）或研发团队负责人，应该如何查看对应方案？",
    a: "为保证主站聚焦创作者与独立开发者体验，我们已拆出独立专题页：家长与青少年同学请访问「青少年营」专题页；研发团队与高校实验室请访问「团队内训」专题页。",
  },
];

function formatCents(cents: number): string {
  return `¥${(cents / 100).toLocaleString("zh-CN", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  })}`;
}

export default function OfficialHomePage({
  onNavigatePage,
  onEnterWorkspace,
  onEnterProjects,
  onEnterSlides,
  onOpenBilling,
  onOpenCohortPanel,
  onOpenInstructorCockpit,
  onOpenAdminConsole,
}: OfficialHomePageProps) {
  const { session } = useAuth();
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [selectedTrackKey, setSelectedTrackKey] = useState<"eng" | "gov">("eng");
  const [experienceTab, setExperienceTab] = useState<"sandbox" | "units" | "quiz">("sandbox");
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, number>>({});
  const [previewGrades, setPreviewGrades] = useState<
    Record<string, PreviewM1QuizResponse["questionResults"][number]>
  >({});
  const [previewQuizError, setPreviewQuizError] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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
        // Fallback to static curriculum definitions cleanly when offline
      });
    return () => {
      active = false;
    };
  }, [session?.hasPaidAccess]);

  const metrics = getPublicCourseMetrics();
  const m1Preview = getFreeTrialModulePreview();
  const m1SampleQuestions = MODULE_QUIZZES.m1.questions.slice(0, 2);

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
      <WebsiteNavbar
        currentPage="home"
        hasPaidAccess={hasPaidAccess}
        onNavigatePage={onNavigatePage}
        onEnterWorkspace={onEnterWorkspace}
        onEnterProjects={onEnterProjects}
        onOpenBilling={onOpenBilling}
        onOpenCohortPanel={onOpenCohortPanel}
        onOpenInstructorCockpit={onOpenInstructorCockpit}
        onOpenAdminConsole={onOpenAdminConsole}
      />

      {/* 1. Hero: Outcome-focused positioning for non-tech creators & indie developers */}
      <section className="relative overflow-hidden border-b border-white/10 cyber-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between gap-6">
            <div className="space-y-5">
              <div className="text-xs font-mono text-gemini-cyan tracking-wide">
                CODING EVERYTHING 项目学院 · 可运行 · 可验证 · 可交付
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.14] [text-wrap:balance]">
                把真实业务问题变成
                <span className="text-gemini-cyan">可运行、可验证</span>的数字资产
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                不止于“学 Prompt”或“背 IDE 操作”。围绕{" "}
                <strong className="text-white font-semibold">
                  业务问题 → 系统边界 → AI 协作实现 → 确定性验证 → 人工批准 → 可维护数字资产
                </strong>{" "}
                打造项目型培训平台，服务企二代真实业务项目营、独立开发者、企业内训与青少年科创营。
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onEnterWorkspace("m1")}
                  className="px-5 py-3 rounded-xl bg-gemini-cyan text-slate-950 font-semibold text-sm hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>免费体验 M1 课程</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => (onEnterProjects ? onEnterProjects() : onEnterWorkspace("m1"))}
                  className="px-5 py-3 rounded-xl border border-emerald-400/45 bg-emerald-400/10 hover:bg-emerald-400/20 text-sm font-semibold text-emerald-200 inline-flex items-center gap-2 cursor-pointer"
                >
                  <FolderGit2 className="w-4 h-4" />
                  <span>进入项目学院 (Starter Kit / Eval)</span>
                </button>
                <a
                  href="#pricing"
                  className="px-4 py-3 rounded-xl border border-white/20 bg-white/[0.04] hover:bg-white/[0.08] text-sm font-medium text-white inline-flex items-center gap-2"
                >
                  <GraduationCap className="w-4 h-4 text-gemini-purple" />
                  <span>学习方案</span>
                </a>
                <button
                  type="button"
                  onClick={() => onEnterSlides("m1")}
                  className="px-4 py-3 rounded-xl border border-white/10 text-xs font-mono text-slate-300 hover:text-white hover:bg-white/5 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <PresentationIcon className="w-4 h-4 text-gemini-cyan" />
                  <span>幻灯片模式</span>
                </button>
              </div>
            </div>

            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-white/10">
              <div>
                <dt className="text-[11px] font-mono text-slate-400">Starter Kit 模板</dt>
                <dd className="text-lg sm:text-xl font-bold font-mono text-white tabular-nums mt-0.5">
                  3 套真实业务基座
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-mono text-slate-400">课程模块与沙盘</dt>
                <dd className="text-lg sm:text-xl font-bold font-mono text-gemini-cyan tabular-nums mt-0.5">
                  {metrics.moduleCount} 模块 · {metrics.labCount} 沙盘
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-mono text-slate-400">服务端双门禁</dt>
                <dd className="text-lg sm:text-xl font-bold font-mono text-emerald-300 tabular-nums mt-0.5">
                  静态审计 + Eval
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-mono text-slate-400">助教与能力认证</dt>
                <dd className="text-lg sm:text-xl font-bold font-mono text-purple-300 tabular-nums mt-0.5">
                  Tutor · Exam · 三锁
                </dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-6 flex">
            <div className="w-full rounded-2xl overflow-hidden border border-white/15 bg-[#090d18] shadow-2xl flex flex-col justify-between">
              <div className="flex-1 min-h-[240px] w-full overflow-hidden bg-gradient-to-br from-[#0b1120] to-[#130d24]">
                <img
                  src={heroImg}
                  alt="Coding Everything 项目学院：从业务问题到可验证数字资产"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-4 py-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                <span>交付资产：README · SPEC · .cursorrules · tests/ · evidence/ · handoff.md</span>
                <span className="text-gemini-cyan">M1 与 Starter Kit 预览开放</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Pain Points */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        <div className="space-y-2 max-w-3xl">
          <div className="text-xs font-mono text-gemini-cyan">WHY PROJECTS STALL</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            自己用 AI 写项目时，为什么总在第 70% 卡住？
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            工具本身已经足够快，真正拖慢交付的往往是下面四个工程失控现场。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PAIN_POINTS.map((item) => (
            <article
              key={item.index}
              className="p-6 rounded-2xl border border-white/10 bg-[#090c14] space-y-2.5"
            >
              <div className="text-xs font-mono text-rose-400 tabular-nums">
                痛点 {item.index}
              </div>
              <h3 className="text-lg font-bold text-white leading-snug">{item.title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 3. Coding Everything 7-Stage Pipeline + Starter Kit Architecture */}
      <section className="border-y border-white/10 bg-[#060912]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="text-xs font-mono text-gemini-purple">
                CODING EVERYTHING · TOP-LEVEL LEARNING PIPELINE
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                不再以“看懂模块”为终点，而是每阶段产出一份可核验的数字资产
              </h2>
              <p className="text-sm text-slate-300">
                从真实业务任务出发，依次走通边界定义、Harness 约束、Diff 切片、确定性测试与 Eval、人工批准与运维交接。
              </p>
            </div>
            <button
              type="button"
              onClick={() => (onEnterProjects ? onEnterProjects() : onEnterWorkspace("m1"))}
              className="px-4 py-2.5 rounded-xl border border-emerald-400/40 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20 text-xs font-semibold inline-flex items-center gap-2 self-start cursor-pointer"
            >
              <FolderGit2 className="w-4 h-4" />
              <span>体验 Starter Kit 与首小时清单 →</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {SEVEN_STAGE_PIPELINE.map((item) => (
              <div
                key={item.step}
                className="p-4 rounded-xl border border-white/10 bg-[#0b101d] flex flex-col justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
                    <span className="text-gemini-cyan font-bold">STAGE {item.step}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug">{item.title}</h3>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{item.action}</p>
                </div>
                <div className="pt-2.5 border-t border-white/10 space-y-1 text-[10px] font-mono">
                  <div className="text-emerald-300">资产：{item.artifact}</div>
                  <div className="text-slate-500">{item.modules}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Starter Kit Structure + First-Hour Positive Loop + GEO Pilot Track */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
            <div className="lg:col-span-5 p-5 rounded-2xl border border-white/12 bg-[#0b101d] space-y-3">
              <div className="text-xs font-mono text-gemini-cyan">
                STANDARD STARTER KIT · 统一项目模板骨架
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                {STANDARD_STARTER_KIT_TREE.map((node) => (
                  <div
                    key={node.path}
                    className="px-2.5 py-2 rounded-lg bg-black/40 border border-white/10 flex flex-col gap-0.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-white font-semibold">{node.path}</span>
                      <span className={node.writable ? "text-emerald-300" : "text-amber-300"}>
                        {node.writable ? "可改" : "只读"}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-sans">{node.purpose}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 p-5 rounded-2xl border border-white/12 bg-[#0b101d] space-y-3">
              <div className="text-xs font-mono text-emerald-300">
                FIRST-HOUR LOOP · 开课第一小时必过 6 步
              </div>
              <ol className="space-y-2 text-xs text-slate-200">
                {FIRST_HOUR_DEFAULT_CHECKLIST.map((step, i) => (
                  <li key={step.id} className="flex items-start gap-2">
                    <span className="font-mono text-[11px] text-gemini-cyan shrink-0 mt-0.5">
                      0{i + 1}.
                    </span>
                    <div>
                      <span className="font-semibold text-white">{step.label}</span>
                      <span className="text-slate-400"> — {step.detail}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="lg:col-span-3 p-5 rounded-2xl border border-gemini-purple/40 bg-[#100e1c] flex flex-col justify-between gap-3">
              <div className="space-y-2">
                <div className="text-xs font-mono text-purple-200">
                  PILOT TRACK · 首推企二代真实业务项目营
                </div>
                <h3 className="text-base font-bold text-white">
                  GEO Evidence Lab 与企业私有知识库试点
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  企业授权脱敏业务场景 → 学员基于 Starter Kit 搭建可演示原型 → 导师双门禁评审 → 形成交接报告。
                </p>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-amber-400/30 text-[11px] text-amber-200 leading-relaxed">
                {GEO_EVIDENCE_LAB_DISCLAIMER}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Live No-Login Experience Showcase */}
      <section id="experience" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-mono text-gemini-cyan">LIVE INTERACTIVE PREVIEW</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              不用先注册，直接体验真实课程沙盘、单元结构与测验反馈
            </h2>
            <p className="text-sm text-slate-300">
              下方即课程 M1 实际运行的提示词装配沙盘与诊断题，先动手试试看是否符合你的学习习惯。
            </p>
          </div>

          <div
            className="inline-flex p-1 rounded-xl bg-[#0b101d] border border-white/15 self-start"
            role="tablist"
            aria-label="免费体验内容切换"
          >
            <button
              type="button"
              role="tab"
              aria-selected={experienceTab === "sandbox"}
              onClick={() => setExperienceTab("sandbox")}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                experienceTab === "sandbox"
                  ? "bg-gemini-cyan text-slate-950 font-semibold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              1. 交互式 Lab 01 沙盘
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={experienceTab === "units"}
              onClick={() => setExperienceTab("units")}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                experienceTab === "units"
                  ? "bg-gemini-cyan text-slate-950 font-semibold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              2. M1 单元与作品导出
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={experienceTab === "quiz"}
              onClick={() => setExperienceTab("quiz")}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                experienceTab === "quiz"
                  ? "bg-gemini-cyan text-slate-950 font-semibold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              3. 即时测验与解析体验
            </button>
          </div>
        </div>

        {experienceTab === "sandbox" && (
          <div className="space-y-4">
            <PlanPromptSandbox />
          </div>
        )}

        {experienceTab === "units" && (
          <div className="p-6 rounded-2xl border border-white/12 bg-[#090d16] space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <div className="text-xs font-mono text-gemini-cyan">
                  M1 开放样板 · 共 {m1Preview.units.length} 个完整教学单元
                </div>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {m1Preview.moduleMeta.title}
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-300">
                可导出产物：{m1Preview.moduleMeta.deliverables[0]}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {m1Preview.units.map((u, idx) => (
                <div
                  key={u.id}
                  className="p-3.5 rounded-xl border border-white/10 bg-black/30 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="text-[11px] font-mono text-slate-400 tabular-nums">
                      单元 {String(idx + 1).padStart(2, "0")} · {u.estimatedMinutes} 分钟
                    </div>
                    <div className="text-sm font-semibold text-white">{u.title}</div>
                    <p className="text-xs text-slate-400 line-clamp-2">{u.learningObjective}</p>
                  </div>
                  {u.artifactFilename && (
                    <span className="text-[11px] font-mono text-gemini-cyan shrink-0">
                      产出模板
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {experienceTab === "quiz" && (
          <div className="p-6 rounded-2xl border border-white/12 bg-[#090d16] space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div>
                <div className="text-xs font-mono text-gemini-cyan">
                  即时自测样本 · 源自 M1 诊断题库（无需登录直接作答）
                </div>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  检验你对“意图拆解与验证闭环”的判断
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                选择选项即可查看解析与复盘位置
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {m1SampleQuestions.map((q, qIdx) => {
                const picked = previewAnswers[q.id];
                const grade = previewGrades[q.id];
                const answered = Boolean(grade);
                const isCorrect = Boolean(grade?.isCorrect);
                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl border border-white/10 bg-black/30 space-y-3"
                  >
                    <div className="text-[11px] font-mono text-gemini-cyan">
                      Q{qIdx + 1} · {q.topic}
                    </div>
                    <h4 className="text-sm font-bold text-white leading-snug">{q.question}</h4>
                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = picked === oIdx;
                        const isRightOpt = answered && grade && oIdx === grade.correctIndex;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setPreviewAnswers((prev) => ({ ...prev, [q.id]: oIdx }));
                              setPreviewQuizError(null);
                              void previewM1QuizApi({ [q.id]: oIdx })
                                .then((res) => {
                                  const hit = res.questionResults.find((r) => r.questionId === q.id);
                                  if (hit) {
                                    setPreviewGrades((prev) => ({ ...prev, [q.id]: hit }));
                                  }
                                })
                                .catch(() => {
                                  setPreviewQuizError("服务端体验判分暂不可用，请稍后再试。");
                                });
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                              isRightOpt
                                ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-100"
                                : isSelected
                                ? answered
                                  ? "border-rose-400/60 bg-rose-500/15 text-rose-100"
                                  : "border-gemini-cyan/60 bg-gemini-cyan/15 text-white"
                                : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07]"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {answered && grade ? (
                      <div className="pt-2 border-t border-white/10 text-xs space-y-1">
                        <div
                          className={
                            isCorrect
                              ? "text-emerald-300 font-semibold"
                              : "text-amber-300 font-semibold"
                          }
                        >
                          {isCorrect ? "判断准确" : "可继续核对思路"}
                        </div>
                        <p className="text-slate-300 leading-relaxed">{grade.explanation}</p>
                      </div>
                    ) : picked !== undefined ? (
                      <div className="pt-2 border-t border-white/10 text-xs text-slate-400">
                        {previewQuizError ?? "正在请求服务端判定与解析..."}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="p-4 rounded-xl border border-gemini-cyan/25 bg-[#09121e] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-200">
            <FlaskConical className="w-4 h-4 text-gemini-cyan shrink-0" />
            <span>
              M1 全 10 单元、Lab 01 练习检查、笔记导出与课件幻灯片均已开放，无需先登录或绑定银行卡。
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onEnterWorkspace("m1")}
              className="px-4 py-2 rounded-lg bg-gemini-cyan text-slate-950 font-semibold text-xs hover:opacity-90 cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>进入完整 M1 学习工作台</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onEnterSlides("m1")}
              className="px-4 py-2 rounded-lg border border-white/15 text-xs text-slate-200 hover:bg-white/5 cursor-pointer"
            >
              打开课堂幻灯片
            </button>
          </div>
        </div>
      </section>

      {/* 5. Dual-Track Path & Curriculum + Verified Case Evidence */}
      <section id="curriculum" className="border-y border-white/10 bg-[#060912]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-12">
          {/* Dual Track Selector */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <div className="text-xs font-mono text-gemini-purple">CURRICULUM &amp; TRACKS</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  两条清晰路线，覆盖创作者与独立开发者核心目标
                </h2>
              </div>

              <div className="inline-flex p-1 rounded-xl bg-[#0d1322] border border-white/15 self-start">
                <button
                  type="button"
                  onClick={() => setSelectedTrackKey("eng")}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    selectedTrackKey === "eng"
                      ? "bg-gemini-cyan text-slate-950"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  独立开发者 / 全栈工程线 (M13-Eng)
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
                  非技术创作者 / 产品治理线 (M13-Gov)
                </button>
              </div>
            </div>

            {selectedTrackKey === "eng" ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 rounded-2xl border border-emerald-400/30 bg-[#0b101d]">
                <div className="lg:col-span-5 aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-[#090d16]">
                  <img
                    src={engTrackImg}
                    alt="M13-Eng 独立开发者全栈与工程交付主线示意图"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="lg:col-span-7 space-y-4">
                  <div className="text-xs font-mono text-emerald-300">
                    M1 → M3 → M4 → M5 → M8 长程 Harness → M12 运行时 KB → M13-Eng Capstone
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    独立开发者：安全全栈 MVP、长程 Harness 与可部署项目交付
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    聚焦前后端鉴权隔离、数据库 Schema 演进、Worktree 多 Agent 协同、ACL Pre-filter 检索与自动化测试门禁，真正做出能上线、能迭代的独立软件。
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300 pt-1">
                    <div>
                      <span className="font-mono text-gemini-cyan block">能力门禁</span>
                      <span className="mt-1 block">服务端鉴权与 Webhook 验签证据</span>
                    </div>
                    <div>
                      <span className="font-mono text-gemini-cyan block">代表沙盘</span>
                      <span className="mt-1 block">Bugbot · Worktree · ACL RAG</span>
                    </div>
                    <div>
                      <span className="font-mono text-gemini-cyan block">结课成果</span>
                      <span className="mt-1 block">含测试退出码的可部署应用</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 rounded-2xl border border-amber-400/35 bg-[#12101a]">
                <div className="lg:col-span-5 aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-[#0d0b14]">
                  <img
                    src={govTrackImg}
                    alt="M13-Gov 非技术创作者产品与治理评审主线示意图"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="lg:col-span-7 space-y-4">
                  <div className="text-xs font-mono text-amber-300">
                    M1 → M9 三层边界 → M3 产品切片 → M10 审美规范 → M11 蓝图 → M13-Gov 治理评审
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    非技术创作者 / 产品设计者：需求契约、三层排错与产品验收
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    不要求硬写底层并发算法，重在让你读懂前后端边界、用结构化蓝图与视觉规范指挥 AI 做出可用原型，并具备审查 AI 风险与把关交付的能力。
                  </p>
                  <div className="text-xs text-amber-200/90 leading-relaxed border-t border-amber-400/20 pt-3">
                    边界说明：{M13_GOV_SIMULATION_DISCLAIMER}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3-Track 14 Modules Matrix */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">
                  全课 {metrics.trackCount} 阶段 {metrics.moduleCount} 模块完整目录
                </h3>
                <p className="text-xs text-slate-400">
                  共 {metrics.unitCount} 个结构化单元 · {metrics.labCount} 个交互沙盘 · {metrics.slideCount} 屏课堂演示
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {COURSE_TRACKS.map((track) => {
                const trackMods = modulesList.filter((m) => m.trackId === track.id);
                return (
                  <div key={track.id} className="space-y-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 pb-2 border-b border-white/10">
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <Layers className="w-4 h-4 text-gemini-cyan" />
                        <span>{track.title}</span>
                      </h4>
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
                              <h5 className="text-sm font-bold text-white leading-snug">
                                {mod.title.replace(/^Module\s+[\w-]+:\s*/i, "")}
                              </h5>
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
          </div>

          {/* Evidence-Based Case Studies */}
          <div id="cases" className="space-y-6 pt-4">
            <div className="space-y-2 max-w-3xl">
              <div className="text-xs font-mono text-gemini-cyan">VERIFIED WORK &amp; BOUNDARIES</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                代表性实战案例与“AI 辅助 vs 人工核验”边界
              </h2>
              <p className="text-sm text-slate-300">
                我们明确展示每个项目的实际背景、项目范围与人工验收环节，不以个案作为普适效果或就业结果承诺。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {VERIFIED_CASE_STUDIES.map((cs) => (
                <article
                  key={cs.id}
                  className="p-5 rounded-xl border border-white/10 bg-[#0b101d] flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-gemini-cyan">{cs.code}</span>
                      <span className="text-slate-400">{cs.background}</span>
                    </div>
                    <h3 className="text-base font-bold text-white">{cs.title}</h3>
                    <dl className="space-y-2 text-xs">
                      <div>
                        <dt className="text-slate-400 font-mono">项目范围</dt>
                        <dd className="text-slate-200 mt-0.5">{cs.scope}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-400 font-mono">AI 工具链边界</dt>
                        <dd className="text-slate-300 mt-0.5">{cs.aiBoundary}</dd>
                      </div>
                      <div>
                        <dt className="text-emerald-300 font-mono">人工核验内容</dt>
                        <dd className="text-slate-200 mt-0.5">{cs.humanVerified}</dd>
                      </div>
                    </dl>
                  </div>
                  <div className="pt-2.5 border-t border-white/10 text-[11px] font-mono text-purple-200">
                    对应模块：{cs.modulesUsed}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Two Product Lines: Self-Serve vs Mentored Cohort */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-10">
        <div className="space-y-2 max-w-3xl">
          <div className="text-xs font-mono text-gemini-purple">LEARNING PLANS</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            两种学习服务：按自己节奏自主学习，或加入小班由老师批改带教
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            支持先免登录免费体验 M1，确认课程节奏后再决定开通完整自学权益或预约小班席位。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Self-Serve Card */}
          <div className="p-6 rounded-2xl border border-white/15 bg-[#0b0f19] flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-gemini-cyan">
                  SELF-SERVE · 自主学习会员
                </span>
                <BookOpen className="w-4 h-4 text-gemini-cyan" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {selfPacedProduct?.title || "Coding Everything 全课自助畅学卡"}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {selfPacedProduct?.description ||
                    "适合独立开发者与业务实践者，解锁全 14 模块、20 沙盘、Starter Kit 模板、Eval 基准集、只读助教 Tutor 与逐题认证考场。"}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {(
                  selfPacedProduct?.prices ?? [
                    { id: 1, label: "月卡 30 天", amountCents: 12900, durationDays: 30 },
                    { id: 2, label: "季卡 90 天", amountCents: 32900, durationDays: 90 },
                    { id: 3, label: "年卡 365 天", amountCents: 69900, durationDays: 365 },
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
                  <span>
                    解锁全 {metrics.moduleCount} 模块（含 M13-Gov / M13-Eng 双线）与 {metrics.labCount} 交互沙盘
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>云端单元进度同步、{metrics.quizQuestionCount} 题巩固自测与 Markdown 笔记导出</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>站内 AI 辅助评测与备课工具（按账号每日配额保护）</span>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onEnterWorkspace("m1")}
                className="py-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium text-xs sm:text-sm cursor-pointer"
              >
                先免费体验 M1
              </button>
              <button
                type="button"
                onClick={onOpenBilling}
                className="py-3 rounded-xl bg-white text-slate-950 font-semibold text-xs sm:text-sm hover:bg-slate-200 transition-colors cursor-pointer"
              >
                {hasPaidAccess ? "查看权益 / 升级" : "开通学习 / 兑换码"}
              </button>
            </div>
          </div>

          {/* Mentored Cohort Card */}
          <div className="p-6 rounded-2xl border border-gemini-purple/50 bg-[#100e1c] flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-purple-200">
                  MENTORED COHORT · 教师小班带教
                </span>
                <Users className="w-4 h-4 text-gemini-purple" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {cohortProduct?.title || "Coding Everything 企二代与小班实战营"}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {cohortProduct?.description ||
                    "基于真实授权业务场景开展双周/多周项目交付，含服务端 422 静态门禁、AI 预审辅助与导师人工批准及三锁技能认证。"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-gemini-purple/35 bg-white/[0.04] flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-purple-200 font-semibold">
                    {activeCohort
                      ? `${activeCohort.title} (${activeCohort.code})`
                      : "小班期次 · COHORT-2026-Q4"}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5 tabular-nums">
                    {activeCohort
                      ? `周期 ${activeCohort.startDate} 至 ${activeCohort.endDate} · 限 ${activeCohort.maxSeats} 席`
                      : "4～6 周带班周期 · 阶段里程碑点评与结课评审"}
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
                  <span>含自主学习全部 {metrics.moduleCount} 模块与沙盘权益</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>定期直播串讲 + 阶段里程碑作业人工审校与反馈</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>支持打回修改重交与结课评审（通过后授予可验证技能记录）</span>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onOpenBilling}
                className="py-3 rounded-xl bg-gemini-purple text-white font-semibold text-xs sm:text-sm hover:opacity-90 transition-opacity cursor-pointer"
              >
                激活入班码 / 查看班期
              </button>
              <a
                href="#inquiry"
                className="py-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-center text-white font-medium text-xs sm:text-sm"
              >
                预约候补 / 咨询报名
              </a>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="rounded-2xl border border-white/10 bg-[#080c15] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-slate-300 font-mono">
                  <th className="py-3.5 px-4 w-1/5">服务对比维度</th>
                  <th className="py-3.5 px-4 w-2/5 text-gemini-cyan">自主学习会员</th>
                  <th className="py-3.5 px-4 w-2/5 text-purple-300">教师小班带教</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-slate-300">
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.label}>
                    <td className="py-3.5 px-4 font-semibold text-white align-top">
                      {row.label}
                    </td>
                    <td className="py-3.5 px-4 leading-relaxed align-top">{row.selfPaced}</td>
                    <td className="py-3.5 px-4 leading-relaxed align-top">{row.cohort}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-white/10 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <span>
              当前开通说明：支持邮箱验证码登录后下单登记并由教务核销开通，或使用激活码即时兑换；线上三方直付网关将在后续版本开放。
            </span>
            <div className="flex items-center gap-4 font-mono">
              <button
                type="button"
                onClick={() => onNavigatePage("teens")}
                className="text-gemini-cyan hover:underline cursor-pointer"
              >
                查看青少年营 →
              </button>
              <button
                type="button"
                onClick={() => onNavigatePage("teams")}
                className="text-purple-300 hover:underline cursor-pointer"
              >
                查看团队内训 →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Instructor Workflow & Trust Disclosures */}
      <section className="border-y border-white/10 bg-[#060912]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 space-y-6">
          <div className="space-y-2 max-w-3xl">
            <div className="text-xs font-mono text-emerald-300">TEACHING &amp; TRUST BOUNDARIES</div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              教学如何指导、作业如何评阅，以及教学模拟的边界说明
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs sm:text-sm">
            <div className="p-5 rounded-xl border border-white/10 bg-[#0b101d] space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs text-gemini-cyan">
                <CheckCircle2 className="w-4 h-4" />
                <span>教师如何批改与带班</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                小班作业需附带自检快照与交付说明，由所属期次教师分班查看，给出具体修改批注并支持退回重交，直至达到结课标准。
              </p>
            </div>

            <div className="p-5 rounded-xl border border-white/10 bg-[#0b101d] space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs text-gemini-purple">
                <ShieldCheck className="w-4 h-4" />
                <span>个人作品与附件处理</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                作业附件仅限指定图片及工程文档格式且限定体积上限，禁止上传含真实线上密钥的配置文件，个人练习记录始终仅限本人与带班导师查阅。
              </p>
            </div>

            <div className="p-5 rounded-xl border border-amber-400/30 bg-[#12101a] space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs text-amber-300">
                <ShieldCheck className="w-4 h-4" />
                <span>模拟演练 vs 生产验证</span>
              </div>
              <p className="text-slate-200 leading-relaxed">
                {M13_GOV_SIMULATION_DISCLAIMER} 涉及真实上线部署的系统，仍需按 M13-Eng 规范补齐真实环境集成与安全测试。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ & Lead Inquiry */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        <div className="space-y-2 text-center">
          <div className="text-xs font-mono text-gemini-cyan">FAQ</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">常见问题</h2>
        </div>

        <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#090d16]">
          {HOME_FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={item.q} className="px-5 py-4">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 text-left text-sm font-semibold text-white cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                      isOpen ? "rotate-180 text-gemini-cyan" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed pr-6">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Lead Inquiry Form */}
      <section id="inquiry" className="border-t border-white/10 bg-[#060912]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-6">
          <div className="space-y-2 text-center">
            <div className="text-xs font-mono text-gemini-cyan">ENROLLMENT &amp; WAITLIST</div>
            <h2 className="text-2xl font-bold text-white">
              预约小班带教 / 候补名额，或咨询订单与入班问题
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              如果您还在对比自主学习与小班节奏，也可以留下背景信息，教务老师将在 1 个工作日内回复。
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
                  placeholder="例如：张同学 / 陈产品"
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
                  placeholder="name@example.com"
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
                  <option value="cohort">个人报名小班带教 / 候补</option>
                  <option value="enterprise">团队研发内训（可看 /teams 专页）</option>
                  <option value="school">青少年 / 校园试点（可看 /teens 专页）</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-300 font-medium">当前角色或关注项目（选填）</label>
              <input
                type="text"
                value={inqOrg}
                onChange={(e) => setInqOrg(e.target.value)}
                placeholder="例如：独立开发者、运营创作者、产品经理"
                className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white focus:outline-none focus:border-gemini-cyan"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-300 font-medium">想做出的产品或解决的问题 *</label>
              <textarea
                rows={3}
                required
                value={inqMessage}
                onChange={(e) => setInqMessage(e.target.value)}
                placeholder="请简述您当前的背景与期望完成的小项目方向..."
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
              Coding Everything 项目学院 · 把真实业务问题变成可运行、可验证、可交接的数字资产
            </div>
            <div>{M13_GOV_SIMULATION_DISCLAIMER}</div>
          </div>
          <div className="flex flex-wrap items-center gap-5 font-mono">
            <button
              type="button"
              onClick={() => onNavigatePage("teens")}
              className="hover:text-gemini-cyan cursor-pointer"
            >
              青少年营 (/teens)
            </button>
            <button
              type="button"
              onClick={() => onNavigatePage("teams")}
              className="hover:text-gemini-cyan cursor-pointer"
            >
              团队内训 (/teams)
            </button>
            <button
              type="button"
              onClick={() => onEnterWorkspace("m1")}
              className="hover:text-gemini-cyan cursor-pointer"
            >
              学习工作台
            </button>
            <button
              type="button"
              onClick={() => onEnterSlides("m1")}
              className="hover:text-gemini-cyan cursor-pointer"
            >
              Reveal 课件
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
