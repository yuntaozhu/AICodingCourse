import Slide from "@/components/Slide";
import DeveloperVelocityHeatmap from "@/components/sandboxes/DeveloperVelocityHeatmap";

export default function P92d() {
  return (
    <Slide
      backgroundColor="#040711"
      notes="Module 7 Developer Velocity Heatmap：使用 D3.js 可视化手工基准、行内补全、Cursor+Rules、Cursor+MCP 以及 Cursor+MCP+Bugbot 全闭环在需求拆解、代码编写、测试调试、Code Review、安全审计与部署恢复六大环节的加速热力矩阵。"
    >
      <div className="flex flex-col justify-center h-full">
        <DeveloperVelocityHeatmap />
      </div>
    </Slide>
  );
}
