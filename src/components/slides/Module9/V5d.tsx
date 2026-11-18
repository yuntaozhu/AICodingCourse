import Slide from "@/components/Slide";
import ArchitectureDecisionSimulator from "@/components/sandboxes/ArchitectureDecisionSimulator";

export default function V5d() {
  return (
    <Slide
      backgroundColor="#040711"
      notes="Architecture Decision Simulator 互动小游戏：学员在 4 个迭代场景中自由选择 MVP 优先、架构解耦或 AI 自动化优先策略，卡片底部实时反馈项目交付时间、技术债累积量与研发质量指标。"
    >
      <div className="flex flex-col justify-center h-full">
        <ArchitectureDecisionSimulator />
      </div>
    </Slide>
  );
}
