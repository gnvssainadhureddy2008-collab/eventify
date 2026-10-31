import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, MapPin } from "lucide-react";
import { Image } from "@/components/ui/image";
import { IMAGES } from "@/lib/eventTypes";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-16">
      <div className="pointer-events-none absolute -left-24 top-24 h-64 w-64 rounded-full bg-[hsl(40_47%_56%/0.14)] blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-[hsl(6_44%_71%/0.18)] blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div className="animate-rise">
          <p className="eyebrow">Celebration &amp; event planning</p>
          <h1 className="mt-5 text-[44px] leading-[1.04] tracking-tight text-primary sm:text-[62px] lg:text-[70px]">
            Make Every
            <br />
            <span className="italic text-[hsl(40_40%_42%)]">Celebration</span> Special.
          </h1>
          <p className="mt-6 max-w-lg text-[15.5px] leading-relaxed text-muted-foreground">
            Plan beautiful events, manage your budget, discover venues, and create invitations — all in one place.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              to="/plan"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm text-primary-foreground transition-all duration-300 hover:shadow-[0_18px_36px_-20px_hsl(320_27%_20%)]"
            >
              Create Event
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3.5 text-sm text-primary transition-colors duration-300 hover:border-accent/60 hover:bg-card"
            >
              My Events
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-[12.5px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> AI-built budget &amp; timeline
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-accent" /> Venues near your address
            </span>
          </div>
        </div>

        <div className="relative animate-fade">
          <div className="overflow-hidden rounded-[2rem] border border-border/60 shadow-[0_40px_80px_-50px_hsl(320_25%_20%)]">
            <Image
              src={IMAGES.hero}
              alt="Elegant candlelit reception table with ivory linen, roses and champagne-gold details"
              className="h-[380px] w-full object-cover sm:h-[460px] lg:h-[520px]"
              fittingType="fill"
            />
          </div>
        </div>
      </div>
    </section>
  );
}