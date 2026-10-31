import { Sparkles, MapPin, Wallet, Mail } from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI event planning",
    text: "A personalised budget, preparation timeline and vendor checklist shaped around your event.",
  },
  {
    icon: MapPin,
    title: "Venue discovery",
    text: "Find real venues around your chosen area, compare them and save your favourite.",
  },
  {
    icon: Wallet,
    title: "Budget management",
    text: "Every rupee mapped to a category — and a copilot that reshapes it when things change.",
  },
  {
    icon: Mail,
    title: "Invitation studio",
    text: "Design an invitation in nine elegant templates and download it as PDF, PNG or JPEG.",
  },
];

export default function FeatureGrid() {
  return (
    <section className="px-5 py-4 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-end justify-between gap-6 reveal">
          <h2 className="max-w-md text-[30px] leading-tight text-primary sm:text-[36px]">
            Everything a celebration needs
          </h2>
          <span className="hidden h-px flex-1 bg-border sm:block" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <article
              key={f.title}
              className="reveal card-soft group p-6 transition-all duration-500 hover:-translate-y-1 hover:border-accent/40"
              style={{ transitionDelay: `${i * 70}ms` }}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary transition-colors duration-500 group-hover:bg-accent/15">
                <f.icon className="h-[18px] w-[18px] text-[hsl(40_40%_42%)]" />
              </span>
              <h3 className="mt-5 text-[19px] text-primary">{f.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">{f.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}