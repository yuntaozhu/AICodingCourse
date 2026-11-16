import Slide from "@/components/Slide";

export default function P98() {
  return (
    <Slide backgroundColor="#020205" notes="现在是提问环节。欢迎大家就 AI Native 研发范式、AI Coding 的应用、或者任何关于未来的想法进行交流。">
      <div className="flex flex-col justify-center items-center h-full text-center">
        <h2 className="text-8xl mb-12 font-bold text-gemini-cyan italic">Q & A</h2>
        <div className="h-1 w-32 bg-gemini-purple mb-12"></div>
        <p className="text-2xl opacity-60">期待您的提问与交流</p>
        <div className="mt-16 flex gap-12">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">💬</div>
            <span className="text-xs opacity-50">Live Chat</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">📧</div>
            <span className="text-xs opacity-50">Email</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">🐦</div>
            <span className="text-xs opacity-50">Twitter</span>
          </div>
        </div>
      </div>
    </Slide>
  );
}
