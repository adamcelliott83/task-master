"use client";
import { useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TimeChunkBlock } from "@/components/tasks/TimeChunkBlock";
import { ProgressRing } from "@/components/tasks/ProgressRing";
import { TaskWizardModal } from "@/components/wizard/TaskWizardModal";
import { useTasks, useTimeChunks, useTaskGroups, useStats } from "@/lib/hooks/useTasks";
import { formatDate, getGreeting } from "@/lib/utils";

const today = new Date().toISOString().split("T")[0];

export default function DashboardPage() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const { tasks, loading, refetch, completeTask } = useTasks({ type: "DAILY", date: today });
  const { timeChunks } = useTimeChunks();
  const { taskGroups } = useTaskGroups();
  const stats = useStats("DAILY");

  // Group tasks by time chunk
  const chunkedTasks = timeChunks.map((tc) => ({
    ...tc,
    tasks: tasks.filter((t) => t.timeChunkId === tc.id),
  }));
  const ungroupedTasks = tasks.filter((t) => !t.timeChunkId);

  const greeting = getGreeting();
  const dateLabel = formatDate(new Date());

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{greeting} 👋</h1>
          <p className="text-sm text-gray-500 mt-0.5">{dateLabel}</p>
        </div>
        <Button onClick={() => setWizardOpen(true)} size="sm">
          <Plus className="h-4 w-4" />
          New task
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="col-span-2 sm:col-span-1 flex justify-center">
          <ProgressRing
            percent={stats?.completionPercent ?? 0}
            label="Today"
            sublabel={stats ? `${stats.completedToday}/${stats.tasksForDate}` : "—"}
          />
        </div>
        {[
          { label: "Total tasks", value: stats?.totalTasks ?? "—" },
          { label: "Completed", value: stats?.completedToday ?? "—", color: "text-green-600" },
          { label: "Remaining", value: stats ? (stats.tasksForDate - stats.completedToday) : "—", color: "text-indigo-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${color ?? "text-gray-900"}`}>{value}</span>
            <span className="text-xs text-gray-500 mt-1">{label}</span>
          </div>
        ))}
      </div>

      {/* Tasks */}
      <Tabs defaultValue="chunks">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="chunks">By time block</TabsTrigger>
            <TabsTrigger value="all">All tasks</TabsTrigger>
          </TabsList>
          <button onClick={refetch} className="text-gray-400 hover:text-gray-600 p-1 rounded">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <TabsContent value="chunks" className="space-y-3 mt-3">
          {loading ? (
            <TaskListSkeleton />
          ) : (
            <>
              {chunkedTasks.filter((c) => c.tasks.length > 0).map((tc) => (
                <TimeChunkBlock key={tc.id} {...tc} onCompleteTask={completeTask} />
              ))}
              {ungroupedTasks.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">
                    Unscheduled
                  </h3>
                  {ungroupedTasks.map((t) => (
                    <TaskCard key={t.id} {...t} onComplete={completeTask} />
                  ))}
                </div>
              )}
              {tasks.length === 0 && <EmptyState onAdd={() => setWizardOpen(true)} />}
            </>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-2 mt-3">
          {loading ? (
            <TaskListSkeleton />
          ) : tasks.length === 0 ? (
            <EmptyState onAdd={() => setWizardOpen(true)} />
          ) : (
            tasks.map((t) => <TaskCard key={t.id} {...t} onComplete={completeTask} />)
          )}
        </TabsContent>
      </Tabs>

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

function TaskListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="text-center py-16 space-y-3">
      <div className="text-4xl">✅</div>
      <p className="font-medium text-gray-700">No tasks yet</p>
      <p className="text-sm text-gray-400">Create your first task to get started</p>
      <Button onClick={onAdd} size="sm" variant="outline">
        <Plus className="h-4 w-4" />
        Add a task
      </Button>
    </div>
  );
}
