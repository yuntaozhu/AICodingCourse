import { useState } from "react";
import { ArrowRight, CheckCircle2, ExternalLink, ShieldCheck, Send } from "lucide-react";
import { useAuth } from "@/context/authContextCore";
import { M13_GOV_SIMULATION_DISCLAIMER } from "@/data/courseWorkspaceStore";
import { getPublicCourseMetrics } from "@/data/courseMetrics";
import { submitInquiry } from "@/lib/apiClient";
import WebsiteNavbar, { type WebsitePageRoute } from "./WebsiteNavbar";

interface TeensLandingPageProps {
  onNavigatePage: (page: WebsitePageRoute) => void;
  onEnterWorkspace: (moduleId?: string) => void;
  onEnterProjects?: () => void;
  onEnterSlides: (moduleId?: string) => void;
  onOpenBilling: () => void;
  onOpenCohortPanel: () => void;
  onOpenInstructorCockpit: () => void;
  onOpenAdminConsole: () => void;
}

const CORE_TEEN_CAPABILITIES = [
  {
    index: "01.",
    title: "拆解与长程接力力",
    detail:
      "学会把一个大想法拆成一格一格的图纸规格，让 AI 按白名单步骤施工不乱跑、跨天长任务交接不失忆。",
  },
  {
    index: "02.",
    title: "双链路 WIKI 知识复利力",
    detail:
      "严格区分“教 AI 写好代码的工程笔记（链路 A）”与“让问答机器人精准查资料、屏蔽过期旧版本的运行时知识库（链路 B）”，越攒越强。",
  },
  {
    index: "03.",
    title: "独立把关与验真力",
    detail:
      "先自己动脑排查再对照解析，看懂报错出在哪一层、守住隐私与密钥边界，敢于质疑并揪出 AI 编造的假数据。",
  },
];

const DELIVERY_RHYTHMS = [
  {
    name: "短讲精要",
    cadence: "约 35–45 分钟 / 模块",
    fit: "适合中学信息/科创社团课与选修课节拍",
  },
  {
    name: "周末工作坊",
    cadence: "90–120 分钟 / 专题",
    fit: "适合集中推进个人作品切片或数模实战演练",
  },
  {
    name: "自主学习模式",
    cadence: "个人随时闯关",
    fit: "内置先修门禁、沙盘实验与错题一键跳回重练",
  },
  {
    name: "双课时深度学习",
    cadence: "完整教研节奏",
    fit: "覆盖翻车案例侦探推理、对照实验与小班点评",
  },
];

const STUDENT_CASES = [
  {
    id: "case-himcm",
    badge: "案例 01 · 国际数模竞赛实录",
    meta: "HiMCM #19243 · 真实学生团队参赛归档",
    title: "打破“全才”垄断：用 WIKI 知识库冲刺国际顶尖建模赛《HiMCM #19243》",
    summary:
      "团队在备赛每节课将能量守恒拆解、体感温度与绘图排版模块沉淀进 WIKI 知识库。正式参赛时用 .cursorrules 立下铁规矩：代码由工具加速，所有温度与耗电数值必须由人类确定的物理计算内核算出；学生跨界引入《洛书》九宫格结构并亲自揪出湿度直角跳变与暴雨评分饱和缺陷，将 42 页初稿打磨为 25 页全英文正式论文 19243.pdf。",
    takeaway: "平时攒 WIKI 知识库，人主导创意立意、边界规则与真实数据验真。",
    sourceNote: "来源：老师代理指导参赛学生团队（2026 HiMCM Team #19243）真实 GitHub 仓与论文归档",
    linkLabel: "GitHub 仓库与 19243.pdf",
    linkUrl: "https://github.com/Tommydjc/himcm.git",
  },
  {
    id: "case-novel",
    badge: "案例 02 · 零编程基础个人创作",
    meta: "AI Novel Studio · 4 天 · 45 份对话实录 · 380+ 测试",
    title: "爱写故事的非程序员同学：4 天造出本地优先百万字级《AI 小说创作工作台》",
    summary:
      "第一天连 AI 编程工具怎么选都不知道的学生，把写长篇网文的真实痛点拆成“基础保存 → 三层大纲 → 人物记忆库 → 续写引擎”积木逐块锁死；改代码前先只读体检并划定文件白名单；“作者正式设定”与“AI 建议”彻底隔离，对外发送前弹出确认清单，并带 AI 写出 380 多项自动检查测试。",
    takeaway: "兴趣热爱就是最好的题目，分块锁死与自动化测试让零基础同学也能管住复杂软件。",
    sourceNote: "来源：零基础学生真实开发与随仓保留的 45 份对话实录",
    linkLabel: "查看 AI Novel Studio 实录",
    linkUrl:
      "https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%221EM8ZFpbPNHJ0jxL7fu3P79MsvnimnnmZ%22%5D,%22action%22:%22open%22,%22userId%22:%22115297251971795371362%22,%22resourceKeys%22:%7B%7D%7D&usp=sharing",
  },
  {
    id: "case-geo",
    badge: "案例 03 · 真实家庭业务场景",
    meta: "医疗公司 GEO 系统 · 合规人工闸门",
    title: "帮自家生意解决真难题：学生独立开发《医疗公司 GEO 系统》",
    summary:
      "外包开发者既不熟悉医疗行业严谨表达，也难把握宣传合规红线。这位在校学生把日常跟随家里积累的行业常识，与“业务需求拆分 + 关键节点必须保留人工审核闸门”方法结合，在 AI Studio 亲手做出面向生成式引擎优化（GEO）的可运行系统原型。",
    takeaway: "观察生活与父母工作里的真实难题，懂行业场景的学生比“套模板”更有创造力。",
    sourceNote: "来源：在校学生基于真实业务痛点独立交付的可运行系统",
    linkLabel: "在线体验 GEO 系统原型",
    linkUrl: "https://ai.studio/apps/b94766e3-1e16-44ed-8484-68712f7caf08",
  },
  {
    id: "case-meeting",
    badge: "案例 04 · 校园协作教学化改编",
    meta: "校园 AI 会议系统 · 基于开源项目 -ECE-Brain-Meeting 改编",
    title: "帮学校搭建「校园 AI 会议系统」：让班委、社团与教研讨论不再乱成一锅粥",
    summary:
      "面向中学生会、社团招新、班委及备课教研场景，参考开源项目 -ECE-Brain-Meeting 的模块化架构进行中学教学化改编：把散落在聊天记录里的讨论，自动归整为统一规格的“议题结论 + 负责同学 + 截止时间”，并配齐工程规范与交接文档，让下一届学弟学妹也能接手迭代。",
    takeaway: "把个人零散用 AI，升级为可多人协同、可跨年级传承的规范校园软件。",
    sourceNote: "说明：基于真实开源项目 -ECE-Brain-Meeting 面向中学校园场景教学化呈现",
    linkLabel: "参考开源原型 -ECE-Brain-Meeting",
    linkUrl: "https://github.com/yuntaozhu/-ECE-Brain-Meeting.git",
  },
];

const CASE_COMPARISON_ROWS = [
  {
    name: "案例 1 · HiMCM #19243",
    origin: "备战国际数模竞赛的学生团队（真实参赛归档）",
    deliverable: "开源仿真仓库 + 25 页全英文参赛论文 19243.pdf",
    growth: "平时攒 WIKI 知识库，人主导《洛书》立意、物理内核与验真",
  },
  {
    name: "案例 2 · AI Novel Studio",
    origin: "零编程基础、热爱写长篇小说的学生（45 份实录）",
    deliverable: "本地优先百万字级长篇创作工作台（380+ 自动测试）",
    growth: "拆成小步积木并锁死白名单，作者永远是主编、守住本地隐私",
  },
  {
    name: "案例 3 · 医疗公司 GEO 系统",
    origin: "观察自家公司真实痛点的在校学生（真实交付）",
    deliverable: "贴合医疗合规边界的生成式引擎优化系统原型",
    growth: "从真实生活与行业需求出发，设计带人工审核闸门的实用系统",
  },
  {
    name: "案例 4 · 校园 AI 会议系统",
    origin: "基于开源原型 -ECE-Brain-Meeting 面向中学教学化改编",
    deliverable: "服务学生会、社团与教研的统一格式会议协同工具",
    growth: "遵守交接文档与工程约束，做出可跨年级传承维护的校园系统",
  },
  {
    name: "案例 5 · 哲学思辨分析系统",
    origin: "基于在线原型 哲学研究平台 面向文科思辨教学化改编",
    deliverable: "按“界定 → 论点 → 反驳 → 出处”定制的概念分析平台",
    growth: "证明文科与人文爱好者的逻辑拆解力，正是驾驭 AI 造软件的强项",
  },
];

const GRADE_STAGES = [
  {
    stage: "初中阶段（初一 – 初三）",
    goal: "兴趣激发 + 养成“先想后做 + 建知识库 + 查风险”好习惯",
    howToLearn:
      "从 Track 1（M1 / M2 / M9 / M3 / M10）与互动小沙盘（含 Lab 17 预算切片）入手，用周末工作坊或自主学习模式做一个错题本、背单词工具或班级小助手，再体验 M11 与 M13-Gov（Lab 20 无代码轨迹评审）练习给 AI 挑错。",
    outcomes: [
      "改掉向 AI“瞎许愿”的毛病，看懂前端、接口与数据层常见报错",
      "养成每学一课就存一条经验进个人 WIKI 知识库的复利习惯",
      "攒下 1–2 个能演示的个人真实小作品与可导出过程档案",
    ],
  },
  {
    stage: "高中阶段（高一 – 高三）",
    goal: "学科融合 + 国际赛事 / 研究性学习 / 硬核 Agent 作品集",
    howToLearn:
      "打通完整 14 模块进阶路径并直达 M13-Eng 工程实战结业：将数理化或人文研究课题拆成严谨规格，练熟长程接力（M8）、带权限与过期剔除的运行时问答（M12 · Lab 18/19）、自动化检验与受控英文写作表达。",
    outcomes: [
      "一套可复用于 HiMCM 等数学建模与科创竞赛的双链路 WIKI 知识库",
      "具备自动测试、权限隔离与安全护栏的完整软件或 Agent 作品",
      "可直接用于综合评价与课题答辩的规范 Markdown 过程成果档案",
    ],
  },
];

const PARENT_TRUST_PRINCIPLES = [
  {
    title: "01. 真实记录，不吹虚假成绩",
    detail:
      "HiMCM #19243、AI Novel Studio 与医疗公司 GEO 系统均源自真实参赛仓/交付实录；校园 AI 会议系统与哲学思辨分析系统明确标注为基于对应真实原型（-ECE-Brain-Meeting 与哲学研究平台）的中学教学化呈现，绝不虚构未公开获奖名次。",
  },
  {
    title: "02. 培养“控制 AI 的人”，绝不是教抄作业",
    detail: `坚持“先独立思考排查、再看参考解析”、“禁止 AI 编造实验数据”、“高敏感内容必须人工核验”。同时明确 M13-Gov 边界：${M13_GOV_SIMULATION_DISCLAIMER}`,
  },
  {
    title: "03. 重视数字安全与隐私意识",
    detail:
      "未登录仅开放第 1 站（M1）免费试学并暂存于本地浏览器；账号登录后学习进度与笔记同步至服务端加密数据库（Cloud SQL PostgreSQL），密钥与评分严格保留在服务端，沙盘专练“不写死密码、不泄露他人隐私与过期文档”。",
  },
  {
    title: "04. 合规使用软件工具",
    detail:
      "课程只教授科学、合规的工程方法与公开工具规则，绝不涉及任何绕过官方账号、校园制度或平台限制的违规做法。",
  },
];

const TEEN_FAQ_ITEMS = [
  {
    q: "这门课会教孩子用 AI 代写作业或代替思考吗？",
    a: "不会。M1 第一关就要求先写结构化需求边界与验收标准，翻车案例也采用“先由学生当小侦探自己找问题，思考后再点开解析对比”，并明令禁止让模型编造实验数值或用假测试敷衍。",
  },
  {
    q: "没有编程基础、或者偏爱文史哲的初中/高中生能学会吗？",
    a: "可以。案例二的 AI Novel Studio 由零编程基础学生完成，案例五展示文科思辨逻辑如何直接转化为软件规格。工作台内置先修门禁，偏重产品与人文策划的同学可走通 M13-Gov 无代码产品与治理结业路线。",
  },
  {
    q: "HiMCM 等数模或科创案例能保证获奖或升学加分吗？",
    a: "不作任何竞赛获奖或升学结果承诺。展示 HiMCM #19243 是为了说明同学如何通过平时积累 WIKI 知识库、限定 .cursorrules 与人类把关物理计算内核来提高工程可靠性。",
  },
  {
    q: "支持学校社团课或家庭先免费体验吗？隐私怎么保障？",
    a: "支持。无需先登录即可体验 M1 全套 10 个单元及交互沙盘；社团课可选 35–45 分钟/模块的“短讲精要”节奏。登录后数据仅存于服务端数据库，课程结束后学生可一键导出全部 WIKI 与复盘笔记 Markdown 档案供家长和老师查阅。",
  },
];

export default function TeensLandingPage({
  onNavigatePage,
  onEnterWorkspace,
  onEnterProjects,
  onEnterSlides,
  onOpenBilling,
  onOpenCohortPanel,
  onOpenInstructorCockpit,
  onOpenAdminConsole,
}: TeensLandingPageProps) {
  const { session } = useAuth();
  const metrics = getPublicCourseMetrics();
  const hasPaidAccess = Boolean(session?.hasPaidAccess);

  const [inqName, setInqName] = useState("");
  const [inqContact, setInqContact] = useState("");
  const [inqGrade, setInqGrade] = useState("");
  const [inqType, setInqType] = useState<"school" | "cohort">("school");
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
        organization: inqGrade || "青少年 / 家长咨询",
        inquiryType: inqType,
        message: `[青少年/竞赛方向] ${inqMessage}`,
      });
      setInqStatus({
        ok: true,
        text: "预约咨询已提交，课程顾问将在 1 个工作日内联系家长或指导老师。",
      });
      setInqName("");
      setInqContact("");
      setInqGrade("");
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
        currentPage="teens"
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
            <div className="text-xs font-mono text-gemini-cyan tracking-wide">
              Coding Everything 项目学院 · 造物台青少年项目营（面向初一至高三同学与家长）
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] [text-wrap:balance]">
              从带 AI 做工具，到学会
              <span className="text-gemini-cyan">驾驭 Agent 系统与知识复利</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              做软件、搭智能体和冲刺数模科研，不再需要“数学满分 + 先敲几千行代码”。「造物台」培养初中与高中生成为
              <strong className="text-white">“少年项目总导演 + 智能体安全裁判”</strong>
              ——按统一 Starter Kit 写清边界（SPEC.md / .cursorrules）、攒下双链路 WIKI 知识库，再亲自运行验真并沉淀可交接作品。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onEnterWorkspace("m1")}
              className="px-5 py-3 rounded-xl bg-gemini-cyan text-slate-950 font-semibold text-sm hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>带孩子免费体验 M1 课程</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => (onEnterProjects ? onEnterProjects() : onEnterWorkspace("m1"))}
              className="px-4 py-3 rounded-xl border border-emerald-400/40 bg-emerald-400/10 hover:bg-emerald-400/20 text-sm font-medium text-emerald-200 cursor-pointer whitespace-nowrap shrink-0"
            >
              看 Starter Kit 项目模板
            </button>
            <a
              href="#teens-cases"
              className="px-5 py-3 rounded-xl border border-white/20 bg-white/[0.04] hover:bg-white/[0.08] text-sm font-medium text-white whitespace-nowrap shrink-0"
            >
              看 5 个中学生实战案例
            </a>
            <a
              href="#teens-inquiry"
              className="px-4 py-3 rounded-xl text-xs font-medium text-slate-300 hover:text-gemini-cyan whitespace-nowrap shrink-0"
            >
              预约小班 / 校园社团咨询 →
            </a>
          </div>

          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-white/10 max-w-4xl">
            <div>
              <dt className="text-[11px] font-mono text-slate-400">三阶递进实战体系</dt>
              <dd className="text-lg font-bold font-mono text-white tabular-nums mt-0.5">
                {metrics.moduleCount} 模块 · {metrics.unitCount} 单元
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-mono text-slate-400">内置沙盘与随堂测验</dt>
              <dd className="text-lg font-bold font-mono text-gemini-cyan tabular-nums mt-0.5">
                {metrics.labCount} 沙盘 · {metrics.quizQuestionCount} 测验
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-mono text-slate-400">双链路 WIKI 与双终点</dt>
              <dd className="text-lg font-bold font-mono text-white tabular-nums mt-0.5">
                M13-Gov / M13-Eng
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-mono text-slate-400">拓展书目与学术底线</dt>
              <dd className="text-lg font-bold font-mono text-emerald-300 tabular-nums mt-0.5">
                78 册书库 · 拒绝代写
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Section 1: Why Teens Need Director + Safety Referee Mindset */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-10">
        <div className="space-y-3 max-w-3xl">
          <div className="text-xs font-mono text-gemini-cyan">为什么初高中学 AI 不能只“背代码”或“瞎聊天”</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight [text-wrap:balance]">
            传统编程只能在黑框打乘法表，直接聊天却往往“开头很酷、越改越崩”
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            很多同学用 AI 写错题本或班委问答助手，5 分钟就有漂亮界面；一想加功能却把昨天写好的部分顺手改坏，长对话聊着聊着忘了规矩，还可能吐出过期资料或编造假数据。「造物台」用三项硬核基本功带同学走出误区：
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CORE_TEEN_CAPABILITIES.map((cap) => (
            <article
              key={cap.index}
              className="p-6 rounded-2xl border border-white/10 bg-[#090c14] space-y-3"
            >
              <div className="text-xs font-mono text-gemini-cyan tabular-nums">{cap.index}</div>
              <h3 className="text-base font-bold text-white">{cap.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{cap.detail}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Section 2: Learning Cockpit, 4 Flexible Rhythms & Dual Capstones */}
      <section className="border-y border-white/10 bg-[#060912]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-8">
          <div className="space-y-2 max-w-3xl">
            <div className="text-xs font-mono text-gemini-purple">青少年专属“AI 造物与智能体模拟驾驶舱”</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight [text-wrap:balance]">
              {metrics.trackCount} 阶路线 × 4 种学习节奏 × 双轨结业终点
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              沿「基础入门与全栈心智 → AI 工程规范与长程接力 → Agent 蓝图、运行时知识库与双轨结业」推进（共 {metrics.slideCount} 节交互页面与 {metrics.labCount} 个互动沙盘）。翻车案例先由同学自己排查再揭晓思路，错题可一键跳回对应沙盘重练。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DELIVERY_RHYTHMS.map((rhythm) => (
              <div
                key={rhythm.name}
                className="p-5 rounded-xl border border-white/10 bg-[#0b101d] space-y-2"
              >
                <div className="text-xs font-mono text-gemini-cyan tabular-nums">{rhythm.cadence}</div>
                <h3 className="text-sm font-bold text-white">{rhythm.name}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{rhythm.fit}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
            <div className="lg:col-span-6 p-6 rounded-2xl border border-white/12 bg-[#0b101d] space-y-2">
              <div className="text-xs font-mono text-emerald-300">结业路线 A · M13-Gov</div>
              <h3 className="text-base font-bold text-white">无代码产品与治理结业（Agent 总监督）</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                适合还没学深代码语法或偏爱人文/产品策划的同学，重点通过规格蓝图与 Lab 20 模拟轨迹评审台完成边界审查与人工签核。
              </p>
              <p className="text-[11px] font-mono text-slate-400 pt-1">
                {M13_GOV_SIMULATION_DISCLAIMER}
              </p>
            </div>
            <div className="lg:col-span-6 p-6 rounded-2xl border border-white/12 bg-[#0b101d] space-y-2">
              <div className="text-xs font-mono text-gemini-cyan">结业路线 B · M13-Eng</div>
              <h3 className="text-base font-bold text-white">全栈与工程实战结业（竞赛与科研冲刺）</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                适合立志冲刺全栈开发、科创与国际数模竞赛的高年级同学，打通长程接力、带权限隔离的运行时知识库与端到端自动化验证，并一键导出个人 WIKI Markdown 作品档案（配套 78 册经典 AI 书目索引）。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: 5 Student & Secondary-Adapted Showcase Cases + Matrix */}
      <section id="teens-cases" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-10">
        <div className="space-y-3 max-w-3xl">
          <div className="text-xs font-mono text-gemini-cyan">同龄榜样与中学生场景实战</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight [text-wrap:balance]">
            看看中学生怎样用「造物台」做出真正有用的软件与竞赛作品
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            涵盖国际数模竞赛、个人长篇创作、家族医疗业务、校园社团协作与文科哲学思辨 5 个案例；前 3 项源自真实学生交付归档，后 2 项明确标注为基于真实开源/在线原型的中学教学化改编呈现。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {STUDENT_CASES.map((item) => (
            <article
              key={item.id}
              className="p-6 rounded-2xl border border-white/12 bg-[#0b101d] space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="text-xs font-mono text-slate-400 flex flex-wrap items-center gap-2">
                  <span className="text-gemini-cyan">{item.badge}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.meta}</span>
                </div>
                <h3 className="text-lg font-bold text-white leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{item.summary}</p>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-2 text-[11px]">
                <div className="text-emerald-300 font-medium">核心收获：{item.takeaway}</div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-slate-400 font-mono">
                  <span>{item.sourceNote}</span>
                  <a
                    href={item.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gemini-cyan hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                  >
                    <span>{item.linkLabel}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Case 5 Full-Width Spotlight */}
        <article className="p-6 rounded-2xl border border-white/15 bg-[#0e0c1a] space-y-3">
          <div className="text-xs font-mono text-slate-400 flex flex-wrap items-center gap-2">
            <span className="text-purple-300">案例 05 · 文科与哲学破圈改编</span>
            <span aria-hidden="true">·</span>
            <span>哲学思辨与分析系统 · 基于在线原型 哲学研究平台 教学化改编</span>
          </div>
          <h3 className="text-lg font-bold text-white">
            文科生与哲学爱好者的破圈之作：把“概念论证逻辑”翻译成专属《哲学思辨与分析系统》
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            很多喜欢哲学、历史、语文思辨或辩论赛的同学以为“编程只是理科生的事”。参考在线原型《哲学研究平台》开展中学文科教学化适配后，同学不必死啃代码教材，而是直接把读康德、庄子、王阳明时最需要的“概念界定 → 核心论点 → 反驳路径 → 原始出处对照”写成清晰规格清单，在 AI Studio 中搭出自己的专属思辨地图——证明逻辑拆解力本身就是驾驭 AI 造软件的王牌优势。
          </p>
          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
            <span className="text-purple-200">
              来源说明：基于真实在线原型《哲学研究平台》面向中学文史哲场景教学化呈现
            </span>
            <a
              href="https://ai.studio/apps/a6c24574-db81-4286-b826-23275c939f2e"
              target="_blank"
              rel="noreferrer"
              className="text-gemini-cyan hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              <span>参考在线原型：哲学研究平台</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </article>

        {/* 5-Case Summary Matrix */}
        <div className="rounded-2xl border border-white/10 bg-[#090c14] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-white">五大青春实战案例对比一览</h3>
            <span className="text-[11px] font-mono text-slate-400">
              真实交付归档（1–3）与教学化原型改编（4–5）明确区分
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 font-mono">
                  <th className="py-3 px-4 font-medium">学生案例</th>
                  <th className="py-3 px-4 font-medium">起点与来源属性</th>
                  <th className="py-3 px-4 font-medium">做出了什么作品</th>
                  <th className="py-3 px-4 font-medium">核心成长收获</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-slate-300">
                {CASE_COMPARISON_ROWS.map((row) => (
                  <tr key={row.name} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">{row.name}</td>
                    <td className="py-3 px-4">{row.origin}</td>
                    <td className="py-3 px-4 text-slate-200">{row.deliverable}</td>
                    <td className="py-3 px-4 text-emerald-300">{row.growth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 4: Junior High vs Senior High Progression + 4 Honest Parent/School Principles */}
      <section id="teens-stages" className="border-y border-white/10 bg-[#060912]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-12">
          {/* Junior vs Senior Progression */}
          <div className="space-y-6">
            <div className="space-y-2 max-w-3xl">
              <div className="text-xs font-mono text-gemini-cyan">分学段进阶建议</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                初中生 vs 高中生：推荐怎么两步衔接进阶？
              </h2>
              <p className="text-sm text-slate-300">
                按照“初中打底养成习惯 → 高中跨学科冲刺作品与赛事”两步衔接，不盲目跳级，每一阶段都留下可核验的过程产出。
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {GRADE_STAGES.map((item) => (
                <article
                  key={item.stage}
                  className="p-6 rounded-2xl border border-white/12 bg-[#0b101d] space-y-4"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-mono text-gemini-cyan">{item.stage}</div>
                    <h3 className="text-lg font-bold text-white">{item.goal}</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.howToLearn}</p>
                  <div className="pt-3 border-t border-white/10 space-y-2">
                    <div className="text-[11px] font-mono text-emerald-300">能攒下的核心成果</div>
                    <ul className="space-y-1.5 text-xs text-slate-200">
                      {item.outcomes.map((outcome) => (
                        <li key={outcome} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* 4 Transparent Principles for Parents & Teachers + Teen FAQ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6 p-6 rounded-2xl border border-emerald-400/25 bg-[#0a121a] space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-300">
                <ShieldCheck className="w-4 h-4" />
                <span>给家长和指导老师的四项透明底线</span>
              </div>
              <ul className="space-y-4 text-xs text-slate-200">
                {PARENT_TRUST_PRINCIPLES.map((item) => (
                  <li key={item.title} className="space-y-1">
                    <div className="flex items-start gap-2 font-semibold text-white">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item.title}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed pl-6">{item.detail}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <h2 className="text-xl font-bold text-white">家长与同学常见问题</h2>
              <div className="space-y-3">
                {TEEN_FAQ_ITEMS.map((item) => (
                  <div
                    key={item.q}
                    className="p-5 rounded-xl border border-white/10 bg-[#090d16] space-y-2"
                  >
                    <h3 className="text-sm font-bold text-white">{item.q}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section id="teens-inquiry" className="bg-[#020205]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-6">
          <div className="space-y-2 text-center">
            <div className="text-xs font-mono text-gemini-cyan">青少年营与学校合作咨询</div>
            <h2 className="text-2xl font-bold text-white [text-wrap:balance]">
              咨询青少年训练营排期，或学校社团 / 科创实验室合作
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              也可以直接点击“带孩子免费体验 M1 课程”，无需注册即可和孩子一起跑通第 1 个交互沙盘。
            </p>
          </div>

          <form
            onSubmit={handleInquirySubmit}
            className="p-6 rounded-2xl border border-white/12 bg-[#0b0f19] space-y-4 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-slate-300 font-medium">家长 / 老师称呼 *</label>
                <input
                  type="text"
                  required
                  value={inqName}
                  onChange={(e) => setInqName(e.target.value)}
                  placeholder="例如：王家长 / 陈老师"
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
                  placeholder="parent@example.com"
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white focus:outline-none focus:border-gemini-cyan"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-300 font-medium">咨询类型</label>
                <select
                  value={inqType}
                  onChange={(e) => setInqType(e.target.value as "school" | "cohort")}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white focus:outline-none focus:border-gemini-cyan"
                >
                  <option value="school">学校科创社团 / 短讲精要试点</option>
                  <option value="cohort">青少年寒暑假 / 周末工作坊小班</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-300 font-medium">学生年级或学校名称（选填）</label>
              <input
                type="text"
                value={inqGrade}
                onChange={(e) => setInqGrade(e.target.value)}
                placeholder="例如：初二 / 高一 / 某中学信息或辩论社团"
                className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white focus:outline-none focus:border-gemini-cyan"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-300 font-medium">学习期望与基础情况 *</label>
              <textarea
                rows={3}
                required
                value={inqMessage}
                onChange={(e) => setInqMessage(e.target.value)}
                placeholder="请简述学生学段（初中/高中）、当前基础与关注方向（如个人作品、数模训练、人文思辨工具或社团课程）..."
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
                className="px-5 py-2.5 rounded-xl bg-gemini-cyan text-slate-950 font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{inqSubmitting ? "提交中..." : "提交咨询"}</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="border-t border-white/10 py-8 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-slate-300 font-medium">
              Coding Everything 项目学院 · 造物台青少年 AI 造物营
            </div>
            <div>{M13_GOV_SIMULATION_DISCLAIMER}</div>
          </div>
          <div className="flex flex-wrap items-center gap-5 font-mono">
            <button
              type="button"
              onClick={() => onNavigatePage("home")}
              className="hover:text-gemini-cyan cursor-pointer whitespace-nowrap shrink-0"
            >
              创作者主页
            </button>
            <button
              type="button"
              onClick={() => onNavigatePage("teams")}
              className="hover:text-gemini-cyan cursor-pointer whitespace-nowrap shrink-0"
            >
              团队内训页
            </button>
            <button
              type="button"
              onClick={() => onEnterWorkspace("m1")}
              className="hover:text-gemini-cyan cursor-pointer whitespace-nowrap shrink-0"
            >
              进入学习工作台
            </button>
            <button
              type="button"
              onClick={() => onEnterSlides("m1")}
              className="hover:text-gemini-cyan cursor-pointer whitespace-nowrap shrink-0"
            >
              课件演示模式
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
