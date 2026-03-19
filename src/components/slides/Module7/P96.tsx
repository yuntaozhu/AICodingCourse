import Slide from "@/components/Slide";

export default function P96() {
  return (
    <Slide backgroundColor="#020205" notes="展望未来，2027 年及以后，研发将彻底进入‘无代码编写’时代。所有的软件都将通过‘意图’直接生成。架构将不再是静态的文档，而是动态演进的生命体。我们正处于这场革命的黎明。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-gemini-cyan italic">未来展望：2027+</h2>
        <div className="space-y-8">
          <div className="flex gap-8 items-center">
            <div className="text-4xl">🌌</div>
            <div>
              <h3 className="text-2xl font-bold">无代码编写 (No-Coding)</h3>
              <p className="opacity-60">人类彻底从语法中解放，专注于业务本质与创新。</p>
            </div>
          </div>
          <div className="flex gap-8 items-center">
            <div className="text-4xl">🧬</div>
            <div>
              <h3 className="text-2xl font-bold">动态演进架构</h3>
              <p className="opacity-60">系统根据用户反馈与环境变化，自动进行架构重构与优化。</p>
            </div>
          </div>
          <div className="flex gap-8 items-center">
            <div className="text-4xl">🌍</div>
            <div>
              <h3 className="text-2xl font-bold">全球化数字工厂</h3>
              <p className="opacity-60">跨地域、跨语言的 AI 代理集群，实现 24/7 全球协同研发。</p>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
