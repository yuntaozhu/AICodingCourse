import Slide from "@/components/Slide";

export default function P74() {
  return (
    <Slide backgroundColor="#020205" notes="在评估中，最重要的不是‘代码长什么样’，而是‘代码是否实现了意图’。Gemini 3.1 的长上下文能力，让我们可以将原始的业务需求、架构设计、安全规范全部喂给评估模型。这种‘意图对齐’的评估，才是真正的 AI Native 评估。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-gemini-purple italic">评估的核心：意图 (Intent)</h2>
        <div className="relative p-12 bg-gemini-purple/10 rounded-3xl border border-gemini-purple/30 overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl font-bold">INTENT</div>
          <div className="grid grid-cols-2 gap-12 relative z-10">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-gemini-cyan">我们要验证什么？</h3>
              <ul className="space-y-4 text-lg">
                <li className="flex gap-3">
                  <span className="text-gemini-purple">✓</span>
                  <span>业务逻辑的完整性</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gemini-purple">✓</span>
                  <span>架构约束的符合度</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gemini-purple">✓</span>
                  <span>安全规范的强制执行</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gemini-purple">✓</span>
                  <span>性能指标的预估</span>
                </li>
              </ul>
            </div>
            <div className="flex flex-col justify-center">
              <div className="p-6 bg-black/40 rounded-2xl border border-white/10">
                <p className="italic opacity-70">“代码只是意图的载体。如果意图错了，代码写得再漂亮也是垃圾。AI Native 评估必须回归意图本身。”</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
