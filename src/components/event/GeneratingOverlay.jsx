import { useEffect, useState } from "react";

const STEPS = [
  "Reading your event details",
  "Weighing your budget",
  "Building a timeline",
  "Choosing vendor categories",
  "Adding personalised ideas",
];

export default function GeneratingOverlay({ active }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) return;
    setIndex(0);
    const timer = setInterval(() => setIndex((i) => (i + 1) % STEPS.length), 1500);
    return () => clearInterval(timer);
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/92 px-5 backdrop-blur-sm">
      <div className="w-full max-w-sm text-center">
        <p className="eyebrow">Composing your plan</p>
        <h2 className="mt-3 text-[26px] leading-tight text-primary">A moment of quiet planning</h2>
        <div className="mt-6 h-[3px] overflow-hidden rounded-full bg-border">
          <div className="h-full w-1/3 animate-[shimmerBar_1.6s_ease-in-out_infinite] rounded-full bg-accent" />
        </div>
        <p key={index} className="mt-5 animate-fade text-[13px] text-muted-foreground">
          {STEPS[index]}…
        </p>
      </div>
    </div>
  );
}