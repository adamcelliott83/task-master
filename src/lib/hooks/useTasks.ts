"use client";
import { useState, useEffect, useCallback } from "react";

export interface TaskCompletion {
  id: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED" | "FAILED";
  date: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: "DAILY" | "WEEKLY" | "MONTHLY";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED" | "FAILED";
  priority: number;
  estimatedMins?: number;
  recurrenceDays: string[];
  taskGroupId?: string;
  timeChunkId?: string;
  consequence?: {
    description: string;
    severity: "LOW" | "MEDIUM" | "HIGH";
    isActive: boolean;
  } | null;
  taskGroup?: { id: string; name: string; color: string } | null;
  timeChunk?: { id: string; name: string; color: string; startTime: string; endTime: string } | null;
  completions: TaskCompletion[];
}

export interface UseTasksOptions {
  type?: "DAILY" | "WEEKLY" | "MONTHLY";
  date?: string; // YYYY-MM-DD
}

export function useTasks(options: UseTasksOptions = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (options.type) params.set("type", options.type);
      if (options.date) params.set("date", options.date);
      params.set("limit", "100");

      const res = await fetch(`/api/tasks?${params}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(data.tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [options.type, options.date]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const completeTask = useCallback(
    async (taskId: string, status: "COMPLETED" | "FAILED" | "SKIPPED") => {
      const date = options.date ?? new Date().toISOString().split("T")[0];

      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status } : t))
      );

      try {
        const res = await fetch(`/api/tasks/${taskId}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date, status }),
        });
        if (!res.ok) throw new Error("Failed to update task");
      } catch {
        // Revert on failure
        await fetchTasks();
      }
    },
    [options.date, fetchTasks]
  );

  const deleteTask = useCallback(async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    } catch {
      await fetchTasks();
    }
  }, [fetchTasks]);

  // Derived stats
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const total = tasks.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { tasks, loading, error, refetch: fetchTasks, completeTask, deleteTask, stats: { completed, total, percent } };
}

export function useTimeChunks() {
  const [timeChunks, setTimeChunks] = useState<Array<{ id: string; name: string; color: string; startTime: string; endTime: string; days: string[] }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/time-chunks")
      .then((r) => r.json())
      .then((d) => setTimeChunks(d.timeChunks ?? []))
      .finally(() => setLoading(false));
  }, []);

  return { timeChunks, loading };
}

export function useTaskGroups() {
  const [taskGroups, setTaskGroups] = useState<Array<{ id: string; name: string; color: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/task-groups")
      .then((r) => r.json())
      .then((d) => setTaskGroups(d.taskGroups ?? []))
      .finally(() => setLoading(false));
  }, []);

  return { taskGroups, loading };
}

export function useStats(type?: "DAILY" | "WEEKLY" | "MONTHLY") {
  const [stats, setStats] = useState<{
    totalTasks: number;
    tasksForDate: number;
    completedToday: number;
    failedToday: number;
    completionPercent: number;
    date: string;
  } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    fetch(`/api/tasks/stats?${params}`)
      .then((r) => r.json())
      .then((d) => setStats(d.stats));
  }, [type]);

  return stats;
}
