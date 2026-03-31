import { createTimeChunkSchema } from "@/schemas/time-chunk";

describe("createTimeChunkSchema", () => {
  const validChunk = {
    name: "Morning Focus",
    startTime: "09:00",
    endTime: "12:00",
    days: ["MONDAY", "TUESDAY", "WEDNESDAY"],
    color: "#3B82F6",
  };

  it("validates a valid time chunk", () => {
    const result = createTimeChunkSchema.safeParse(validChunk);
    expect(result.success).toBe(true);
  });

  it("rejects end time before start time", () => {
    const result = createTimeChunkSchema.safeParse({
      ...validChunk,
      startTime: "12:00",
      endTime: "09:00",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten();
      expect(errors.fieldErrors.endTime).toBeDefined();
    }
  });

  it("rejects equal start and end time", () => {
    const result = createTimeChunkSchema.safeParse({
      ...validChunk,
      startTime: "09:00",
      endTime: "09:00",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid time format", () => {
    const result = createTimeChunkSchema.safeParse({
      ...validChunk,
      startTime: "9:00",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid hex color", () => {
    const result = createTimeChunkSchema.safeParse({
      ...validChunk,
      color: "blue",
    });
    expect(result.success).toBe(false);
  });

  it("requires at least one day", () => {
    const result = createTimeChunkSchema.safeParse({
      ...validChunk,
      days: [],
    });
    expect(result.success).toBe(false);
  });

  it("defaults color to #3B82F6", () => {
    const { color: _, ...withoutColor } = validChunk;
    const result = createTimeChunkSchema.safeParse(withoutColor);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.color).toBe("#3B82F6");
    }
  });
});
