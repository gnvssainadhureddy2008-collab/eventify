import { Lightbulb } from "lucide-react";

export default function IdeasPanel({ plan }) {
  const ideas = plan?.ideas || [];

  if (!ideas.length) {
    return (
      <div className="card-soft p-6">
        <h3 className="text-[19px] text-primary">Personalised ideas</h3>
        <p className="mt-2 text-[13px] text-muted-foreground">Ideas appear with your generated plan.</p>
      </div>
    );
  }

  const groups = ideas.reduce((acc, idea) => {
    const key = idea.category || "Idea";
    acc[key] = acc[key] || [];
    acc[key].push(idea);
    return acc;
  }, {});

  return (
    <div className="card-soft p-5">
      <h3 className="flex items-center gap-2 text-[19px] text-primary">
        <Lightbulb className="h-4 w-4 text-accent" /> Personalised ideas
      </h3>
      <div className="mt-4 space-y-5">
        {Object.entries(groups).map(([category, items]) => (
          <div key={category}>
            <p className="eyebrow">{category}</p>
            <ul className="mt-2 space-y-2.5">
              {items.map((idea, i) => (
                <li key={`${idea.title}-${i}`} className="rounded-xl bg-secondary/50 p-3">
                  <p className="text-[13px] text-primary">{idea.title}</p>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground">{idea.description}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}