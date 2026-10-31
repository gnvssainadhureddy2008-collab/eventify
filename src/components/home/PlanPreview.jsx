import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Image } from "@/components/ui/image";
import { IMAGES } from "@/lib/eventTypes";

const STEPS = [
  { n: "01", title: "Tell us the celebration", text: "Type, name, date, guests, budget and anything you need." },
  { n: "02", title: "Pin the location", text: "Search an area or drop a pin — a general area is enough." },
  { n: "03", title: "Receive your plan", text: "Budget, timeline, vendors and ideas — then refine with the copilot." },
];

export default function PlanPreview() {
  return (
    <section className="px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div className="reveal">
          <p className="eyebrow">How planning feels</p>
          <h2 className="mt-4 text-[32px] leading-tight text-primary sm:text-[42px]">
            Three quiet steps,
            <br />
            then everything is in place.
          </h2>
          <ol className="mt-8 space-y-6">
            {STEPS.map((s) => (
              <li key={s.n} className="flex gap-4">
                <span className="serif-display text-[22px] leading-none text-accent">{s.n}</span>
                <div>
                  <h3 className="text-[17px] text-primary">{s.title}</h3>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link
            to="/plan"
            className="group mt-9 inline-flex items-center gap-2 text-sm text-primary transition-colors hover:text-[hsl(40_40%_42%)]"
          >
            Start planning
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="reveal relative">
          <div className="overflow-hidden rounded-[2rem] border border-border/60">
            <Image
              src={IMAGES.anniversary}
              alt="An intimate candlelit anniversary table set for two"
              className="h-[300px] w-full object-cover sm:h-[440px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}