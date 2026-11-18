import Slide from "@/components/Slide";
import AiEfficiencyAssessmentSandbox from "@/components/sandboxes/AiEfficiencyAssessmentSandbox";

export default function P99b() {
  return (
    <Slide
      backgroundColor="#040711"
      notes="Lab 09 AI 编码效能自测：从上下文构建、DoD 定义、Bugbot 协作与架构主权 4 个维度评估工程成熟度，并映射 SonarSource 7 Habits 生成个性化改进处方与 .mdc 配置。"
    >
      <div className="flex flex-col justify-center h-full">
        <AiEfficiencyAssessmentSandbox />
      </div>
    </Slide>
  );
}
