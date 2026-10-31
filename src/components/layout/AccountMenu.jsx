import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { LogOut, Trash2, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteMyAccount } from "@/lib/server-fns";
import { useAuth } from "@/lib/AuthContext";

export default function AccountMenu({ className = "" }) {
  const { user, logout } = useAuth();
  const removeAccount = useServerFn(deleteMyAccount);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const label = user?.full_name || user?.email || "Account";
  const initials = label
    .replace(/@.*$/, "")
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  async function handleDelete() {
    setDeleting(true);
    setError("");
    try {
      await removeAccount();
      await logout();
    } catch (err) {
      setError(err?.message || "We could not delete your account. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Account menu"
          className={`flex h-9 w-9 items-center justify-center rounded-full border border-border/70 text-[11px] uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:border-accent/60 hover:text-primary ${className}`}
        >
          {initials || <UserRound className="h-3.5 w-3.5" />}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="truncate text-[12px] font-normal text-muted-foreground">
            {user?.email || label}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={logout} className="gap-2 text-[13px]">
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              setError("");
              setConfirming(true);
            }}
            className="gap-2 text-[13px] text-destructive focus:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirming} onOpenChange={(open) => !deleting && setConfirming(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes your account along with every event, plan and invitation you saved. This cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && <p className="text-[12px] text-destructive">{error}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Keep my account</AlertDialogCancel>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex h-10 items-center justify-center rounded-md bg-destructive px-4 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {deleting ? "Deleting…" : "Delete permanently"}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}