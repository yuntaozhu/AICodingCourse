import Slide from "@/components/Slide";

export default function P82() {
  return (
    <Slide backgroundColor="#020205" notes="传统的 CI/CD 是‘被动’的：它只是运行你写的脚本。AI Native CI/CD 是‘主动’的：它能理解你的意图，自动生成代码，自动修复错误，甚至自动优化架构。它是流水线上的‘数字员工’。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-gemini-purple">传统 CI/CD vs. AI-Native CI/CD</h2>
        <div className="grid grid-cols-2 gap-12">
          <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
            <h3 className="text-2xl font-bold mb-6 text-red-400">传统：被动执行</h3>
            <ul className="space-y-4 opacity-70">
              <li>• 静态脚本驱动</li>
              <li>• 仅验证已有代码</li>
              <li>• 错误需人工干预修复</li>
              <li>• 关注“通过率”</li>
            </ul>
          </div>
          <div className="p-8 bg-gemini-cyan/10 rounded-3xl border border-gemini-cyan/30">
            <h3 className="text-2xl font-bold mb-6 text-gemini-cyan">AI Native：主动进化</h3>
            <ul className="space-y-4">
              <li>• 意图驱动 (Intent-Driven)</li>
              <li>• 自动生成与修复代码</li>
              <li>• 自主决策与优化</li>
              <li>• 关注“意图对齐率”</li>
            </ul>
          </div>
        </div>
      </div>
    </Slide>
  );
}
