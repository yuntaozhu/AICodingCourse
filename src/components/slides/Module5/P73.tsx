import Slide from "@/components/Slide";

export default function P73() {
  return (
    <section>
      <Slide backgroundColor="#020205" notes="来看一个真实的案例。在某金融项目中，我们实现了自动化的 Bug 修复流水线。当线上监控发现异常时，系统自动定位代码，生成修复 PR，并通过多维评估闭环进行验证。整个过程无需人工干预，修复时间从小时级缩短到分钟级。">
        {/* Main Slide */}
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
        <h2 className="text-4xl mb-8 font-bold text-white">案例研究：<span className="text-gemini-cyan">自动化 Bug 修复</span></h2>
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-500">
          <div className="flex justify-between mb-6 items-center">
            <div className="text-xs font-mono text-gemini-purple">Project: FinTech-Core-v4</div>
            <div className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded-full border border-green-500/40">Success Case</div>
          </div>
          <div className="space-y-3">
            {[
              { color: "bg-red-500", text: "1. 监控发现异常：支付接口超时 (P0)" },
              { color: "bg-gemini-purple", text: "2. AI 自动定位：定位到数据库连接池溢出" },
              { color: "bg-gemini-purple", text: "3. AI 生成修复：优化连接释放逻辑并增加重试" },
              { color: "bg-gemini-cyan", text: "4. 评估闭环：通过语义验证、压力测试、安全扫描", bold: true },
              { color: "bg-green-500", text: "5. 自动部署：PR 自动合并，线上故障恢复" }
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-center group cursor-pointer">
                <div className={`w-3 h-3 rounded-full ${item.color} group-hover:scale-150 transition-transform`}></div>
                <p className={`text-base ${item.bold ? 'font-bold text-gemini-cyan' : 'opacity-80'}`}>{item.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-white/10 flex justify-around text-center">
            <div className="hover:scale-110 transition-transform">
              <div className="text-2xl font-bold text-gemini-cyan">120min → 4min</div>
              <div className="text-[10px] opacity-50">MTTR 缩短</div>
            </div>
            <div className="hover:scale-110 transition-transform">
              <div className="text-2xl font-bold text-gemini-cyan">0</div>
              <div className="text-[10px] opacity-50">人工干预</div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="text-gemini-cyan text-xl">↓</div>
        </div>
        </div>
      </Slide>

      {/* Vertical Slide 1: Technical Architecture */}
      <Slide backgroundColor="#020205">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
        <h3 className="text-3xl mb-8 font-bold text-gemini-purple">技术架构：自愈系统的神经中枢</h3>
        <div className="relative p-8 bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
          <div className="grid grid-cols-3 gap-6 relative z-10">
            <div className="space-y-3">
              <div className="text-gemini-cyan font-bold text-base">感知层 (Perception)</div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs">
                Sentry / Prometheus<br/>
                实时监控与异常捕获
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-gemini-cyan font-bold text-base">决策层 (Reasoning)</div>
              <div className="p-3 bg-gemini-purple/20 rounded-xl border border-gemini-purple/40 text-xs">
                AI Agent (Gemini 2.0)<br/>
                根因分析与代码生成
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-gemini-cyan font-bold text-base">执行层 (Execution)</div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs">
                GitHub Actions / ArgoCD<br/>
                自动化部署与验证
              </div>
            </div>
          </div>
          {/* Connecting lines (simulated) */}
          <div className="absolute top-1/2 left-1/3 w-1/6 h-px bg-gemini-purple/50"></div>
          <div className="absolute top-1/2 left-2/3 w-1/6 h-px bg-gemini-purple/50"></div>
        </div>
        <div className="mt-8 p-4 bg-gemini-cyan/5 rounded-xl border border-gemini-cyan/20">
          <p className="text-xs opacity-70 italic">“这不仅仅是一个脚本，而是一个具备‘观察-思考-行动’能力的闭环系统。”</p>
        </div>
        </div>
      </Slide>

      {/* Vertical Slide 2: ROI Analysis */}
      <Slide backgroundColor="#020205">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
        <h3 className="text-3xl mb-8 font-bold text-gemini-cyan">投资回报率 (ROI) 分析</h3>
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h4 className="text-lg font-bold mb-4 text-gemini-purple">效率提升</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>故障恢复时间 (MTTR)</span>
                  <span className="text-gemini-cyan">-96%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-[96%] h-full bg-gemini-cyan"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>研发人力投入</span>
                  <span className="text-gemini-cyan">-80%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-[80%] h-full bg-gemini-cyan"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h4 className="text-lg font-bold mb-4 text-gemini-purple">质量收益</h4>
            <ul className="space-y-3 text-xs opacity-70">
              <li className="flex gap-2">
                <span className="text-green-500">✓</span>
                <span>消除人为操作失误导致的二次故障</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-500">✓</span>
                <span>全天候 (24/7) 自动响应，无需值班</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-500">✓</span>
                <span>修复过程可审计、可回溯、可学习</span>
              </li>
            </ul>
          </div>
        </div>
        </div>
      </Slide>
    </section>
  );
}
