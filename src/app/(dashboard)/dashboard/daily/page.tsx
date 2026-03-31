"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskWizardModal } from "@/components/wizard/TaskWizardModal";
import { ProgressRing } from "@/components/tasks/ProgressRing";
import { useTasks, useTimeChunks, useTaskGroups } from "@/lib/hooks/useTasks";

function dateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

function addDays(d: Date, n: number) {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

export default function DailyPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [wizardOpen, setWizardOpen] = useState(false);

  const dateKey = dateStr(currentDate);
  const { tasks, loading, refetch, completeTask, deleteTask, stats } = useTasks({
    type: "DAILY",
    date: dateKey,
  });
  const { timeChunks } = useTimeChunks();
  const { taskGroups } = useTaskGroups();

  const isToday = dateStr(currentDate) === dateStr(new Date());

  const dayLabel = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-900">Daily Tasks</h1>
        <Button onClick={() => setWizardOpen(true)} size="sm">
          <Plus className="h-4 w-4" />
          New task
        </Button>
      </div>

      {/* Date navigator */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-3">
        <button
          onClick={() => setCurrentDate(addDays(currentDate, -1))}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="font-semibold text-gray-900 text-sm">{dayLabel}</p>
          {isToday && (
            <span className="text-xs text-indigo-600 font-medium">Today</span>
          )}
        </div>
        <button
          onClick={() => setCurrentDate(addDays(currentDate, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Progress */}
      {!loading && tasks.length > 0 && (
        <div className="flex items-center gap-5 bg-white rounded-xl border border-gray-200 p-4">
          <ProgressRing percent={stats.percent} size={80} strokeWidth={6} />
          <div className="space-y-1 text-sm">
            <p className="font-medium text-gray-900">
              {stats.completed} of {stats.total} tasks completed
            </p>
            <p className="text-gray-500 text-xs">
              {stats.total - stats.completed} remaining
            </p>
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400 space-y-2">
            <p className="text-4xl">📋</p>
            <p className="font-medium text-gray-600">No daily tasks for this date</p>
            <Button onClick={() => setWizardOpen(true)} size="sm" variant="outline">
              <Plus className="h-4 w-4" /> Add a task
            </Button>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="group relative">
              <TaskCard {...task} onComplete={completeTask} />
              <button
                onClick={() => deleteTask(task.id)}
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50"
                title="Delete task"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
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
