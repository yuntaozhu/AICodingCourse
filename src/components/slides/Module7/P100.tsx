import Slide from "@/components/Slide";

export default function P100() {
  return (
    <Slide backgroundColor="#020205" notes="感谢大家的聆听。我是您的演讲者，期待在 AI Native 的新纪元与您再次相遇。再见！">
      <div className="flex flex-col justify-center items-center h-full text-center">
        <div className="text-gemini-purple text-6xl mb-8">✨</div>
        <h1 className="text-8xl mb-4 font-bold">THANK YOU</h1>
        <p className="text-2xl text-gemini-cyan font-mono opacity-80 mb-12">AI Coding 研发范式革命 · 2026</p>
        <div className="h-1 w-64 bg-white/10 mb-12"></div>
        <div className="flex gap-12 text-sm opacity-50">
          <span>immanuel.zhu@gmail.com</span>
          <span>github.com/ai-native-2026</span>
          <span>@ainative_expert</span>
        </div>
      </div>
    </Slide>
  );
}
