import Slide from "@/components/Slide";

export default function P86() {
  return (
    <Slide backgroundColor="#020205" notes="流水线不再是脆弱的。自愈流水线（Self-healing Pipelines）可以自动处理构建失败、测试失败甚至部署失败。当流水线中断时，AI 会自动分析日志，修复配置或代码，并重新触发流水线。这大大降低了运维成本。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-white italic">自愈流水线 (Self-healing)</h2>
        <div className="grid grid-cols-3 gap-8">
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-xl font-bold mb-2">构建失败</h3>
            <p className="text-xs opacity-50">依赖版本冲突或配置错误。</p>
            <div className="mt-4 p-2 bg-gemini-purple/20 rounded text-xs text-gemini-cyan">AI 自动修复依赖并重试</div>
          </div>
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold mb-2">测试失败</h3>
            <p className="text-xs opacity-50">代码逻辑错误或环境不稳定。</p>
            <div className="mt-4 p-2 bg-gemini-purple/20 rounded text-xs text-gemini-cyan">AI 分析日志并自动修复代码</div>
          </div>
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
            <div className="text-4xl mb-4">🔥</div>
            <h3 className="text-xl font-bold mb-2">部署失败</h3>
            <p className="text-xs opacity-50">资源不足或网络异常。</p>
            <div className="mt-4 p-2 bg-gemini-purple/20 rounded text-xs text-gemini-cyan">AI 自动扩容或切换可用区</div>
          </div>
        </div>
        <div className="mt-12 p-6 bg-gemini-cyan/10 rounded-xl border border-gemini-cyan/30 text-center">
          <p className="font-mono text-gemini-cyan">“让流水线具备‘免疫系统’，实现真正的 24/7 无人值守。”</p>
        </div>
      </div>
    </Slide>
  );
}
