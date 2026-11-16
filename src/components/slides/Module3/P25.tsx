import Slide from "@/components/Slide";

export default function P25() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="跨模态 UI 是未来的趋势。AI 可以生成跨模态 UI。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-gemini-cyan glow-text">
            跨模态 UI：AI 的设计
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col justify-center gap-4">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                <h3 className="text-xl mb-2 font-bold text-gemini-cyan text-sm">Multi-modal UI Design</h3>
                <p className="text-xs opacity-60 leading-relaxed">AI 正在重新定义人机交互。它设计的 UI 不再局限于屏幕点击，而是无缝整合了语音、手势和视觉识别。</p>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                <h3 className="text-xl mb-2 font-bold text-gemini-purple text-sm">Adaptive UI Generation</h3>
                <p className="text-xs opacity-60 leading-relaxed">UI 不再是静态的。AI 根据用户的操作习惯、环境光线甚至情绪状态，动态调整布局、配色和交互深度。</p>
              </div>
            </div>
            <div className="flex items-center justify-center relative">
              <div className="w-full h-64 bg-gemini-cyan/5 border border-gemini-cyan/20 rounded-3xl flex items-center justify-center overflow-hidden">
                 <div className="relative w-full h-full flex items-center justify-center text-center p-6">
                   <div className="space-y-3">
                     <div className="text-3xl animate-pulse">🎨</div>
                     <div className="text-lg font-mono text-gemini-cyan">Adaptive Interface</div>
                     <div className="text-[10px] opacity-40">"Synchronizing voice, touch, and vision..."</div>
                   </div>
                 </div>
              </div>
              <div className="absolute bottom-4 right-4 animate-bounce text-gemini-cyan">
                <span className="text-[10px] font-mono">MODALITY INTEGRATION ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Voice & Gesture Integration */}
      <Slide backgroundColor="#050505" notes="AI 能够协调多种输入方式，提供自然的交互体验。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">MODALITY INTEGRATION</div>
          <h3 className="text-3xl mb-8 font-bold text-white">多模态融合：自然交互</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">语音与视觉协同</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                用户可以指着屏幕说“把这个移到那里”，AI 结合视觉追踪和语义理解，精准执行跨模态指令。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-purple">无接触手势控制</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                AI 通过摄像头捕捉细微的手势动作，将其转化为精准的 UI 操作，适用于车载、医疗等特殊场景。
              </p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Contextual UI Adaptation */}
      <Slide backgroundColor="#050505" notes="UI 能够根据环境自动演进，提供最合适的界面。">
        <div className="flex flex-col justify-center h-full text-center max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">CONTEXTUAL ADAPTATION</div>
          <h3 className="text-3xl mb-10 font-bold text-white">情境自适应：懂你所想</h3>
          <div className="max-w-5xl mx-auto grid grid-cols-3 gap-6">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xl mb-3">🕒</div>
              <h4 className="font-bold mb-2 text-sm">时间与任务感知</h4>
              <p className="text-[10px] opacity-50">工作时间侧重效率工具，休息时间侧重娱乐内容，UI 随任务自动切换。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xl mb-3">📍</div>
              <h4 className="font-bold mb-2 text-sm">地理位置感知</h4>
              <p className="text-[10px] opacity-50">根据用户所处位置（办公室、家中、户外），自动呈现最相关的操作入口。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xl mb-3">🔋</div>
              <h4 className="font-bold mb-2 text-sm">设备状态感知</h4>
              <p className="text-[10px] opacity-50">低电量或弱网环境下，UI 自动切换为极简模式，确保核心功能可用。</p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
