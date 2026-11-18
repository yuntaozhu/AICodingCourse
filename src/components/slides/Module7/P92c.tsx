import Slide from "@/components/Slide";
import WorkflowEvolutionChartSandbox from "@/components/sandboxes/WorkflowEvolutionChartSandbox";

export default function P92c() {
  return (
    <Slide
      backgroundColor="#040711"
      notes="交互式演化图表：对比传统人工研发、无约束盲目 Vibe 与基于 Sonar 7 Habits 的 AI-First 研发流程在 12 个迭代周期内需求变更响应速度（Change Lead Time）与 Bug 修复周期（MTTR）的演化分叉。"
    >
      <div className="flex flex-col justify-center h-full">
        <WorkflowEvolutionChartSandbox />
      </div>
    </Slide>
  );
}
