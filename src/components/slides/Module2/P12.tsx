import Slide from "@/components/Slide";

export default function P12() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="Repomix 是全量代码库理解的利器。它将整个代码库打包成一个文件。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-gemini-cyan glow-text">
            Repomix: 全量代码库打包
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <p className="text-xl leading-relaxed font-light opacity-90">
                Repomix 是全量代码库理解的利器。它将分散的文件“坍缩”为一个结构化的上下文文件。
              </p>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                  <div className="text-gemini-cyan text-2xl">📦</div>
                  <div>
                    <div className="font-bold text-lg">结构化打包</div>
                    <div className="text-xs opacity-60">保留文件路径、元数据和代码注释。</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                  <div className="text-gemini-cyan text-2xl">🧩</div>
                  <div>
                    <div className="font-bold text-lg">上下文注入</div>
                    <div className="text-xs opacity-60">直接注入 AI Coding，实现 100% 召回。</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-black/40 p-6 rounded-2xl border border-gemini-purple/30 relative overflow-hidden group flex flex-col justify-center">
              <div className="absolute top-0 right-0 p-3 text-[8px] font-mono text-gemini-purple opacity-40">REPOMIX_CLI.SH</div>
              <pre className="text-xs leading-relaxed"><code className="language-bash">{`# Install Repomix
npm install -g repomix

# Pack repository
repomix . --output codebase.txt

# Inject to AI Coding
# "Here is my full codebase: [codebase.txt]"`}</code></pre>
              <div className="absolute bottom-3 right-3 animate-bounce text-gemini-purple">
                <span className="text-[10px] font-mono">CONFIG & BEST PRACTICES ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Configuration */}
      <Slide backgroundColor="#050505" notes="排除噪音是全量上下文的关键。你不需要 node_modules。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">REPOMIX CONFIGURATION</div>
          <h3 className="text-3xl mb-8 font-bold text-white">排除噪音：精简上下文</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-base opacity-70">
                通过 <code className="text-gemini-cyan px-1 bg-white/5 rounded">repomix.config.json</code>，你可以精确控制哪些文件被打包。
              </p>
              <div className="p-5 bg-white/5 rounded-xl border border-white/10">
                <h4 className="font-bold mb-3 text-white text-sm">建议排除项:</h4>
                <ul className="space-y-1.5 text-xs opacity-60">
                  <li>• node_modules / vendor</li>
                  <li>• .git / .svn</li>
                  <li>• dist / build / out</li>
                  <li>• Large binary files (images, pdfs)</li>
                  <li>• Lock files (package-lock.json)</li>
                </ul>
              </div>
            </div>
            <div className="bg-black/60 p-5 rounded-xl border border-white/10 font-mono text-[10px] text-gemini-purple flex flex-col justify-center">
              <pre>{`{
  "output": {
    "filePath": "repomix-output.txt",
    "style": "markdown"
  },
  "ignore": {
    "customPatterns": [
      "**/node_modules/**",
      "**/*.log",
      "dist/**"
    ]
  }
}`}</pre>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Best Practices */}
      <Slide backgroundColor="#050505" notes="打包只是第一步，如何提问才是关键。">
        <div className="flex flex-col justify-center h-full text-center max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">REPOMIX BEST PRACTICES</div>
          <h3 className="text-3xl mb-8 font-bold text-white">全量上下文的使用艺术</h3>
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-left">
            <div className="p-5 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xl mb-3">📍</div>
              <h4 className="font-bold mb-2 text-sm">明确起点</h4>
              <p className="text-xs opacity-50 leading-relaxed">即使 AI 有全量上下文，也应告知它从哪个模块开始分析。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xl mb-3">🏗️</div>
              <h4 className="font-bold mb-2 text-sm">架构优先</h4>
              <p className="text-xs opacity-50 leading-relaxed">先让 AI 总结整体架构，再进行具体的代码修改。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xl mb-3">🔄</div>
              <h4 className="font-bold mb-2 text-sm">增量更新</h4>
              <p className="text-xs opacity-50 leading-relaxed">重大变更后重新打包，确保 AI 始终基于最新的代码库工作。</p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
