/**
 * Merge a copilot proposal into the saved plan without losing the planner's work.
 * Budget is re-totalled; timeline items keep their completion state by id;
 * vendor statuses/notes are preserved by type.
 */
const uid = () =>
  (globalThis.crypto?.randomUUID?.() || `id-${Math.random().toString(36).slice(2)}`).slice(0, 12);

export function mergeProposal(current, proposal, totalBudget) {
  const base = current || {};

  const budget = (proposal.budget || []).length ? proposal.budget : base.budget || [];

  const existing = base.timeline || [];
  const byId = new Map(existing.map((t) => [t.id, t]));
  const usedIds = new Set();
  const timeline = (proposal.timeline || []).map((t) => {
    const match = t.id ? byId.get(t.id) : null;
    const id = match ? match.id : uid();
    usedIds.add(id);
    return {
      id,
      title: t.title,
      due_date: t.due_date,
      priority: t.priority,
      note: t.note || "",
      done: match ? !!match.done : false,
    };
  });
  existing.forEach((t) => {
    if (!usedIds.has(t.id)) timeline.push(t);
  });

  const vendorByType = new Map((base.vendors || []).map((v) => [v.type.toLowerCase(), v]));
  const vendors = (proposal.vendors || []).map((v) => {
    const match = vendorByType.get(v.type.toLowerCase());
    return {
      id: match?.id || uid(),
      type: v.type,
      why: v.why,
      estimated_budget: v.estimated_budget,
      notes: match?.notes || v.notes || "",
      status: match?.status || "Not Started",
      custom: match?.custom || false,
    };
  });

  return {
    summary: proposal.summary || base.summary || "",
    budget,
    timeline,
    vendors: vendors.length ? vendors : base.vendors || [],
    ideas: (proposal.ideas || []).length ? proposal.ideas : base.ideas || [],
    _totalBudget: totalBudget,
  };
}

export function planTotals(event) {
  const budget = event?.budget || 0;
  const planned = (event?.plan?.budget || []).reduce((acc, b) => acc + (Number(b.amount) || 0), 0);
  const committed = (event?.plan?.vendors || [])
    .filter((v) => v.status === "Booked" || v.status === "Paid")
    .reduce((acc, v) => acc + (Number(v.estimated_budget) || 0), 0);
  return { budget, planned, committed };
}