import Slide from "@/components/Slide";
import AgentWorkflowSandbox from "@/components/sandboxes/AgentWorkflowSandbox";

export default function AgentLoopSlide() {
  return (
    <Slide
      backgroundColor="#040711"
      notes="Lab 19 · 运行时 Agent 工具循环与熔断沙盘。对照确定性 Workflow、受控 Agent（maxSteps + HITL 挂起）与无边界死循环的执行轨迹与 Token 账单。"
    >
      <div className="flex flex-col justify-center h-full">
        <AgentWorkflowSandbox />
      </div>
    </Slide>
  );
}
