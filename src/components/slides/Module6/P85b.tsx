import Slide from "@/components/Slide";

export default function P85b() {
  return (
    <Slide backgroundColor="#020205" notes="依赖管理不再是‘人肉升级’。通过自主代理，我们可以实现从检测到升级、验证、回归测试的全流程自动化。AI 不仅会帮你更新版本号，还会通过 Browser Use 验证 UI 兼容性，确保每一次升级都是‘零风险’的。这是研发效能的终极飞跃。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-gemini-cyan italic">自主依赖演进：从 Dependabot 到 AI-Renovate</h2>
        
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-xl font-bold mb-4 text-gemini-purple">Autonomous Dependency Loop</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gemini-cyan/20 rounded flex items-center justify-center text-xs">🕒</div>
                  <span className="text-sm opacity-80">Cron Job: 自动扫描 package.json 漏洞与过期</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gemini-cyan/20 rounded flex items-center justify-center text-xs">🛠️</div>
                  <span className="text-sm opacity-80">AI-Agent: 自动生成升级 PR 并解决 Breaking Changes</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gemini-cyan/20 rounded flex items-center justify-center text-xs">🧪</div>
                  <span className="text-sm opacity-80">Verification: 触发 Browser Use E2E 验证与回归测试</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gemini-purple/10 rounded-2xl border border-gemini-purple/30">
              <div className="text-xs font-mono text-gemini-cyan mb-2 uppercase tracking-widest">Cron Logic (Simulated)</div>
              <pre className="text-[10px] leading-tight opacity-70 overflow-hidden font-mono">
                <code>{`# cron-dependency-check.yml
on:
  schedule:
    - cron: '0 0 * * *' # Daily at midnight
jobs:
  update-deps:
    runs-on: ai-native-runner
    steps:
      - uses: ai-native/renovate-agent@v1
        with:
          token: \${{ secrets.AI_TOKEN }}
          auto-merge: true # If E2E passes
`}</code>
              </pre>
            </div>
          </div>

          <div className="relative bg-black/40 rounded-3xl border border-white/10 overflow-hidden flex flex-col">
            <div className="bg-white/10 p-3 flex items-center gap-2">
              <div className="px-2 py-1 bg-gemini-purple/20 text-gemini-purple rounded text-[10px] font-mono">PR #1235</div>
              <div className="bg-black/40 px-3 py-1 rounded text-[10px] text-white/40 font-mono flex-1">
                chore(deps): bump vite from 5.0.0 to 6.0.0
              </div>
            </div>
            <div className="flex-1 p-6 font-mono text-[10px] space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-white/40">Status</span>
                <span className="text-green-400 font-bold">● PASSING</span>
              </div>
              
              <div className="space-y-2">
                <div className="text-gemini-cyan"># AI Agent Summary:</div>
                <p className="text-[9px] opacity-60 leading-relaxed">
                  "Detected Vite 6.0 upgrade. Automatically updated vite.config.ts to use new plugin API. 
                  Triggered Browser Use E2E: 124/124 tests passed. No visual regressions detected."
                </p>
              </div>

              <div className="p-3 bg-white/5 rounded border border-white/10 space-y-2">
                <div className="text-[9px] text-gemini-purple uppercase tracking-widest">E2E Verification Report</div>
                <div className="flex justify-between text-[8px] opacity-50">
                  <span>Home Page</span>
                  <span className="text-green-400">✓ OK</span>
                </div>
                <div className="flex justify-between text-[8px] opacity-50">
                  <span>Checkout Flow</span>
                  <span className="text-green-400">✓ OK</span>
                </div>
                <div className="flex justify-between text-[8px] opacity-50">
                  <span>Responsive Layout</span>
                  <span className="text-green-400">✓ OK</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-500/20 border-t border-white/10 text-center">
              <span className="text-xs font-bold text-white uppercase tracking-widest">Autonomous Auto-Merge Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
