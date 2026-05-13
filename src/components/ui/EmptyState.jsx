import { FileText } from "lucide-react";
import Card from "./Card";

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
  compact = false,
}) {
  const Icon = icon || FileText;

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className={`relative text-center ${compact ? "py-6" : "py-12"}`}>
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-indigo-500/30 bg-indigo-500/15 text-indigo-300 shadow-lg shadow-indigo-500/10">
          <Icon size={30} aria-hidden="true" />
        </div>

        <h3 className="text-xl font-bold text-white">{title}</h3>

        {description && (
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400 md:text-base">
            {description}
          </p>
        )}

        {action && <div className="mt-6">{action}</div>}
      </div>
    </Card>
  );
}
