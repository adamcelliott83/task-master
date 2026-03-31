"use client";
import { useFormContext } from "react-hook-form";
import { AlertTriangle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Severity = "LOW" | "MEDIUM" | "HIGH";

const SEVERITY_OPTIONS: { value: Severity; label: string; description: string; color: string; icon: string }[] = [
  { value: "LOW", label: "Low", description: "Minor nudge — easy to ignore", color: "border-green-400 bg-green-50 text-green-700", icon: "💚" },
  { value: "MEDIUM", label: "Medium", description: "Noticeable but manageable", color: "border-amber-400 bg-amber-50 text-amber-700", icon: "🟡" },
  { value: "HIGH", label: "High", description: "Significant — this really matters", color: "border-red-400 bg-red-50 text-red-700", icon: "🔴" },
];

export function StepConsequence() {
  const { register, setValue, watch } = useFormContext();

  const hasConsequence: boolean = watch("hasConsequence") ?? false;
  const severity: Severity = watch("consequence.severity") ?? "MEDIUM";
  const description: string = watch("consequence.description") ?? "";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Consequence (optional)</h2>
        <p className="text-sm text-gray-500 mt-1">
          Set a personal consequence if this task is not completed. This is shown as a reminder when you skip or fail a task.
        </p>
      </div>

      {/* Toggle */}
      <button
        type="button"
        onClick={() => setValue("hasConsequence", !hasConsequence)}
        className={cn(
          "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
          hasConsequence
            ? "border-amber-400 bg-amber-50"
            : "border-gray-200 bg-white hover:border-gray-300"
        )}
      >
        <div className={cn("rounded-lg p-2", hasConsequence ? "bg-amber-100" : "bg-gray-100")}>
          <Zap className={cn("h-5 w-5", hasConsequence ? "text-amber-600" : "text-gray-400")} />
        </div>
        <div>
          <p className={cn("font-medium text-sm", hasConsequence ? "text-amber-800" : "text-gray-700")}>
            {hasConsequence ? "Consequence enabled" : "Add a consequence"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {hasConsequence
              ? "A reminder will appear when this task is failed or skipped"
              : "Optional — helps build accountability"}
          </p>
        </div>
        <div className="ml-auto">
          <div
            className={cn(
              "h-5 w-9 rounded-full transition-colors relative",
              hasConsequence ? "bg-amber-500" : "bg-gray-300"
            )}
          >
            <div
              className={cn(
                "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                hasConsequence ? "translate-x-4" : "translate-x-0.5"
              )}
            />
          </div>
        </div>
      </button>

      {/* Consequence details */}
      {hasConsequence && (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-2">
            <Label htmlFor="consequence-description">
              What happens if you skip this? <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="consequence-description"
              placeholder="e.g. No TV tonight, do 20 push-ups, donate $5…"
              rows={2}
              {...register("consequence.description")}
            />
            {!description && (
              <p className="text-xs text-gray-400">Be specific — vague consequences are easy to ignore.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Severity</Label>
            <div className="grid grid-cols-3 gap-2">
              {SEVERITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue("consequence.severity", opt.value)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-lg border-2 text-center transition-all",
                    severity === opt.value ? opt.color + " border-current" : "border-gray-200 bg-white hover:border-gray-300"
                  )}
                >
                  <span className="text-lg">{opt.icon}</span>
                  <span className={cn("text-xs font-semibold", severity === opt.value ? "text-current" : "text-gray-700")}>
                    {opt.label}
                  </span>
                  <span className={cn("text-xs leading-tight", severity === opt.value ? "text-current opacity-80" : "text-gray-400")}>
                    {opt.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className={cn(
            "flex items-start gap-2 p-3 rounded-lg border text-xs",
            severity === "HIGH" ? "bg-red-50 border-red-200 text-red-700" :
            severity === "MEDIUM" ? "bg-amber-50 border-amber-200 text-amber-700" :
            "bg-green-50 border-green-200 text-green-700"
          )}>
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <span>
              {description
                ? `If you fail this task: "${description}"`
                : "Describe your consequence above to preview it here."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
