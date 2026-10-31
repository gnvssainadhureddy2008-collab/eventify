import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { searchPlacesApi } from "@/lib/places.server";
import { loadReminderPreview, runReminderDigest } from "@/lib/reminders.server";
import { purgeAccount } from "@/lib/account.server";

const PLAN_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    budget: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string" },
          amount: { type: "number" },
          percent: { type: "number" },
          note: { type: "string" },
        },
        required: ["category", "amount", "percent", "note"],
      },
    },
    timeline: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          due_date: { type: "string" },
          priority: { type: "string", enum: ["High", "Medium", "Low"] },
          note: { type: "string" },
        },
        required: ["title", "due_date", "priority", "note"],
      },
    },
    vendors: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string" },
          why: { type: "string" },
          estimated_budget: { type: "number" },
          notes: { type: "string" },
        },
        required: ["type", "why", "estimated_budget", "notes"],
      },
    },
    ideas: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
        },
        required: ["category", "title", "description"],
      },
    },
  },
  required: ["summary", "budget", "timeline", "vendors", "ideas"],
};

const uid = () =>
  (globalThis.crypto?.randomUUID?.() || `id-${Math.random().toString(36).slice(2)}`).slice(0, 12);

function normalizeBudget(items, totalBudget) {
  const clean = (items || [])
    .map((b) => ({
      category: String(b.category || "Other").slice(0, 60),
      amount: Math.max(0, Math.round(Number(b.amount) || 0)),
      note: String(b.note || "").slice(0, 200),
    }))
    .filter((b) => b.amount > 0)
    .slice(0, 10);

  if (!clean.length) return [];

  const sum = clean.reduce((acc, b) => acc + b.amount, 0);
  const budget = Math.max(0, Math.round(Number(totalBudget) || 0));
  const factor = sum > 0 && budget > 0 ? budget / sum : 1;
  let scaled = clean.map((b) => ({ ...b, amount: Math.round((b.amount * factor) / 100) * 100 }));
  const scaledSum = scaled.reduce((acc, b) => acc + b.amount, 0);
  if (budget > 0 && scaled.length) {
    scaled[scaled.length - 1].amount += budget - scaledSum;
  }
  const finalTotal = scaled.reduce((acc, b) => acc + b.amount, 0) || 1;
  let percentSum = 0;
  scaled = scaled.map((b, i) => {
    const percent =
      i === scaled.length - 1 ? Math.max(0, 100 - percentSum) : Math.round((b.amount / finalTotal) * 100);
    percentSum += percent;
    return { ...b, percent };
  });
  return scaled;
}

function normalizePlan(raw, event) {
  const budget = normalizeBudget(raw?.budget, event.budget);
  const timeline = (raw?.timeline || [])
    .map((t) => ({
      id: uid(),
      title: String(t.title || "").slice(0, 140),
      due_date: String(t.due_date || "").slice(0, 10),
      priority: ["High", "Medium", "Low"].includes(t.priority) ? t.priority : "Medium",
      done: false,
      note: String(t.note || "").slice(0, 220),
    }))
    .filter((t) => t.title)
    .slice(0, 24);

  const vendors = (raw?.vendors || [])
    .map((v) => ({
      id: uid(),
      type: String(v.type || "").slice(0, 80),
      why: String(v.why || "").slice(0, 220),
      estimated_budget: Math.max(0, Math.round(Number(v.estimated_budget) || 0)),
      status: "Not Started",
      notes: String(v.notes || "").slice(0, 300),
      custom: false,
    }))
    .filter((v) => v.type)
    .slice(0, 20);

  const ideas = (raw?.ideas || [])
    .map((i) => ({
      category: String(i.category || "Idea").slice(0, 40),
      title: String(i.title || "").slice(0, 90),
      description: String(i.description || "").slice(0, 400),
    }))
    .filter((i) => i.title)
    .slice(0, 16);

  return { summary: String(raw?.summary || "").slice(0, 700), budget, timeline, vendors, ideas };
}

function eventBrief(event, today) {
  return [
    `Event name: ${event.name}`,
    `Event type: ${event.event_type === "Other / Custom Event" ? event.custom_type || "Custom celebration" : event.event_type}`,
    `Event date: ${event.date}`,
    `Time: ${event.start_time || "not set"} to ${event.end_time || "not set"}`,
    `Guests: ${event.guest_count || "not specified"}`,
    `Total budget: ₹${Number(event.budget) || 0} (Indian rupees)`,
    `Preferred style/theme: ${event.theme || "open to suggestions"}`,
    `Location: ${event.location_address || event.location_label || "India"}`,
    event.venue_name ? `Venue already chosen: ${event.venue_name} (${event.venue_address || ""})` : "Venue: not chosen yet",
    `Additional requirements typed by the user: ${event.requirements?.trim() || "none specified"}`,
    `Today's date: ${today}. Days remaining: ${event.date ? Math.round((new Date(`${event.date}T00:00:00`) - new Date(`${today}T00:00:00`)) / 86400000) : "unknown"}`,
  ].join("\n");
}

export const generateEventPlan = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ eventId: z.string().min(1).max(80) }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const event = await base44.entities.Event.get(data.eventId);
    const today = new Date().toISOString().slice(0, 10);

    const prompt = `You are a seasoned Indian celebration and event planner. Build a personalised, realistic plan for the event below.

${eventBrief(event, today)}

Rules:
- Budget categories must be chosen for THIS event type and its requirements (a college festival, a wedding and a corporate conference need different categories). Percentages must total exactly 100 and amounts must total exactly ₹${Number(event.budget) || 0}. All amounts are estimates in ₹, in Indian price context.
- Include an emergency reserve of roughly 5-10%.
- If the user typed requirements (food preference, accessibility, parking, live music, tight decoration budget, children's activities, etc.), visibly reflect them in the budget, timeline, vendors and ideas.
- The timeline must be ordered chronologically, every due_date in YYYY-MM-DD format, on or before the event date, adapted to how much time remains (if the event is close, focus on the few urgent items; if months away, spread tasks out). Give 8-16 practical tasks with priorities.
- Vendor checklist: 5-10 vendor TYPES relevant to this event (e.g. "Caterer (pure vegetarian)", "Mandap decorator", "Sound & lighting"). Never name a specific real business — only categories. Estimated budget should be a sensible slice of the total.
- Ideas: 6-12 specific, tasteful suggestions personalised to the theme, location, guest count, budget and typed requirements, grouped by category (Theme, Decor, Food, Activities, Entertainment, Guest experience).
- Never claim an item is booked, available on the date, or confirmed.
- Writing style: warm, concise, concrete. No emojis.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: PLAN_SCHEMA,
    });

    const plan = normalizePlan(result, event);
    if (!plan.budget.length) throw new Error("The planner could not build a budget — please try again.");

    await base44.entities.Event.update(event.id, {
      plan,
      plan_generated_at: new Date().toISOString(),
    });

    return plan;
  });

const COPILOT_SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string" },
    changes: { type: "array", items: { type: "string" } },
    updated: {
      type: "object",
      properties: {
        summary: { type: "string" },
        budget: PLAN_SCHEMA.properties.budget,
        timeline: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              due_date: { type: "string" },
              priority: { type: "string", enum: ["High", "Medium", "Low"] },
              note: { type: "string" },
            },
            required: ["id", "title", "due_date", "priority", "note"],
          },
        },
        vendors: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string" },
              why: { type: "string" },
              estimated_budget: { type: "number" },
              notes: { type: "string" },
            },
            required: ["type", "why", "estimated_budget", "notes"],
          },
        },
        ideas: PLAN_SCHEMA.properties.ideas,
      },
      required: ["summary", "budget", "timeline", "vendors", "ideas"],
    },
  },
  required: ["reply", "changes", "updated"],
};

export const askCopilot = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      eventId: z.string().min(1).max(80),
      message: z.string().min(1).max(1200),
      history: z
        .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
        .max(12)
        .optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const event = await base44.entities.Event.get(data.eventId);
    const plan = event.plan || {};
    const today = new Date().toISOString().slice(0, 10);

    const prompt = `You are the event copilot for a planning app. You know the event and the saved plan below, and you help the planner refine it.

${eventBrief(event, today)}

CURRENT SAVED PLAN (JSON):
${JSON.stringify(
  {
    summary: plan.summary || "",
    budget: plan.budget || [],
    timeline: (plan.timeline || []).map(({ id, title, due_date, priority, done, note }) => ({
      id,
      title,
      due_date,
      priority,
      done,
      note,
    })),
    vendors: (plan.vendors || []).map(({ type, why, estimated_budget, notes }) => ({
      type,
      why,
      estimated_budget,
      notes,
    })),
    ideas: plan.ideas || [],
  },
  null,
  1,
).slice(0, 6000)}

The planner asked: "${data.message}"

Return:
- reply: 1-3 short, warm sentences describing what you changed and why. No emojis.
- changes: short bullet strings, each naming one concrete change for the planner to approve (e.g. "Catering reduced by ₹12,000").
- updated: a COMPLETE replacement plan that keeps everything that should not change and applies the request. Budget must still total exactly ₹${Number(event.budget) || 0} with percentages summing to 100, unless the request is to change the total budget — then use the new total. Keep existing timeline ids for tasks you keep or adjust; use an empty string id for brand new tasks. Keep vendor types by their existing names when you keep them. Adapt to the event type and typed requirements. Never invent real business names, prices of real venues, or availability.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: COPILOT_SCHEMA,
    });

    const updated = result?.updated || {};
    const totalBudget =
      Number(
        (updated.budget || []).reduce((acc, b) => acc + (Number(b.amount) || 0), 0),
      ) || Number(event.budget) || 0;

    const proposal = {
      summary: String(updated.summary || plan.summary || "").slice(0, 700),
      budget: normalizeBudget(updated.budget, totalBudget),
      timeline: (updated.timeline || []).map((t) => ({
        id: t.id ? String(t.id).slice(0, 40) : "",
        title: String(t.title || "").slice(0, 140),
        due_date: String(t.due_date || "").slice(0, 10),
        priority: ["High", "Medium", "Low"].includes(t.priority) ? t.priority : "Medium",
        note: String(t.note || "").slice(0, 220),
      })),
      vendors: (updated.vendors || []).map((v) => ({
        type: String(v.type || "").slice(0, 80),
        why: String(v.why || "").slice(0, 220),
        estimated_budget: Math.max(0, Math.round(Number(v.estimated_budget) || 0)),
        notes: String(v.notes || "").slice(0, 300),
      })),
      ideas: (updated.ideas || []).map((i) => ({
        category: String(i.category || "Idea").slice(0, 40),
        title: String(i.title || "").slice(0, 90),
        description: String(i.description || "").slice(0, 400),
      })),
    };

    return {
      reply: String(result?.reply || "").slice(0, 900),
      changes: (result?.changes || []).map((c) => String(c).slice(0, 160)).slice(0, 10),
      proposal,
    };
  });

export const askAssistant = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      message: z.string().min(1).max(1200),
      history: z
        .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
        .max(12)
        .optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const today = new Date().toISOString().slice(0, 10);
    const name = String(context.user?.full_name || context.user?.email || "there").split("@")[0];
    const events = await base44.entities.Event.list("-date", 5);

    const brief = events.length
      ? events
          .map(
            (e) =>
              `- ${e.name} (${e.event_type}) on ${e.date || "no date"}, ${e.guest_count || "unset"} guests, budget ₹${
                Number(e.budget) || 0
              }${e.venue_name ? `, venue ${e.venue_name}` : ""}`,
          )
          .join("\n")
      : "- none saved yet";

    const history = (data.history || [])
      .map((m) => `${m.role === "user" ? "Planner" : "Assistant"}: ${m.content}`)
      .join("\n");

    const prompt = `You are Aurelia's celebration assistant, a warm and practical planning companion for hosted events: weddings, birthdays, anniversaries, engagements, baby showers and corporate gatherings.

Today is ${today}. The planner is ${name}.
Their most recent events:
${brief}

How to answer:
- Be concise: 2-5 short sentences, or up to 5 lines starting with "- " when listing steps or options.
- Be concrete and budget-aware, using ₹ for money.
- Never invent real venue or vendor names, real prices, or availability.
- When they need a saved budget or checklist, mention that "Plan an Event" builds one, but still answer the question helpfully now.
- Plain text only: no emojis, no markdown headings, no tables.

${history ? `Conversation so far:\n${history}\n\n` : ""}Planner: ${data.message}
Assistant:`;

    const reply = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });
    return { reply: String(reply || "").trim().slice(0, 2000) };
  });

export const searchLocation = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ query: z.string().min(2).max(160) }))
  .handler(async ({ data }) => searchPlacesApi({ query: data.query, limit: 6 }));

export const searchVenues = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      eventId: z.string().min(1).max(80),
      keyword: z.string().max(120).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const event = await base44.entities.Event.get(data.eventId);
    const lat = event.location_lat;
    const lng = event.location_lng;
    if (typeof lat !== "number" || typeof lng !== "number") {
      return { configured: true, places: [], error: "Add a location to the event before searching for venues." };
    }

    const typeLabel =
      event.event_type === "Other / Custom Event" ? event.custom_type || "event" : event.event_type;
    const query = data.keyword?.trim()
      ? `${data.keyword.trim()} venue near ${event.location_label || event.location_address}`
      : `${typeLabel.toLowerCase()} venue near ${event.location_label || event.location_address}`;

    return searchPlacesApi({ query, lat, lng, radius: 12000, limit: 14 });
  });

export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .handler(({ context }) => purgeAccount(context.getBase44(), context.user));

export const getDeadlineDigest = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(({ context }) => loadReminderPreview(context.getBase44(), context.user));

export const sendDeadlineDigest = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .handler(({ context }) => runReminderDigest(context.getBase44(), context.user));