import { Loader2, Sparkles } from "lucide-react";
import Card from "./Card";

export default function LoadingState({
  title = "Loading...",
  description = "Please wait while we prepare your workspace.",
  icon: Icon = Sparkles,
  variant = "card",
  className = "",
}) {
  const content = (
    <div className="text-center" role="status" aria-live="polite">
      <div className="relative mx-auto mb-5 grid h-16 w-16 place-items-center rounded-3xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-300 shadow-lg shadow-indigo-500/10">
        <Icon size={24} aria-hidden="true" />
        <Loader2
          size={70}
          className="absolute -inset-1 animate-spin text-indigo-400/50"
          aria-hidden="true"
        />
      </div>

      <h3 className="text-xl font-bold text-white">{title}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">
          {description}
        </p>
      )}
    </div>
  );

  if (variant === "inline") {
    return (
      <div
        className={`rounded-3xl border border-white/10 bg-white/5 p-8 ${className}`}
      >
        {content}
      </div>
    );
  }

  if (variant === "page") {
    return (
      <div
        className={`flex min-h-[55vh] items-center justify-center px-4 ${className}`}
      >
        {content}
      </div>
    );
  }

  return <Card className={className}>{content}</Card>;
}
