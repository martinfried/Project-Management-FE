import { FormEvent, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { api } from "@/services/api";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import type { ProjectSimple, ProjectDetail, ProjectStatus } from "@/types";

export interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: ProjectSimple | ProjectDetail | null;
  onSuccess: (updatedId?: number) => void;
}

interface ProjectFormContentProps {
  project?: ProjectSimple | ProjectDetail | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updatedId?: number) => void;
}

function ProjectFormContent({ project, onOpenChange, onSuccess }: ProjectFormContentProps) {
  const { t } = useTranslation();
  const isEdit = Boolean(project);

  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const initialStartDate = project?.startDate ? project.startDate.split("T")[0] : "";

  const [name, setNewName] = useState(project ? project.name : "");
  const [description, setNewDescription] = useState(project?.description || "");
  const [status, setNewStatus] = useState<ProjectStatus>(project ? project.status : "Planned");
  const [startDate, setNewStartDate] = useState(initialStartDate);
  const [endDate, setNewEndDate] = useState(project?.endDate ? project.endDate.split("T")[0] : "");
  const [submitting, setSubmitting] = useState(false);

  const isStartDateInPast = Boolean(startDate && startDate < todayStr && (!isEdit || startDate !== initialStartDate));
  const isEndDateBeforeStart = Boolean(startDate && endDate && endDate < startDate);
  const hasDateErrors = isStartDateInPast || isEndDateBeforeStart;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || hasDateErrors) return;

    try {
      setSubmitting(true);
      if (isEdit && project) {
        await api.updateProject(project.id, {
          name: name.trim(),
          description: description.trim() || null,
          status,
          startDate: startDate || null,
          endDate: endDate || null,
        });
        onOpenChange(false);
        onSuccess(project.id);
      } else {
        await api.createProject({
          name: name.trim(),
          description: description.trim() || undefined,
          status,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });
        onOpenChange(false);
        onSuccess();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : isEdit ? "Failed to update project" : "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DialogContent className="max-w-md" data-testid="project-form-dialog">
      <DialogHeader>
        <DialogTitle>{isEdit ? t.projects.editModalTitle : t.projects.createModalTitle}</DialogTitle>
        <DialogDescription>{isEdit ? t.projects.editModalSubtitle : t.projects.createModalSubtitle}</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">{t.projects.nameLabel}</label>
          <Input required placeholder={t.projects.namePlaceholder} value={name} onChange={(e) => setNewName(e.target.value)} data-testid="project-name-input" className="text-sm" />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">{t.projects.descLabel}</label>
          <Input
            placeholder={t.projects.descPlaceholder}
            value={description}
            onChange={(e) => setNewDescription(e.target.value)}
            data-testid="project-desc-input"
            className="text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">{t.projects.statusLabel}</label>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setNewStatus(e.target.value as ProjectStatus)}
              data-testid="project-status-select"
              className="w-full h-9 rounded-md border border-input bg-background pl-3 pr-9 py-1 text-sm shadow-xs appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="Planned">{t.status["Planned"]}</option>
              <option value="In Progress">{t.status["In Progress"]}</option>
              <option value="Completed">{t.status["Completed"]}</option>
              <option value="On Hold">{t.status["On Hold"]}</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">{t.projects.startDateLabel}</label>
            <Input
              type="date"
              value={startDate}
              min={isEdit && initialStartDate && initialStartDate < todayStr ? initialStartDate : todayStr}
              onChange={(e) => setNewStartDate(e.target.value)}
              data-testid="project-start-date-input"
              className={cn("text-sm", isStartDateInPast && "border-destructive focus-visible:ring-destructive text-destructive")}
            />
            {isStartDateInPast && (
              <p className="text-[11px] text-destructive leading-tight font-medium" data-testid="error-start-date-past">
                {t.projects.errorStartDateInPast}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">{t.projects.endDateLabel}</label>
            <Input
              type="date"
              value={endDate}
              min={startDate || (isEdit && initialStartDate && initialStartDate < todayStr ? initialStartDate : todayStr)}
              onChange={(e) => setNewEndDate(e.target.value)}
              data-testid="project-end-date-input"
              className={cn("text-sm", isEndDateBeforeStart && "border-destructive focus-visible:ring-destructive text-destructive")}
            />
            {isEndDateBeforeStart && (
              <p className="text-[11px] text-destructive leading-tight font-medium" data-testid="error-end-date-before-start">
                {t.projects.errorEndDateBeforeStart}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="w-full sm:w-auto h-9 sm:h-8">
            {t.common.cancel}
          </Button>
          <Button type="submit" size="sm" disabled={submitting || hasDateErrors} data-testid="project-submit-btn" className="w-full sm:w-auto h-9 sm:h-8">
            {submitting ? (isEdit ? t.projects.editingBtn : t.projects.creatingBtn) : isEdit ? t.projects.editBtn : t.projects.createBtn}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

export function ProjectFormDialog({ open, onOpenChange, project, onSuccess }: ProjectFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && <ProjectFormContent key={project ? `edit-${project.id}` : "create"} project={project} onOpenChange={onOpenChange} onSuccess={onSuccess} />}
    </Dialog>
  );
}
