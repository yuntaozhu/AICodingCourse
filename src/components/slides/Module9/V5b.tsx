import Slide from "@/components/Slide";
import AgentOrchestrationVisualizer from "@/components/sandboxes/AgentOrchestrationVisualizer";

export default function V5b() {
  return (
    <Slide
      backgroundColor="#040711"
      notes="Agent Orchestration Visualizer：动态演示复杂全栈任务如何在 Sonar 7 Habits（上下文文档化、低复杂度拆解、零残留编码、独立单测防作弊、SAST 扫雷与人类主编签核）下完成上下文剪枝与 Agent 接力。"
    >
      <div className="flex flex-col justify-center h-full">
        <AgentOrchestrationVisualizer />
      </div>
    </Slide>
  );
}
