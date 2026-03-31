"use client";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, ChevronLeft, ChevronRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WizardProgress } from "./WizardProgress";
import { StepType } from "./steps/StepType";
import { StepDetails } from "./steps/StepDetails";
import { StepSchedule } from "./steps/StepSchedule";
import { StepConsequence } from "./steps/StepConsequence";

// Wizard-local schema (superset of createTaskSchema, adds hasConsequence UI toggle)
const wizardSchema = z.object({
  type: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
  title: z.string().min(1, "Task name is required"),
  description: z.string().optional(),
  priority: z.number().int().min(0).max(2).default(0),
  estimatedMins: z.number().int().positive().optional().or(z.nan().transform(() => undefined)),
  recurrenceDays: z.array(z.string()).default([]),
  weekOfMonth: z.number().int().min(1).max(4).optional(),
  timeChunkId: z.string().optional(),
  taskGroupId: z.string().optional(),
  hasConsequence: z.boolean().default(false),
  consequence: z
    .object({
      description: z.string().optional(),
      severity: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
    })
    .optional(),
});

type WizardFormData = z.infer<typeof wizardSchema>;

interface TimeChunkOption { id: string; name: string; startTime: string; endTime: string; }
interface TaskGroupOption { id: string; name: string; color: string; }

interface TaskWizardProps {
  timeChunks: TimeChunkOption[];
  taskGroups: TaskGroupOption[];
  onClose: () => void;
  onCreated: () => void;
}

const STEPS = [
  { label: "Frequency", description: "How often?" },
  { label: "Details", description: "Name & priority" },
  { label: "Schedule", description: "Days & time block" },
  { label: "Consequence", description: "Accountability" },
];

export function TaskWizard({ timeChunks, taskGroups, onClose, onCreated }: TaskWizardProps) {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const methods = useForm<WizardFormData>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      type: "DAILY",
      priority: 0,
      recurrenceDays: [],
      hasConsequence: false,
    },
    mode: "onChange",
  });

  const { handleSubmit, watch, setValue, trigger } = methods;

  const type = watch("type");

  const canAdvance = async () => {
    if (step === 0) return true; // type always valid (has default)
    if (step === 1) return await trigger(["title"]);
    return true;
  };

  const handleNext = async () => {
    if (await canAdvance()) setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const onSubmit = async (data: WizardFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    const { hasConsequence, consequence, estimatedMins, ...rest } = data;

    const payload = {
      ...rest,
      estimatedMins: Number.isNaN(estimatedMins) ? undefined : estimatedMins,
      consequence:
        hasConsequence && consequence?.description
          ? { description: consequence.description, severity: consequence.severity ?? "MEDIUM" }
          : undefined,
    };

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json();
        setSubmitError(json.error ?? "Failed to create task");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onCreated();
        onClose();
      }, 1200);
    } catch {
      setSubmitError("Network error — please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="rounded-full bg-green-100 p-4">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <p className="text-lg font-semibold text-gray-900">Task created!</p>
        <p className="text-sm text-gray-500">Adding it to your list…</p>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">New task</h2>
            <p className="text-xs text-gray-500">Step {step + 1} of {STEPS.length}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <WizardProgress steps={STEPS} currentStep={step} />

          <form onSubmit={handleSubmit(onSubmit)} id="wizard-form">
            {step === 0 && (
              <StepType value={type} onChange={(t) => setValue("type", t)} />
            )}
            {step === 1 && <StepDetails />}
            {step === 2 && (
              <StepSchedule timeChunks={timeChunks} taskGroups={taskGroups} />
            )}
            {step === 3 && <StepConsequence />}
          </form>

          {submitError && (
            <div className="mt-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/60">
          <Button
            type="button"
            variant="ghost"
            onClick={step === 0 ? onClose : handleBack}
            disabled={isSubmitting}
          >
            {step === 0 ? (
              "Cancel"
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                Back
              </>
            )}
          </Button>

          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              form="wizard-form"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create task"
              )}
            </Button>
          )}
        </div>
      </div>
    </FormProvider>
  );
}
