import Slide from "@/components/Slide";
import CodeHealthSimulator from "@/components/sandboxes/CodeHealthSimulator";

export default function P85g() {
  return (
    <Slide
      backgroundColor="#040711"
      notes="Code Health Simulator：可视化对比行内建议、无护栏后台 Agent、Agent+Bugbot 闭环与纯手工基线在多轮迭代中的技术债堆积速度与功能迭代频率交叉演化趋势。"
    >
      <div className="flex flex-col justify-center h-full">
        <CodeHealthSimulator />
      </div>
    </Slide>
  );
}
