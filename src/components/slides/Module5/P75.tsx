import Slide from "@/components/Slide";

export default function P75() {
  return (
    <section>
      <Slide backgroundColor="#020205" notes="不要盲目相信通用的 Benchmark。在 2026 年，每个团队都应该有自己的‘领域 Benchmark’。通过构建针对自己业务场景的评估集，我们可以持续监控 AI 在特定领域（如支付、推荐、搜索）的表现，从而进行针对性的优化。">
        {/* Main Slide */}
        <div className="flex flex-col justify-center h-full">
        <h2 className="text-3xl mb-8 font-bold text-white">构建你的领域 Benchmark</h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gemini-cyan">为什么需要？</h3>
            <p className="text-sm opacity-70">通用模型在特定业务场景（如私有协议、特定框架）下可能表现不佳。你需要一把尺子来衡量它在“你的战场”上的表现。</p>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10 group hover:border-gemini-purple/50 transition-colors">
              <h4 className="text-lg font-bold text-gemini-purple mb-2">数据来源</h4>
              <ul className="text-xs opacity-60 space-y-1">
                <li className="hover:translate-x-2 transition-transform cursor-pointer"> 历史高质量 PR 数据</li>
                <li className="hover:translate-x-2 transition-transform cursor-pointer"> 业务文档与 Spec</li>
                <li className="hover:translate-x-2 transition-transform cursor-pointer"> 线上故障复盘数据</li>
              </ul>
            </div>
          </div>
          <div className="bg-black/40 p-6 rounded-2xl border border-white/10 hover:shadow-[0_0_30px_rgba(0,255,255,0.1)] transition-shadow">
            <h3 className="text-lg font-bold mb-4 text-center">评估指标 (Metrics)</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span>代码生成准确率</span>
                <span className="text-gemini-cyan">94.2%</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-gemini-cyan h-full w-[94.2%] animate-[progress_2s_ease-out]"></div>
              </div>
              <div className="flex justify-between items-center">
                <span>安全规范合规率</span>
                <span className="text-gemini-purple">99.8%</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-gemini-purple h-full w-[99.8%] animate-[progress_2s_ease-out]"></div>
              </div>
              <div className="flex justify-between items-center">
                <span>业务逻辑对齐度</span>
                <span className="text-white">88.5%</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-white h-full w-[88.5%] animate-[progress_2s_ease-out]"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="text-gemini-cyan text-2xl">↓</div>
        </div>
        </div>
      </Slide>

      {/* Vertical Slide 1: Benchmark Dataset Construction */}
      <Slide backgroundColor="#020205">
        <div className="flex flex-col justify-center h-full">
        <h3 className="text-2xl mb-8 font-bold text-gemini-purple">数据集构建：从原始数据到评估集</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-lg font-bold mb-3 text-gemini-cyan">1. 样本筛选</div>
            <p className="text-xs opacity-60 mb-3">从 Git 历史中筛选出经过严格 Code Review 且无 Bug 的 PR 作为“黄金样本”。</p>
            <div className="text-xs font-mono opacity-40 bg-black/40 p-3 rounded">
              git log --grep="feat" --since="2025-01-01"
            </div>
          </div>
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-lg font-bold mb-3 text-gemini-cyan">2. 意图标注</div>
            <p className="text-xs opacity-60 mb-3">将代码对应的需求文档、设计稿描述提取出来，作为评估的“预期意图”。</p>
            <div className="text-xs font-mono opacity-40 bg-black/40 p-3 rounded">
              Input: SDD v2.1<br/>
              Expected: Auth Flow
            </div>
          </div>
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-lg font-bold mb-3 text-gemini-cyan">3. 负样本构造</div>
            <p className="text-xs opacity-60 mb-3">引入历史线上故障的代码片段，作为“负样本”，用于测试评估器的敏感度。</p>
            <div className="text-xs font-mono opacity-40 bg-black/40 p-3 rounded">
              Negative: Race Condition<br/>
              Expected: Intercepted
            </div>
          </div>
        </div>
        </div>
      </Slide>

      {/* Vertical Slide 2: Custom Metric Definition */}
      <Slide backgroundColor="#020205">
        <div className="flex flex-col justify-center h-full">
        <h3 className="text-2xl mb-8 font-bold text-gemini-cyan">自定义指标：定义“你的好代码”</h3>
        <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="text-lg font-bold mb-4 text-gemini-purple">示例：内部库强制使用校验</div>
              <pre className="text-[10px] font-mono opacity-70 bg-black/40 p-4 rounded-xl leading-relaxed">
{`// Custom Metric Logic
const checkInternalAuth = (code) => {
  const hasAuth = code.includes('import { auth } from "@company/auth"');
  const hasLegacy = code.includes('import { oldAuth } from "legacy-lib"');
  
  if (hasLegacy) return { score: 0, reason: "使用了废弃的旧版鉴权库" };
  if (!hasAuth) return { score: 0.5, reason: "未发现标准鉴权库引用" };
  return { score: 1, reason: "符合规范" };
};`}
              </pre>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <div className="p-4 bg-gemini-purple/10 rounded-2xl border border-gemini-purple/30">
                <div className="text-base font-bold mb-1">领域专有性</div>
                <p className="text-xs opacity-60">通用模型不知道你的公司规范，自定义指标是注入“组织意志”的关键。</p>
              </div>
              <div className="p-4 bg-gemini-cyan/10 rounded-2xl border border-gemini-cyan/30">
                <div className="text-base font-bold mb-1">可解释性</div>
                <p className="text-xs opacity-60">指标不仅给分，更要给出“为什么扣分”的详细理由，指导 AI 修正。</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </Slide>
    </section>
  );
}
