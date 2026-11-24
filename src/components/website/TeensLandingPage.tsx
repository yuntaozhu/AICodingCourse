import { useState } from "react";
import { ArrowRight, CheckCircle2, ShieldCheck, Send } from "lucide-react";
import { useAuth } from "@/context/authContextCore";
import { M13_GOV_SIMULATION_DISCLAIMER } from "@/data/courseWorkspaceStore";
import { getPublicCourseMetrics } from "@/data/courseMetrics";
import { submitInquiry } from "@/lib/apiClient";
import WebsiteNavbar, { type WebsitePageRoute } from "./WebsiteNavbar";

interface TeensLandingPageProps {
  onNavigatePage: (page: WebsitePageRoute) => void;
  onEnterWorkspace: (moduleId?: string) => void;
  onEnterSlides: (moduleId?: string) => void;
  onOpenBilling: () => void;
  onOpenCohortPanel: () => void;
  onOpenInstructorCockpit: () => void;
  onOpenAdminConsole: () => void;
}

const TEEN_STAGE_PATH = [
  {
    step: "01",
    module: "M1 · 结构化提问与需求拆解",
    title: "先把题目和想法拆清楚，再让 AI 写代码",
    detail:
      "练习把模糊想法写成包含目标、约束条件与验收标准的 Spec 蓝图，改掉“直接向 AI 要答案”的习惯。",
  },
  {
    step: "02",
    module: "M9 · 网页与数据三层常识",
    title: "看懂报错发生在前端、接口还是数据层",
    detail:
      "学会识别 CORS、环境变量缺失、脚本退出码等高频报错，不再盲目把错误截图反复粘贴给模型。",
  },
  {
    step: "03",
    module: "M3 · 独立可运行作品实战",
    title: "做出能打开、能交互、能验证的小型工程作品",
    detail:
      "围绕个人兴趣、课堂实验或校园效率工具交付完整垂直切片，并保留人工检查与复跑证据。",
  },
  {
    step: "04",
    module: "M5 & M11 · 测试核验与汇报表达",
    title: "学会区分“AI 辅助部分”与“本人验证部分”",
    detail:
      "建立自测清单与学术诚信边界记录，能清晰汇报模型输出了什么、人工修正与实测了什么。",
  },
];

const TEEN_FAQ_ITEMS = [
  {
    q: "这门课会教孩子用 AI 代写作业或代替思考吗？",
    a: "恰恰相反。课程第一关就要求先写结构化需求边界（Plan Mode），第五关专门训练识别 AI 编造和作弊测试。所有练习都要求学生独立解释设计取舍与运行验收命令。",
  },
  {
    q: "适合什么年龄段和基础的学生？",
    a: "主要面向初二至高中生及高年级科创/竞赛学习者。无需事先精通复杂后端框架，但建议具备基础的电脑文件目录操作习惯，并能投入每周 2～3 小时实操。",
  },
  {
    q: "HiMCM 等数模或科创案例能保证获奖吗？",
    a: "不作任何竞赛获奖或升学结果承诺。页面展示的 HiMCM #19243 案例仅用于说明如何把数学建模脚本、敏感性测试和图表核验组织成可复跑工程流，核心建模与论文论证始终由参赛学生自主完成。",
  },
  {
    q: "家长如何了解学习进展与隐私保护？",
    a: "学员个人测验与 M1 免费体验均可在工作台查看完成记录；若报名小班带教，阶段里程碑均支持教师人工点评并生成结构化 Markdown 导出，课程禁止学员上传真实隐私或敏感密钥。",
  },
];

export default function TeensLandingPage({
  onNavigatePage,
  onEnterWorkspace,
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
              TEENS &amp; STEM TRACK · 面向家长与青少年科创学习者
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] [text-wrap:balance]">
              引导青少年用 AI 做真实工程实验，
              <span className="text-gemini-cyan">学会提问、拆解与动手验证</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              不教孩子用大模型直接抄答案，而是借由真实工具链练习“把问题写清 → 指挥 AI 分步实现 → 亲自运行核验结果”，为数模竞赛、科创课题与未来工程素养打下严谨底座。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onEnterWorkspace("m1")}
              className="px-5 py-3 rounded-xl bg-gemini-cyan text-slate-950 font-semibold text-sm hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer"
            >
              <span>带孩子体验 M1 免费课程</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#teens-inquiry"
              className="px-5 py-3 rounded-xl border border-white/20 bg-white/[0.04] hover:bg-white/[0.08] text-sm font-medium text-white"
            >
              预约青少年小班 / 校园咨询
            </a>
            <button
              type="button"
              onClick={() => onNavigatePage("home")}
              className="px-4 py-3 rounded-xl text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
            >
              返回创作者与开发者主页 →
            </button>
          </div>

          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-white/10 max-w-3xl">
            <div>
              <dt className="text-[11px] font-mono text-slate-400">推荐入门主线</dt>
              <dd className="text-lg font-bold font-mono text-white tabular-nums mt-0.5">
                M1 · M9 · M3 · M5
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-mono text-slate-400">内置交互沙盘</dt>
              <dd className="text-lg font-bold font-mono text-gemini-cyan tabular-nums mt-0.5">
                {metrics.labCount} 个可动手实验
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-mono text-slate-400">核心素养训练</dt>
              <dd className="text-lg font-bold font-mono text-white mt-0.5">拆解与核验</dd>
            </div>
            <div>
              <dt className="text-[11px] font-mono text-slate-400">学术安全边界</dt>
              <dd className="text-lg font-bold font-mono text-emerald-300 mt-0.5">
                拒绝代写与作弊
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Why Teens Struggle with AI Coding */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-mono text-gemini-cyan">WHY STRUCTURED TRAINING</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            很多同学早早用上了 AI，却容易掉进三个误区
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="p-6 rounded-2xl border border-white/10 bg-[#090c14] space-y-3">
            <div className="text-xs font-mono text-rose-300">01 · 只问答案不拆问题</div>
            <h3 className="text-base font-bold text-white">复制一整段代码却讲不清原理</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              遇到老师或评委追问“参数为什么这么设、边界条件怎么处理”时无从回答，反而削弱了独立思考能力。
            </p>
          </article>
          <article className="p-6 rounded-2xl border border-white/10 bg-[#090c14] space-y-3">
            <div className="text-xs font-mono text-rose-300">02 · 轻信模型编造的数据</div>
            <h3 className="text-base font-bold text-white">把 AI 幻觉结论写进实验或论文</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              缺乏交叉验证意识，容易直接采纳模型编造的参考文献、不存在的函数或假装通过的测试脚本。
            </p>
          </article>
          <article className="p-6 rounded-2xl border border-white/10 bg-[#090c14] space-y-3">
            <div className="text-xs font-mono text-rose-300">03 · 报错就越改越乱</div>
            <h3 className="text-base font-bold text-white">无法定位问题出在思路还是环境</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              一旦程序跑不通就不断换问法重试，最终把原本能运行的小项目改到无法挽回。
            </p>
          </article>
        </div>
      </section>

      {/* 4-Stage Learning Route */}
      <section className="border-y border-white/10 bg-[#060912]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-8">
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-mono text-gemini-purple">LEARNING PROGRESSION</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              青少年 / STEM 四阶训练路径
            </h2>
            <p className="text-sm text-slate-300">
              从结构化表达起步，逐步过渡到可运行作品与严谨的自检报告，不追求跳过基础的“一键奇迹”。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {TEEN_STAGE_PATH.map((item) => (
              <div
                key={item.step}
                className="p-5 rounded-xl border border-white/10 bg-[#0b101d] space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gemini-cyan">{item.module}</span>
                  <span className="text-slate-500">STEP {item.step}</span>
                </div>
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 Real Student Success Stories from PRODUCT_INTRO_STUDENT.md */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-12">
        <div className="space-y-3 max-w-3xl">
          <div className="text-xs font-mono text-gemini-cyan">STUDENT INSPIRING SHOWCASE</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            看看同龄同学在「造物台」里自己做出了什么真作品！
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            这里没有枯燥脱离生活的练习题。以下 5 个真实学生项目——涵盖国际顶尖数学建模赛、小说创作系统、家族 GEO 优化、校园会议助手与哲学分析工具，证明了只要掌握拆解与核验方法，中学生也能做出令人惊叹的系统。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Story 1 */}
          <article className="p-6 rounded-2xl border border-white/12 bg-[#0b101d] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gemini-cyan">CASE 01 · 国际数模冲刺</span>
                <span className="text-slate-400">HiMCM Team #19243</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                打破“全才”垄断：用 WIKI 知识库冲刺国际顶尖数学建模赛
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                学生团队在备赛中把每次学到的建模模块存入团队 <strong className="text-white">WIKI 知识库</strong>。比赛时直接调用以往攒下的工程流，通过严格的 <code className="text-gemini-cyan">.cursorrules</code> 规定“代码由 AI 加速，物理公式与计算核心必须由人类把关”，最终将 42 页初稿打磨成严丝合缝的 25 页全英文正式参赛论文 <code className="text-slate-200">19243.pdf</code>。
              </p>
            </div>
            <div className="pt-3 border-t border-white/10 text-[11px] font-mono text-emerald-300 flex items-center justify-between">
              <span>核心收获：平时攒 WIKI 知识库，人主导立意与验真</span>
              <a
                href="https://github.com/Tommydjc/himcm.git"
                target="_blank"
                rel="noreferrer"
                className="text-gemini-cyan hover:underline"
              >
                GitHub 源码库 →
              </a>
            </div>
          </article>

          {/* Story 2 */}
          <article className="p-6 rounded-2xl border border-white/12 bg-[#0b101d] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gemini-purple">CASE 02 · 零基础长篇创作</span>
                <span className="text-slate-400">AI Novel Studio</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                爱写故事的非程序员同学：4 天给自己造出百万字级小说创作系统
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                一位零基础学生痛恨通用 AI 写作时“前文记不住、草稿被改乱”，通过课程所学的分块锁死、修改前只读体检与作者拍板机制，在本地造出左边管人物大纲、中间写正文、右边带 AI 助手的桌面级软件，并随仓保留了完整的 45 份开发实录。
              </p>
            </div>
            <div className="pt-3 border-t border-white/10 text-[11px] font-mono text-purple-300 flex items-center justify-between">
              <span>核心收获：把大想法拆成乐高模块，作者永远是主编</span>
              <span className="text-slate-400">本地优先，隐私零泄露</span>
            </div>
          </article>

          {/* Story 3 */}
          <article className="p-6 rounded-2xl border border-white/12 bg-[#0b101d] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-amber-300">CASE 03 · 解决真实商业难题</span>
                <span className="text-slate-400">医疗公司 GEO 系统</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                帮家里生意解决真难题：独立开发生成式引擎优化（GEO）系统
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                面对大模型时代如何让家里的医疗科普和合规介绍被 AI 准确检索引用的新痛点，这位同学结合课程中“业务需求拆解 + 保留人工审核闸门”的训练，在 AI Studio 中亲手把 GEO 系统做成可运行原型。
              </p>
            </div>
            <div className="pt-3 border-t border-white/10 text-[11px] font-mono text-amber-300 flex items-center justify-between">
              <span>核心收获：懂真实场景的学生，能做出比套模板更有价值的产品</span>
              <span className="text-slate-400">合规红线人工把关</span>
            </div>
          </article>

          {/* Story 4 */}
          <article className="p-6 rounded-2xl border border-white/12 bg-[#0b101d] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-300">CASE 04 · 校园治理与协作</span>
                <span className="text-slate-400">校园 AI 会议助手</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                帮学校构建「校园 AI 会议系统」：让班级与社团讨论不再乱成一锅粥
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                针对学生会和社团开会效率低、任务无人认领的痛点，这位同学参考企业团队架构，为学校搭建了自动整理“议题结论 + 负责同学 + 截止时间”的 AI 会议助手，并严格遵守工程交接规范，方便学弟学妹一届届传承维护。
              </p>
            </div>
            <div className="pt-3 border-t border-white/10 text-[11px] font-mono text-emerald-300 flex items-center justify-between">
              <span>核心收获：用工程规范做出既省心又能一届届传承的校园系统</span>
              <span className="text-slate-400">规范交接文档</span>
            </div>
          </article>
        </div>

        {/* Story 5 (Full Width) */}
        <article className="p-6 rounded-2xl border border-gemini-purple/40 bg-[#100e1c] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-purple-300">CASE 05 · 文科与哲学破圈之作</span>
            <span className="text-slate-400">哲学思辨与分析系统</span>
          </div>
          <h3 className="text-lg font-bold text-white">
            文科生与哲学爱好者的破圈之作：打造自己的「哲学思辨与分析系统」
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            谁说学文科、爱哲学的同学就和 AI 造软件无缘？这位同学在整理康德、庄子等经典概念交叉引用时，把哲学研究中“概念界定 ➔ 核心论点 ➔ 反驳路径 ➔ 原始出处”的严密逻辑翻译成 AI 听得懂的规格清单，在 AI Studio 中亲手搭出了属于自己的专属哲学研究与辩论辅助分析平台。
          </p>
          <div className="pt-2 text-[11px] font-mono text-purple-200">
            核心收获：AI 时代最怕用理科思维一刀切——把专业思考逻辑拆清楚，文科生也能做出最懂你的思辨工具！
          </div>
        </article>
      </section>

      {/* Case & Boundary Disclosure */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 p-6 rounded-2xl border border-white/12 bg-[#090d16] space-y-4">
            <div className="text-xs font-mono text-gemini-cyan">
              CASE EVIDENCE · HiMCM #19243 数模工作流拆解
            </div>
            <h2 className="text-xl font-bold text-white">
              真实科研与竞赛协作演示：AI 负责脚本加速，人类负责建模与核验
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              在 HiMCM #19243 案例教学中，我们向学生展示如何把数学模型公式先写成结构化边界说明，再让 AI 生成可复跑的数据清洗与参数敏感性图表脚本。
            </p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/10 text-xs">
              <div>
                <dt className="font-mono text-slate-400">AI 辅助范围</dt>
                <dd className="text-slate-200 mt-1">
                  Python 绘图脚本模板、参数批量敏感性扫描、代码格式与报错排查辅助。
                </dd>
              </div>
              <div>
                <dt className="font-mono text-emerald-300">人类必须亲自核验</dt>
                <dd className="text-slate-200 mt-1">
                  模型假设合理性、真实原始数据口径、论文论证逻辑与最终图表数值校验。
                </dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-5 p-6 rounded-2xl border border-emerald-400/25 bg-[#0a121a] space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-300">
              <ShieldCheck className="w-4 h-4" />
              <span>家长与学校最关心的四项原则</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-200">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>过程可留痕：所有思考记录、DoD 自检与心得均可导出文档由家长或指导老师查阅。</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>数据零泄露：练习沙盘在受控环境运行，不要求未成年人输入真实家庭或敏感信息。</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>不承诺保奖：如实说明工具辅助边界，杜绝虚假升学/竞赛结果宣传。</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Teen FAQ */}
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-bold text-white">家长与同学常见问题</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </section>

      {/* Inquiry Form */}
      <section id="teens-inquiry" className="border-t border-white/10 bg-[#060912]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-6">
          <div className="space-y-2 text-center">
            <div className="text-xs font-mono text-gemini-cyan">TEENS &amp; SCHOOL INQUIRY</div>
            <h2 className="text-2xl font-bold text-white">
              咨询青少年训练营安排，或学校社团 / 科创实验室合作
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              也可先点击右上角“免费体验 M1”，由家长和同学一起完成 10 分钟交互式入门体验。
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
                  <option value="school">学校科创社团 / 实验室试点</option>
                  <option value="cohort">青少年寒暑假/周末小班</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-300 font-medium">学生年级或学校名称（选填）</label>
              <input
                type="text"
                value={inqGrade}
                onChange={(e) => setInqGrade(e.target.value)}
                placeholder="例如：高一 / 某中学信息学社团"
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
                placeholder="请简述学生当前编程基础、关注课题（如科创制作、数模训练或个人作品）..."
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
            <div className="text-slate-300 font-medium">AI Coding 学院 · 青少年与 STEM 专题页</div>
            <div>{M13_GOV_SIMULATION_DISCLAIMER}</div>
          </div>
          <div className="flex flex-wrap items-center gap-5 font-mono">
            <button
              type="button"
              onClick={() => onNavigatePage("home")}
              className="hover:text-gemini-cyan cursor-pointer"
            >
              创作者主页
            </button>
            <button
              type="button"
              onClick={() => onNavigatePage("teams")}
              className="hover:text-gemini-cyan cursor-pointer"
            >
              团队内训页
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
