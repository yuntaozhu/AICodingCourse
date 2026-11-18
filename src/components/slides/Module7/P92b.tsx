import Slide from "@/components/Slide";
import AiRoiCalculatorSandbox from "@/components/sandboxes/AiRoiCalculatorSandbox";

export default function P92b() {
  return (
    <Slide
      backgroundColor="#040711"
      notes="AI 研发 ROI 计算沙盘：引导学员输入团队当前的 Bug 修复时长、功能产出速度与返工率，动态对比引入 Cursor + Bugbot 后的提升幅度、净 ROI 与 6 个月累计回报曲线。"
    >
      <div className="flex flex-col justify-center h-full">
        <AiRoiCalculatorSandbox />
      </div>
    </Slide>
  );
}
