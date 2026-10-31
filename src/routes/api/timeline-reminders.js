import { createFileRoute } from "@tanstack/react-router";
import { requireUserRoute } from "@/lib/auth-middleware";
import { runReminderDigest } from "@/lib/reminders.server";

// Daily reminder digest. A scheduled workflow in the app dashboard calls this
// route as the app admin; the in-app "send now" button uses the server
// function in src/lib/server-fns.js.
export const Route = createFileRoute("/api/timeline-reminders")({
  server: {
    middleware: [requireUserRoute],
    handlers: {
      POST: async ({ context }) => {
        if (context.user.role !== "admin") {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }
        const result = await runReminderDigest(context.getBase44(), context.user);
        return Response.json(result, { headers: { "cache-control": "no-store" } });
      },
    },
  },
});