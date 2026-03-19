import Slide from "@/components/Slide";

export default function P15() {
  return (
    <Slide notes="全量代码库理解让新员工入职变得简单。AI 可以解释整个系统。">
      <h2 className="text-6xl mb-8">AI 辅助入职：系统全解</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col justify-center gap-4">
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-xl mb-2">System Explanation</h3>
            <p className="text-sm opacity-70">AI 解释整个系统的架构和关键流程。</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-xl mb-2">Code Walkthrough</h3>
            <p className="text-sm opacity-70">AI 带领新员工走读关键代码模块。</p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full h-64 bg-gemini-cyan/10 border border-gemini-cyan/30 rounded-lg flex items-center justify-center">
             <span className="text-2xl font-mono text-gemini-cyan">AI Onboarding Assistant</span>
          </div>
        </div>
      </div>
    </Slide>
  );
}
