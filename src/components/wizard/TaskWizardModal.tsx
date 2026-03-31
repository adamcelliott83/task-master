"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { TaskWizard } from "./TaskWizard";

interface TimeChunkOption { id: string; name: string; startTime: string; endTime: string; }
interface TaskGroupOption { id: string; name: string; color: string; }

interface TaskWizardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timeChunks: TimeChunkOption[];
  taskGroups: TaskGroupOption[];
  onCreated: () => void;
}

export function TaskWizardModal({
  open,
  onOpenChange,
  timeChunks,
  taskGroups,
  onCreated,
}: TaskWizardModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed z-50 left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-lg max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <Dialog.Title className="sr-only">Create new task</Dialog.Title>
          <TaskWizard
            timeChunks={timeChunks}
            taskGroups={taskGroups}
            onClose={() => onOpenChange(false)}
            onCreated={onCreated}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
