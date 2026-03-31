import { parseCSV, parseNotionRow } from "@/lib/notion-parser";
import { NotionTaskRow } from "@/schemas/notion-import";

describe("parseCSV", () => {
  it("returns empty array for empty string", () => {
    expect(parseCSV("")).toEqual([]);
  });

  it("returns empty array for header-only CSV", () => {
    expect(parseCSV("Name,Type,Status")).toEqual([]);
  });

  it("parses a basic CSV with one task", () => {
    const csv = `Name,Type,Status,Description\nMorning workout,DAILY,PENDING,Do 30 mins of exercise`;
    const result = parseCSV(csv);
    expect(result).toHaveLength(1);
    expect(result[0].Name).toBe("Morning workout");
    expect(result[0].Type).toBe("DAILY");
  });

  it("handles quoted fields with commas", () => {
    const csv = `Name,Description\n"Task, with comma","Description, also has comma"`;
    const result = parseCSV(csv);
    expect(result).toHaveLength(1);
    expect(result[0].Name).toBe("Task, with comma");
  });

  it("handles quoted fields with embedded quotes", () => {
    const csv = `Name,Description\n"Task with ""quotes""","Normal desc"`;
    const result = parseCSV(csv);
    expect(result).toHaveLength(1);
    expect(result[0].Name).toBe('Task with "quotes"');
  });

  it("filters rows without a Name", () => {
    const csv = `Name,Type\nValid Task,DAILY\n,WEEKLY`;
    const result = parseCSV(csv);
    expect(result).toHaveLength(1);
    expect(result[0].Name).toBe("Valid Task");
  });
});

describe("parseNotionRow", () => {
  const baseRow: NotionTaskRow = {
    Name: "Test Task",
    Type: "daily",
    Status: "pending",
    Priority: "high",
    "Estimated Minutes": "30",
    "Recurrence Days": "mon,wed,fri",
    Consequence: "Push-ups",
    "Consequence Severity": "LOW",
  };

  it("parses a complete row correctly", () => {
    const result = parseNotionRow(baseRow, {});
    expect(result.title).toBe("Test Task");
    expect(result.type).toBe("DAILY");
    expect(result.priority).toBe(2);
    expect(result.estimatedMins).toBe(30);
    expect(result.recurrenceDays).toEqual(["MONDAY", "WEDNESDAY", "FRIDAY"]);
    expect(result.consequence?.description).toBe("Push-ups");
    expect(result.consequence?.severity).toBe("LOW");
  });

  it("uses default type when Type is missing", () => {
    const row: NotionTaskRow = { Name: "No type task" };
    const result = parseNotionRow(row, { type: "WEEKLY" });
    expect(result.type).toBe("WEEKLY");
  });

  it("uses DAILY as fallback type", () => {
    const row: NotionTaskRow = { Name: "No type task" };
    const result = parseNotionRow(row, {});
    expect(result.type).toBe("DAILY");
  });

  it("returns no consequence when Consequence field is empty", () => {
    const row: NotionTaskRow = { Name: "No consequence", Consequence: "" };
    const result = parseNotionRow(row, {});
    expect(result.consequence).toBeUndefined();
  });

  it("applies taskGroupId and timeChunkId from defaults", () => {
    const row: NotionTaskRow = { Name: "Grouped Task" };
    const result = parseNotionRow(row, {
      taskGroupId: "clxyz123",
      timeChunkId: "clxyz456",
    });
    expect(result.taskGroupId).toBe("clxyz123");
    expect(result.timeChunkId).toBe("clxyz456");
  });

  it("handles invalid priority gracefully", () => {
    const row: NotionTaskRow = { Name: "Task", Priority: "unknown" };
    const result = parseNotionRow(row, {});
    expect(result.priority).toBe(0);
  });

  it("handles invalid estimated minutes gracefully", () => {
    const row: NotionTaskRow = { Name: "Task", "Estimated Minutes": "abc" };
    const result = parseNotionRow(row, {});
    expect(result.estimatedMins).toBeUndefined();
  });
});
