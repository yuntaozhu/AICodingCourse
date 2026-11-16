import Slide from "@/components/Slide";

export default function P71() {
  return (
    <section>
      <Slide backgroundColor="#020205" notes="我们要构建的是一个‘确定性引擎’。这个引擎的核心是：将不确定性转化为确定性。通过多层自动化评估，剔除不确定性，修正逻辑偏差，最终输出高置信度的软件资产。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto px-8">
        <h2 className="text-4xl mb-8 font-bold text-gemini-cyan italic">构建“确定性引擎”</h2>
        <div className="flex justify-between items-center gap-8">
          <div className="flex-1 text-center p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="text-3xl mb-2">AI 生成</div>
            <div className="text-xs opacity-50">不确定性 (Uncertainty)</div>
          </div>
          <div className="text-gemini-purple text-4xl animate-pulse">→</div>
          <div className="flex-1 text-center p-6 bg-gemini-purple/20 rounded-3xl border border-gemini-purple/40 hover:scale-105 transition-transform duration-300">
            <div className="text-3xl mb-2 text-gemini-cyan font-bold">确定性引擎</div>
            <div className="text-xs opacity-70">规则 + 评估 + 反馈</div>
          </div>
          <div className="text-gemini-purple text-4xl animate-pulse">→</div>
          <div className="flex-1 text-center p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="text-3xl mb-2">可信资产</div>
            <div className="text-xs opacity-50">确定性 (Certainty)</div>
          </div>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-6 text-center">
          <div className="group cursor-pointer">
            <div className="text-gemini-cyan font-bold mb-1 group-hover:scale-110 transition-transform">静态规则</div>
            <p className="text-[10px] opacity-50">Lint, Security Scan, Type Check</p>
          </div>
          <div className="group cursor-pointer">
            <div className="text-gemini-cyan font-bold mb-1 group-hover:scale-110 transition-transform">动态评估</div>
            <p className="text-[10px] opacity-50">LLM-as-a-Judge, Runtime Check</p>
          </div>
          <div className="group cursor-pointer">
            <div className="text-gemini-cyan font-bold mb-1 group-hover:scale-110 transition-transform">意图对齐</div>
            <p className="text-[10px] opacity-50">Spec-to-Code Validation</p>
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="text-gemini-cyan text-xl">↓</div>
        </div>
        </div>
      </Slide>

      {/* Vertical Slide 1: Engine Components */}
      <Slide backgroundColor="#020205">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto px-8">
        <h3 className="text-3xl mb-8 font-bold text-gemini-purple">引擎核心组件：三层过滤</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-gemini-cyan/50 transition-colors">
            <div className="text-2xl mb-3 text-gemini-cyan font-bold">L1: 语法与合规</div>
            <ul className="space-y-2 text-xs opacity-70">
              <li>• 静态代码分析 (ESLint/Sonar)</li>
              <li>• 类型安全检查 (TypeScript)</li>
              <li>• 依赖漏洞扫描 (Snyk)</li>
              <li>• 许可证合规性检查</li>
            </ul>
          </div>
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-gemini-cyan/50 transition-colors">
            <div className="text-2xl mb-3 text-gemini-cyan font-bold">L2: 逻辑与性能</div>
            <ul className="space-y-2 text-xs opacity-70">
              <li>• 单元测试与集成测试</li>
              <li>• 覆盖率分析 (Istanbul)</li>
              <li>• 性能基准测试 (Benchmark)</li>
              <li>• 运行时边界检查</li>
            </ul>
          </div>
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-gemini-cyan/50 transition-colors">
            <div className="text-2xl mb-3 text-gemini-cyan font-bold">L3: 语义与意图</div>
            <ul className="space-y-2 text-xs opacity-70">
              <li>• LLM-as-a-Judge 架构评审</li>
              <li>• 需求对齐验证 (SDD Alignment)</li>
              <li>• 交互一致性检查</li>
              <li>• 业务风险评估</li>
            </ul>
          </div>
        </div>
        </div>
      </Slide>

      {/* Vertical Slide 2: The Transformation Process */}
      <Slide backgroundColor="#020205">
        <div className="flex flex-col justify-center h-full max-w-5xl mx-auto px-8">
        <h3 className="text-3xl mb-8 font-bold text-gemini-cyan">从“概率生成”到“工程交付”</h3>
        <div className="relative p-8 bg-white/5 rounded-3xl border border-white/10">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-gemini-purple/20 flex items-center justify-center text-xl font-bold border border-gemini-purple/40">1</div>
              <div className="flex-1">
                <div className="text-lg font-bold mb-0.5">输入：非结构化意图</div>
                <p className="text-xs opacity-60">自然语言需求、设计稿、遗留代码上下文</p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-gemini-purple/20 flex items-center justify-center text-xl font-bold border border-gemini-purple/40">2</div>
              <div className="flex-1">
                <div className="text-lg font-bold mb-0.5">生成：概率性代码</div>
                <p className="text-xs opacity-60">LLM 基于概率预测生成的代码片段，可能存在幻觉或逻辑漏洞</p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-gemini-cyan/20 flex items-center justify-center text-xl font-bold border border-gemini-cyan/40 text-gemini-cyan">3</div>
              <div className="flex-1">
                <div className="text-lg font-bold mb-0.5">加工：确定性引擎</div>
                <p className="text-xs opacity-60">通过多层自动化评估，剔除不确定性，修正逻辑偏差</p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-xl font-bold border border-green-500/40 text-green-400">4</div>
              <div className="flex-1">
                <div className="text-lg font-bold mb-0.5">输出：高置信度资产</div>
                <p className="text-xs opacity-60">符合生产标准、可直接部署的稳定软件模块</p>
              </div>
            </div>
          </div>
          {/* Decorative background element */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-gemini-cyan/10 rounded-full blur-3xl"></div>
        </div>
        </div>
      </Slide>
    </section>
  );
}
