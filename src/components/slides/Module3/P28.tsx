import Slide from "@/components/Slide";

export default function P28() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="借鉴 easy-vibe 最受好评的《写代码时遇到错误怎么办》并结合 Cursor Debug Mode：非资深开发者无需死磕堆栈，核心是把完整现场精准交给 AI 并善用安全回滚。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-xs font-mono text-amber-400 mb-2">
            VIBE DEBUGGING PLAYBOOK · 遇到报错怎么办
          </div>
          <h2 className="text-4xl mb-6 font-bold tracking-tight text-white">
            实战：Cursor <span className="text-gemini-cyan">Debug 三步排障法</span>与安全回滚
          </h2>
          <div className="grid grid-cols-3 gap-5">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-gemini-cyan mb-2">STEP 01 · 精准描述现象</div>
              <h3 className="text-lg font-bold text-white mb-2">截图 + 预期 vs 实际</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                不要只说“报错了帮我修”。直接把页面截图贴进 Cursor，并说明：我在哪个页面、点了什么按钮、预期出现什么，结果实际发生了什么。
              </p>
              <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-white/10">
                适用：样式错位、按钮没反应、交互不符合直觉
              </div>
            </div>

            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-gemini-purple mb-2">STEP 02 · 补充四大现场</div>
              <h3 className="text-lg font-bold text-white mb-2">Console · Network · Terminal</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                白屏拷贝浏览器 <strong className="text-white">Console 红字</strong>；接口无响应拷贝 <strong className="text-white">Network 状态码与 Response</strong>；后端崩溃在 Cursor 点击 Terminal 旁的 <strong className="text-white">Add to Chat</strong>。
              </p>
              <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-white/10">
                适用：页面白屏、500 报错、端口被占用
              </div>
            </div>

            <div className="p-5 bg-[#0b0f19] rounded-2xl border border-amber-400/40">
              <div className="text-xs font-mono text-amber-400 mb-2">STEP 03 · 止损与规则沉淀</div>
              <h3 className="text-lg font-bold text-white mb-2">Checkpoint 回滚 + 写进规则</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                同一 Bug 连修 3 轮仍越改越乱？立即点 Cursor <strong className="text-white">Restore Checkpoint</strong> 或 <code className="text-white">git checkout</code> 退回绿灯版本，换思路重来，并把根因写入 <code className="text-white">.mdc</code>。
              </p>
              <div className="text-[11px] font-mono text-amber-400 pt-2 border-t border-white/10">
                黄金铁律：先有绿灯 Git 锚点，再做大改动
              </div>
            </div>
          </div>
          <p className="mt-5 text-xs font-mono text-slate-400">
            ↓ 向下查看四类高频报错的 Cursor 一键诊断清单
          </p>
        </div>
      </Slide>

      {/* Sub Slide 1: 4 Common Failure Modes */}
      <Slide
        backgroundColor="#050814"
        notes="高频 4 类 Vibe Coding 排障卡，对应前端白屏、接口跨域、环境变量缺失与类型冲突。"
      >
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-xs font-mono text-gemini-purple mb-2">COMMON ERRORS MATRIX</div>
          <h3 className="text-3xl mb-6 font-bold text-white">
            独立开发最常见的四大故障现场与精准喂料话术
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-red-400 mb-1">CASE A · 页面完全白屏</div>
              <div className="text-sm font-bold text-white mb-1">喂料：F12 Console 报错首行 + 组件文件</div>
              <p className="text-xs text-slate-300">常见于 <code className="text-white">undefined.map</code> 或 SSR/CSR 状态不一致；要求 Cursor 先加空值守卫与 ErrorBoundary。</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-amber-400 mb-1">CASE B · 点按钮没数据 / CORS 报错</div>
              <div className="text-sm font-bold text-white mb-1">喂料：Network 红色请求 Headers + Response</div>
              <p className="text-xs text-slate-300">常见于 Vite 没走服务端代理、端口不一致或缺少 Cookie/Bearer Header。</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-gemini-cyan mb-1">CASE C · 本地能跑、部署后 500</div>
              <div className="text-sm font-bold text-white mb-1">喂料：平台构建日志 + .env.example 核对</div>
              <p className="text-xs text-slate-300">常见于忘记在 Vercel/Zeabur 后台配环境变量，或 Serverless 尝试写入只读文件系统。</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-emerald-400 mb-1">CASE D · 改了 A 文件、B 模块挂了</div>
              <div className="text-sm font-bold text-white mb-1">解法：先跑 npx tsc --noEmit 全量类型检查</div>
              <p className="text-xs text-slate-300">别等浏览器点击才发现崩溃，让 Cursor Agent 把所有报错文件列表一次性全量修完。</p>
            </div>
          </div>
          <div className="mt-5 p-4 rounded-xl bg-[#0b0f19] border border-amber-400/35 flex items-center justify-between gap-4 text-xs text-slate-200">
            <span>
              <strong className="text-amber-300">报错解码黄金法则（Vibe Handbook Ch.18）：</strong>永远先精读报错第一行——90% 的 <code className="text-white">Hydration mismatch</code>、<code className="text-white">ECONNREFUSED</code> 与 <code className="text-white">peer dep</code> 均有固定排障指令。
            </span>
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("reveal:jump-lab", { detail: { labId: "vibe-stack-map" } })
                )
              }
              className="text-gemini-cyan font-mono hover:underline shrink-0 cursor-pointer"
            >
              打开 Lab 07 报错解码器 →
            </button>
          </div>
        </div>
      </Slide>
    </section>
  );
}
