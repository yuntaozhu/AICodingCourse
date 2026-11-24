import { useState } from "react";
import { ArrowRight, CheckCircle2, Layers, Send, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/authContextCore";
import { M13_GOV_SIMULATION_DISCLAIMER } from "@/data/courseWorkspaceStore";
import { getPublicCourseMetrics } from "@/data/courseMetrics";
import { submitInquiry } from "@/lib/apiClient";
import WebsiteNavbar, { type WebsitePageRoute } from "./WebsiteNavbar";

interface TeamsLandingPageProps {
  onNavigatePage: (page: WebsitePageRoute) => void;
  onEnterWorkspace: (moduleId?: string) => void;
  onEnterSlides: (moduleId?: string) => void;
  onOpenBilling: () => void;
  onOpenCohortPanel: () => void;
  onOpenInstructorCockpit: () => void;
  onOpenAdminConsole: () => void;
}

const TEAM_CAPABILITIES = [
  {
    code: "M2 · 上下文降噪基线",
    title: "统一 .cursorignore 与任务切片预算",
    detail:
      "清除构建产物、日志和无关目录噪音，建立单任务最小文件影响面约定，减少团队上下文膨胀与 Token 浪费。",
  },
  {
    code: "M4 · .cursor/rules & MCP 护栏",
    title: "按目录生效的规则契约与最小特权 MCP",
    detail:
      "把鉴权规范、错误处理和数据库迁移边界写入版本库 .mdc 规则；MCP 强制 ${env:...} 变量引用与写操作审批。",
  },
  {
    code: "M5 & M6 · DoD 自愈与异步 Bugbot",
    title: "禁止测试作弊的 PR 审查闭环",
    detail:
      "识别模型跳过断言、静默降级或绕过服务端校验的反模式，在 CI 中配置独立上下文评审与人工终审红线。",
  },
  {
    code: "M8 & M12 · 长程 Harness 与 ACL 检索",
    title: "Worktree 多 Agent 隔离与运行时权限过滤",
    detail:
      "通过 init.sh + feature_list.json 抑制跨会话 Context Rot，落地 Pre-filter 租户隔离与双层自动化 Eval 套件。",
  },
];

const DELIVERY_MODES = [
  {
    duration: "90 分钟内训专场",
    fit: "全员认知对齐",
    scope: "聚焦 M1/M2/M4 核心闭环：为什么团队需要 Spec-First 与 .mdc 护栏，现场演示典型返工场景。",
  },
  {
    duration: "半天工程实战工作坊",
    fit: "研发骨干 / TL",
    scope: "结合团队真实仓库片段现场装配 Rules、MCP 审计清单与 DoD 验证命令，直接带走可提交 PR 模板。",
  },
  {
    duration: "4 周团队陪跑试点",
    fit: "10–30 人研发或高校实验室",
    scope: "按业务里程碑分班带教，人工审校团队 PR 规则、长程 Harness 配置与运行时知识库安全验收。",
  },
  {
    duration: "全套教研备课包授权",
    fit: "内部技术学院 / 高校课程",
    scope: "包含 14 模块 4 种可组合课表、教师逐单元讲义、参考答案与实验评分标准一键导出。",
  },
];

export default function TeamsLandingPage({
  onNavigatePage,
  onEnterWorkspace,
  onEnterSlides,
  onOpenBilling,
  onOpenCohortPanel,
  onOpenInstructorCockpit,
  onOpenAdminConsole,
}: TeamsLandingPageProps) {
  const { session } = useAuth();
  const metrics = getPublicCourseMetrics();
  const hasPaidAccess = Boolean(session?.hasPaidAccess);

  const [inqName, setInqName] = useState("");
  const [inqContact, setInqContact] = useState("");
  const [inqOrg, setInqOrg] = useState("");
  const [inqType, setInqType] = useState<"enterprise" | "school">("enterprise");
  const [inqMessage, setInqMessage] = useState("");
  const [inqSubmitting, setInqSubmitting] = useState(false);
  const [inqStatus, setInqStatus] = useState<{ ok: boolean; text: string } | null>(null);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInqStatus(null);
    setInqSubmitting(true);
    try {
      await submitInquiry({
        name: inqName,
        contact: inqContact,
        organization: inqOrg || "企业研发 / 高校团队",
        inquiryType: inqType,
        message: `[团队内训专页] ${inqMessage}`,
      });
      setInqStatus({
        ok: true,
        text: "团队试点需求已进入教务跟进队列，将在 1 个工作日内联系并安排诊断沟通。",
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

  return (
    <div className="min-h-screen bg-[#020205] text-slate-200 selection:bg-gemini-cyan/30 selection:text-white">
      <WebsiteNavbar
        currentPage="teams"
        hasPaidAccess={hasPaidAccess}
        onNavigatePage={onNavigatePage}
        onEnterWorkspace={onEnterWorkspace}
        onOpenBilling={onOpenBilling}
        onOpenCohortPanel={onOpenCohortPanel}
        onOpenInstructorCockpit={onOpenInstructorCockpit}
        onOpenAdminConsole={onOpenAdminConsole}
      />

      {/* Hero Section */}
      <section className="border-b border-white/10 cyber-grid">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-20 space-y-8">
          <div className="space-y-4 max-w-3xl">
            <div className="text-xs font-mono text-gemini-purple tracking-wide">
              ENGINEERING TEAMS &amp; LABS · 面向研发团队、技术负责人与高校实验室
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] [text-wrap:balance]">
              为研发团队建立统一的 AI Coding 护栏，
              <span className="text-gemini-cyan">降低返工率与越权风险</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              个人用得好不等于团队用得稳。课程跳过入门语法，直接围绕团队仓库规范（.mdc）、最小特权 MCP、DoD 测试门禁、长程 Coding Harness 与运行时 ACL 知识库构建可审计的研发基线。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#teams-inquiry"
              className="px-5 py-3 rounded-xl bg-gemini-cyan text-slate-950 font-semibold text-sm hover:opacity-90 transition-opacity inline-flex items-center gap-2"
            >
              <span>预约团队方案诊断与试听</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={() => onEnterWorkspace("m4")}
              className="px-5 py-3 rounded-xl border border-white/20 bg-white/[0.04] hover:bg-white/[0.08] text-sm font-medium text-white cursor-pointer"
            >
              先体验 M1 公开样板（含工作台入口）
            </button>
            <button
              type="button"
              onClick={() => onNavigatePage("home")}
              className="px-4 py-3 rounded-xl text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
            >
              返回个人学习主页 →
            </button>
          </div>

          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-white/10 max-w-3xl">
            <div>
              <dt className="text-[11px] font-mono text-slate-400">研发基线模块</dt>
              <dd className="text-lg font-bold font-mono text-white tabular-nums mt-0.5">
                {metrics.moduleCount} 模块 · {metrics.labCount} 沙盘
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-mono text-slate-400">团队默认免修入门</dt>
              <dd className="text-lg font-bold font-mono text-gemini-cyan mt-0.5">
                直切 M2/M4/M8/M12
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-mono text-slate-400">安全审计底线</dt>
              <dd className="text-lg font-bold font-mono text-white mt-0.5">
                ACL + Dual Eval
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-mono text-slate-400">交付形态</dt>
              <dd className="text-lg font-bold font-mono text-emerald-300 mt-0.5">
                内训 / 工作坊 / 陪跑
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Core Team Capabilities */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-mono text-gemini-cyan">TEAM ENGINEERING HARNESS</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            企业与高校实验室落地 AI Coding 的四项关键基础设施
          </h2>
          <p className="text-sm text-slate-300">
            以“首次通过率、返工率、MTTV（平均验证时间）”替代“AI 生成代码行数”等虚荣指标。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TEAM_CAPABILITIES.map((cap) => (
            <article
              key={cap.code}
              className="p-6 rounded-2xl border border-white/10 bg-[#090d16] space-y-2.5"
            >
              <div className="text-xs font-mono text-gemini-cyan">{cap.code}</div>
              <h3 className="text-lg font-bold text-white">{cap.title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{cap.detail}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 4 Flexible Delivery Modes */}
      <section className="border-y border-white/10 bg-[#060912]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-8">
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-mono text-gemini-purple">FLEXIBLE DELIVERY MODES</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              四种团队授课与交付编排，按节奏和人员规模组合
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DELIVERY_MODES.map((mode) => (
              <div
                key={mode.duration}
                className="p-5 rounded-xl border border-white/10 bg-[#0b101d] flex flex-col justify-between gap-3"
              >
                <div className="space-y-2">
                  <div className="text-xs font-mono text-gemini-cyan flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{mode.fit}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{mode.duration}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{mode.scope}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Case Studies & Security Boundary */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <article className="p-6 rounded-2xl border border-white/12 bg-[#090d16] space-y-3">
            <div className="text-xs font-mono text-gemini-cyan">
              TEAM CASE · ECE-Brain-Meeting 科研团队工作流
            </div>
            <h3 className="text-lg font-bold text-white">
              跨人员沉淀 .cursor/rules 与结构化实验室会议知识包
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              将科研组会记录、文献摘要与实验脚本规范收口为仓库内共享规则，避免新成员入组重复踩坑，同时规定敏感科研未发表数据不得进入外部模型上下文。
            </p>
          </article>

          <article className="p-6 rounded-2xl border border-white/12 bg-[#090d16] space-y-3">
            <div className="text-xs font-mono text-gemini-purple">
              COMPLIANCE CASE · 医疗公司 GEO 知识库隔离
            </div>
            <h3 className="text-lg font-bold text-white">
              Pre-filter 元数据鉴权 + 来源可溯引用，严控幻觉输出
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              先按租户和角色在检索前拦截越权文档，再强制生成结果绑定原始章节出处与过期淘汰标识（Tombstone），高风险文案全部挂起等待合规专员复核。
            </p>
          </article>
        </div>

        <div className="p-5 rounded-2xl border border-emerald-400/25 bg-[#0a121a] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-slate-300">
              <div className="font-semibold text-white">课程内训边界说明</div>
              <p>
                我们不对外出售“全自动替代研发团队”的伪承诺。内训与陪跑重点解决规则资产沉淀、代码安全底线与测试防作弊机制，企业核心业务架构与生产密钥始终由客户团队自主掌控。
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            <span>支持团队私有仓库脱敏演练</span>
          </div>
        </div>
      </section>

      {/* Lead Inquiry Form */}
      <section id="teams-inquiry" className="border-t border-white/10 bg-[#060912]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-6">
          <div className="space-y-2 text-center">
            <div className="text-xs font-mono text-gemini-cyan">ENTERPRISE &amp; UNIVERSITY PILOT</div>
            <h2 className="text-2xl font-bold text-white">
              预约企业内训方案沟通，或高校实验室课程试点
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              请简述团队人数、当前主要技术栈以及希望优先治理的研发环节。
            </p>
          </div>

          <form
            onSubmit={handleInquirySubmit}
            className="p-6 rounded-2xl border border-white/12 bg-[#0b0f19] space-y-4 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-slate-300 font-medium">联系人姓名 *</label>
                <input
                  type="text"
                  required
                  value={inqName}
                  onChange={(e) => setInqName(e.target.value)}
                  placeholder="例如：李架构师 / 周主任"
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white focus:outline-none focus:border-gemini-cyan"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-300 font-medium">工作邮箱或微信 *</label>
                <input
                  type="text"
                  required
                  value={inqContact}
                  onChange={(e) => setInqContact(e.target.value)}
                  placeholder="lead@company.com"
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white focus:outline-none focus:border-gemini-cyan"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-300 font-medium">合作形态</label>
                <select
                  value={inqType}
                  onChange={(e) => setInqType(e.target.value as "enterprise" | "school")}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white focus:outline-none focus:border-gemini-cyan"
                >
                  <option value="enterprise">企业研发团队内训 / 陪跑</option>
                  <option value="school">高校实验室 / 课程建设合作</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-300 font-medium">企业 / 高校院系名称 *</label>
              <input
                type="text"
                required
                value={inqOrg}
                onChange={(e) => setInqOrg(e.target.value)}
                placeholder="例如：XX 科技研发中心 / XX 大学软件学院"
                className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white focus:outline-none focus:border-gemini-cyan"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-300 font-medium">团队规模与试点诉求 *</label>
              <textarea
                rows={3}
                required
                value={inqMessage}
                onChange={(e) => setInqMessage(e.target.value)}
                placeholder="例如：20 人全栈研发团队，希望统一 Cursor Rules、MCP 权限管控和 PR 自动化审校流程..."
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
                <span>{inqSubmitting ? "提交中..." : "提交团队沟通意向"}</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="border-t border-white/10 py-8 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-slate-300 font-medium">AI Coding 学院 · 团队与高校试点专页</div>
            <div>{M13_GOV_SIMULATION_DISCLAIMER}</div>
          </div>
          <div className="flex flex-wrap items-center gap-5 font-mono">
            <button
              type="button"
              onClick={() => onNavigatePage("home")}
              className="hover:text-gemini-cyan cursor-pointer"
            >
              个人学习主页
            </button>
            <button
              type="button"
              onClick={() => onNavigatePage("teens")}
              className="hover:text-gemini-cyan cursor-pointer"
            >
              青少年专题页
            </button>
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
              课件演示模式
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
