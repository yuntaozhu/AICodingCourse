import Slide from "@/components/Slide";

export default function P7() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="Spec-Driven Development (SDD) 是 AI Native 的基石。没有 Spec，就没有确定性。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-gemini-purple glow-text">
            SDD: 确定性研发的基石
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-lg leading-relaxed font-light opacity-90">
                SDD (Spec-Driven Development) 是 AI Native 的核心。它将“自然语言”转化为“逻辑约束”。
              </p>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-gemini-cyan text-xl">🎯</div>
                  <div>
                    <div className="font-bold text-sm">Spec 是 AI 的指令集</div>
                    <div className="text-xs opacity-60">消除歧义，提供明确的边界。</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-gemini-cyan text-xl">🌍</div>
                  <div>
                    <div className="font-bold text-sm">Spec 抹平了语言边界</div>
                    <div className="text-xs opacity-60">同一份 Spec 可以生成 Java, Go 或 Rust。</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-gemini-cyan text-xl">✅</div>
                  <div>
                    <div className="font-bold text-sm">Spec 是可验证的</div>
                    <div className="text-xs opacity-60">通过 Evaluation 自动验证代码合规性。</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-black/40 p-6 rounded-2xl border border-gemini-purple/30 relative overflow-hidden group flex flex-col justify-center">
              <div className="absolute top-0 right-0 p-3 text-[8px] font-mono text-gemini-purple opacity-40">SPEC_V1.0.MD</div>
              <pre className="text-xs leading-relaxed"><code className="language-markdown">{`# Spec: Payment Logic
# Auth: Required
# Flow: 
  1. Validate Balance
  2. Lock Funds
  3. Execute Transaction
  4. Notify User
# Error: Atomic Rollback`}</code></pre>
              <div className="absolute bottom-3 right-3 animate-bounce text-gemini-purple">
                <span className="text-[10px] font-mono">CASE STUDIES ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Case 1 - Financial Logic */}
      <Slide backgroundColor="#050505" notes="金融逻辑对确定性要求极高，SDD 是唯一的出路。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-purple mb-2">CASE STUDY 01</div>
          <h3 className="text-3xl mb-8 font-bold text-white">复杂金融逻辑：清结算系统</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="p-5 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-gemini-cyan mb-1 font-bold text-base">挑战 (Challenge)</h4>
                <p className="text-xs opacity-70">涉及多币种转换、阶梯手续费计算、实时对账。传统开发极易在边界条件出错。</p>
              </div>
              <div className="p-5 bg-gemini-purple/10 rounded-xl border border-gemini-purple/30">
                <h4 className="text-gemini-purple mb-1 font-bold text-base">SDD 方案 (Solution)</h4>
                <p className="text-xs opacity-70">定义严格的数学 Spec，包含所有舍入规则和异常处理矩阵。AI 根据 Spec 生成 100% 覆盖的测试用例和实现代码。</p>
              </div>
            </div>
            <div className="bg-black/60 p-5 rounded-xl border border-white/10 font-mono text-[9px] text-green-400/80 flex flex-col justify-center">
              <div>{`// Spec-Generated Logic Verification`}</div>
              <div className="text-white/40 mt-1">{`[PASS] Rounding: Half-Even`}</div>
              <div className="text-white/40">{`[PASS] Currency: ISO-4217 Compliance`}</div>
              <div className="text-white/40">{`[PASS] Atomic: Multi-stage Rollback`}</div>
              <div className="mt-3 text-gemini-cyan">{`Result: 0 Production Bugs in 6 Months`}</div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Case 2 - Legacy Refactoring */}
      <Slide backgroundColor="#050505" notes="重构不是重写代码，而是重构意图。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-purple mb-2">CASE STUDY 02</div>
          <h3 className="text-3xl mb-8 font-bold text-white">遗留系统重构：从 PHP 到 Go</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4 text-xs opacity-70">
              <p>
                某大型电商平台的遗留订单系统，代码混乱，文档缺失。
              </p>
              <div className="flex items-center gap-3">
                <div className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded border border-red-500/30 text-[10px]">Legacy Code</div>
                <div className="text-lg">➔</div>
                <div className="px-2 py-0.5 bg-gemini-cyan/20 text-gemini-cyan rounded border border-gemini-cyan/30 text-[10px]">Spec Extraction</div>
                <div className="text-lg">➔</div>
                <div className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded border border-green-500/30 text-[10px]">New Go Service</div>
              </div>
              <p className="italic text-gemini-purple text-sm">
                "AI 首先从混乱的代码中提取业务 Spec，经过架构师确认后，再由 AI 生成全新的、高性能的 Go 代码。"
              </p>
            </div>
            <div className="bg-white/5 p-5 rounded-xl border border-white/10">
              <h4 className="font-bold mb-3 text-base">重构收益 (Benefits)</h4>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-2">✅ 性能提升 300%</li>
                <li className="flex items-center gap-2">✅ 代码量减少 60%</li>
                <li className="flex items-center gap-2">✅ 业务逻辑完全对齐</li>
              </ul>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 3: Case 3 - Security Hardening */}
      <Slide backgroundColor="#050505" notes="安全不是补丁，而是 Spec 的一部分。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-purple mb-2">CASE STUDY 03</div>
          <h3 className="text-3xl mb-8 font-bold text-white">安全加固：零信任架构实现</h3>
          <div className="p-6 bg-red-500/5 rounded-2xl border border-red-500/20">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-red-400 font-bold mb-2 text-base">Before SDD</h4>
                <p className="text-xs opacity-60">安全规范分散在文档中，开发者经常忘记实现鉴权或输入校验。漏洞频发。</p>
              </div>
              <div>
                <h4 className="text-green-400 font-bold mb-2 text-base">After SDD</h4>
                <p className="text-xs opacity-60">安全 Spec 成为代码生成的强制约束。AI 自动在每个入口注入鉴权逻辑和 WAF 规则。</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/10 flex justify-around">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">0</div>
                <div className="text-[8px] opacity-40">OWASP TOP 10 VULNS</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-[8px] opacity-40">COMPLIANCE RATE</div>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 4: SDD Prompt Engineering */}
      <Slide backgroundColor="#050505" notes="高质量的 SDD 提示词是成功的关键。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-purple mb-2">PROMPT ENGINEERING</div>
          <h3 className="text-3xl mb-8 font-bold text-white">SDD 开发提示词模板</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-xs font-bold text-gemini-cyan mb-2">1. 角色定义 (Role)</h4>
                <p className="text-[10px] opacity-60">"你是一位资深系统架构师，擅长编写严谨的软件设计文档..."</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-xs font-bold text-gemini-cyan mb-2">2. 核心逻辑 (Logic)</h4>
                <p className="text-[10px] opacity-60">"请为 [功能名] 编写 SDD。必须包含：数据结构、状态机、异常处理矩阵..."</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-xs font-bold text-gemini-cyan mb-2">3. 约束条件 (Constraints)</h4>
                <p className="text-[10px] opacity-60">"代码必须符合 [规范]，禁止使用 [库]，必须通过 [测试]..."</p>
              </div>
            </div>
            <div className="bg-black/60 p-5 rounded-xl border border-gemini-purple/30 font-mono text-[9px] text-white/60">
              <div className="text-gemini-purple mb-2"># SDD Prompt Example</div>
              <div>Act as a Technical Architect.</div>
              <div>Write a detailed SDD for "User Auth Flow".</div>
              <div className="mt-2">## Requirements:</div>
              <div>- Use JWT with 15min expiry.</div>
              <div>- Password hashing: Argon2.</div>
              <div>- Rate limiting: 5 req/min.</div>
              <div className="mt-2">## Output Format:</div>
              <div>- Markdown with Mermaid diagrams.</div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 5: SDD-to-Code Workflow */}
      <Slide backgroundColor="#050505" notes="SDD 如何驱动代码生成。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-purple mb-2">WORKFLOW</div>
          <h3 className="text-3xl mb-8 font-bold text-white">AI Coding 如何使用 SDD</h3>
          <div className="relative">
            <div className="flex justify-between items-center gap-4">
              <div className="flex-1 p-4 bg-gemini-purple/10 rounded-xl border border-gemini-purple/30 text-center">
                <div className="text-lg mb-1">📝</div>
                <div className="text-xs font-bold">Draft Spec</div>
                <div className="text-[9px] opacity-50">人类定义意图</div>
              </div>
              <div className="text-gemini-purple">➔</div>
              <div className="flex-1 p-4 bg-gemini-purple/10 rounded-xl border border-gemini-purple/30 text-center">
                <div className="text-lg mb-1">🤖</div>
                <div className="text-xs font-bold">AI Refinement</div>
                <div className="text-[9px] opacity-50">AI 补全边界条件</div>
              </div>
              <div className="text-gemini-purple">➔</div>
              <div className="flex-1 p-4 bg-gemini-purple/10 rounded-xl border border-gemini-purple/30 text-center">
                <div className="text-lg mb-1">💻</div>
                <div className="text-xs font-bold">Code Gen</div>
                <div className="text-[9px] opacity-50">基于 Spec 生成代码</div>
              </div>
              <div className="text-gemini-purple">➔</div>
              <div className="flex-1 p-4 bg-gemini-purple/10 rounded-xl border border-gemini-purple/30 text-center">
                <div className="text-lg mb-1">🧪</div>
                <div className="text-xs font-bold">Validation</div>
                <div className="text-[9px] opacity-50">自动化测试验证</div>
              </div>
            </div>
            <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10 text-center italic text-xs opacity-60">
              "SDD 确保了 AI 不再是‘瞎猜’，而是‘按图索骥’。"
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
