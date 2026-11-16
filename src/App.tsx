import Presentation, { type ModuleNavItem } from "@/components/Presentation";
import { Module1Slides } from "@/components/slides/Module1";
import { Module2Slides } from "@/components/slides/Module2";
import { Module3Slides } from "@/components/slides/Module3";
import { Module4Slides } from "@/components/slides/Module4";
import { Module5Slides } from "@/components/slides/Module5";
import { Module6Slides } from "@/components/slides/Module6";
import { Module7Slides } from "@/components/slides/Module7";
import { Module8Slides } from "@/components/slides/Module8";

function App() {
  const moduleGroups = [
    { id: "m1", label: "M1 范式革命", title: "Module 1: AI Coding 研发范式革命", slides: Module1Slides },
    { id: "m2", label: "M2 全量理解", title: "Module 2: 全量代码库理解", slides: Module2Slides },
    { id: "m3", label: "M3 研发实战", title: "Module 3: 研发实战练习", slides: Module3Slides },
    { id: "m4", label: "M4 Agent架构", title: "Module 4: SDD 与 Agent 工程架构", slides: Module4Slides },
    { id: "m5", label: "M5 评估闭环", title: "Module 5: 评估闭环与 DoD", slides: Module5Slides },
    { id: "m6", label: "M6 CI/CD革命", title: "Module 6: Issue-to-PR 零干预流水线", slides: Module6Slides },
    { id: "m7", label: "M7 ROI与进化", title: "Module 7: ROI 与架构大脑", slides: Module7Slides },
    { id: "m8", label: "M8 2026升级", title: "Module 8: 2026 课程更新计划 & AI Studio 案例库", slides: Module8Slides },
  ];

  let runningIndex = 0;
  const modules: ModuleNavItem[] = moduleGroups.map((group) => {
    const item: ModuleNavItem = {
      id: group.id,
      label: group.label,
      title: group.title,
      startIndex: runningIndex,
    };
    runningIndex += group.slides.length;
    return item;
  });

  const allSlides = moduleGroups.flatMap((group) => group.slides);

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#020205]">
      <Presentation modules={modules}>
        {allSlides.map((SlideComponent, index) => (
          <SlideComponent key={index} />
        ))}
      </Presentation>
    </main>
  );
}

export default App;
