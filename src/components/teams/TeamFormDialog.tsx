import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { api } from "@/services/api";
import { useTranslation } from "@/i18n";
import type { TeamSimple, TeamDetail } from "@/types";

export interface TeamFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team?: TeamSimple | TeamDetail | null;
  onSuccess: (updatedId?: number) => void;
}

interface TeamFormContentProps {
  team?: TeamSimple | TeamDetail | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updatedId?: number) => void;
}

function TeamFormContent({ team, onOpenChange, onSuccess }: TeamFormContentProps) {
  const { t } = useTranslation();
  const isEdit = Boolean(team);

  const [name, setName] = useState(team ? team.name : "");
  const [description, setDescription] = useState(team && "description" in team && team.description ? team.description : "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (team && !("description" in team)) {
      let isMounted = true;
      api
        .getTeam(team.id)
        .then((res) => {
          if (isMounted && res.data?.description) {
            setDescription(res.data.description);
          }
        })
        .catch(() => {
          // ignore
        });
      return () => {
        isMounted = false;
      };
    }
  }, [team]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      if (isEdit && team) {
        await api.updateTeam(team.id, {
          name: name.trim(),
          description: description.trim() || null,
        });
        onOpenChange(false);
        onSuccess(team.id);
      } else {
        await api.createTeam({
          name: name.trim(),
          description: description.trim() || undefined,
        });
        onOpenChange(false);
        onSuccess();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : isEdit ? "Failed to update team" : "Failed to create team");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DialogContent className="max-w-md" data-testid="team-form-dialog">
      <DialogHeader>
        <DialogTitle>{isEdit ? t.teams.editModalTitle : t.teams.createModalTitle}</DialogTitle>
        <DialogDescription>{isEdit ? t.teams.editModalSubtitle : t.teams.createModalSubtitle}</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">{t.teams.nameLabel}</label>
          <Input required placeholder={t.teams.namePlaceholder} value={name} onChange={(e) => setName(e.target.value)} data-testid="team-name-input" className="text-sm" />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">{t.teams.descLabel}</label>
          <Input placeholder={t.teams.descPlaceholder} value={description} onChange={(e) => setDescription(e.target.value)} data-testid="team-desc-input" className="text-sm" />
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="w-full sm:w-auto h-9 sm:h-8">
            {t.common.cancel}
          </Button>
          <Button type="submit" size="sm" disabled={submitting} data-testid="team-submit-btn" className="w-full sm:w-auto h-9 sm:h-8">
            {submitting ? (isEdit ? t.teams.editingBtn : t.teams.creatingBtn) : isEdit ? t.teams.editBtn : t.teams.createBtn}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

export function TeamFormDialog({ open, onOpenChange, team, onSuccess }: TeamFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && <TeamFormContent key={team ? `edit-${team.id}` : "create"} team={team} onOpenChange={onOpenChange} onSuccess={onSuccess} />}
    </Dialog>
  );
}
