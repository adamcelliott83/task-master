"use client";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type RecurrenceDay = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
type TaskType = "DAILY" | "WEEKLY" | "MONTHLY";

const DAYS: { value: RecurrenceDay; short: string; label: string }[] = [
  { value: "MONDAY", short: "M", label: "Monday" },
  { value: "TUESDAY", short: "T", label: "Tuesday" },
  { value: "WEDNESDAY", short: "W", label: "Wednesday" },
  { value: "THURSDAY", short: "T", label: "Thursday" },
  { value: "FRIDAY", short: "F", label: "Friday" },
  { value: "SATURDAY", short: "S", label: "Saturday" },
  { value: "SUNDAY", short: "S", label: "Sunday" },
];

const WEEK_OPTIONS = [
  { value: "1", label: "1st week of month" },
  { value: "2", label: "2nd week of month" },
  { value: "3", label: "3rd week of month" },
  { value: "4", label: "4th week of month" },
];

interface TimeChunkOption {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

interface TaskGroupOption {
  id: string;
  name: string;
  color: string;
}

interface StepScheduleProps {
  timeChunks: TimeChunkOption[];
  taskGroups: TaskGroupOption[];
}

export function StepSchedule({ timeChunks, taskGroups }: StepScheduleProps) {
  const { setValue, watch } = useFormContext();

  const type: TaskType = watch("type");
  const recurrenceDays: RecurrenceDay[] = watch("recurrenceDays") ?? [];
  const weekOfMonth: string = watch("weekOfMonth");
  const timeChunkId: string = watch("timeChunkId");
  const taskGroupId: string = watch("taskGroupId");

  const toggleDay = (day: RecurrenceDay) => {
    const current = recurrenceDays ?? [];
    if (current.includes(day)) {
      setValue("recurrenceDays", current.filter((d: RecurrenceDay) => d !== day));
    } else {
      setValue("recurrenceDays", [...current, day]);
    }
  };

  const formatTime = (t: string) => {
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Schedule</h2>
        <p className="text-sm text-gray-500 mt-1">When should this task occur?</p>
      </div>

      {/* Day picker — daily and weekly */}
      {(type === "DAILY" || type === "WEEKLY") && (
        <div className="space-y-2">
          <Label>
            {type === "DAILY" ? "Repeat on days (leave blank for every day)" : "Repeat on"}
          </Label>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                title={day.label}
                className={cn(
                  "h-9 w-9 rounded-full text-sm font-medium border-2 transition-colors",
                  recurrenceDays.includes(day.value)
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "bg-white border-gray-300 text-gray-600 hover:border-indigo-400"
                )}
              >
                {day.short}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Week-of-month picker — monthly */}
      {type === "MONTHLY" && (
        <div className="space-y-2">
          <Label>Week of month</Label>
          <Select
            value={weekOfMonth ? String(weekOfMonth) : undefined}
            onValueChange={(v) => setValue("weekOfMonth", parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select week…" />
            </SelectTrigger>
            <SelectContent>
              {WEEK_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Time chunk assignment */}
      <div className="space-y-2">
        <Label>Time chunk (optional)</Label>
        <Select
          value={timeChunkId ?? "none"}
          onValueChange={(v) => setValue("timeChunkId", v === "none" ? undefined : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Assign to a time block…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No time chunk</SelectItem>
            {timeChunks.map((tc) => (
              <SelectItem key={tc.id} value={tc.id}>
                {tc.name} ({formatTime(tc.startTime)}–{formatTime(tc.endTime)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {timeChunks.length === 0 && (
          <p className="text-xs text-gray-400">
            No time chunks yet — you can create them after saving this task.
          </p>
        )}
      </div>

      {/* Task group assignment */}
      <div className="space-y-2">
        <Label>Task group (optional)</Label>
        <Select
          value={taskGroupId ?? "none"}
          onValueChange={(v) => setValue("taskGroupId", v === "none" ? undefined : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Assign to a group…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No group</SelectItem>
            {taskGroups.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: g.color }}
                  />
                  {g.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
