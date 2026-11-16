import Slide from "@/components/Slide";

export default function P18() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="全量代码库理解让文档生成变得自动化。AI 可以生成高质量文档。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-gemini-purple glow-text">
            文档生成：AI 的写作
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <p className="text-xl leading-relaxed font-light opacity-80">
                全量代码库理解让文档生成从“负担”变为“资产”。AI 能够实时同步代码变更，确保文档永不过时。
              </p>
              <ul className="space-y-4 text-lg">
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-cyan group-hover:scale-125 transition-transform text-sm">▶</span>
                  <span className="font-bold text-sm">生成 API 接口文档</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-cyan group-hover:scale-125 transition-transform text-sm">▶</span>
                  <span className="font-bold text-sm">生成系统架构文档</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-cyan group-hover:scale-125 transition-transform text-sm">▶</span>
                  <span className="font-bold text-sm">生成用户操作手册</span>
                </li>
              </ul>
            </div>
            <div className="bg-gemini-purple/5 p-6 rounded-3xl border border-gemini-purple/20 purple-glow relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gemini-purple to-transparent opacity-50"></div>
              <pre className="text-xs font-mono text-gemini-purple/80">
                <code className="language-markdown">{`# API Documentation
# Endpoint: /api/auth
# Method: POST
# Description: User login
# Parameters: 
#   - email: string (required)
#   - password: string (required)
# Response: 200 OK { token: string }`}</code>
              </pre>
              <div className="absolute bottom-4 right-4 animate-bounce text-gemini-purple">
                <span className="text-[10px] font-mono">LIVING DOCS ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Living Documentation */}
      <Slide backgroundColor="#050505" notes="文档不再是静态的，而是随着代码一起演进。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-purple mb-2">LIVING DOCUMENTATION</div>
          <h3 className="text-3xl mb-8 font-bold text-white">文档即代码：实时演进</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">自动同步</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                每当代码发生变更（PR 合并），AI 自动分析影响范围并更新相关文档。告别“代码改了，文档忘了”的尴尬。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-purple">深度语义理解</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                AI 不仅仅是提取注释，它能理解代码的真实意图，生成包含业务逻辑、边界条件和使用示例的高质量文档。
              </p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Multi-Perspective Documentation */}
      <Slide backgroundColor="#050505" notes="AI 可以为不同的人生成不同的文档。">
        <div className="flex flex-col justify-center h-full text-center max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-purple mb-2">MULTI-PERSPECTIVE</div>
          <h3 className="text-3xl mb-10 font-bold text-white">多维视角：按需生成</h3>
          <div className="max-w-5xl mx-auto grid grid-cols-3 gap-6">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xl mb-3">👨‍💻</div>
              <h4 className="font-bold mb-2 text-sm">开发者视角</h4>
              <p className="text-[10px] opacity-50">侧重于实现细节、类图、调用栈和异常处理。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xl mb-3">📋</div>
              <h4 className="font-bold mb-2 text-sm">产品经理视角</h4>
              <p className="text-[10px] opacity-50">侧重于业务流程、功能清单和用户价值。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xl mb-3">👤</div>
              <h4 className="font-bold mb-2 text-sm">最终用户视角</h4>
              <p className="text-[10px] opacity-50">侧重于操作步骤、常见问题和最佳实践。</p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
