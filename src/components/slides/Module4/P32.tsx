import Slide from "@/components/Slide";

export default function P32() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="Browser Use 是 Agent 的核心能力。Agent 可以像人一样操作浏览器。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center px-8">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-gemini-cyan glow-text text-center">
            Browser Use: Agent 的眼睛和手
          </h2>
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-6">
              <p className="text-xl leading-relaxed opacity-80">
                Agent 不再局限于 API 调用，而是能够像人类一样直接操作浏览器，完成复杂的 Web 任务。
              </p>
              <ul className="space-y-4 text-lg">
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-cyan group-hover:scale-125 transition-transform">▶</span>
                  <span className="font-bold">Agent 自动操作浏览器完成任务</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-cyan group-hover:scale-125 transition-transform">▶</span>
                  <span className="font-bold">Agent 自动识别网页元素并进行交互</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-cyan group-hover:scale-125 transition-transform">▶</span>
                  <span className="font-bold">Agent 自动处理网页中的复杂逻辑</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="bg-gemini-purple/5 p-6 rounded-3xl border border-gemini-purple/20 purple-glow h-full flex flex-col justify-center">
                <pre className="font-mono text-xs text-gemini-purple/80 leading-relaxed">
                  <code>{`# Browser Use
# Task: Book a flight
# Tool: AI Coding + Playwright
# Action: 
# 1. Open browser
# 2. Search flight
# 3. Select flight
# 4. Book flight
# Status: Mission Accomplished ✈️`}</code>
                </pre>
              </div>
              <div className="absolute -bottom-4 -right-4 animate-bounce text-gemini-cyan">
                <span className="text-[10px] font-mono">VISUAL PERCEPTION ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Visual Perception */}
      <Slide backgroundColor="#050505" notes="AI 通过视觉和 DOM 结构共同理解网页。">
        <div className="max-w-5xl mx-auto h-full flex flex-col justify-center px-8">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">VISUAL PERCEPTION</div>
          <h3 className="text-3xl mb-6 font-bold text-white">视觉感知：读懂网页</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">多模态理解</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                Agent 不仅分析 DOM 树，还通过截图进行视觉分析，识别按钮、输入框及其空间关系，即使在复杂的动态布局中也能精准定位。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-purple">语义元素提取</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                自动识别网页中的关键业务元素，如价格、日期选择器、购物车按钮等，并将其映射为 Agent 可理解的结构化数据。
              </p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Action Execution */}
      <Slide backgroundColor="#050505" notes="Agent 通过自动化工具执行具体的点击、输入等操作。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center text-center px-8">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">ACTION EXECUTION</div>
          <h3 className="text-3xl mb-8 font-bold text-white">动作执行：精准交互</h3>
          <div className="grid grid-cols-3 gap-6 text-left">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xl mb-3">🖱️</div>
              <h4 className="text-sm font-bold mb-1">模拟人类行为</h4>
              <p className="text-[10px] opacity-60 leading-tight">模拟真实的鼠标移动、点击和滚动，绕过简单的反爬虫机制，确保交互的自然性。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xl mb-3">⌨️</div>
              <h4 className="text-sm font-bold mb-1">智能表单填充</h4>
              <p className="text-[10px] opacity-60 leading-tight">根据任务需求，自动在各种输入框中填入正确的信息，处理复杂的验证逻辑。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xl mb-3">🔄</div>
              <h4 className="text-sm font-bold mb-1">状态同步与重试</h4>
              <p className="text-[10px] opacity-60 leading-tight">实时监控页面状态变更，处理加载延迟或意外弹窗，确保任务流的连续性。</p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
