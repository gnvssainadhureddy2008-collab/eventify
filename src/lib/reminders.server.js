// Deadline reminder digests: collects pending timeline tasks across the caller's
// events and emails them through the Gmail connector.

const GMAIL_SEND_ENDPOINT = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
export const HORIZON_DAYS = 7;
const APP_URL = "https://precise-plan-your-vibe.base44.app";
const DAY_MS = 86400000;
const encoder = new TextEncoder();

function base64Utf8(text) {
  let binary = "";
  for (const byte of encoder.encode(text)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function encodeHeader(text) {
  return /^[\x20-\x7E]*$/.test(text) ? text : `=?UTF-8?B?${base64Utf8(text)}?=`;
}

// RFC 2822 message, base64 body, base64url for the Gmail API.
function buildRawMessage({ to, subject, html }) {
  const message = [
    `To: ${to}`,
    `Subject: ${encodeHeader(subject)}`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    base64Utf8(html).replace(/(.{76})/g, "$1\r\n"),
  ].join("\r\n");
  return base64Utf8(message).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function dayNumber(value) {
  const [y, m, d] = String(value || "").split("-").map(Number);
  if (!y || !m || !d) return null;
  return Date.UTC(y, m - 1, d) / DAY_MS;
}

function dateLabel(value) {
  const day = dayNumber(value);
  if (day === null) return "No date";
  return new Date(day * DAY_MS).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function countdownLabel(daysLeft) {
  if (daysLeft < -1) return `Overdue by ${Math.abs(daysLeft)} days`;
  if (daysLeft === -1) return "Overdue by 1 day";
  if (daysLeft === 0) return "Due today";
  if (daysLeft === 1) return "Due tomorrow";
  return `Due in ${daysLeft} days`;
}

export function collectDeadlines(events, now = new Date()) {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / DAY_MS;
  const groups = [];
  let total = 0;
  let overdue = 0;

  for (const event of events) {
    const eventDay = dayNumber(event?.date);
    if (eventDay !== null && eventDay < today) continue;

    const tasks = [];
    for (const task of event?.plan?.timeline || []) {
      if (!task || task.done) continue;
      const dueDay = dayNumber(task.due_date);
      if (dueDay === null) continue;
      const daysLeft = dueDay - today;
      if (daysLeft > HORIZON_DAYS) continue;
      tasks.push({
        id: String(task.id || task.title || ""),
        title: String(task.title || "Untitled task"),
        due_date: task.due_date,
        due_label: dateLabel(task.due_date),
        priority: task.priority || "Medium",
        days_left: daysLeft,
        countdown: countdownLabel(daysLeft),
      });
    }

    if (!tasks.length) continue;
    tasks.sort((a, b) => a.days_left - b.days_left);
    total += tasks.length;
    overdue += tasks.filter((task) => task.days_left < 0).length;
    groups.push({
      event_id: event.id,
      event_name: event.name || "Untitled event",
      event_date: event.date || "",
      event_date_label: dateLabel(event.date),
      tasks,
    });
  }

  groups.sort((a, b) => a.tasks[0].days_left - b.tasks[0].days_left);
  return { groups, total, overdue, horizon_days: HORIZON_DAYS };
}

const PRIORITY_COLOUR = { High: "#A94D63", Medium: "#B08A4F", Low: "#6E7B6B" };

export function buildDigestEmail({ userName, deadlines }) {
  const name = String(userName || "").split(" ")[0] || "there";
  const subject =
    deadlines.total === 1
      ? `1 timeline task needs your attention`
      : `${deadlines.total} timeline tasks need your attention`;

  const sections = deadlines.groups
    .map((group) => {
      const tasks = group.tasks
        .map(
          (task) => `
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #EDE3D8;" valign="top">
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#3E2C36;">${escapeHtml(task.title)}</div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:${PRIORITY_COLOUR[task.priority] || "#8A7A70"};margin-top:4px;">
                ${escapeHtml(task.priority)} · ${escapeHtml(task.countdown)}
              </div>
            </td>
            <td style="padding:10px 0;border-bottom:1px solid #EDE3D8;font-family:Arial,Helvetica,sans-serif;font-size:11.5px;color:#8A7A70;text-align:right;white-space:nowrap;" valign="top">
              ${escapeHtml(task.due_label)}
            </td>
          </tr>`,
        )
        .join("");
      return `
        <div style="margin-top:26px;">
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:#B08A4F;">${escapeHtml(group.event_date_label)}</div>
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:19px;color:#3E2C36;margin:4px 0 10px;">${escapeHtml(group.event_name)}</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${tasks}</table>
        </div>`;
    })
    .join("");

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#F6EFE6;">
  <div style="max-width:620px;margin:0 auto;padding:32px 20px;">
    <div style="background:#FFFCF7;border:1px solid #EDE3D8;border-radius:22px;padding:34px 30px;">
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;color:#B08A4F;">Aurelia · deadline reminder</div>
      <h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:26px;line-height:1.3;color:#3E2C36;margin:14px 0 8px;">
        ${escapeHtml(name)}, ${deadlines.total} ${deadlines.total === 1 ? "task is" : "tasks are"} coming up
      </h1>
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:13.5px;line-height:1.7;color:#6E5C63;margin:0;">
        ${
          deadlines.overdue
            ? `${deadlines.overdue} of them ${deadlines.overdue === 1 ? "is" : "are"} already past ${deadlines.overdue === 1 ? "its" : "their"} deadline. `
            : ""
        }Here is everything due in the next ${deadlines.horizon_days} days.
      </p>
      ${sections}
      <div style="margin-top:32px;">
        <a href="${APP_URL}/calendar" style="display:inline-block;background:#5C4A52;color:#FFFCF7;font-family:Arial,Helvetica,sans-serif;font-size:12.5px;letter-spacing:.04em;text-decoration:none;padding:12px 22px;border-radius:999px;">Open my planning calendar</a>
      </div>
    </div>
    <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#A2939A;text-align:center;margin:18px 0 0;">
      Sent from your Aurelia planning space. Turn this off any time from the calendar.
    </p>
  </div>
</body></html>`;

  return { subject, html };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendGmail(base44, { to, subject, html }) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection("gmail");
  const response = await fetch(GMAIL_SEND_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw: buildRawMessage({ to, subject, html }) }),
  });
  if (!response.ok) throw new Error(`Gmail could not send the reminder (${response.status}).`);
  return (await response.json()).id;
}

// Read exactly the caller's own events, including when a scheduled run calls this
// route as the app admin (whose identity differs from the visitor's access rules).
async function loadOwnEvents(base44, userId) {
  const page = await base44.asServiceRole.entities.Event.filter(
    { created_by_id: userId },
    { sort: "-date", limit: 200 },
  );
  return Array.isArray(page) ? page : page?.items || [];
}

export async function runReminderDigest(base44, user) {
  const deadlines = collectDeadlines(await loadOwnEvents(base44, user.id));
  if (!deadlines.total) {
    return { sent: false, reason: "no_deadlines", ...deadlines };
  }
  const { subject, html } = buildDigestEmail({ userName: user.full_name || user.email, deadlines });
  await sendGmail(base44, { to: user.email, subject, html });
  return { sent: true, recipient: user.email, ...deadlines };
}

export async function loadReminderPreview(base44, user) {
  const deadlines = collectDeadlines(await loadOwnEvents(base44, user.id));
  return { recipient: user.email, ...deadlines };
}