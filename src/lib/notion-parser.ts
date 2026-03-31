import { ParsedNotionTask, NotionTaskRow } from "@/schemas/notion-import";
import { TaskType, RecurrenceDay } from "@prisma/client";

const PRIORITY_MAP: Record<string, number> = {
  low: 0, medium: 1, high: 2,
  "0": 0, "1": 1, "2": 2,
};

const TYPE_MAP: Record<string, TaskType> = {
  daily: "DAILY", weekly: "WEEKLY", monthly: "MONTHLY",
};

const DAY_MAP: Record<string, RecurrenceDay> = {
  mon: "MONDAY", tue: "TUESDAY", wed: "WEDNESDAY", thu: "THURSDAY",
  fri: "FRIDAY", sat: "SATURDAY", sun: "SUNDAY",
  monday: "MONDAY", tuesday: "TUESDAY", wednesday: "WEDNESDAY",
  thursday: "THURSDAY", friday: "FRIDAY", saturday: "SATURDAY", sunday: "SUNDAY",
};

export function parseNotionRow(
  row: NotionTaskRow,
  defaults: { type?: TaskType; taskGroupId?: string; timeChunkId?: string }
): ParsedNotionTask {
  const title = row.Name.trim();

  const typeRaw = row.Type?.toLowerCase().trim() ?? "";
  const type: TaskType = TYPE_MAP[typeRaw] ?? defaults.type ?? "DAILY";

  const priorityRaw = row.Priority?.toLowerCase().trim() ?? "";
  const priority = PRIORITY_MAP[priorityRaw] ?? 0;

  const estimatedMins = row["Estimated Minutes"]
    ? parseInt(row["Estimated Minutes"], 10) || undefined
    : undefined;

  const recurrenceDays: RecurrenceDay[] = (row["Recurrence Days"] ?? "")
    .split(",")
    .map((d) => DAY_MAP[d.trim().toLowerCase()])
    .filter(Boolean) as RecurrenceDay[];

  const consequence =
    row.Consequence
      ? {
          description: row.Consequence.trim(),
          severity: (row["Consequence Severity"]?.toUpperCase() as "LOW" | "MEDIUM" | "HIGH") || "MEDIUM",
        }
      : undefined;

  return {
    title,
    description: row.Description?.trim() || undefined,
    type,
    priority,
    estimatedMins,
    recurrenceDays,
    dueDate: row["Due Date"] || undefined,
    taskGroupId: defaults.taskGroupId,
    timeChunkId: defaults.timeChunkId,
    notionId: row["Notion ID"] || undefined,
    notionUrl: row.URL || undefined,
    consequence,
  };
}

export function parseCSV(csvText: string): NotionTaskRow[] {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h.trim()] = values[i]?.trim() ?? "";
    });
    return row as unknown as NotionTaskRow;
  }).filter((row) => row.Name);
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
