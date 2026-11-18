import Slide from "@/components/Slide";
import VibeStackMasterSandbox from "@/components/sandboxes/VibeStackMasterSandbox";

export default function V5() {
  return (
    <Slide
      backgroundColor="#040711"
      notes="Lab 07 交互沙盘：源自《The Vibe Coder's Handbook (2026)》第 16、18、20 章及 Glossary，支持 14 岗技术栈装配导出给 Cursor Plan Mode、8 大报错精准解码与 32 词速查。"
    >
      <div className="flex flex-col justify-center h-full">
        <VibeStackMasterSandbox />
      </div>
    </Slide>
  );
}
