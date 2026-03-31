"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskWizardModal } from "@/components/wizard/TaskWizardModal";
import { ProgressRing } from "@/components/tasks/ProgressRing";
import { useTasks, useTimeChunks, useTaskGroups } from "@/lib/hooks/useTasks";
import { getCurrentWeekDates } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getWeekStart(date: Date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function addWeeks(d: Date, n: number) {
  const result = new Date(d);
  result.setDate(result.getDate() + n * 7);
  return result;
}

export default function WeeklyPage() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isCurrentWeek = weekStart.getTime() === getWeekStart(new Date()).getTime();

  const selectedDate = new Date(weekStart);
  selectedDate.setDate(weekStart.getDate() + selectedDay);
  const dateKey = selectedDate.toISOString().split("T")[0];

  const { tasks, loading, refetch, completeTask, stats } = useTasks({
    type: "WEEKLY",
    date: dateKey,
  });
  const { timeChunks } = useTimeChunks();
  const { taskGroups } = useTaskGroups();

  const weekLabel = () => {
    const end = new Date(weekStart);
    end.setDate(weekStart.getDate() + 6);
    const startStr = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const endStr = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `${startStr} – ${endStr}`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-900">Weekly Tasks</h1>
        <Button onClick={() => setWizardOpen(true)} size="sm">
          <Plus className="h-4 w-4" />
          New task
        </Button>
      </div>

      {/* Week navigator */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button
            onClick={() => setWeekStart(addWeeks(weekStart, -1))}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-900">{weekLabel()}</p>
            {isCurrentWeek && <span className="text-xs text-indigo-600 font-medium">This week</span>}
          </div>
          <button
            onClick={() => setWeekStart(addWeeks(weekStart, 1))}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Day selector */}
        <div className="grid grid-cols-7 divide-x divide-gray-100">
          {DAYS.map((day, i) => {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            const isToday = date.getTime() === today.getTime();
            const isSelected = i === selectedDay;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(i)}
                className={`flex flex-col items-center py-3 gap-1 transition-colors ${
                  isSelected
                    ? "bg-indigo-50 text-indigo-700"
                    : "hover:bg-gray-50 text-gray-600"
                }`}
              >
                <span className="text-xs font-medium">{day}</span>
                <span
                  className={`text-sm font-semibold h-6 w-6 flex items-center justify-center rounded-full ${
                    isToday ? "bg-indigo-600 text-white" : ""
                  }`}
                >
                  {date.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress */}
      {!loading && tasks.length > 0 && (
        <div className="flex items-center gap-5 bg-white rounded-xl border border-gray-200 p-4">
          <ProgressRing percent={stats.percent} size={80} strokeWidth={6} />
          <div>
            <p className="font-medium text-gray-900 text-sm">
              {stats.completed} of {stats.total} completed
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
      )}

      {/* Tasks */}
      <div className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />)}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400 space-y-2">
            <p className="text-4xl">📅</p>
            <p className="font-medium text-gray-600">No weekly tasks for this day</p>
            <Button onClick={() => setWizardOpen(true)} size="sm" variant="outline">
              <Plus className="h-4 w-4" /> Add a task
            </Button>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} {...task} onComplete={completeTask} />
          ))
        )}
      </div>

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
