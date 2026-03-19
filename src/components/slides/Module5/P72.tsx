import Slide from "@/components/Slide";

export default function P72() {
  return (
    <Slide backgroundColor="#020205" notes="反馈循环是确定性的核心。当评估发现错误时，系统不应该只是报错，而应该自动将错误信息反馈给生成模型，让它进行自我修正。这种‘错误-反馈-修正’的闭环，是 AI Native 研发提效的关键。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-gemini-purple">反馈闭环：<span className="text-white">从错误到修正</span></h2>
        <div className="relative h-64 w-full">
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-32 h-32 bg-white/5 rounded-full flex items-center justify-center border border-white/20">生成</div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gemini-purple/20 rounded-full flex items-center justify-center border border-gemini-purple/40">评估</div>
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-32 h-32 bg-gemini-cyan/20 rounded-full flex items-center justify-center border border-gemini-cyan/40 text-black font-bold">修正</div>
          
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
            <path d="M128,128 Q256,64 384,128" fill="none" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
            <path d="M384,128 Q512,192 640,128" fill="none" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
            <path d="M640,128 Q384,256 128,128" fill="none" stroke="#00ffff" strokeWidth="3" />
          </svg>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-12">
          <div className="p-6 bg-white/5 rounded-xl">
            <h3 className="text-xl font-bold mb-4 text-red-400">传统模式：中断</h3>
            <p className="opacity-60">报错 → 开发排查 → 手动修改 → 重新提交</p>
          </div>
          <div className="p-6 bg-gemini-cyan/10 rounded-xl">
            <h3 className="text-xl font-bold mb-4 text-gemini-cyan">AI Native：自愈</h3>
            <p className="opacity-80">报错 → 错误上下文反馈 → AI 自动修正 → 重新验证</p>
          </div>
        </div>
      </div>
    </Slide>
  );
}
