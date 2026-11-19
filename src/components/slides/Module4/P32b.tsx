import Slide from "@/components/Slide";
import McpRegistryBrowser from "@/components/sandboxes/McpRegistryBrowser";

export default function P32b() {
  return (
    <Slide
      backgroundColor="#040711"
      notes="MCP Registry Browser：按关键词或类别检索 GitHub、PostgreSQL、Slack、Playwright、Context7 与 Sentry 等 MCP Server，开关挂载后实时查看工具 Schema、Token 预算与 Cursor 上下文锚定链路变化。"
    >
      <div className="flex flex-col justify-center h-full">
        <McpRegistryBrowser />
      </div>
    </Slide>
  );
}
