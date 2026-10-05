import { FormEvent, useState } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { api } from "@/services/api";
import { useTranslation } from "@/i18n";
import type { PersonSimple, PersonDetail, TeamSimple } from "@/types";

export interface PersonFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person?: PersonSimple | PersonDetail | null;
  teams: TeamSimple[];
  onSuccess: (updatedId?: number) => void;
}

interface PersonFormContentProps {
  person?: PersonSimple | PersonDetail | null;
  teams: TeamSimple[];
  onOpenChange: (open: boolean) => void;
  onSuccess: (updatedId?: number) => void;
}

function PersonFormContent({ person, teams, onOpenChange, onSuccess }: PersonFormContentProps) {
  const { t } = useTranslation();
  const isEdit = Boolean(person);

  const [name, setName] = useState(person ? person.name : "");
  const [email, setEmail] = useState(person ? person.email : "");
  const [role, setRole] = useState(person ? person.role : "Developer");
  const [teamId, setTeamId] = useState<number | "">(person?.team?.id ?? "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !role.trim()) return;

    try {
      setSubmitting(true);
      if (isEdit && person) {
        await api.updatePerson(person.id, {
          name: name.trim(),
          email: email.trim(),
          role: role.trim(),
          teamId: teamId === "" ? null : Number(teamId),
        });
        onOpenChange(false);
        onSuccess(person.id);
      } else {
        await api.createPerson({
          name: name.trim(),
          email: email.trim(),
          role: role.trim(),
          teamId: teamId === "" ? undefined : Number(teamId),
        });
        onOpenChange(false);
        onSuccess();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : isEdit ? "Failed to update person" : "Failed to create person");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DialogContent className="max-w-md" data-testid="person-form-dialog">
      <DialogHeader>
        <DialogTitle>{isEdit ? t.persons.editModalTitle : t.persons.createModalTitle}</DialogTitle>
        <DialogDescription>{isEdit ? t.persons.editModalSubtitle : t.persons.createModalSubtitle}</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">{t.persons.nameLabel}</label>
          <Input required placeholder={t.persons.namePlaceholder} value={name} onChange={(e) => setName(e.target.value)} data-testid="person-name-input" className="text-sm" />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">{t.persons.emailLabel}</label>
          <Input
            required
            type="email"
            placeholder={t.persons.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="person-email-input"
            className="text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">{t.persons.roleLabel}</label>
          <Input required placeholder={t.persons.rolePlaceholder} value={role} onChange={(e) => setRole(e.target.value)} data-testid="person-role-input" className="text-sm" />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">{t.persons.teamLabel}</label>
          <div className="relative">
            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value === "" ? "" : Number(e.target.value))}
              data-testid="person-team-select"
              className="w-full h-9 rounded-md border border-input bg-background pl-3 pr-9 py-1 text-sm shadow-xs appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">{t.persons.noTeamAssigned}</option>
              {teams.map((tItem) => (
                <option key={tItem.id} value={tItem.id}>
                  {tItem.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="w-full sm:w-auto h-9 sm:h-8">
            {t.common.cancel}
          </Button>
          <Button type="submit" size="sm" disabled={submitting} data-testid="person-submit-btn" className="w-full sm:w-auto h-9 sm:h-8">
            {submitting ? (isEdit ? t.persons.editingBtn : t.persons.creatingBtn) : isEdit ? t.persons.editBtn : t.persons.createBtn}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

export function PersonFormDialog({ open, onOpenChange, person, teams, onSuccess }: PersonFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && <PersonFormContent key={person ? `edit-${person.id}` : "create"} person={person} teams={teams} onOpenChange={onOpenChange} onSuccess={onSuccess} />}
    </Dialog>
  );
}
