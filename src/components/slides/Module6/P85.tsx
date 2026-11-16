import Slide from "@/components/Slide";

export default function P85() {
  return (
    <Slide backgroundColor="#020205" notes="代码评审（Code Review）不再是人类的负担。AI 驱动的 CR 可以做到 24/7 实时响应，不仅能处理业务 PR，还能自动审核由 AI 代理生成的依赖升级 PR。它不仅能发现低级的语法错误，还能指出深层的架构违规、性能瓶颈和安全隐患。人类评审员的角色转变为‘终审法官’。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-gemini-cyan">AI 驱动的代码评审 (CR)</h2>
        <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
          <div className="flex gap-8 items-center mb-8">
            <div className="px-4 py-2 bg-gemini-purple/20 text-gemini-purple rounded-lg font-mono text-sm">PR #1234</div>
            <div className="text-sm opacity-50">Author: AI-Agent-Alpha</div>
            <div className="text-sm opacity-50">Reviewer: Gemini-3.1-Expert</div>
          </div>
          <div className="space-y-6">
            <div className="p-4 bg-red-500/10 rounded-lg border-l-4 border-red-500">
              <div className="font-bold text-red-400 mb-1">Security & Best Practices</div>
              <p className="text-sm opacity-70">检测到 SQL 注入风险：在第 45 行未对输入进行参数化处理。违反安全编码规范。</p>
            </div>
            <div className="p-4 bg-yellow-500/10 rounded-lg border-l-4 border-yellow-500">
              <div className="font-bold text-yellow-400 mb-1">Performance & Scalability</div>
              <p className="text-sm opacity-70">循环中存在不必要的 API 调用，建议使用批量查询优化。高并发场景下可能导致瓶颈。</p>
            </div>
            <div className="p-4 bg-gemini-cyan/10 rounded-lg border-l-4 border-gemini-cyan">
              <div className="font-bold text-gemini-cyan mb-1">Architectural Adherence</div>
              <p className="text-sm opacity-70">代码符合《2026 领域驱动设计规范》，模块解耦良好。</p>
            </div>
          </div>
          <div className="mt-8 text-right">
            <button className="px-6 py-2 bg-gemini-purple rounded-full font-bold">Approve & Merge</button>
          </div>
        </div>
      </div>
    </Slide>
  );
}
