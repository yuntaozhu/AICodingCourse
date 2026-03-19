import Slide from "@/components/Slide";

export default function P12() {
  return (
    <Slide notes="Repomix 是全量代码库理解的利器。它将整个代码库打包成一个文件。">
      <h2 className="text-6xl mb-8">Repomix: 全量代码库打包</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          <p className="text-xl leading-relaxed">
            Repomix 是全量代码库理解的利器。
          </p>
          <ul className="space-y-4 text-lg">
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>打包整个代码库为一个文件</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>保留文件结构和元数据</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>直接注入 Gemini 3.1 上下文</span>
            </li>
          </ul>
        </div>
        <div className="bg-gemini-purple/10 p-6 rounded-lg border border-gemini-purple/30 purple-glow">
          <pre><code className="language-bash">{`# Install Repomix
npm install -g repomix

# Pack repository
repomix . --output codebase.txt

# Inject to Gemini 3.1
# "Here is my full codebase: [codebase.txt]"`}</code></pre>
        </div>
      </div>
    </Slide>
  );
}
