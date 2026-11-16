import Slide from "@/components/Slide";

export default function P68() {
  return (
    <section>
      {/* Main Slide */}
      <Slide backgroundColor="#020205" notes="AI Coding 的强大之处在于它不仅能写代码，还能‘评判’代码。通过 LLM-as-a-Judge，我们可以构建一个多维度的评估矩阵：从代码风格、逻辑正确性到安全性，全部自动化。这不仅是提效，更是质量的飞跃。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto px-8">
          <h2 className="text-4xl md:text-5xl mb-8 font-black italic tracking-tighter text-gemini-cyan glow-text leading-tight">
            LLM-as-a-Judge：架构裁判实战
          </h2>
          
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                <div className="text-[10px] font-mono text-gemini-purple mb-3 uppercase tracking-widest opacity-70">Input Code (Legacy Style)</div>
                <pre className="text-xs leading-relaxed opacity-70 overflow-hidden font-mono">
                  <code>{`class UserHandler {
  saveUser(user) {
    if (user.isValid()) {
      db.save(user);
      email.sendWelcome(user);
      logger.log("User saved: " + user.id);
    }
  }
}`}</code>
                </pre>
              </div>
              
              <div className="p-5 bg-gemini-purple/10 rounded-2xl border border-gemini-purple/30 relative">
                <div className="text-[10px] font-mono text-gemini-cyan mb-3 uppercase tracking-widest opacity-70">Judge Prompt</div>
                <p className="text-base italic opacity-80 leading-relaxed">
                  "Evaluate this code against SOLID and DRY principles. Provide a score (0-100) and specific violations."
                </p>
                <div className="absolute -right-4 -bottom-4 animate-bounce text-gemini-cyan">
                  <span className="text-[10px] font-mono">EVALUATION MATRIX ↓</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-black/40 rounded-3xl border border-gemini-cyan/30 relative overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.1)]">
              <div className="absolute top-0 right-0 p-4">
                <div className="text-4xl font-bold text-red-400">65<span className="text-xs opacity-50">/100</span></div>
              </div>
              <div className="text-[10px] font-mono text-gemini-cyan mb-6 uppercase tracking-widest opacity-70">Judge Report (AI Coding)</div>
              
              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <div className="w-5 h-5 bg-red-500/20 rounded-lg flex items-center justify-center text-[10px] text-red-400 font-bold">!</div>
                  <div>
                    <h4 className="text-base font-bold text-white">SRP Violation</h4>
                    <p className="text-xs opacity-60">UserHandler handles persistence, notification, and logging. Should be decoupled into separate services.</p>
                  </div>
                </div>
                
                <div className="flex gap-3 items-start">
                  <div className="w-5 h-5 bg-yellow-500/20 rounded-lg flex items-center justify-center text-[10px] text-yellow-400 font-bold">W</div>
                  <div>
                    <h4 className="text-base font-bold text-white">DIP Violation</h4>
                    <p className="text-xs opacity-60">Hardcoded 'db' and 'email' instances. Use Dependency Injection to improve testability.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-5 h-5 bg-green-500/20 rounded-lg flex items-center justify-center text-[10px] text-green-400 font-bold">✓</div>
                  <div>
                    <h4 className="text-base font-bold text-white">DRY Compliance</h4>
                    <p className="text-xs opacity-60">No obvious code duplication in this snippet.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="text-[10px] text-gemini-purple font-bold mb-1 uppercase tracking-wider">Suggested Refactoring:</div>
                <p className="text-xs opacity-50 italic">"Extract EmailService and LoggerService. Inject them into a UserService."</p>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Evaluation Matrix */}
      <Slide backgroundColor="#050505" notes="详细展示多维度的评估矩阵。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto px-8">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2 tracking-widest">EVALUATION MATRIX</div>
          <h3 className="text-3xl mb-10 font-bold text-white text-center">多维度评估矩阵：全方位的代码体检</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
              <div className="text-3xl mb-4">🔒</div>
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">安全性 (Security)</h4>
              <p className="text-xs opacity-50">注入风险、硬编码密钥、越权漏洞扫描。</p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
              <div className="text-3xl mb-4">⚡</div>
              <h4 className="text-lg font-bold mb-3 text-gemini-purple">性能 (Performance)</h4>
              <p className="text-xs opacity-50">N+1 查询、大对象分配、冗余计算识别。</p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
              <div className="text-3xl mb-4">🏗️</div>
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">可维护性 (Maintainability)</h4>
              <p className="text-xs opacity-50">圈复杂度、耦合度、命名规范、注释质量。</p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Automated Refactoring */}
      <Slide backgroundColor="#050505" notes="展示 AI 如何根据裁判报告自动重构代码。">
        <div className="flex flex-col justify-center h-full max-w-5xl mx-auto px-8">
          <div className="text-[10px] font-mono text-gemini-purple mb-2 tracking-widest">AUTOMATED REFACTORING</div>
          <h3 className="text-3xl mb-10 font-bold text-white text-center">自动重构：从“发现问题”到“解决问题”</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="text-[10px] font-mono opacity-40 uppercase tracking-wider">Before</div>
              <div className="p-5 bg-red-500/5 rounded-2xl border border-red-500/20">
                <pre className="text-[10px] font-mono text-red-400/80 leading-relaxed">
                  <code>{`class UserHandler {
  saveUser(user) {
    if (user.isValid()) {
      db.save(user); // Hardcoded
      email.send(user); // Hardcoded
    }
  }
}`}</code>
                </pre>
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-[10px] font-mono opacity-40 uppercase tracking-wider">After (AI Refactored)</div>
              <div className="p-5 bg-green-500/5 rounded-2xl border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                <pre className="text-[10px] font-mono text-green-400/80 leading-relaxed">
                  <code>{`class UserService {
  constructor(repository, notifier) {
    this.repo = repository;
    this.notifier = notifier;
  }
  async save(user) {
    await this.repo.save(user);
    await this.notifier.welcome(user);
  }
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
