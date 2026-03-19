import Slide from "@/components/Slide";

export default function P22() {
  return (
    <Slide notes="逆向工程是理解复杂系统的捷径。AI 可以辅助逆向工程。">
      <h2 className="text-6xl mb-8">逆向工程：AI 的透视</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          <p className="text-xl leading-relaxed">
            逆向工程是理解复杂系统的捷径。
          </p>
          <ul className="space-y-4 text-lg">
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>分析二进制文件和反汇编代码</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>还原系统架构和逻辑流程</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>识别关键算法和数据结构</span>
            </li>
          </ul>
        </div>
        <div className="bg-gemini-purple/10 p-6 rounded-lg border border-gemini-purple/30 purple-glow">
          <pre><code className="language-markdown">{`# Reverse Engineering
# Target: Binary.exe
# Task: Extract Encryption Logic
# Tool: Gemini 3.1
# Result: AES-256 implementation found`}</code></pre>
        </div>
      </div>
    </Slide>
  );
}
