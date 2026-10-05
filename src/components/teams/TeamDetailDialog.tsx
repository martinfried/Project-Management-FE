import { useEffect, useMemo, useState } from "react";
import { Users, FolderKanban, Pencil, Loader2, Plus, Trash2, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogLoading } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { api } from "@/services/api";
import { useTranslation } from "@/i18n";
import type { TeamDetail, PersonSimple, ProjectSimple } from "@/types";

export interface TeamDetailDialogProps {
  teamId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (team: TeamDetail) => void;
  onUpdate?: () => void;
  refreshKey?: number;
}

interface TeamDetailContentProps {
  teamId: number;
  onEdit: (team: TeamDetail) => void;
  onUpdate?: () => void;
}

function TeamDetailContent({ teamId, onEdit, onUpdate }: TeamDetailContentProps) {
  const { t, format } = useTranslation();
  const [teamDetail, setTeamDetail] = useState<TeamDetail | null>(null);
  const [allPersons, setAllPersons] = useState<PersonSimple[]>([]);
  const [allProjects, setAllProjects] = useState<ProjectSimple[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigningMember, setAssigningMember] = useState(false);
  const [assigningProject, setAssigningProject] = useState(false);

  useEffect(() => {
    let isMounted = true;

    Promise.all([api.getTeam(teamId), api.getPersons().catch(() => ({ data: [] })), api.getProjects().catch(() => ({ data: [] }))])
      .then(([teamRes, personsRes, projectsRes]) => {
        if (isMounted) {
          setTeamDetail(teamRes.data);
          setAllPersons(personsRes.data || []);
          setAllProjects(projectsRes.data || []);
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

  const currentMembers: PersonSimple[] = useMemo(() => {
    if (!teamDetail?.members) return [];
    return Array.isArray(teamDetail.members) ? teamDetail.members : (Object.values(teamDetail.members) as PersonSimple[]);
  }, [teamDetail]);

  const availablePersons = useMemo(() => {
    if (!teamDetail) return [];
    return allPersons.filter((p) => !currentMembers.some((m) => m.id === p.id));
  }, [allPersons, currentMembers, teamDetail]);

  const assignedProjects = useMemo(() => {
    if (!teamDetail?.projects) return [];
    return Array.isArray(teamDetail.projects) ? teamDetail.projects : (Object.values(teamDetail.projects) as ProjectSimple[]);
  }, [teamDetail]);

  const availableProjects = useMemo(() => {
    if (!teamDetail) return [];
    return allProjects.filter((p) => !assignedProjects.some((ap) => ap.id === p.id));
  }, [allProjects, assignedProjects, teamDetail]);

  const handleAssignMember = async () => {
    if (!selectedPersonId || !teamDetail || assigningMember) return;
    try {
      setAssigningMember(true);
      const currentMemberIds = currentMembers.map((m) => m.id);
      const newMemberId = Number(selectedPersonId);
      if (!currentMemberIds.includes(newMemberId)) {
        const res = await api.updateTeam(teamDetail.id, {
          memberIds: [...currentMemberIds, newMemberId],
        });
        setTeamDetail(res.data);
        setSelectedPersonId("");
        onUpdate?.();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to assign member");
    } finally {
      setAssigningMember(false);
    }
  };

  const handleRemoveMember = async (personId: number) => {
    if (!teamDetail) return;
    try {
      const currentMemberIds = currentMembers.map((m) => m.id);
      const updatedMemberIds = currentMemberIds.filter((id) => id !== personId);
      const res = await api.updateTeam(teamDetail.id, {
        memberIds: updatedMemberIds,
      });
      setTeamDetail(res.data);
      onUpdate?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to remove member");
    }
  };

  const handleAssignProject = async () => {
    if (!selectedProjectId || !teamDetail || assigningProject) return;
    try {
      setAssigningProject(true);
      await api.assignTeamToProject(Number(selectedProjectId), teamDetail.id);
      const res = await api.getTeam(teamDetail.id);
      setTeamDetail(res.data);
      setSelectedProjectId("");
      onUpdate?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to assign project");
    } finally {
      setAssigningProject(false);
    }
  };

  const handleRemoveProject = async (projectId: number) => {
    if (!teamDetail) return;
    try {
      await api.removeTeamFromProject(projectId, teamDetail.id);
      const res = await api.getTeam(teamDetail.id);
      setTeamDetail(res.data);
      onUpdate?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to remove project");
    }
  };

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
                  {currentMembers.length} {t.common.members}
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
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {format(t.teams.members, { count: currentMembers.length })}
            </h3>
            {currentMembers.length ? (
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {currentMembers.map((member) => (
                  <div key={member.id} data-testid={`team-member-row-${member.id}`} className="p-2 rounded-md border bg-card text-xs flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-foreground truncate">{member.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {member.email} • {member.role}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="outline" className="text-[10px]">
                        {member.role}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(member.id)}
                        title={t.teams.removeMember}
                        data-testid={`remove-member-btn-${member.id}`}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">{t.teams.noMembers}</p>
            )}

            {availablePersons.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <div className="relative flex-1">
                  <select
                    value={selectedPersonId}
                    onChange={(e) => setSelectedPersonId(e.target.value)}
                    data-testid="assign-person-select"
                    className="w-full h-8 rounded-md border border-input bg-background pl-2.5 pr-8 py-1 text-xs shadow-xs appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">{t.teams.selectMemberPlaceholder}</option>
                    {availablePersons.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.role})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={!selectedPersonId || assigningMember}
                  onClick={handleAssignMember}
                  data-testid="assign-person-btn"
                  className="h-8 text-xs shrink-0 cursor-pointer"
                >
                  {assigningMember ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
                  {assigningMember ? t.teams.assigningMember : t.teams.assignMember}
                </Button>
              </div>
            )}
          </div>

          {/* Assigned Projects */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FolderKanban className="h-3.5 w-3.5" />
              {format(t.teams.assignedProjects, { count: assignedProjects.length })}
            </h3>
            {assignedProjects.length ? (
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {assignedProjects.map((proj) => (
                  <div key={proj.id} data-testid={`assigned-project-row-${proj.id}`} className="p-2 rounded-md border bg-card text-xs flex items-center justify-between gap-2">
                    <span className="font-medium truncate">{proj.name}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <StatusBadge status={proj.status} size="sm" />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveProject(proj.id)}
                        title={t.teams.removeProject}
                        data-testid={`remove-project-btn-${proj.id}`}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">{t.teams.noProjects}</p>
            )}

            {availableProjects.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <div className="relative flex-1">
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    data-testid="assign-project-select"
                    className="w-full h-8 rounded-md border border-input bg-background pl-2.5 pr-8 py-1 text-xs shadow-xs appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">{t.teams.selectProjectPlaceholder}</option>
                    {availableProjects.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.name} ({proj.status})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={!selectedProjectId || assigningProject}
                  onClick={handleAssignProject}
                  data-testid="assign-project-btn"
                  className="h-8 text-xs shrink-0 cursor-pointer"
                >
                  {assigningProject ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
                  {assigningProject ? t.teams.assigningProject : t.teams.assignProject}
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center py-6 text-xs text-muted-foreground">{t.teams.teamNotFound}</p>
      )}
    </DialogContent>
  );
}

export function TeamDetailDialog({ teamId, open, onOpenChange, onEdit, onUpdate, refreshKey = 0 }: TeamDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && teamId !== null && <TeamDetailContent key={`${teamId}-${refreshKey}`} teamId={teamId} onEdit={onEdit} onUpdate={onUpdate} />}
    </Dialog>
  );
}
