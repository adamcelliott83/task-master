import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TaskCard } from "@/components/tasks/TaskCard";

const baseTask = {
  id: "task-1",
  title: "Morning workout",
  type: "DAILY" as const,
  status: "PENDING" as const,
  priority: 0,
};

describe("TaskCard", () => {
  it("renders the task title", () => {
    render(<TaskCard {...baseTask} onComplete={jest.fn()} />);
    expect(screen.getByText("Morning workout")).toBeInTheDocument();
  });

  it("shows the task type badge", () => {
    render(<TaskCard {...baseTask} onComplete={jest.fn()} />);
    expect(screen.getByText("Daily")).toBeInTheDocument();
  });

  it("shows description when provided", () => {
    render(
      <TaskCard {...baseTask} description="Do 30 mins cardio" onComplete={jest.fn()} />
    );
    expect(screen.getByText("Do 30 mins cardio")).toBeInTheDocument();
  });

  it("shows estimated time when provided", () => {
    render(<TaskCard {...baseTask} estimatedMins={30} onComplete={jest.fn()} />);
    expect(screen.getByText("30m")).toBeInTheDocument();
  });

  it("calls onComplete with COMPLETED when check button is clicked", async () => {
    const onComplete = jest.fn().mockResolvedValue(undefined);
    render(<TaskCard {...baseTask} onComplete={onComplete} />);
    fireEvent.click(screen.getByTitle("Mark complete"));
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith("task-1", "COMPLETED");
    });
  });

  it("calls onComplete with SKIPPED when skip button is clicked", async () => {
    const onComplete = jest.fn().mockResolvedValue(undefined);
    render(<TaskCard {...baseTask} onComplete={onComplete} />);
    fireEvent.click(screen.getByTitle("Skip"));
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith("task-1", "SKIPPED");
    });
  });

  it("shows line-through for completed tasks", () => {
    render(
      <TaskCard {...baseTask} status="COMPLETED" onComplete={jest.fn()} />
    );
    const title = screen.getByText("Morning workout");
    expect(title).toHaveClass("line-through");
  });

  it("hides action buttons when task is completed", () => {
    render(
      <TaskCard {...baseTask} status="COMPLETED" onComplete={jest.fn()} />
    );
    expect(screen.queryByTitle("Mark complete")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Skip")).not.toBeInTheDocument();
  });

  it("shows consequence toggle when consequence is set", () => {
    render(
      <TaskCard
        {...baseTask}
        consequence={{ description: "Do 20 push-ups", severity: "MEDIUM", isActive: true }}
        onComplete={jest.fn()}
      />
    );
    expect(screen.getByText("Consequence")).toBeInTheDocument();
  });

  it("expands consequence details on click", () => {
    render(
      <TaskCard
        {...baseTask}
        consequence={{ description: "Do 20 push-ups", severity: "HIGH", isActive: true }}
        onComplete={jest.fn()}
      />
    );
    fireEvent.click(screen.getByText("Consequence"));
    expect(screen.getByText("Do 20 push-ups")).toBeInTheDocument();
  });

  it("shows High priority label for priority 2", () => {
    render(<TaskCard {...baseTask} priority={2} onComplete={jest.fn()} />);
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("does not show priority label for priority 0", () => {
    render(<TaskCard {...baseTask} priority={0} onComplete={jest.fn()} />);
    expect(screen.queryByText("Low")).not.toBeInTheDocument();
  });
});
