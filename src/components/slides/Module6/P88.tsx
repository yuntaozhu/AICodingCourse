import Slide from "@/components/Slide";

export default function P88() {
  return (
    <Slide backgroundColor="#020205" notes="自动化并不意味着失去控制。安全与合规（Security & Compliance）必须内置在 AI 流水线中。通过‘安全即代码’（Security as Code）和 AI 实时审计，我们可以确保自动生成的每一行代码都符合最严格的安全标准。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-white">安全与合规：<span className="text-gemini-purple italic">内置的护栏</span></h2>
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-gemini-cyan/20 rounded-full flex items-center justify-center text-xl">🔒</div>
              <div>
                <h3 className="text-xl font-bold mb-2">实时漏洞扫描</h3>
                <p className="text-sm opacity-60">在代码生成瞬间进行 SAST/DAST 扫描，拒绝不安全的代码进入仓库。</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-gemini-cyan/20 rounded-full flex items-center justify-center text-xl">📜</div>
              <div>
                <h3 className="text-xl font-bold mb-2">合规性审计</h3>
                <p className="text-sm opacity-60">自动验证代码是否符合 GDPR、HIPAA 等行业合规标准。</p>
              </div>
            </div>
          </div>
          <div className="bg-gemini-purple/10 p-8 rounded-2xl border border-gemini-purple/30">
            <h3 className="text-xl font-bold mb-4 text-gemini-cyan">AI 安全大脑</h3>
            <p className="text-sm opacity-70 mb-6 italic">“通过 Gemini 3.1 的推理能力，我们可以识别复杂的逻辑漏洞，这些漏洞是传统静态扫描工具无法发现的。”</p>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-green-400">✓ 注入攻击防护</span>
              <span className="text-green-400">✓ 越权访问检查</span>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
