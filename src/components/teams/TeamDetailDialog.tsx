import { useEffect, useState } from "react";
import { Users, FolderKanban, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogLoading } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { api } from "@/services/api";
import { useTranslation } from "@/i18n";
import type { TeamDetail } from "@/types";

export interface TeamDetailDialogProps {
  teamId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (team: TeamDetail) => void;
  refreshKey?: number;
}

interface TeamDetailContentProps {
  teamId: number;
  onEdit: (team: TeamDetail) => void;
}

function TeamDetailContent({ teamId, onEdit }: TeamDetailContentProps) {
  const { t, format } = useTranslation();
  const [teamDetail, setTeamDetail] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    api
      .getTeam(teamId)
      .then((res) => {
        if (isMounted) {
          setTeamDetail(res.data);
        }
      })
      .catch((err: unknown) => {
        toast.error(err instanceof Error ? err.message : "Failed to load team details");
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [teamId]);

  return (
    <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
      {loading ? (
        <DialogLoading text={t.teams.loadingDetails} />
      ) : teamDetail ? (
        <div className="space-y-6">
          <DialogHeader>
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  #{teamDetail.id}
                </Badge>
                <Badge variant="secondary">
                  {teamDetail.membersCount} {t.common.members}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={() => onEdit(teamDetail)} className="gap-1.5 text-xs h-7 cursor-pointer shrink-0">
                <Pencil className="h-3.5 w-3.5" />
                <span>{t.common.edit}</span>
              </Button>
            </div>
            <DialogTitle className="text-xl mt-1">{teamDetail.name}</DialogTitle>
            <DialogDescription className="text-sm">{teamDetail.description || t.teams.noDescription}</DialogDescription>
          </DialogHeader>

          {/* Team Members List */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
              <Users className="h-3.5 w-3.5" />
              {format(t.teams.members, { count: teamDetail.members?.length || 0 })}
            </h3>
            {teamDetail.members?.length ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {teamDetail.members.map((member) => (
                  <div key={member.id} className="p-2.5 rounded-md border bg-card text-xs flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">{member.name}</div>
                      <div className="text-[11px] text-muted-foreground">{member.email}</div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">{t.teams.noMembers}</p>
            )}
          </div>

          {/* Assigned Projects */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
              <FolderKanban className="h-3.5 w-3.5" />
              {format(t.teams.assignedProjects, { count: teamDetail.projects?.length || 0 })}
            </h3>
            {teamDetail.projects?.length ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {teamDetail.projects.map((proj) => (
                  <div key={proj.id} className="p-2.5 rounded-md border bg-card text-xs flex items-center justify-between">
                    <span className="font-medium">{proj.name}</span>
                    <StatusBadge status={proj.status} size="sm" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">{t.teams.noProjects}</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center py-6 text-xs text-muted-foreground">{t.teams.teamNotFound}</p>
      )}
    </DialogContent>
  );
}

export function TeamDetailDialog({ teamId, open, onOpenChange, onEdit, refreshKey = 0 }: TeamDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && teamId !== null && <TeamDetailContent key={`${teamId}-${refreshKey}`} teamId={teamId} onEdit={onEdit} />}
    </Dialog>
  );
}
