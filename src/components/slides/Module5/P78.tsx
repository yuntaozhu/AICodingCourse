import Slide from "@/components/Slide";

export default function P78() {
  return (
    <Slide backgroundColor="#020205" notes="最后，我们要明确一点：拒绝给 AI 当 QA，本质上是拒绝低效的重复劳动。AI Native 架构师应该关注的是‘如何定义规则’，而不是‘如何检查错误’。我们要从‘代码清洁工’进化为‘架构设计师’。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-gemini-purple italic">拒绝成为“代码清洁工”</h2>
        <div className="flex gap-12 items-center">
          <div className="flex-1">
            <div className="p-8 bg-red-500/10 rounded-3xl border border-red-500/30">
              <h3 className="text-2xl font-bold mb-4 text-red-400">过去：代码清洁工</h3>
              <ul className="space-y-3 opacity-70">
                <li>• 盯着屏幕找 Bug</li>
                <li>• 纠结于缩进和命名</li>
                <li>• 手动写重复的测试用例</li>
                <li>• 疲于奔命的“救火员”</li>
              </ul>
            </div>
          </div>
          <div className="text-3xl opacity-30 font-mono">VS</div>
          <div className="flex-1">
            <div className="p-8 bg-gemini-cyan/10 rounded-3xl border border-gemini-cyan/30">
              <h3 className="text-2xl font-bold mb-4 text-gemini-cyan">未来：架构设计师</h3>
              <ul className="space-y-3">
                <li>• 定义业务意图与架构约束</li>
                <li>• 构建自动化的评估闭环</li>
                <li>• 关注系统的确定性与演进</li>
                <li>• 运筹帷幄的“总指挥”</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 text-center">
          <p className="text-2xl font-bold text-white">“你的价值不在于你发现了多少 Bug，而在于你构建了多少不产生 Bug 的机制。”</p>
        </div>
      </div>
    </Slide>
  );
}
