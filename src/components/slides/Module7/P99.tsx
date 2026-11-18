import Slide from "@/components/Slide";

export default function P99() {
  return (
    <Slide backgroundColor="#020205" notes="最后，我希望大家今天带走的不仅仅是知识，更是一种行动的勇气。不要等待未来，去定义未来。从今天开始，尝试构建你的第一个 AI Native 评估闭环，开启你的进化之旅。">
      <div className="flex flex-col justify-center items-center h-full text-center">
        <h2 className="text-6xl mb-12 font-bold">定义未来，<span className="text-gemini-purple italic">从今天开始</span></h2>
        <div className="space-y-6 max-w-2xl">
          <p className="text-xl opacity-80">这场革命没有旁观者，只有参与者。</p>
          <div className="p-8 bg-gemini-cyan/10 rounded-3xl border border-gemini-cyan/30">
            <p className="text-2xl font-bold text-gemini-cyan">“最好的预测未来的方式，就是去创造它。”</p>
          </div>
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("reveal:jump-module", { detail: { moduleId: "m8", v: 0 } })
              )
            }
            className="mt-8 px-10 py-3.5 bg-gemini-purple hover:bg-gemini-purple/90 rounded-full text-lg font-bold text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            前往 M8 交互沙盘与案例库 →
          </button>
        </div>
      </div>
    </Slide>
  );
}
