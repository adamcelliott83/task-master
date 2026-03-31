"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Clock, Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTime, cn } from "@/lib/utils";
import { createTimeChunkSchema, type CreateTimeChunkInput } from "@/schemas/time-chunk";

type RecurrenceDay = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

const ALL_DAYS: { value: RecurrenceDay; short: string }[] = [
  { value: "MONDAY", short: "M" },
  { value: "TUESDAY", short: "T" },
  { value: "WEDNESDAY", short: "W" },
  { value: "THURSDAY", short: "T" },
  { value: "FRIDAY", short: "F" },
  { value: "SATURDAY", short: "S" },
  { value: "SUNDAY", short: "S" },
];

const COLORS = ["#3B82F6", "#6366F1", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#EF4444", "#14B8A6"];

interface TimeChunk {
  id: string;
  name: string;
  color: string;
  startTime: string;
  endTime: string;
  days: RecurrenceDay[];
  description?: string;
  _count?: { tasks: number };
}

export default function TimeChunksPage() {
  const [timeChunks, setTimeChunks] = useState<TimeChunk[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<RecurrenceDay[]>([]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateTimeChunkInput>({
    resolver: zodResolver(createTimeChunkSchema),
    defaultValues: { color: COLORS[0], order: 0 },
  });

  const fetchChunks = async () => {
    const res = await fetch("/api/time-chunks");
    const data = await res.json();
    setTimeChunks(data.timeChunks ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchChunks(); }, []);

  const toggleDay = (day: RecurrenceDay) => {
    const next = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    setSelectedDays(next);
    setValue("days", next);
  };

  const openForm = (chunk?: TimeChunk) => {
    if (chunk) {
      setEditingId(chunk.id);
      reset({ name: chunk.name, startTime: chunk.startTime, endTime: chunk.endTime, color: chunk.color, description: chunk.description, days: chunk.days, order: 0 });
      setSelectedDays(chunk.days);
      setSelectedColor(chunk.color);
    } else {
      setEditingId(null);
      reset({ color: COLORS[0], order: 0 });
      setSelectedDays([]);
      setSelectedColor(COLORS[0]);
    }
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingId(null); setFormError(null); };

  const onSubmit = async (data: CreateTimeChunkInput) => {
    setSubmitting(true);
    setFormError(null);
    const payload = { ...data, days: selectedDays, color: selectedColor };
    try {
      const res = await fetch(editingId ? `/api/time-chunks/${editingId}` : "/api/time-chunks", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const json = await res.json();
        setFormError(json.error ?? "Failed to save");
        return;
      }
      await fetchChunks();
      closeForm();
    } finally {
      setSubmitting(false);
    }
  };

  const deleteChunk = async (id: string) => {
    if (!confirm("Delete this time chunk? Tasks will be unassigned.")) return;
    await fetch(`/api/time-chunks/${id}`, { method: "DELETE" });
    setTimeChunks((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Time Chunks</h1>
          <p className="text-sm text-gray-500 mt-0.5">Group tasks into named time blocks</p>
        </div>
        {!showForm && (
          <Button onClick={() => openForm()} size="sm">
            <Plus className="h-4 w-4" /> New chunk
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{editingId ? "Edit time chunk" : "New time chunk"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {formError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{formError}</p>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label>Name *</Label>
                  <Input placeholder="e.g. Morning Focus" {...register("name")} />
                  {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Start time *</Label>
                  <Input type="time" {...register("startTime")} />
                  {errors.startTime && <p className="text-xs text-red-600">{errors.startTime.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>End time *</Label>
                  <Input type="time" {...register("endTime")} />
                  {errors.endTime && <p className="text-xs text-red-600">{errors.endTime.message}</p>}
                </div>
              </div>

              {/* Day picker */}
              <div className="space-y-1.5">
                <Label>Days *</Label>
                <div className="flex gap-2 flex-wrap">
                  {ALL_DAYS.map((d) => (
                    <button key={d.value} type="button" onClick={() => toggleDay(d.value)}
                      className={cn("h-9 w-9 rounded-full text-sm font-medium border-2 transition-colors",
                        selectedDays.includes(d.value) ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-300 text-gray-600 hover:border-indigo-400"
                      )}>
                      {d.short}
                    </button>
                  ))}
                </div>
                {errors.days && <p className="text-xs text-red-600">{errors.days.message}</p>}
              </div>

              {/* Color picker */}
              <div className="space-y-1.5">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => { setSelectedColor(c); setValue("color", c); }}
                      className={cn("h-7 w-7 rounded-full border-2 transition-all", selectedColor === c ? "border-gray-900 scale-110" : "border-transparent")}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={submitting} size="sm">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingId ? "Save changes" : "Create chunk"}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={closeForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : timeChunks.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Clock className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-600">No time chunks yet</p>
          <p className="text-sm mt-1">Create blocks like "Morning Focus" or "Evening Review"</p>
        </div>
      ) : (
        <div className="space-y-3">
          {timeChunks.map((chunk) => (
            <div key={chunk.id} className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 group">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: chunk.color + "20" }}>
                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: chunk.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900">{chunk.name}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                  <span>{formatTime(chunk.startTime)} – {formatTime(chunk.endTime)}</span>
                  <span>{chunk.days.map((d) => d.slice(0, 3)).join(", ")}</span>
                  {chunk._count && <span>{chunk._count.tasks} tasks</span>}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openForm(chunk)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => deleteChunk(chunk.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
