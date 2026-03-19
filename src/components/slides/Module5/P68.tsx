import Slide from "@/components/Slide";

export default function P68() {
  return (
    <Slide backgroundColor="#020205" notes="Gemini 3.1 的强大之处在于它不仅能写代码，还能‘评判’代码。通过 LLM-as-a-Judge，我们可以构建一个多维度的评估矩阵：从代码风格、逻辑正确性到安全性，全部自动化。这不仅是提效，更是质量的飞跃。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-8 font-bold text-gemini-cyan italic">LLM-as-a-Judge：架构裁判实战</h2>
        
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xs font-mono text-gemini-purple mb-2 uppercase tracking-widest">Input Code (Legacy Style)</div>
              <pre className="text-[10px] leading-tight opacity-70 overflow-hidden">
                <code>{`class UserHandler {
  saveUser(user) {
    if (user.isValid()) {
      db.save(user);
      email.sendWelcome(user);
      logger.log("User saved: " + user.id);
    }
  }
  // ... more mixed responsibilities
}`}</code>
              </pre>
            </div>
            
            <div className="p-4 bg-gemini-purple/10 rounded-xl border border-gemini-purple/30">
              <div className="text-xs font-mono text-gemini-cyan mb-2 uppercase tracking-widest">Judge Prompt</div>
              <p className="text-[11px] italic opacity-80">
                "Evaluate this code against SOLID and DRY principles. Provide a score (0-100) and specific violations."
              </p>
            </div>
          </div>

          <div className="p-6 bg-black/40 rounded-2xl border border-gemini-cyan/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <div className="text-4xl font-bold text-red-400">65<span className="text-sm opacity-50">/100</span></div>
            </div>
            <div className="text-xs font-mono text-gemini-cyan mb-4 uppercase tracking-widest">Judge Report (Gemini 3.1)</div>
            
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 bg-red-500/20 rounded flex items-center justify-center text-[10px] text-red-400 font-bold">!</div>
                <div>
                  <h4 className="text-sm font-bold text-white">SRP Violation (Single Responsibility)</h4>
                  <p className="text-[10px] opacity-60">UserHandler handles persistence, notification, and logging. Should be decoupled into separate services.</p>
                </div>
              </div>
              
              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 bg-yellow-500/20 rounded flex items-center justify-center text-[10px] text-yellow-400 font-bold">W</div>
                <div>
                  <h4 className="text-sm font-bold text-white">DIP Violation (Dependency Inversion)</h4>
                  <p className="text-[10px] opacity-60">Hardcoded 'db' and 'email' instances. Use Dependency Injection to improve testability.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 bg-green-500/20 rounded flex items-center justify-center text-[10px] text-green-400 font-bold">✓</div>
                <div>
                  <h4 className="text-sm font-bold text-white">DRY Compliance</h4>
                  <p className="text-[10px] opacity-60">No obvious code duplication in this snippet.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="text-[10px] text-gemini-purple font-bold">Suggested Refactoring:</div>
              <p className="text-[9px] opacity-50 italic">"Extract EmailService and LoggerService. Inject them into a UserService."</p>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
