import Slide from "@/components/Slide";

export default function P22() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="逆向工程是理解复杂系统的捷径。AI 可以辅助逆向工程。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-gemini-cyan glow-text">
            逆向工程：AI 的透视
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <p className="text-xl leading-relaxed font-light opacity-80">
                逆向工程不再是少数专家的专利。AI 能够快速梳理复杂的二进制逻辑，将其转化为可读的架构图和伪代码。
              </p>
              <ul className="space-y-4 text-lg">
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-cyan group-hover:scale-125 transition-transform text-sm">▶</span>
                  <span className="font-bold text-sm">分析二进制文件和反汇编代码</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-cyan group-hover:scale-125 transition-transform text-sm">▶</span>
                  <span className="font-bold text-sm">还原系统架构和逻辑流程</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-cyan group-hover:scale-125 transition-transform text-sm">▶</span>
                  <span className="font-bold text-sm">识别关键算法和数据结构</span>
                </li>
              </ul>
            </div>
            <div className="bg-gemini-cyan/5 p-6 rounded-3xl border border-gemini-cyan/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gemini-cyan to-transparent opacity-50"></div>
              <pre className="text-xs font-mono text-gemini-cyan/80">
                <code className="language-markdown">{`# Reverse Engineering
# Target: Legacy_Module.bin
# Task: Extract Logic
# AI Analysis:
#   - Found: AES-256 Key Schedule
#   - Found: Custom Packet Header
#   - Status: 85% Logic Restored`}</code>
              </pre>
              <div className="absolute bottom-4 right-4 animate-bounce text-gemini-cyan">
                <span className="text-[10px] font-mono">DE-OBFUSCATION ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: De-obfuscation */}
      <Slide backgroundColor="#050505" notes="AI 可以将难以阅读的代码还原为清晰的逻辑。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">DE-OBFUSCATION</div>
          <h3 className="text-3xl mb-8 font-bold text-white">代码去混淆：还原真相</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">语义化重命名</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                AI 能够根据变量的用法 and 上下文，将混淆后的 `a`, `b`, `c` 自动重命名为 `userId`, `sessionToken`, `retryCount` 等具有语义的名称。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-purple">结构还原</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                识别被展开的循环、被内联的函数以及被扭曲的控制流（Control Flow Flattening），将其还原为结构清晰的高级语言逻辑。
              </p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Protocol Analysis */}
      <Slide backgroundColor="#050505" notes="AI 能够快速推断出未公开的通信协议。">
        <div className="flex flex-col justify-center h-full text-center max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">PROTOCOL ANALYSIS</div>
          <h3 className="text-3xl mb-10 font-bold text-white">协议推断：破解黑盒</h3>
          <div className="max-w-4xl mx-auto grid grid-cols-2 gap-10 text-left">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">报文结构识别</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                通过分析处理网络数据的二进制代码，AI 能够推断出自定义协议的报文头、校验位、加密算法和负载格式。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-purple">状态机还原</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                分析协议处理逻辑中的分支跳转，AI 能够还原出系统的通信状态机（FSM），帮助开发者理解复杂的交互流程。
              </p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
