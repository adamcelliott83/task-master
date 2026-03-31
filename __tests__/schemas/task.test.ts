import { createTaskSchema, updateTaskSchema, taskQuerySchema } from "@/schemas/task";

describe("createTaskSchema", () => {
  const validTask = {
    title: "Morning workout",
    type: "DAILY",
    priority: 1,
  };

  it("validates a minimal valid task", () => {
    const result = createTaskSchema.safeParse(validTask);
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = createTaskSchema.safeParse({ ...validTask, title: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.title).toBeDefined();
    }
  });

  it("rejects invalid task type", () => {
    const result = createTaskSchema.safeParse({ ...validTask, type: "HOURLY" });
    expect(result.success).toBe(false);
  });

  it("rejects priority out of range", () => {
    const result = createTaskSchema.safeParse({ ...validTask, priority: 5 });
    expect(result.success).toBe(false);
  });

  it("validates task with consequence", () => {
    const result = createTaskSchema.safeParse({
      ...validTask,
      consequence: { description: "Do 20 push-ups", severity: "HIGH" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects consequence with empty description", () => {
    const result = createTaskSchema.safeParse({
      ...validTask,
      consequence: { description: "", severity: "MEDIUM" },
    });
    expect(result.success).toBe(false);
  });

  it("defaults recurrenceDays to empty array", () => {
    const result = createTaskSchema.safeParse(validTask);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.recurrenceDays).toEqual([]);
    }
  });
});

describe("updateTaskSchema", () => {
  it("allows partial updates", () => {
    const result = updateTaskSchema.safeParse({ title: "Updated title" });
    expect(result.success).toBe(true);
  });

  it("allows status update", () => {
    const result = updateTaskSchema.safeParse({ status: "COMPLETED" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = updateTaskSchema.safeParse({ status: "DONE" });
    expect(result.success).toBe(false);
  });
});

describe("taskQuerySchema", () => {
  it("applies defaults", () => {
    const result = taskQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(50);
    }
  });

  it("validates date format", () => {
    const valid = taskQuerySchema.safeParse({ date: "2024-01-15" });
    expect(valid.success).toBe(true);

    const invalid = taskQuerySchema.safeParse({ date: "01/15/2024" });
    expect(invalid.success).toBe(false);
  });

  it("coerces string numbers for pagination", () => {
    const result = taskQuerySchema.safeParse({ page: "2", limit: "20" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(20);
    }
  });

  it("rejects limit over 100", () => {
    const result = taskQuerySchema.safeParse({ limit: "200" });
    expect(result.success).toBe(false);
  });
});
