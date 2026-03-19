import Slide from "@/components/Slide";

export default function P3() {
  return (
    <Slide notes="意图架构师不再是打字员。他们的核心竞争力在于：抽象、评估和编排。代码只是副产品，意图才是源头。">
      <h2 className="text-6xl mb-8">定义“意图架构师”</h2>
      <div className="flex flex-col gap-8">
        <div className="border-l-4 border-gemini-cyan pl-6 py-4 bg-gemini-cyan/5">
          <p className="text-3xl italic font-black">"Code is the artifact, Intent is the source."</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white/5 rounded">
            <h3 className="text-xl mb-2">抽象能力</h3>
            <p className="text-sm opacity-70">将复杂的业务需求转化为精准的 Spec 描述。</p>
          </div>
          <div className="p-4 bg-white/5 rounded">
            <h3 className="text-xl mb-2">评估能力</h3>
            <p className="text-sm opacity-70">构建多维 Evaluation 闭环，确保 AI 输出符合预期。</p>
          </div>
          <div className="p-4 bg-white/5 rounded">
            <h3 className="text-xl mb-2">编排能力</h3>
            <p className="text-sm opacity-70">指挥 Agent 集群完成全链路研发任务。</p>
          </div>
        </div>
      </div>
    </Slide>
  );
}
