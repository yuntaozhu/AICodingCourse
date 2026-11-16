import Slide from "@/components/Slide";

export default function P3() {
  return (
    <Slide notes="意图架构师不再是打字员。他们的核心竞争力在于：抽象、评估和编排。代码只是副产品，意图才是源头。">
      <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
        <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-white">
          定义<span className="text-gemini-cyan">“意图架构师”</span>
        </h2>
        
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="group p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-gemini-cyan/10 hover:border-gemini-cyan/30 transition-all duration-500">
            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">🧩</div>
            <h3 className="text-xl font-bold mb-2 text-gemini-cyan">抽象能力</h3>
            <p className="text-xs opacity-60 leading-relaxed">将复杂的业务需求转化为精准的 Spec 描述。从模糊到确定的跨越。</p>
          </div>
          
          <div className="group p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-gemini-purple/10 hover:border-gemini-purple/30 transition-all duration-500">
            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">⚖️</div>
            <h3 className="text-xl font-bold mb-2 text-gemini-purple">评估能力</h3>
            <p className="text-xs opacity-60 leading-relaxed">构建多维 Evaluation 闭环，确保 AI 输出符合预期。质量的终极守门人。</p>
          </div>
          
          <div className="group p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-500">
            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">🎼</div>
            <h3 className="text-xl font-bold mb-2 text-white">编排能力</h3>
            <p className="text-xs opacity-60 leading-relaxed">指挥 Agent 集群完成全链路研发任务。从单兵作战到指挥千军。</p>
          </div>
        </div>

        <div className="relative p-6 bg-gemini-cyan/5 rounded-xl border-l-4 border-gemini-cyan overflow-hidden">
          <div className="absolute right-0 top-0 text-7xl opacity-5 font-black select-none">INTENT</div>
          <p className="text-2xl italic font-light tracking-tight text-gemini-cyan relative z-10">
            "Code is the <span className="font-bold">artifact</span>, Intent is the <span className="font-bold">source</span>."
          </p>
        </div>
      </div>
    </Slide>
  );
}
