import { useEffect, useState } from "react";
import { Building2, FolderKanban, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogLoading } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { api } from "@/services/api";
import { useTranslation } from "@/i18n";
import type { PersonDetail } from "@/types";

export interface PersonDetailDialogProps {
  personId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (person: PersonDetail) => void;
  refreshKey?: number;
}

interface PersonDetailContentProps {
  personId: number;
  onEdit: (person: PersonDetail) => void;
}

function PersonDetailContent({ personId, onEdit }: PersonDetailContentProps) {
  const { t, format } = useTranslation();
  const [personDetail, setPersonDetail] = useState<PersonDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    api
      .getPerson(personId)
      .then((res) => {
        if (isMounted) {
          setPersonDetail(res.data);
        }
      })
      .catch((err: unknown) => {
        toast.error(err instanceof Error ? err.message : "Failed to load person details");
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [personId]);

  return (
    <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
      {loading ? (
        <DialogLoading text={t.persons.loadingDetails} />
      ) : personDetail ? (
        <div className="space-y-6">
          <DialogHeader>
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  #{personDetail.id}
                </Badge>
                <Badge variant="secondary">{personDetail.role}</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={() => onEdit(personDetail)} className="gap-1.5 text-xs h-7 cursor-pointer shrink-0">
                <Pencil className="h-3.5 w-3.5" />
                <span>{t.common.edit}</span>
              </Button>
            </div>
            <DialogTitle className="text-xl mt-1">{personDetail.name}</DialogTitle>
            <DialogDescription className="text-sm">{personDetail.email}</DialogDescription>
          </DialogHeader>

          {/* Team Information */}
          <div className="p-3 rounded-lg border bg-muted/30 text-xs">
            <span className="text-muted-foreground block mb-1">{t.persons.teamAffiliation}</span>
            {personDetail.team ? (
              <div className="flex items-center gap-2 font-medium">
                <Building2 className="h-4 w-4 text-primary" />
                <span>{personDetail.team.name}</span>
              </div>
            ) : (
              <span className="italic text-muted-foreground">{t.persons.notAssignedToTeam}</span>
            )}
          </div>

          {/* Assigned Projects */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
              <FolderKanban className="h-3.5 w-3.5" />
              {format(t.persons.assignedProjects, {
                count: personDetail.projects?.length || 0,
              })}
            </h3>
            {personDetail.projects?.length ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {personDetail.projects.map((proj) => (
                  <div key={proj.id} className="p-2.5 rounded-md border bg-card text-xs flex items-center justify-between">
                    <span className="font-medium">{proj.name}</span>
                    <StatusBadge status={proj.status} size="sm" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">{t.persons.noAssignedProjects}</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center py-6 text-xs text-muted-foreground">{t.persons.personNotFound}</p>
      )}
    </DialogContent>
  );
}

export function PersonDetailDialog({ personId, open, onOpenChange, onEdit, refreshKey = 0 }: PersonDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && personId !== null && <PersonDetailContent key={`${personId}-${refreshKey}`} personId={personId} onEdit={onEdit} />}
    </Dialog>
  );
}
