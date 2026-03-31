"use client";
import { Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn, formatTime } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { TaskCard } from "./TaskCard";

interface Task {
  id: string;
  title: string;
  description?: string;
  type: "DAILY" | "WEEKLY" | "MONTHLY";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED" | "FAILED";
  priority: number;
  estimatedMins?: number;
  consequence?: {
    description: string;
    severity: "LOW" | "MEDIUM" | "HIGH";
    isActive: boolean;
  } | null;
}

interface TimeChunkBlockProps {
  id: string;
  name: string;
  color: string;
  startTime: string;
  endTime: string;
  tasks: Task[];
  onCompleteTask: (id: string, status: "COMPLETED" | "FAILED" | "SKIPPED") => Promise<void>;
}

export function TimeChunkBlock({
  name,
  color,
  startTime,
  endTime,
  tasks,
  onCompleteTask,
}: TimeChunkBlockProps) {
  const [collapsed, setCollapsed] = useState(false);

  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const total = tasks.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
        style={{ borderLeft: `4px solid ${color}` }}
      >
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: color }}
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 text-left">{name}</h3>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              <span>
                {formatTime(startTime)} – {formatTime(endTime)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <Progress value={percent} className="w-24 h-1.5" />
            <span className={cn("text-xs font-medium", percent === 100 ? "text-green-600" : "text-gray-500")}>
              {completed}/{total}
            </span>
          </div>
          {collapsed ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Task list */}
      {!collapsed && (
        <div className="divide-y divide-gray-100 bg-gray-50/50">
          {tasks.length === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-400 text-center">
              No tasks in this time block
            </p>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="px-4 py-2">
                <TaskCard {...task} onComplete={onCompleteTask} />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
