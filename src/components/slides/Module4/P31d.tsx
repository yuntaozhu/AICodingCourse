import Slide from "@/components/Slide";
import PromptCraftingSandbox from "@/components/sandboxes/PromptCraftingSandbox";

export default function P31d() {
  return (
    <Slide
      backgroundColor="#040711"
      notes="Prompt Crafting Sandbox：输入目标开发任务与必选工程红线，由服务端 Gemini 模型或离线模板生成高质量 .cursor/rules (.mdc) 或 AGENTS.md 配置，支持一键复制进项目。"
    >
      <div className="flex flex-col justify-center h-full">
        <PromptCraftingSandbox />
      </div>
    </Slide>
  );
}
