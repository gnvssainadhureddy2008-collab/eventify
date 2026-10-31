import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import OpeningVeil from "@/components/home/OpeningVeil";
import Hero from "@/components/home/Hero";
import FeatureGrid from "@/components/home/FeatureGrid";
import PlanPreview from "@/components/home/PlanPreview";
import { useReveal } from "@/lib/useReveal";

export const Route = createFileRoute("/_authed/")({
  head: () => ({
    meta: [
      { title: "Aurelia — Make Every Celebration Special" },
      {
        name: "description",
        content:
          "Plan weddings, birthdays, festivals and corporate events: AI-built budgets and timelines, real venue discovery, and beautiful downloadable invitations.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  useReveal();

  return (
    <div>
      <OpeningVeil />
      <Hero />
      <FeatureGrid />
      <PlanPreview />

      <section className="px-5 pb-8 sm:px-8">
        <div className="reveal mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-border/60 bg-secondary/50 px-6 py-12 text-center sm:px-12 sm:py-16">
          <p className="eyebrow">Ready when you are</p>
          <h2 className="mx-auto mt-4 max-w-xl text-[30px] leading-tight text-primary sm:text-[38px]">
            Your next celebration deserves a plan that fits it.
          </h2>
          <Link
            to="/plan"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm text-primary-foreground transition-all duration-300 hover:shadow-[0_18px_36px_-20px_hsl(320_27%_20%)]"
          >
            Create Event
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}