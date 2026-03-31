"use client";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function StepDetails() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const priority = watch("priority");

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Task details</h2>
        <p className="text-sm text-gray-500 mt-1">Give your task a name and optional context.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">
          Task name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g. Morning workout"
          {...register("title")}
          aria-invalid={!!errors.title}
        />
        {errors.title && (
          <p className="text-xs text-red-600">{errors.title.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          placeholder="Add any notes or context…"
          rows={3}
          {...register("description")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={String(priority ?? 0)}
            onValueChange={(v) => setValue("priority", parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Low</SelectItem>
              <SelectItem value="1">Medium</SelectItem>
              <SelectItem value="2">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedMins">Estimated time (mins)</Label>
          <Input
            id="estimatedMins"
            type="number"
            min={1}
            max={480}
            placeholder="30"
            {...register("estimatedMins", { valueAsNumber: true })}
          />
          {errors.estimatedMins && (
            <p className="text-xs text-red-600">{errors.estimatedMins.message as string}</p>
          )}
        </div>
      </div>
    </div>
  );
}
