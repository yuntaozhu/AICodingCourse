import Slide from "@/components/Slide";
import DevOpsVsAiFirstDashboard from "@/components/sandboxes/DevOpsVsAiFirstDashboard";

export default function P85e() {
  return (
    <Slide
      backgroundColor="#040711"
      notes="Lab 10 DevOps vs AI-First 对比仪表盘：利用 D3.js 实时可视化传统瀑布流开发与 AI-First 闭环开发在需求拆解、编码联调、测试回归、CR 安全审计与部署阶段的周期差异，支持调节团队人数与代码库复杂度。"
    >
      <div className="flex flex-col justify-center h-full">
        <DevOpsVsAiFirstDashboard />
      </div>
    </Slide>
  );
}
