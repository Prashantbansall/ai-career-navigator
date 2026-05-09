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
    <Card className={className}>
      <div className={`text-center ${compact ? "py-6" : "py-12"}`}>
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/20 text-indigo-300">
          <Icon size={30} aria-hidden="true" />
        </div>

        <h3 className="text-xl font-semibold text-indigo-400">{title}</h3>

        {description && (
          <p className="mx-auto mt-2 max-w-xl text-sm md:text-base text-gray-400">
            {description}
          </p>
        )}

        {action && <div className="mt-6">{action}</div>}
      </div>
    </Card>
  );
}
