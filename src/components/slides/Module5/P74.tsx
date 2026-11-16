import Slide from "@/components/Slide";

export default function P74() {
  return (
    <section>
      <Slide backgroundColor="#020205" notes="在评估中，最重要的不是‘代码长什么样’，而是‘代码是否实现了意图’。AI Coding 的长期价值在于通过语义验证确保意图对齐。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto px-8">
        <h2 className="text-4xl mb-8 font-bold text-gemini-purple italic">评估的核心：意图 (Intent)</h2>
        <div className="relative p-8 bg-gemini-purple/10 rounded-3xl border border-gemini-purple/30 overflow-hidden group hover:bg-gemini-purple/20 transition-all duration-500">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl font-bold group-hover:scale-110 transition-transform">INTENT</div>
          <div className="grid grid-cols-2 gap-8 relative z-10">
            <div>
              <h3 className="text-xl font-bold mb-4 text-gemini-cyan">我们要验证什么？</h3>
              <ul className="space-y-3 text-base">
                {[
                  "业务逻辑的完整性",
                  "架构约束的符合度",
                  "安全规范的强制执行",
                  "性能指标的预估"
                ].map((item, i) => (
                  <li key={i} className="flex gap-2 hover:translate-x-2 transition-transform">
                    <span className="text-gemini-purple">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col justify-center">
              <div className="p-5 bg-black/40 rounded-2xl border border-white/10 hover:border-gemini-cyan/50 transition-colors">
                <p className="italic opacity-70 text-sm">“代码只是意图的载体。如果意图错了，代码写得再漂亮也是垃圾。AI Native 评估必须回归意图本身。”</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="text-gemini-purple text-xl">↓</div>
        </div>
        </div>
      </Slide>

      {/* Vertical Slide 1: Intent Extraction */}
      <Slide backgroundColor="#020205">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto px-8">
        <h3 className="text-3xl mb-8 font-bold text-gemini-cyan">意图提取：从非结构化到结构化</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-lg font-bold mb-2 text-gemini-purple">1. 需求解析</div>
            <p className="text-xs opacity-60">通过 LLM 解析 PR 描述、SDD 文档和业务需求，提取核心业务规则。</p>
          </div>
          <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-lg font-bold mb-2 text-gemini-purple">2. 规范注入</div>
            <p className="text-xs opacity-60">将企业的架构规范、安全基线、性能阈值转化为可评估的 Checkpoint。</p>
          </div>
          <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-lg font-bold mb-2 text-gemini-purple">3. 动态上下文</div>
            <p className="text-xs opacity-60">结合当前代码库的拓扑结构和依赖关系，构建完整的评估上下文。</p>
          </div>
        </div>
        <div className="mt-8 p-6 bg-gemini-cyan/5 rounded-2xl border border-gemini-cyan/20 flex items-center gap-6">
          <div className="text-3xl">🔍</div>
          <div>
            <div className="text-base font-bold mb-0.5 text-gemini-cyan">意图指纹 (Intent Fingerprint)</div>
            <p className="text-xs opacity-70">为每一个功能模块生成唯一的“意图指纹”，作为后续所有评估的基准。任何代码变更都必须通过指纹校验。</p>
          </div>
        </div>
        </div>
      </Slide>

      {/* Vertical Slide 2: Intent vs. Implementation */}
      <Slide backgroundColor="#020205">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto px-8">
        <h3 className="text-3xl mb-8 font-bold text-gemini-purple">意图 vs. 实现：为什么单元测试不够？</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="p-6 bg-red-500/5 rounded-2xl border border-red-500/20">
            <div className="text-lg font-bold mb-3 text-red-400">实现正确 (Implementation OK)</div>
            <div className="bg-black/40 p-3 rounded-lg font-mono text-[10px] mb-3">
              {`// 单元测试通过
test('should add item', () => {
  const cart = new Cart();
  cart.add({ id: 1, price: 10 });
  expect(cart.total).toBe(10);
});`}
            </div>
            <p className="text-xs opacity-60">代码逻辑无误，测试用例全部绿色。但在业务层面可能完全错误。</p>
          </div>
          <div className="p-6 bg-gemini-cyan/5 rounded-2xl border border-gemini-cyan/20">
            <div className="text-lg font-bold mb-3 text-gemini-cyan">意图对齐 (Intent Aligned)</div>
            <div className="bg-black/40 p-3 rounded-lg font-mono text-[10px] mb-3">
              {`// 语义验证发现问题
"意图：购物车总价应包含税费。
 现状：代码仅计算了原价。
 结论：意图不匹配，拦截发布。"`}
            </div>
            <p className="text-xs opacity-60">回归业务本质。AI 评估能够识别出代码虽然“能跑”，但并不符合“业务预期”。</p>
          </div>
        </div>
        </div>
      </Slide>
    </section>
  );
}
