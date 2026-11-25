import Slide from "@/components/Slide";

export default function V4() {
  return (
    <section>
      {/* Main Slide: Chapter 13, 14, 15 - 45% AI Security Warning, Auth & Deployment */}
      <Slide
        backgroundColor="#040711"
        notes="Handbook 第 13–15 章最发人深省的数据：研究显示 45% AI 生成代码包含安全漏洞；功能能跑绝不等于系统安全。"
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-rose-400 mb-2">
            CHAPTER 13, 14 &amp; 15 · SECURITY WARNING · AUTH &amp; DEPLOYMENT
          </div>
          <h2 className="text-4xl font-bold text-white mb-5">
            警钟：<span className="text-rose-400">45% AI 代码含漏洞</span>——功能可用 ≠ 生产安全
          </h2>

          <div className="grid grid-cols-12 gap-5 text-xs">
            {/* Left: 6 Security Rules */}
            <div className="col-span-7 p-5 rounded-2xl bg-[#0b0f19] border border-rose-500/35 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-rose-400">VIBE CODING 六大安全红线（不可后补）</span>
                <span className="font-mono text-slate-400 tabular-nums">1,645 应用检出 170 高危漏洞</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-slate-200">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <strong className="text-white">1. 永不信任客户端数据：</strong>
                  浏览器 DevTools 可改任何请求体，服务端必须二次鉴权查价。
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <strong className="text-white">2. 绝不向前端暴露密钥：</strong>
                  API/DB 密钥只放服务端 <code className="text-gemini-cyan">.env</code>，严禁打进 Vite/浏览器 bundle。
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <strong className="text-white">3. 严禁明文存密码：</strong>
                  必须 bcrypt 不可逆哈希，或交给 Supabase Auth / Clerk 托管。
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <strong className="text-white">4. 强制全链路 HTTPS：</strong>
                  防同网段监听令牌（Vercel / Netlify / Railway 默认自带）。
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <strong className="text-white">5. Zod 全入口校验：</strong>
                  表单、API 参数、启动环境变量全部校验类型、长度与格式。
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <strong className="text-white">6. 用 ORM 防 SQL 注入：</strong>
                  Drizzle / Prisma 自动参数化，禁止在查询语句中拼接字符串。
                </div>
              </div>
            </div>

            {/* Right: Auth & Deployment Matrix */}
            <div className="col-span-5 space-y-3">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="font-mono text-gemini-cyan">身份认证选型矩阵（本平台采用 Email OTP + Firebase Auth）</div>
                <div className="space-y-1 text-slate-300">
                  <div><strong className="text-white">Email 6 位 OTP + HMAC Bearer：</strong>国内直连首选（本平台主登录通道）</div>
                  <div><strong className="text-white">Firebase Auth：</strong>Google / 移动生态与可信 ID Token 校验（本平台备选通道）</div>
                  <div><strong className="text-white">Supabase Auth / Auth.js：</strong>开源自托管 / Postgres 绑定场景</div>
                  <div><strong className="text-white">Clerk（历史参考项）：</strong>纯海外托管 UI 方案，本系统不依赖</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="font-mono text-emerald-400">Git push 即上线矩阵（CH.13 &amp; 15）</div>
                <div className="space-y-1 text-slate-300">
                  <div><strong className="text-white">Vercel / Netlify：</strong>前端 SPA / Next.js / Astro + Serverless，PR 自动生预览 URL</div>
                  <div><strong className="text-white">Railway / Render：</strong>常驻 Express 后端、Docker 容器、PostgreSQL &amp; Redis</div>
                  <div><strong className="text-white">AWS / GCP / Azure：</strong>规模化后降本或复杂合规基础设施再用</div>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs font-mono text-slate-400">
            ↓ 向下查看 2026 AI Coding 工具矩阵与 Vibe Coding 的“诚实能力边界”（Ch.17）
          </p>
        </div>
      </Slide>

      {/* Vertical Sub Slide 1: Chapter 17 - 2026 AI Tools Landscape & Honest Limits */}
      <Slide
        backgroundColor="#050814"
        notes="Handbook 第 17 章用客观数据标明 Vibe Coding 的甜蜜区与诚实边界：Vibe Code 出 MVP v1，然后用工程化审查加固进生产。"
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-purple mb-2">
            CHAPTER 17 · VIBE CODING &amp; 2026 TOOLS LANDSCAPE
          </div>
          <h3 className="text-3xl font-bold text-white mb-5">
            2026 工具全景图 &amp; Vibe Coding 的诚实生产边界
          </h3>

          <div className="grid grid-cols-12 gap-5 text-xs">
            <div className="col-span-7 p-5 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-gemini-cyan">主流 7 大 AI 编码工具定位对比</span>
                <span className="font-mono text-slate-400 tabular-nums">92% 美国开发者日用 · 41% 代码 AI 生成</span>
              </div>
              <div className="space-y-1.5 text-slate-300">
                <div><strong className="text-white">Cursor / Windsurf：</strong>专业 AI 原生 IDE，掌握全仓库语义与 Rules/MCP 工程护栏</div>
                <div><strong className="text-white">Claude Code：</strong>终端原生智能体，擅长跨目录复杂任务与大仓库深度推理</div>
                <div><strong className="text-white">Google AI Studio / Bolt.new / Lovable：</strong>浏览器内零配置秒出原型与精美 UI</div>
                <div><strong className="text-white">Replit / GitHub Copilot：</strong>在线协作即部署 vs 编辑器内逐行自动补全</div>
              </div>
            </div>

            <div className="col-span-5 p-5 rounded-2xl bg-amber-500/10 border border-amber-400/35 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="font-mono text-amber-300">THE HONEST LIMITS · 诚实边界结论</div>
                <p className="text-slate-200 leading-relaxed">
                  Vibe Coding 非常适合原型验证、个人效率工具与早期 MVP（书中统计 <strong className="text-white">63% 使用者为非传统程序员</strong>）。
                </p>
                <p className="text-slate-300 leading-relaxed">
                  但一旦涉及真实用户支付、敏感数据或千人并发，就必须用本课程教给你的 <strong className="text-white">Plan + .mdc 护栏 + Bugbot + 安全复核</strong> 对 v1 进行工程加固，而非把它当成盲盒黑箱直接上线。
                </p>
              </div>
              <div className="pt-2 border-t border-white/10 text-[11px] font-mono text-gemini-cyan">
                → 右滑进入 Lab 07：14 岗全栈装配与 8 大报错解码台
              </div>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
