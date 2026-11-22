import Slide from "@/components/Slide";
import RuntimeKbRagSandbox from "@/components/sandboxes/RuntimeKbRagSandbox";

export default function RuntimeKbSlide() {
  return (
    <Slide
      backgroundColor="#040711"
      notes="Lab 18 · 运行时 KB：ACL Pre-filter 与混合检索沙盘。对照“先过滤后检索”与“先召回后用 Prompt 掩盖”在多租户权限隔离和 Tombstone 版本淘汰上的决定性差异。"
    >
      <div className="flex flex-col justify-center h-full">
        <RuntimeKbRagSandbox />
      </div>
    </Slide>
  );
}
