import Slide from "@/components/Slide";

export default function P67() {
  return (
    <Slide backgroundColor="#020205" notes="传统的开发模式是：人写代码，机器跑测试。AI Native 模式下，AI 写代码，如果还是人去测试，那你就成了 AI 的‘保姆’。这种‘人肉 QA’模式不可持续。我们需要的是将评估逻辑前置，让 AI 产出的每一行代码都经过确定性的验证。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-gemini-purple italic">“人肉 QA”的陷阱</h2>
        <div className="grid grid-cols-2 gap-12">
          <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
            <h3 className="text-2xl mb-4 text-red-400 font-bold">传统模式</h3>
            <ul className="space-y-4 opacity-70">
              <li>• 人工 Code Review</li>
              <li>• 随机抽样测试</li>
              <li>• 依赖经验判断</li>
              <li>• 效率瓶颈在人</li>
            </ul>
          </div>
          <div className="bg-gemini-purple/10 p-8 rounded-2xl border border-gemini-purple/30">
            <h3 className="text-2xl mb-4 text-gemini-cyan font-bold">AI Native 模式</h3>
            <ul className="space-y-4">
              <li>• 自动化语义验证</li>
              <li>• 100% 覆盖率监控</li>
              <li>• 确定性架构约束</li>
              <li>• 效率瓶颈在算力</li>
            </ul>
          </div>
        </div>
      </div>
    </Slide>
  );
}
