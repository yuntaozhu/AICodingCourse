import Slide from "@/components/Slide";

export default function P84b() {
  return (
    <Slide backgroundColor="#020205" notes="Gemini 3.1 的 Browser Use 能力让 AI 代理能够像人类一样操作浏览器。这不仅仅是运行脚本，而是 AI 能够理解页面布局、点击按钮、填写表单，并实时验证复杂的业务流程。通过 Playwright 或 Selenium，代理可以跨越不同的状态和交互，确保动态应用的每一处细节都符合预期。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-gemini-cyan italic">Browser Use：自主 E2E 验证</h2>
        
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-xl font-bold mb-4 text-gemini-purple">Agentic Browser Control</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gemini-cyan/20 rounded flex items-center justify-center text-xs">🖱️</div>
                  <span className="text-sm opacity-80">视觉感知与元素定位 (Playwright/Selenium)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gemini-cyan/20 rounded flex items-center justify-center text-xs">⌨️</div>
                  <span className="text-sm opacity-80">模拟复杂用户交互与多状态流转</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gemini-cyan/20 rounded flex items-center justify-center text-xs">👁️</div>
                  <span className="text-sm opacity-80">实时视觉断言与异常捕获</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gemini-purple/10 rounded-2xl border border-gemini-purple/30">
              <div className="text-xs font-mono text-gemini-cyan mb-2 uppercase tracking-widest">Capability</div>
              <p className="text-sm italic opacity-80">
                "Agent can autonomously navigate to the checkout page, fill in dynamic forms, and verify the final order state."
              </p>
            </div>
          </div>

          <div className="relative bg-black/40 rounded-3xl border border-white/10 overflow-hidden flex flex-col">
            <div className="bg-white/10 p-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
              </div>
              <div className="bg-black/40 px-3 py-1 rounded text-[10px] text-white/40 font-mono flex-1">
                https://app.internal/checkout
              </div>
            </div>
            <div className="flex-1 p-6 font-mono text-[10px] space-y-2 text-gemini-cyan/80">
              <div className="text-white/40"># Gemini 3.1 Browser Session</div>
              <div>{`> `}page.goto('/checkout')</div>
              <div>{`> `}page.fill('#email', 'user@example.com')</div>
              <div>{`> `}page.click('text=Proceed to Payment')</div>
              <div className="text-yellow-400 font-bold animate-pulse">! AI Reasoning: "Detecting dynamic loading spinner..."</div>
              <div>{`> `}await page.waitForSelector('.success-message')</div>
              <div className="text-green-400 font-bold">✓ Verification Passed: Order #12345 confirmed.</div>
            </div>
            <div className="p-4 bg-gemini-purple/20 border-t border-white/10 text-center">
              <span className="text-xs font-bold text-white uppercase tracking-widest">Autonomous E2E Flow</span>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
