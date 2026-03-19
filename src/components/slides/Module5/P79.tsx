import Slide from "@/components/Slide";

export default function P79() {
  return (
    <Slide backgroundColor="#020205" notes="总结一下第五模块。我们讨论了评估闭环的重要性，从拒绝‘人肉 QA’到构建‘确定性引擎’。核心在于：利用 LLM-as-a-Judge 和语义验证，将 AI 的不确定性转化为软件的确定性。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-gemini-cyan">模块 5 总结：评估闭环</h2>
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="text-gemini-purple font-bold">01</div>
              <p className="text-lg">拒绝“人肉 QA”，通过自动化手段填补算力缺口。</p>
            </div>
            <div className="flex gap-4">
              <div className="text-gemini-purple font-bold">02</div>
              <p className="text-lg">引入 LLM-as-a-Judge，构建多维度的自动裁判机制。</p>
            </div>
            <div className="flex gap-4">
              <div className="text-gemini-purple font-bold">03</div>
              <p className="text-lg">从单元测试进化到语义验证，实现意图对齐。</p>
            </div>
          </div>
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="text-gemini-purple font-bold">04</div>
              <p className="text-lg">构建“确定性引擎”，将不确定性转化为可信资产。</p>
            </div>
            <div className="flex gap-4">
              <div className="text-gemini-purple font-bold">05</div>
              <p className="text-lg">实施持续评估 (CE)，贯穿研发生命周期全流程。</p>
            </div>
            <div className="flex gap-4">
              <div className="text-gemini-purple font-bold">06</div>
              <p className="text-lg">从“清洁工”进化为“设计师”，关注机制而非错误。</p>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
