import Slide from "@/components/Slide";
import GovTrajectoryEvalSandbox from "@/components/sandboxes/GovTrajectoryEvalSandbox";

export default function GovEvalSlide() {
  return (
    <Slide
      backgroundColor="#040711"
      notes="Lab 20 · 无代码 Agent 预制轨迹风险评估与评审台：本验收基于预制轨迹与固定评测集进行模拟治理评审，不构成对生产运行系统的实测验证。"
    >
      <div className="flex flex-col justify-center h-full">
        <GovTrajectoryEvalSandbox />
      </div>
    </Slide>
  );
}
