import Slide from "@/components/Slide";
import ContextSliceSandbox from "@/components/sandboxes/ContextSliceSandbox";

export default function P12e() {
  return (
    <Slide
      backgroundColor="#040711"
      notes="Lab 17 · 上下文切片与 Token 预算沙盘：围绕具体跨模块需求组装最小高信噪比上下文切片，排除 dist/、*.lock、legacy-v1 与 .env 噪音，体会 Context Rot 临界点。"
    >
      <div className="flex flex-col justify-center h-full">
        <ContextSliceSandbox />
      </div>
    </Slide>
  );
}
