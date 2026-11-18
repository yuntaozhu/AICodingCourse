import Slide from "@/components/Slide";

export default function P91() {
  return (
    <Slide
      backgroundColor="#020205"
      notes="Module 7 聚焦独立开发者与产品经理在 Cursor 时代的 ROI 效能度量、GitHub 沉淀与项目规则大脑进化。"
    >
      <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
        <div className="text-gemini-purple text-xs font-mono mb-3 tracking-widest uppercase">
          Module 7 · ROI &amp; Architecture Brain
        </div>
        <h1 className="text-5xl md:text-6xl mb-5 leading-tight font-bold text-white">
          ROI 与进化：<br />
          <span className="text-gemini-cyan">从试错成本到架构资产</span>
        </h1>
        <div className="h-1 w-24 bg-gemini-purple mb-6" />
        <p className="text-lg text-slate-300 max-w-3xl leading-relaxed">
          用独立产品真实交付周期、首轮通过率与 <code className="text-white">.cursor/rules</code> / <code className="text-white">SKILL.md</code> 资产复利，衡量 Cursor 时代的产品研发 ROI。
        </p>
      </div>
    </Slide>
  );
}
