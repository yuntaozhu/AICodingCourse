import { cn } from "@/lib/utils";

interface SlideProps {
  children: React.ReactNode;
  backgroundColor?: string;
  className?: string;
  notes?: string;
}

export default function Slide({ children, backgroundColor, className, notes }: SlideProps) {
  return (
    <section data-background-color={backgroundColor} className={cn("text-left", className)}>
      {children}
      {notes && <aside className="notes">{notes}</aside>}
    </section>
  );
}
