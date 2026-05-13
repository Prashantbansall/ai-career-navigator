import { AlertTriangle, RefreshCcw } from "lucide-react";
import Card from "./Card";
import GlowButton from "./GlowButton";

export default function ErrorState({
  title = "Something went wrong",
  description = "We could not load this section right now.",
  details = "",
  actionLabel = "Try Again",
  onAction,
  actionTo = "",
  secondaryAction = null,
  className = "",
}) {
  const ActionContent = (
    <>
      <RefreshCcw size={16} aria-hidden="true" />
      {actionLabel}
    </>
  );

  return (
    <Card
      className={`border-red-500/25 bg-red-500/5 hover:bg-red-500/5 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-red-400/20 bg-red-500/10 text-red-300">
            <AlertTriangle size={24} aria-hidden="true" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-red-100">{title}</h2>
            {description && (
              <p className="mt-2 text-sm leading-6 text-red-100/80">
                {description}
              </p>
            )}
            {details && (
              <p className="mt-2 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm leading-6 text-slate-300">
                {details}
              </p>
            )}
          </div>
        </div>

        {(onAction || actionTo || secondaryAction) && (
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            {onAction && (
              <button
                type="button"
                onClick={onAction}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-red-400/40 hover:bg-red-500/10 hover:shadow-lg hover:shadow-red-500/10"
              >
                {ActionContent}
              </button>
            )}

            {actionTo && (
              <GlowButton to={actionTo} variant="solid">
                {actionLabel}
              </GlowButton>
            )}

            {secondaryAction}
          </div>
        )}
      </div>
    </Card>
  );
}
