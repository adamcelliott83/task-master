"use client";
import { Calendar, CalendarDays, CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";

type TaskType = "DAILY" | "WEEKLY" | "MONTHLY";

interface StepTypeProps {
  value: TaskType;
  onChange: (type: TaskType) => void;
}

const options: { type: TaskType; label: string; description: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  {
    type: "DAILY",
    label: "Daily",
    description: "Repeats every day or on selected days of the week",
    icon: Calendar,
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  {
    type: "WEEKLY",
    label: "Weekly",
    description: "Repeats once a week on a chosen day",
    icon: CalendarDays,
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
  {
    type: "MONTHLY",
    label: "Monthly",
    description: "Repeats once a month, on a specific week",
    icon: CalendarRange,
    color: "text-orange-600 bg-orange-50 border-orange-200",
  },
];

export function StepType({ value, onChange }: StepTypeProps) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Task frequency</h2>
        <p className="text-sm text-gray-500 mt-1">How often does this task repeat?</p>
      </div>
      <div className="grid gap-3">
        {options.map(({ type, label, description, icon: Icon, color }) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
              value === type
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
            )}
          >
            <div className={cn("rounded-lg p-2 border", color)}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className={cn("font-medium text-sm", value === type ? "text-indigo-700" : "text-gray-900")}>
                {label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            </div>
            <div className="ml-auto">
              <div
                className={cn(
                  "h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors",
                  value === type ? "border-indigo-600 bg-indigo-600" : "border-gray-300"
                )}
              >
                {value === type && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
