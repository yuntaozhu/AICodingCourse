import Slide from "@/components/Slide";

export default function Module6() {
  return (
    <section>
      {/* Main Slide */}
      <Slide backgroundColor="#051005" notes="SDD: 确定性研发的基石。探讨软件设计文档在 AI Coding 中的核心作用。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <h2 className="text-gemini-cyan text-xs uppercase tracking-widest mb-3">Module 6</h2>
          <h1 className="text-7xl mb-4 leading-none text-white font-bold">SDD：<br /><span className="text-gemini-purple">确定性研发的基石</span></h1>
          <p className="text-2xl font-mono text-gemini-purple opacity-80 mb-6">软件设计文档：AI Coding 的施工蓝图</p>
          <div className="h-1 w-24 bg-gemini-purple mb-8"></div>
          <p className="text-sm text-white/50 italic animate-bounce">↓ 点击向下按钮探索更多</p>
        </div>
      </Slide>

      {/* Sub Slide 1: What is SDD */}
      <Slide backgroundColor="#0a0a15" notes="什么是 SDD？它不仅仅是文档，更是 AI 的约束和指导。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <h2 className="text-gemini-purple text-sm font-bold mb-4 uppercase tracking-widest">What is SDD?</h2>
          <h3 className="text-4xl mb-8 font-bold text-white">什么是 SDD (Software Design Document)?</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
              <h4 className="text-gemini-cyan text-xl mb-4 font-bold">核心定义</h4>
              <p className="text-white/70 leading-relaxed">
                SDD 是对软件系统架构、模块、接口、数据结构和业务逻辑的详细描述。
                <br /><br />
                在 AI Coding 中，SDD 是 <span className="text-white font-bold">“意图”与“实现”之间的桥梁</span>。它将模糊的需求转化为 AI 可执行的精确指令。
              </p>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gemini-purple/10 rounded-xl border border-gemini-purple/30">
                <h5 className="font-bold text-white">架构约束</h5>
                <p className="text-xs text-white/60">规定技术栈、目录结构和设计模式。</p>
              </div>
              <div className="p-4 bg-gemini-purple/10 rounded-xl border border-gemini-purple/30">
                <h5 className="font-bold text-white">接口契约</h5>
                <p className="text-xs text-white/60">定义 API 签名、输入输出格式和错误码。</p>
              </div>
              <div className="p-4 bg-gemini-purple/10 rounded-xl border border-gemini-purple/30">
                <h5 className="font-bold text-white">逻辑细节</h5>
                <p className="text-xs text-white/60">描述核心算法、状态机和业务流程。</p>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: SDD Prompts & Usage */}
      <Slide backgroundColor="#051005" notes="SDD 开发提示词与使用。如何通过 Prompt 让 AI 生成高质量的 SDD。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <h2 className="text-gemini-purple text-sm font-bold mb-4 uppercase tracking-widest">SDD Prompts & Usage</h2>
          <h3 className="text-4xl mb-8 font-bold text-white">SDD 开发提示词与实战</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-gemini-cyan font-bold">SDD 生成提示词 (示例)</h4>
              <div className="bg-zinc-900 p-6 rounded-xl border border-white/10 font-mono text-xs text-emerald-400 leading-relaxed">
                {`"请基于以下需求，生成一份详细的 SDD：
1. 技术栈：React, Tailwind, Express
2. 包含：目录结构、核心组件接口、数据流图
3. 重点描述：用户认证流程和错误处理机制
4. 输出格式：Markdown"`}
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="text-gemini-purple font-bold">AI Coding 如何使用 SDD</h4>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-gemini-cyan flex items-center justify-center font-bold text-black shrink-0">1</div>
                  <p className="text-sm text-white/70"><span className="text-white font-bold">先设计后编码：</span>先让 AI 生成 SDD，人类进行架构评审，确保方向正确。</p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-gemini-cyan flex items-center justify-center font-bold text-black shrink-0">2</div>
                  <p className="text-sm text-white/70"><span className="text-white font-bold">作为上下文喂入：</span>在编写具体代码时，将 SDD 作为 System Prompt 或全局上下文。</p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-gemini-cyan flex items-center justify-center font-bold text-black shrink-0">3</div>
                  <p className="text-sm text-white/70"><span className="text-white font-bold">一致性校验：</span>AI 自动检查生成的代码是否符合 SDD 定义的规范。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
