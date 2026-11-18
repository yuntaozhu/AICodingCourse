import Slide from "@/components/Slide";
import AgentBehavioralSimulation from "@/components/sandboxes/AgentBehavioralSimulation";

export default function V5c() {
  return (
    <Slide
      backgroundColor="#040711"
      notes="Agent Behavioral Simulation：通过交互式六维雷达图对比防御性编程、激进重构、无约束 Vibe 与 7 Habits 编排策略在开发速度、低认知复杂度、零残留代码、SAST 安全、反作弊测试与人类可审校度上的权衡差异。"
    >
      <div className="flex flex-col justify-center h-full">
        <AgentBehavioralSimulation />
      </div>
    </Slide>
  );
}
