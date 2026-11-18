import Slide from "@/components/Slide";

export default function P31() {
  return (
    <Slide backgroundColor="#050510" notes="Module 4: Cursor 工程底座——Plan 模式 SDD、.cursor/rules (.mdc) 与 AGENTS.md 治理、MCP 外部工具链与安全边界。">
      <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
        <div className="text-gemini-cyan text-xs font-mono uppercase tracking-widest mb-3">Module 4</div>
        <h1 className="text-5xl md:text-6xl mb-4 leading-tight text-white font-bold">
          Cursor Agent 工程架构：<br />
          <span className="text-gemini-purple">Rules · MCP · 自主协同</span>
        </h1>
        <p className="text-lg font-mono text-gemini-purple/90 mb-6">
          .cursor/rules (.mdc) · AGENTS.md · .cursor/mcp.json (Figma / GitHub / DB / Browser)
        </p>
        <div className="h-1 w-24 bg-gemini-cyan mb-6" />
        <p className="text-sm text-slate-300 max-w-2xl">
          本模块包含两大可交互沙盘：在线配置并模拟 <code className="text-gemini-cyan">.mdc</code> 路径触发规则，以及一键装配 <code className="text-gemini-purple">.cursor/mcp.json</code> 工具调用链。
        </p>
      </div>
    </Slide>
  );
}
