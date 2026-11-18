import Slide from "@/components/Slide";
import SmartCodeReviewSandbox from "@/components/sandboxes/SmartCodeReviewSandbox";

export default function P85f() {
  return (
    <Slide
      backgroundColor="#040711"
      notes="Smart Code Review Sandbox：扮演 Bugbot 配置不同 Prompt 规则与严格度阈值，在真实代码片段上实时观察 AI 检出的 Bug 数量、漏检风险以及 P0/P1/P2 修复优先级预测。"
    >
      <div className="flex flex-col justify-center h-full">
        <SmartCodeReviewSandbox />
      </div>
    </Slide>
  );
}
