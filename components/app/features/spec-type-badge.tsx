import { cn } from "@/lib/utils";

export type SpecType = "NF" | "BE" | "FE" | "DA";

const TYPE_STYLES: Record<SpecType, string> = {
  NF: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  BE: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  FE: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  DA: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
};

const TYPE_LABELS: Record<SpecType, string> = {
  NF: "Non-Functional",
  BE: "Backend",
  FE: "Frontend",
  DA: "Data",
};

interface SpecTypeBadgeProps {
  type: SpecType;
  showLabel?: boolean;
  className?: string;
}

export function SpecTypeBadge({
  type,
  showLabel = false,
  className,
}: SpecTypeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold font-mono",
        TYPE_STYLES[type],
        className
      )}
      title={TYPE_LABELS[type]}
    >
      {type}
      {showLabel && (
        <span className="ml-1 font-normal font-sans">{TYPE_LABELS[type]}</span>
      )}
    </span>
  );
}
