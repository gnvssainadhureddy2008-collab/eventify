import { useEffect, useState } from "react";

export default function OpeningVeil() {
  const [stage, setStage] = useState("in");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStage("gone");
      return;
    }
    const fadeOut = setTimeout(() => setStage("out"), 1250);
    const remove = setTimeout(() => setStage("gone"), 2050);
    return () => {
      clearTimeout(fadeOut);
      clearTimeout(remove);
    };
  }, []);

  if (stage === "gone") return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[70] flex items-center justify-center bg-background transition-opacity duration-700 ease-out ${
        stage === "out" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center px-6 text-center">
        <span className="serif-display animate-fade text-4xl tracking-tight text-primary sm:text-5xl">Aurelia</span>
        <span className="mt-4 block h-px w-40 origin-left bg-accent/70 animate-draw" />
        <span className="mt-4 text-[10px] uppercase tracking-[0.4em] text-muted-foreground/80">
          Celebrations
        </span>
      </div>
    </div>
  );
}