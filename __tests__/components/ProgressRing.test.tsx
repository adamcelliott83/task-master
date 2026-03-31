import { render, screen } from "@testing-library/react";
import { ProgressRing } from "@/components/tasks/ProgressRing";

describe("ProgressRing", () => {
  it("displays the percent value", () => {
    render(<ProgressRing percent={75} />);
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("shows 0% when percent is 0", () => {
    render(<ProgressRing percent={0} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("shows 100% when fully complete", () => {
    render(<ProgressRing percent={100} />);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("renders a label when provided", () => {
    render(<ProgressRing percent={50} label="Today" />);
    expect(screen.getByText("Today")).toBeInTheDocument();
  });

  it("renders a sublabel when provided", () => {
    render(<ProgressRing percent={50} label="Today" sublabel="3/6" />);
    expect(screen.getByText("3/6")).toBeInTheDocument();
  });

  it("renders an SVG element", () => {
    const { container } = render(<ProgressRing percent={60} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
