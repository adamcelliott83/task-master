"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskWizardModal } from "@/components/wizard/TaskWizardModal";
import { ProgressRing } from "@/components/tasks/ProgressRing";
import { useTasks, useTimeChunks, useTaskGroups } from "@/lib/hooks/useTasks";

function getMonthStart(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

const WEEK_LABELS = ["1st week", "2nd week", "3rd week", "4th week"];

export default function MonthlyPage() {
  const [monthStart, setMonthStart] = useState(() => getMonthStart(new Date()));
  const [wizardOpen, setWizardOpen] = useState(false);

  const isCurrentMonth =
    monthStart.getMonth() === new Date().getMonth() &&
    monthStart.getFullYear() === new Date().getFullYear();

  const dateKey = monthStart.toISOString().split("T")[0];

  const { tasks, loading, refetch, completeTask, stats } = useTasks({
    type: "MONTHLY",
    date: dateKey,
  });
  const { timeChunks } = useTimeChunks();
  const { taskGroups } = useTaskGroups();

  const monthLabel = monthStart.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Group tasks by weekOfMonth
  const byWeek: Record<number, typeof tasks> = { 1: [], 2: [], 3: [], 4: [] };
  tasks.forEach((t) => {
    const week = (t as { weekOfMonth?: number }).weekOfMonth ?? 1;
    if (week >= 1 && week <= 4) byWeek[week].push(t);
  });
  const ungrouped = tasks.filter((t) => !(t as { weekOfMonth?: number }).weekOfMonth);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-900">Monthly Tasks</h1>
        <Button onClick={() => setWizardOpen(true)} size="sm">
          <Plus className="h-4 w-4" />
          New task
        </Button>
      </div>

      {/* Month navigator */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-3">
        <button
          onClick={() => setMonthStart(addMonths(monthStart, -1))}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="font-semibold text-gray-900 text-sm">{monthLabel}</p>
          {isCurrentMonth && (
            <span className="text-xs text-indigo-600 font-medium">This month</span>
          )}
        </div>
        <button
          onClick={() => setMonthStart(addMonths(monthStart, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Progress */}
      {!loading && tasks.length > 0 && (
        <div className="flex items-center gap-5 bg-white rounded-xl border border-gray-200 p-4">
          <ProgressRing percent={stats.percent} size={80} strokeWidth={6} />
          <div>
            <p className="font-medium text-gray-900 text-sm">
              {stats.completed} of {stats.total} completed this month
            </p>
          </div>
        </div>
      )}

      {/* Tasks grouped by week */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-400 space-y-2">
          <p className="text-4xl">📆</p>
          <p className="font-medium text-gray-600">No monthly tasks yet</p>
          <Button onClick={() => setWizardOpen(true)} size="sm" variant="outline">
            <Plus className="h-4 w-4" /> Add a task
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {WEEK_LABELS.map((label, i) => {
            const week = i + 1;
            const weekTasks = byWeek[week];
            if (!weekTasks.length) return null;
            return (
              <div key={week} className="space-y-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {label}
                </h3>
                {weekTasks.map((task) => (
                  <TaskCard key={task.id} {...task} onComplete={completeTask} />
                ))}
              </div>
            );
          })}
          {ungrouped.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Unscheduled
              </h3>
              {ungrouped.map((task) => (
                <TaskCard key={task.id} {...task} onComplete={completeTask} />
              ))}
            </div>
          )}
        </div>
      )}

      <TaskWizardModal
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        timeChunks={timeChunks}
        taskGroups={taskGroups}
        onCreated={refetch}
      />
    </div>
  );
}
