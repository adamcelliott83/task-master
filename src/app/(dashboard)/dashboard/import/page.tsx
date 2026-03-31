"use client";
import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useTaskGroups, useTimeChunks } from "@/lib/hooks/useTasks";

type ImportStatus = "idle" | "parsing" | "confirming" | "importing" | "done" | "error";

interface PreviewTask {
  title: string;
  type: string;
  priority: number;
  estimatedMins?: number;
  recurrenceDays: string[];
  consequence?: { description: string; severity: string };
}

export default function ImportPage() {
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [csvContent, setCsvContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewTask[]>([]);
  const [defaultType, setDefaultType] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("DAILY");
  const [timeChunkId, setTimeChunkId] = useState<string>("");
  const [taskGroupId, setTaskGroupId] = useState<string>("");
  const [importedCount, setImportedCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { timeChunks } = useTimeChunks();
  const { taskGroups } = useTaskGroups();

  const parsePreview = (content: string) => {
    const lines = content.trim().split("\n");
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());
    return lines.slice(1, 6).map((line) => {
      const vals = line.split(",").map((v) => v.replace(/"/g, "").trim());
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = vals[i] ?? ""; });
      return {
        title: row["Name"] ?? row["name"] ?? "Untitled",
        type: row["Type"] ?? defaultType,
        priority: ["high", "2"].includes((row["Priority"] ?? "").toLowerCase()) ? 2 : ["medium", "1"].includes((row["Priority"] ?? "").toLowerCase()) ? 1 : 0,
        estimatedMins: row["Estimated Minutes"] ? parseInt(row["Estimated Minutes"]) || undefined : undefined,
        recurrenceDays: row["Recurrence Days"] ? row["Recurrence Days"].split(",").map((d) => d.trim()) : [],
        consequence: row["Consequence"] ? { description: row["Consequence"], severity: row["Consequence Severity"] || "MEDIUM" } : undefined,
      };
    }).filter((t) => t.title && t.title !== "Untitled");
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setErrorMsg("Please upload a CSV file (.csv)");
      setStatus("error");
      return;
    }
    if (file.size > 1_000_000) {
      setErrorMsg("File too large (max 1 MB)");
      setStatus("error");
      return;
    }
    setFileName(file.name);
    setStatus("parsing");
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvContent(content);
      setPreview(parsePreview(content));
      setStatus("confirming");
    };
    reader.onerror = () => { setErrorMsg("Failed to read file"); setStatus("error"); };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleImport = async () => {
    if (!csvContent) return;
    setStatus("importing");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/import/notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvContent,
          defaultType,
          timeChunkId: timeChunkId || undefined,
          taskGroupId: taskGroupId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Import failed");
        setStatus("error");
        return;
      }
      setImportedCount(data.imported);
      setStatus("done");
    } catch {
      setErrorMsg("Network error — please try again");
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setCsvContent(null);
    setFileName(null);
    setPreview([]);
    setErrorMsg(null);
    setImportedCount(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const PRIORITY_LABELS = ["Low", "Medium", "High"];
  const PRIORITY_COLORS = ["text-gray-500", "text-amber-600", "text-red-600"];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Import from Notion</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload a CSV exported from Notion to bulk-create tasks.
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-800 space-y-2">
        <p className="font-semibold">How to export from Notion:</p>
        <ol className="list-decimal list-inside space-y-1 text-indigo-700">
          <li>Open your Notion database</li>
          <li>Click <strong>···</strong> (top right) → <strong>Export</strong></li>
          <li>Choose <strong>CSV</strong> format and download</li>
          <li>Upload the file below</li>
        </ol>
        <p className="text-xs text-indigo-600 mt-2">
          Supported columns: <code className="bg-indigo-100 px-1 rounded">Name</code>, <code className="bg-indigo-100 px-1 rounded">Type</code>, <code className="bg-indigo-100 px-1 rounded">Priority</code>, <code className="bg-indigo-100 px-1 rounded">Description</code>, <code className="bg-indigo-100 px-1 rounded">Estimated Minutes</code>, <code className="bg-indigo-100 px-1 rounded">Recurrence Days</code>, <code className="bg-indigo-100 px-1 rounded">Consequence</code>, <code className="bg-indigo-100 px-1 rounded">Consequence Severity</code>
        </p>
        <a href="/notion-import-template.csv" download className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:underline font-medium mt-1">
          <Download className="h-3.5 w-3.5" />
          Download template CSV
        </a>
      </div>

      {/* Success state */}
      {status === "done" && (
        <div className="flex flex-col items-center py-12 gap-4 bg-green-50 rounded-xl border border-green-200">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
          <div className="text-center">
            <p className="text-lg font-semibold text-green-800">{importedCount} tasks imported!</p>
            <p className="text-sm text-green-600 mt-1">They've been added to your task list.</p>
          </div>
          <Button onClick={reset} variant="outline" size="sm">Import another file</Button>
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{errorMsg}</p>
          </div>
          <button onClick={reset} className="text-red-400 hover:text-red-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload zone */}
      {(status === "idle" || status === "error") && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors",
            isDragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
          )}
        >
          <div className="bg-gray-100 rounded-full p-3">
            <Upload className="h-6 w-6 text-gray-500" />
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-700 text-sm">Drop your CSV here, or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">Max 1 MB · CSV files only</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>
      )}

      {/* Parsing indicator */}
      {status === "parsing" && (
        <div className="flex items-center justify-center py-10 gap-3 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Parsing file…</span>
        </div>
      )}

      {/* Confirmation */}
      {status === "confirming" && (
        <div className="space-y-5">
          {/* File info */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-lg border border-gray-200 px-4 py-3">
            <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
              <p className="text-xs text-gray-500">
                {preview.length > 0 ? `${preview.length}+ tasks detected` : "Checking…"}
              </p>
            </div>
            <button onClick={reset} className="text-gray-400 hover:text-gray-600 p-1">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Import options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Default task type</Label>
              <Select value={defaultType} onValueChange={(v) => setDefaultType(v as typeof defaultType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Assign to time chunk</Label>
              <Select value={timeChunkId || "none"} onValueChange={(v) => setTimeChunkId(v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {timeChunks.map((tc) => (
                    <SelectItem key={tc.id} value={tc.id}>{tc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Assign to task group</Label>
              <Select value={taskGroupId || "none"} onValueChange={(v) => setTaskGroupId(v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {taskGroups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Preview (first {preview.length} tasks)
              </p>
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                {preview.map((task, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 bg-white">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                      <div className="flex gap-2 mt-0.5 text-xs text-gray-400">
                        <span>{task.type}</span>
                        {task.estimatedMins && <span>{task.estimatedMins}m</span>}
                        {task.recurrenceDays.length > 0 && <span>{task.recurrenceDays.join(", ")}</span>}
                      </div>
                    </div>
                    <span className={cn("text-xs font-medium flex-shrink-0", PRIORITY_COLORS[task.priority])}>
                      {PRIORITY_LABELS[task.priority]}
                    </span>
                    {task.consequence && (
                      <span className="text-xs text-amber-600 flex-shrink-0">⚡ Consequence</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handleImport} disabled={status === "importing"}>
              {status === "importing" ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Importing…</>
              ) : (
                <><Upload className="h-4 w-4" /> Import tasks</>
              )}
            </Button>
            <Button variant="outline" onClick={reset}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
