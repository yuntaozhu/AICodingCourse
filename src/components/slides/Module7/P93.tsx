import Slide from "@/components/Slide";

export default function P93() {
  return (
    <Slide backgroundColor="#020205" notes="AI Native 的 ROI 不仅仅是人力成本的降低，更是业务敏捷性的极大提升。当你的研发周期从月缩短到天，甚至小时，你对市场的响应速度将是竞争对手无法企及的。这就是 AI Native 的核心竞争力。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-white italic">超越“代码行数”的 ROI</h2>
        <div className="flex gap-12">
          <div className="flex-1 space-y-8">
            <div className="p-6 bg-gemini-purple/10 rounded-xl border-l-4 border-gemini-purple">
              <h3 className="text-2xl font-bold mb-2 text-gemini-cyan">业务敏捷性</h3>
              <p className="opacity-70">交付周期缩短 10 倍以上，实现“想法即上线”。</p>
            </div>
            <div className="p-6 bg-gemini-purple/10 rounded-xl border-l-4 border-gemini-purple">
              <h3 className="text-2xl font-bold mb-2 text-gemini-cyan">质量确定性</h3>
              <p className="opacity-70">通过评估闭环，实现零线上故障的极致质量。</p>
            </div>
            <div className="p-6 bg-gemini-purple/10 rounded-xl border-l-4 border-gemini-purple">
              <h3 className="text-2xl font-bold mb-2 text-gemini-cyan">创新杠杆</h3>
              <p className="opacity-70">释放人类创造力，从“写代码”转向“解决业务问题”。</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="text-8xl font-bold text-gemini-cyan mb-4">10X+</div>
            <div className="text-xl opacity-50 uppercase tracking-widest">Efficiency Leap</div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
