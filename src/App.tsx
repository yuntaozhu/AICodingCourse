import Presentation from "@/components/Presentation";
import { Module1Slides } from "@/components/slides/Module1";
import { Module2Slides } from "@/components/slides/Module2";
import { Module3Slides } from "@/components/slides/Module3";
import { Module4Slides } from "@/components/slides/Module4";
import { Module5Slides } from "@/components/slides/Module5";
import { Module6Slides } from "@/components/slides/Module6";
import { Module7Slides } from "@/components/slides/Module7";

function App() {
  const allSlides = [
    ...Module1Slides,
    ...Module2Slides,
    ...Module3Slides,
    ...Module4Slides,
    ...Module5Slides,
    ...Module6Slides,
    ...Module7Slides
  ];

  return (
    <main className="h-screen w-screen overflow-hidden">
      <Presentation>
        {allSlides.map((SlideComponent, index) => (
          <SlideComponent key={index} />
        ))}
      </Presentation>
    </main>
  );
}

export default App;
