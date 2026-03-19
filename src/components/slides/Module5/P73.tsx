import Slide from "@/components/Slide";

export default function P73() {
  return (
    <Slide backgroundColor="#020205" notes="来看一个真实的案例。在某金融项目中，我们实现了自动化的 Bug 修复流水线。当线上监控发现异常时，系统自动定位代码，生成修复 PR，并通过多维评估闭环进行验证。整个过程无需人工干预，修复时间从小时级缩短到分钟级。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-white">案例研究：<span className="text-gemini-cyan">自动化 Bug 修复</span></h2>
        <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
          <div className="flex justify-between mb-8 items-center">
            <div className="text-sm font-mono text-gemini-purple">Project: FinTech-Core-v4</div>
            <div className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/40">Success Case</div>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <p className="text-lg">1. 监控发现异常：支付接口超时 (P0)</p>
            </div>
            <div className="flex gap-4 items-center">
              <div className="w-4 h-4 rounded-full bg-gemini-purple"></div>
              <p className="text-lg">2. AI 自动定位：定位到数据库连接池溢出</p>
            </div>
            <div className="flex gap-4 items-center">
              <div className="w-4 h-4 rounded-full bg-gemini-purple"></div>
              <p className="text-lg">3. AI 生成修复：优化连接释放逻辑并增加重试</p>
            </div>
            <div className="flex gap-4 items-center">
              <div className="w-4 h-4 rounded-full bg-gemini-cyan"></div>
              <p className="text-lg font-bold">4. 评估闭环：通过语义验证、压力测试、安全扫描</p>
            </div>
            <div className="flex gap-4 items-center">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <p className="text-lg">5. 自动部署：PR 自动合并，线上故障恢复</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 flex justify-around text-center">
            <div>
              <div className="text-3xl font-bold text-gemini-cyan">120min → 4min</div>
              <div className="text-xs opacity-50">MTTR 缩短</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gemini-cyan">0</div>
              <div className="text-xs opacity-50">人工干预</div>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
