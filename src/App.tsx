import { useEffect, useState } from "react";
import CourseSystemApp, { type CourseSubView } from "@/components/course/CourseSystemApp";
import BillingModal from "@/components/lms/BillingModal";
import Presentation, { type LabJumpItem, type ModuleNavItem } from "@/components/Presentation";
import OfficialHomePage from "@/components/website/OfficialHomePage";
import { Module1Slides } from "@/components/slides/Module1";
import { Module2Slides } from "@/components/slides/Module2";
import { Module3Slides } from "@/components/slides/Module3";
import { Module4Slides } from "@/components/slides/Module4";
import { Module5Slides } from "@/components/slides/Module5";
import { Module6Slides } from "@/components/slides/Module6";
import { Module7Slides } from "@/components/slides/Module7";
import { Module8Slides } from "@/components/slides/Module8";
import { Module9Slides } from "@/components/slides/Module9";
import {
  AestheticsLabSlide,
  VibeCodingAestheticsSlides,
} from "@/components/slides/Module10";
import { Module11Slides } from "@/components/slides/Module11";
import { Module12Slides } from "@/components/slides/Module12";
import { Module13GovSlides } from "@/components/slides/Module13Gov";
import { Module13EngSlides } from "@/components/slides/Module13Eng";
import P7 from "@/components/slides/Module1/P7";
import P12e from "@/components/slides/Module2/P12e";
import P31c from "@/components/slides/Module4/P31c";
import P31d from "@/components/slides/Module4/P31d";
import P32 from "@/components/slides/Module4/P32";
import P32b from "@/components/slides/Module4/P32b";
import P85d from "@/components/slides/Module6/P85d";
import P85e from "@/components/slides/Module6/P85e";
import P85f from "@/components/slides/Module6/P85f";
import P85g from "@/components/slides/Module6/P85g";
import P92d from "@/components/slides/Module7/P92d";
import P99b from "@/components/slides/Module7/P99b";
import KnowledgeBaseSlide from "@/components/slides/Module8/KnowledgeBaseSlide";
import AgentHarnessSlide from "@/components/slides/Module8/AgentHarnessSlide";
import V5 from "@/components/slides/Module9/V5";
import V5d from "@/components/slides/Module9/V5d";
import RuntimeKbSlide from "@/components/slides/Module12/RuntimeKbSlide";
import AgentLoopSlide from "@/components/slides/Module12/AgentLoopSlide";
import GovEvalSlide from "@/components/slides/Module13Gov/GovEvalSlide";
import { AI_BOOKS_KNOWLEDGE_BASE } from "@/data/aiBooksKnowledgeBase";

type AppViewMode = "website" | "workspace" | "slides";

function detectInitialView(): AppViewMode {
  if (typeof window === "undefined") return "website";
  if (window.location.hash.startsWith("#/")) {
    return "slides";
  }
  if (window.location.pathname.startsWith("/app")) {
    return "workspace";
  }
  return "website";
}

function App() {
  const [appMode, setAppMode] = useState<AppViewMode>(detectInitialView);
  const [workspaceModuleId, setWorkspaceModuleId] = useState<string | undefined>(undefined);
  const [workspaceSubView, setWorkspaceSubView] = useState<CourseSubView | undefined>(undefined);
  const [billingOpen, setBillingOpen] = useState(false);
  const [pendingRevealTarget, setPendingRevealTarget] = useState<{
    h: number;
    v?: number;
  } | null>(null);

  useEffect(() => {
    const handleOpenBilling = () => setBillingOpen(true);
    const handlePopState = () => {
      if (window.location.hash.startsWith("#/")) {
        setAppMode("slides");
      } else if (window.location.pathname.startsWith("/app")) {
        setAppMode("workspace");
      } else {
        setAppMode("website");
      }
    };
    window.addEventListener("app:open-billing", handleOpenBilling);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("app:open-billing", handleOpenBilling);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const moduleGroups = [
    { id: "m1", label: "M1 Cursor范式", title: "Module 1: Cursor AI Coding 研发范式革命", slides: Module1Slides },
    { id: "m2", label: "M2 @上下文", title: "Module 2: Cursor 上下文工程与全量理解", slides: Module2Slides },
    { id: "m3", label: "M3 全栈实战", title: "Module 3: Cursor 独立产品实战练习", slides: Module3Slides },
    { id: "m4", label: "M4 Rules·MCP", title: "Module 4: .cursor/rules、AGENTS.md 与 MCP 架构", slides: Module4Slides },
    { id: "m5", label: "M5 DoD自愈", title: "Module 5: DoD 完成定义与终端自愈闭环", slides: Module5Slides },
    { id: "m6", label: "M6 异步Bugbot", title: "Module 6: Background Agents、CLI 与 Bugbot", slides: Module6Slides },
    { id: "m7", label: "M7 ROI演进", title: "Module 7: 独立开发者 ROI 与架构大脑", slides: Module7Slides },
    { id: "m8", label: "M8 长程Harness", title: "Module 8: 长程软件任务的 Harness 与多 Coding Agent 协同", slides: Module8Slides },
    { id: "m9", label: "M9 全栈图谱", title: "Module 9: Vibe Coder's Handbook 全栈工具图谱与白盒实战", slides: Module9Slides },
    { id: "m10", label: "M10 审美与效能", title: "Module 10: AI Coding 审美积累与 VibeCoding 效能实践", slides: VibeCodingAestheticsSlides },
    { id: "m11", label: "M11 Agent蓝图", title: "Module 11: Agent 产品蓝图、Workflow 决策与治理架构", slides: Module11Slides },
    { id: "m12", label: "M12 运行时KB", title: "Module 12: 运行时 Agent 工作流与领域知识库工程实现", slides: Module12Slides },
    { id: "m13-gov", label: "M13-Gov 治理", title: "Module 13-Gov: Agent 系统产品与治理 Capstone（无代码版）", slides: Module13GovSlides },
    { id: "m13-eng", label: "M13-Eng 工程", title: "Module 13-Eng: 生产级 Agent、Harness 与运行时 KB 工程 Capstone", slides: Module13EngSlides },
  ];

  let runningIndex = 0;
  const modules: ModuleNavItem[] = moduleGroups.map((group) => {
    const item: ModuleNavItem = {
      id: group.id,
      label: group.label,
      title: group.title,
      startIndex: runningIndex,
      slideCount: group.slides.length,
    };
    runningIndex += group.slides.length;
    return item;
  });

  const extraSlides = [KnowledgeBaseSlide];
  const allSlides = [...moduleGroups.flatMap((group) => group.slides), ...extraSlides];

  const labs: LabJumpItem[] = [
    { id: "plan-prompt", label: "01 Plan→Agent 提示词沙盘", h: allSlides.indexOf(P7), v: 2 },
    { id: "cursor-rules", label: "02 .mdc 规则与 AGENTS 沙盘", h: allSlides.indexOf(P31c), v: 1 },
    { id: "mcp-toolbox", label: "03 MCP 配置与轨迹模拟", h: allSlides.indexOf(P32), v: 2 },
    { id: "bugbot-review", label: "04 Bugbot 实时评审台", h: allSlides.indexOf(P85d), v: 0 },
    { id: "book-kb", label: `05 AI书籍知识库与备课 (${AI_BOOKS_KNOWLEDGE_BASE.length}册)`, h: allSlides.indexOf(KnowledgeBaseSlide), v: 0 },
    { id: "agent-harness", label: "06 长程 Coding Harness & Worktree (M8)", h: allSlides.indexOf(AgentHarnessSlide), v: 0 },
    { id: "vibe-stack-map", label: "07 Vibe 全栈图谱与报错解码 (Handbook)", h: allSlides.indexOf(V5), v: 0 },
    { id: "ui-inspiration", label: "08 前端审美与组件参考库 (23站)", h: allSlides.indexOf(AestheticsLabSlide), v: 0 },
    { id: "efficiency-assessment", label: "09 AI 编码效能自测 (Sonar 7 Habits)", h: allSlides.indexOf(P99b), v: 0 },
    { id: "devops-ai-first", label: "10 DevOps vs AI-First 仪表盘 (D3.js)", h: allSlides.indexOf(P85e), v: 0 },
    { id: "arch-decision-sim", label: "11 架构决策模拟器 (Module 9 小游戏)", h: allSlides.indexOf(V5d), v: 0 },
    { id: "smart-code-review", label: "12 Smart Code Review 沙盘 (Bugbot)", h: allSlides.indexOf(P85f), v: 0 },
    { id: "code-health-sim", label: "13 Code Health 演化模拟器 (M6)", h: allSlides.indexOf(P85g), v: 0 },
    { id: "prompt-crafting", label: "14 Prompt Crafting 规则生成器 (M4)", h: allSlides.indexOf(P31d), v: 0 },
    { id: "velocity-heatmap", label: "15 Developer Velocity 热力图 (D3.js)", h: allSlides.indexOf(P92d), v: 0 },
    { id: "mcp-registry", label: "16 MCP Registry 浏览器 (M4)", h: allSlides.indexOf(P32b), v: 0 },
    { id: "context-slice", label: "17 上下文切片与 Token 预算沙盘 (M2)", h: allSlides.indexOf(P12e), v: 0 },
    { id: "runtime-kb-rag", label: "18 运行时 KB：ACL Pre-filter 沙盘 (M12)", h: allSlides.indexOf(RuntimeKbSlide), v: 0 },
    { id: "agent-workflow-sim", label: "19 运行时 Agent 工具循环与熔断 (M12)", h: allSlides.indexOf(AgentLoopSlide), v: 0 },
    { id: "gov-trajectory-eval", label: "20 无代码 Agent 预制轨迹评审台 (M13-Gov)", h: allSlides.indexOf(GovEvalSlide), v: 0 },
  ];

  const handleSwitchToReveal = (target: {
    moduleId?: string;
    labId?: string;
    slideOffset?: number;
  }) => {
    if (target.labId) {
      const lab = labs.find((l) => l.id === target.labId);
      if (lab && lab.h >= 0) {
        setPendingRevealTarget({ h: lab.h, v: lab.v });
        setAppMode("slides");
        return;
      }
    }
    if (target.moduleId) {
      const mod = modules.find((m) => m.id === target.moduleId);
      if (mod) {
        setPendingRevealTarget({ h: mod.startIndex + (target.slideOffset ?? 0), v: 0 });
        setAppMode("slides");
        return;
      }
    }
    setPendingRevealTarget(null);
    setAppMode("slides");
  };

  const handleOpenCourseSystem = (moduleId?: string, subView?: CourseSubView) => {
    setWorkspaceModuleId(moduleId);
    setWorkspaceSubView(subView);
    if (typeof window !== "undefined") {
      if (window.location.hash.startsWith("#/") || window.location.pathname !== "/app") {
        window.history.pushState(null, "", "/app");
      }
    }
    setAppMode("workspace");
  };

  const handleGoOfficialHome = () => {
    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      window.history.pushState(null, "", "/");
    }
    setAppMode("website");
  };

  return (
    <main
      className={
        appMode === "slides"
          ? "h-screen w-screen overflow-hidden bg-[#020205]"
          : "min-h-screen w-screen bg-[#020205]"
      }
    >
      {appMode === "website" && (
        <OfficialHomePage
          onEnterWorkspace={(moduleId) => handleOpenCourseSystem(moduleId, moduleId ? "module" : "catalog")}
          onEnterSlides={(moduleId) => handleSwitchToReveal({ moduleId })}
          onOpenBilling={() => setBillingOpen(true)}
          onOpenCohortPanel={() => handleOpenCourseSystem(undefined, "cohort")}
          onOpenInstructorCockpit={() => handleOpenCourseSystem(undefined, "instructor")}
          onOpenAdminConsole={() => handleOpenCourseSystem(undefined, "admin")}
        />
      )}

      {appMode === "workspace" && (
        <CourseSystemApp
          initialModuleId={workspaceModuleId}
          initialSubView={workspaceSubView}
          onGoOfficialHome={handleGoOfficialHome}
          onOpenBilling={() => setBillingOpen(true)}
          onSwitchToReveal={handleSwitchToReveal}
        />
      )}

      {appMode === "slides" && (
        <Presentation
          modules={modules}
          labs={labs}
          initialJumpTarget={pendingRevealTarget}
          onOpenCourseSystem={(modId) => handleOpenCourseSystem(modId)}
        >
          {allSlides.map((SlideComponent, index) => (
            <SlideComponent key={index} />
          ))}
        </Presentation>
      )}

      <BillingModal
        open={billingOpen}
        onClose={() => setBillingOpen(false)}
      />
    </main>
  );
}

export default App;
