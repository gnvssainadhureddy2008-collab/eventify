import { useState } from "react";
import { Check, Plus, Trash2, CalendarClock } from "lucide-react";
import { formatShortDate, parseDateOnly } from "@/lib/format";

function priorityStyle(priority) {
  if (priority === "High") return "bg-[hsl(356_62%_46%/0.12)] text-[hsl(356_55%_38%)]";
  if (priority === "Low") return "bg-secondary text-muted-foreground";
  return "bg-[hsl(40_47%_56%/0.16)] text-[hsl(38_45%_34%)]";
}

export default function TimelinePanel({ plan, onChange, eventDate }) {
  const tasks = plan?.timeline || [];
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState("Medium");
  const done = tasks.filter((t) => t.done).length;

  const sorted = [...tasks].sort((a, b) => String(a.due_date).localeCompare(String(b.due_date)));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function toggle(id) {
    onChange({ timeline: tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) });
  }

  function remove(id) {
    onChange({ timeline: tasks.filter((t) => t.id !== id) });
  }

  function add(e) {
    e.preventDefault();
    if (!title.trim()) return;
    onChange({
      timeline: [
        ...tasks,
        {
          id: `custom-${Date.now()}`,
          title: title.trim(),
          due_date: due || eventDate || "",
          priority,
          done: false,
          note: "",
        },
      ],
    });
    setTitle("");
    setDue("");
    setPriority("Medium");
  }

  return (
    <div className="card-soft p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[19px] text-primary">Preparation timeline</h3>
        <span className="text-[11.5px] text-muted-foreground">
          {done}/{tasks.length} done
        </span>
      </div>
      <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-accent transition-all duration-700"
          style={{ width: `${tasks.length ? (done / tasks.length) * 100 : 0}%` }}
        />
      </div>

      <ul className="mt-4 divide-y divide-border/50">
        {sorted.map((task) => {
          const dueDate = parseDateOnly(task.due_date);
          const overdue = !task.done && dueDate && dueDate < today;
          return (
            <li key={task.id} className="group flex items-start gap-3 py-3">
              <button
                type="button"
                onClick={() => toggle(task.id)}
                aria-label={task.done ? `Mark ${task.title} as pending` : `Mark ${task.title} as done`}
                className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-colors ${
                  task.done ? "border-accent bg-accent/25" : "border-border hover:border-accent"
                }`}
              >
                {task.done && <Check className="h-2.5 w-2.5 text-[hsl(40_40%_34%)]" />}
              </button>
              <div className="min-w-0 flex-1">
                <p className={`text-[13.5px] leading-snug ${task.done ? "text-muted-foreground line-through" : "text-primary"}`}>
                  {task.title}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  {task.due_date && (
                    <span className={overdue ? "text-destructive" : ""}>
                      <CalendarClock className="mr-1 inline h-3 w-3" />
                      {formatShortDate(task.due_date)}
                      {overdue ? " · overdue" : ""}
                    </span>
                  )}
                  <span className={`rounded-full px-2 py-0.5 ${priorityStyle(task.priority)}`}>{task.priority}</span>
                </div>
                {task.note && <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">{task.note}</p>}
              </div>
              <button
                type="button"
                onClick={() => remove(task.id)}
                aria-label={`Remove ${task.title}`}
                className="mt-0.5 text-muted-foreground/50 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          );
        })}
      </ul>

      <form onSubmit={add} className="mt-3 space-y-2 border-t border-border/60 pt-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add your own task"
          aria-label="New task"
          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[13px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/25"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            aria-label="Task deadline"
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-[12px] outline-none focus:border-accent"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            aria-label="Task priority"
            className="rounded-xl border border-border bg-background px-3 py-2 text-[12px] outline-none focus:border-accent"
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <button
            type="submit"
            className="inline-flex items-center gap-1 rounded-xl bg-primary px-3.5 py-2 text-[12px] text-primary-foreground"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
      </form>
    </div>
  );
}