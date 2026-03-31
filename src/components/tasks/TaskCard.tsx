"use client";
import { useState } from "react";
import { Clock, AlertTriangle, CheckCircle2, XCircle, SkipForward, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED" | "FAILED";
type TaskType = "DAILY" | "WEEKLY" | "MONTHLY";
type ConsequenceSeverity = "LOW" | "MEDIUM" | "HIGH";

interface Consequence {
  description: string;
  severity: ConsequenceSeverity;
  isActive: boolean;
}

interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: number;
  estimatedMins?: number;
  consequence?: Consequence | null;
  onComplete: (id: string, status: "COMPLETED" | "FAILED" | "SKIPPED") => Promise<void>;
  className?: string;
}

const TYPE_LABELS: Record<TaskType, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
};

const TYPE_VARIANTS: Record<TaskType, "daily" | "weekly" | "monthly"> = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
};

const PRIORITY_LABELS = ["Low", "Medium", "High"];
const PRIORITY_COLORS = [
  "text-gray-500",
  "text-amber-600",
  "text-red-600",
];

const CONSEQUENCE_SEVERITY_COLORS: Record<ConsequenceSeverity, string> = {
  LOW: "text-green-600 bg-green-50 border-green-200",
  MEDIUM: "text-amber-700 bg-amber-50 border-amber-200",
  HIGH: "text-red-700 bg-red-50 border-red-200",
};

export function TaskCard({
  id,
  title,
  description,
  type,
  status,
  priority,
  estimatedMins,
  consequence,
  onComplete,
  className,
}: TaskCardProps) {
  const [showConsequence, setShowConsequence] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isCompleted = status === "COMPLETED";
  const isFailed = status === "FAILED";
  const isSkipped = status === "SKIPPED";
  const isDone = isCompleted || isFailed || isSkipped;

  const handleAction = async (action: "COMPLETED" | "FAILED" | "SKIPPED") => {
    setIsUpdating(true);
    try {
      await onComplete(id, action);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        isCompleted && "bg-green-50 border-green-200 opacity-80",
        isFailed && "bg-red-50 border-red-200 opacity-80",
        isSkipped && "bg-gray-50 border-gray-200 opacity-70",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Status icon */}
          <div className="mt-0.5 flex-shrink-0">
            {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-600" />}
            {isFailed && <XCircle className="h-5 w-5 text-red-600" />}
            {isSkipped && <SkipForward className="h-5 w-5 text-gray-400" />}
            {!isDone && (
              <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={cn(
                  "text-sm font-medium leading-snug",
                  isCompleted && "line-through text-gray-500",
                  isFailed && "text-red-700",
                  isSkipped && "text-gray-400"
                )}
              >
                {title}
              </h3>
              <Badge variant={TYPE_VARIANTS[type]} className="text-xs">
                {TYPE_LABELS[type]}
              </Badge>
              {priority > 0 && (
                <span className={cn("text-xs font-medium", PRIORITY_COLORS[priority])}>
                  {PRIORITY_LABELS[priority]}
                </span>
              )}
            </div>

            {/* Description */}
            {description && (
              <p className="mt-1 text-xs text-gray-500 line-clamp-2">{description}</p>
            )}

            {/* Meta row */}
            <div className="mt-2 flex items-center gap-3 flex-wrap">
              {estimatedMins && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  {estimatedMins}m
                </span>
              )}
              {consequence && consequence.isActive && (
                <button
                  onClick={() => setShowConsequence(!showConsequence)}
                  className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700"
                >
                  <Zap className="h-3 w-3" />
                  Consequence
                  {showConsequence ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              )}
            </div>

            {/* Consequence detail */}
            {showConsequence && consequence && (
              <div
                className={cn(
                  "mt-2 rounded-md border p-2 text-xs",
                  CONSEQUENCE_SEVERITY_COLORS[consequence.severity]
                )}
              >
                <div className="flex items-start gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  <span>{consequence.description}</span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          {!isDone && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                size="sm"
                variant="success"
                onClick={() => handleAction("COMPLETED")}
                disabled={isUpdating}
                className="h-7 px-2 text-xs"
                title="Mark complete"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAction("SKIPPED")}
                disabled={isUpdating}
                className="h-7 px-2 text-xs text-gray-400 hover:text-gray-600"
                title="Skip"
              >
                <SkipForward className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
          {isDone && !isSkipped && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleAction("PENDING" as "COMPLETED")}
              disabled={isUpdating}
              className="h-7 px-2 text-xs text-gray-400 flex-shrink-0"
              title="Undo"
            >
              Undo
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
