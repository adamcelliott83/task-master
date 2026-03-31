import {
  calculateCompletionPercent,
  formatTime,
  getGreeting,
  getCurrentWeekDates,
  getCurrentMonthDates,
} from "@/lib/utils";

describe("calculateCompletionPercent", () => {
  it("returns 0 when total is 0", () => {
    expect(calculateCompletionPercent(0, 0)).toBe(0);
  });

  it("returns 100 when all tasks are completed", () => {
    expect(calculateCompletionPercent(5, 5)).toBe(100);
  });

  it("returns 50 when half tasks are completed", () => {
    expect(calculateCompletionPercent(3, 6)).toBe(50);
  });

  it("rounds to nearest integer", () => {
    expect(calculateCompletionPercent(1, 3)).toBe(33);
  });
});

describe("formatTime", () => {
  it("formats morning time correctly", () => {
    expect(formatTime("09:00")).toBe("9:00 AM");
  });

  it("formats afternoon time correctly", () => {
    expect(formatTime("14:30")).toBe("2:30 PM");
  });

  it("formats midnight as 12:00 AM", () => {
    expect(formatTime("00:00")).toBe("12:00 AM");
  });

  it("formats noon as 12:00 PM", () => {
    expect(formatTime("12:00")).toBe("12:00 PM");
  });
});

describe("getGreeting", () => {
  it("returns a non-empty string", () => {
    const greeting = getGreeting();
    expect(greeting).toBeTruthy();
    expect(["Good morning", "Good afternoon", "Good evening"]).toContain(greeting);
  });
});

describe("getCurrentWeekDates", () => {
  it("returns start and end dates of the current week", () => {
    const { start, end } = getCurrentWeekDates();
    expect(start).toBeInstanceOf(Date);
    expect(end).toBeInstanceOf(Date);
    expect(end.getTime()).toBeGreaterThan(start.getTime());
    // Week span is at least 6 days
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    expect(diff).toBeGreaterThanOrEqual(6);
  });
});

describe("getCurrentMonthDates", () => {
  it("returns start and end dates of the current month", () => {
    const { start, end } = getCurrentMonthDates();
    expect(start.getDate()).toBe(1);
    expect(end.getMonth()).toBe(start.getMonth());
    expect(end.getFullYear()).toBe(start.getFullYear());
  });
});
