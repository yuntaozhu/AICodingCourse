import Slide from "@/components/Slide";

export default function P72() {
  return (
    <section>
      <Slide backgroundColor="#020205" notes="反馈循环是确定性的核心。当评估发现错误时，系统不应该只是报错，而应该自动将错误信息反馈给生成模型，让它进行自我修正。这种‘错误-反馈-修正’的闭环，是 AI Native 研发提效的关键。">
        {/* Main Slide */}
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
        <h2 className="text-4xl mb-8 font-bold text-gemini-purple">反馈闭环：<span className="text-white">从错误到修正</span></h2>
        <div className="relative h-48 w-full">
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/20 hover:bg-white/10 transition-colors cursor-pointer text-lg">生成</div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gemini-purple/20 rounded-full flex items-center justify-center border border-gemini-purple/40 hover:scale-110 transition-transform cursor-pointer text-lg">评估</div>
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-24 h-24 bg-gemini-cyan/20 rounded-full flex items-center justify-center border border-gemini-cyan/40 text-black font-bold hover:bg-gemini-cyan/30 transition-colors cursor-pointer text-lg">修正</div>
          
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
            <path d="M96,96 Q192,48 288,96" fill="none" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
            <path d="M288,96 Q384,144 480,96" fill="none" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
            <path d="M480,96 Q288,192 96,96" fill="none" stroke="#00ffff" strokeWidth="3" className="animate-[dash_3s_linear_infinite]" />
          </svg>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-8">
          <div className="p-5 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-lg font-bold mb-3 text-red-400">传统模式：中断</h3>
            <p className="text-sm opacity-60">报错 → 开发排查 → 手动修改 → 重新提交</p>
          </div>
          <div className="p-5 bg-gemini-cyan/10 rounded-xl border border-gemini-cyan/20">
            <h3 className="text-lg font-bold mb-3 text-gemini-cyan">AI Native：自愈</h3>
            <p className="text-sm opacity-80">报错 → 错误上下文反馈 → AI 自动修正 → 重新验证</p>
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="text-gemini-purple text-xl">↓</div>
        </div>
        </div>
      </Slide>

      {/* Vertical Slide 1: The Self-Healing Pipeline */}
      <Slide backgroundColor="#020205">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
        <h3 className="text-3xl mb-8 font-bold text-gemini-cyan">自愈流水线：Step-by-Step</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { step: "1. 触发", desc: "测试失败或 Lint 报错", color: "bg-red-500/20", border: "border-red-500/40" },
            { step: "2. 诊断", desc: "提取堆栈信息与错误日志", color: "bg-gemini-purple/20", border: "border-gemini-purple/40" },
            { step: "3. 反馈", desc: "构建 Prompt 发送给 AI", color: "bg-gemini-purple/20", border: "border-gemini-purple/40" },
            { step: "4. 验证", desc: "自动应用修复并重跑测试", color: "bg-green-500/20", border: "border-green-500/40" }
          ].map((item, i) => (
            <div key={i} className={`p-4 rounded-2xl border ${item.color} ${item.border} flex flex-col items-center text-center`}>
              <div className="text-lg font-bold mb-1">{item.step}</div>
              <p className="text-xs opacity-60">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10">
          <div className="text-xs font-mono text-gemini-cyan mb-3">// AI 修正 Prompt 示例</div>
          <pre className="text-[10px] opacity-70 leading-relaxed">
{`"你的代码在运行单元测试时失败了。
错误信息：TypeError: Cannot read property 'map' of undefined
相关代码：src/components/List.tsx (Line 42)
上下文：当 'items' 为空时未进行空值检查。
请修复此问题并确保代码符合我们的安全规范。"`}
          </pre>
        </div>
        </div>
      </Slide>

      {/* Vertical Slide 2: Context-Aware Feedback */}
      <Slide backgroundColor="#020205">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
        <h3 className="text-3xl mb-8 font-bold text-gemini-purple">上下文感知反馈：为什么重要？</h3>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-lg font-bold mb-1 text-gemini-cyan">不仅仅是 Error Message</div>
              <p className="text-xs opacity-60">单纯的错误信息往往不足以让 AI 理解根因。我们需要提供完整的“故障现场”。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-lg font-bold mb-1 text-gemini-cyan">多维上下文注入</div>
              <p className="text-xs opacity-60">包括：相关文件依赖、历史提交记录、当前的 SDD 需求、运行时状态快照。</p>
            </div>
          </div>
          <div className="bg-gemini-purple/10 p-6 rounded-3xl border border-gemini-purple/30 flex flex-col justify-center">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🧠</div>
              <div className="text-xl font-bold">AI 的“顿悟”时刻</div>
            </div>
            <p className="text-xs italic opacity-80 text-center">
              “当 AI 拿到的不仅仅是报错，而是整个工程的‘全景图’时，它的修复准确率将从 30% 提升到 90% 以上。”
            </p>
          </div>
        </div>
        </div>
      </Slide>
    </section>
  );
}
