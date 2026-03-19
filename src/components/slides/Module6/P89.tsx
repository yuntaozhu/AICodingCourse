import Slide from "@/components/Slide";

export default function P89() {
  return (
    <Slide backgroundColor="#020205" notes="总结一下第六模块。我们探讨了从传统 CI/CD 到 AI Native CI/CD 的转型，重点介绍了 Issue-to-PR 的全自动工作流。核心在于：利用自主代理和自愈能力，实现研发流程的零人工干预。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-gemini-cyan">模块 6 总结：CI/CD 革命</h2>
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="text-gemini-purple font-bold">01</div>
              <p className="text-lg">从被动执行进化为主动进化，构建 AI Native 流水线。</p>
            </div>
            <div className="flex gap-4">
              <div className="text-gemini-purple font-bold">02</div>
              <p className="text-lg">实现 Issue-to-PR 的全自动闭环，极大提升交付频率。</p>
            </div>
            <div className="flex gap-4">
              <div className="text-gemini-purple font-bold">03</div>
              <p className="text-lg">利用自主代理处理复杂任务，成为流水线上的“数字员工”。</p>
            </div>
          </div>
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="text-gemini-purple font-bold">04</div>
              <p className="text-lg">构建自愈流水线，通过 AI 自动修复构建与测试失败。</p>
            </div>
            <div className="flex gap-4">
              <div className="text-gemini-purple font-bold">05</div>
              <p className="text-lg">将安全与合规内置于流程中，确保自动化的安全性。</p>
            </div>
            <div className="flex gap-4">
              <div className="text-gemini-purple font-bold">06</div>
              <p className="text-lg">追求零人工干预的终极目标，让研发进入“自动驾驶”时代。</p>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
