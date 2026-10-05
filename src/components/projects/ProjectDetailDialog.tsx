import { useEffect, useMemo, useState } from "react";
import { Users, Building2, UserCheck, Pencil, Loader2, Plus, Trash2, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Dialog, DialogCloseButton, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogLoading } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { api } from "@/services/api";
import { useTranslation } from "@/i18n";
import { formatCzechDate } from "@/lib/date";
import type { ProjectDetail, TeamSimple, PersonSimple, Participant } from "@/types";

export interface ProjectDetailDialogProps {
  projectId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (project: ProjectDetail) => void;
  onUpdate?: () => void;
  refreshKey?: number;
}

interface ProjectDetailContentProps {
  projectId: number;
  onEdit: (project: ProjectDetail) => void;
  onUpdate?: () => void;
}

function ProjectDetailContent({ projectId, onEdit, onUpdate }: ProjectDetailContentProps) {
  const { t, format } = useTranslation();
  const [projectDetail, setProjectDetail] = useState<ProjectDetail | null>(null);
  const [allTeams, setAllTeams] = useState<TeamSimple[]>([]);
  const [allPersons, setAllPersons] = useState<PersonSimple[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigningTeam, setAssigningTeam] = useState(false);
  const [assigningPerson, setAssigningPerson] = useState(false);

  useEffect(() => {
    let isMounted = true;

    Promise.all([api.getProject(projectId), api.getTeams().catch(() => ({ data: [] })), api.getPersons().catch(() => ({ data: [] }))])
      .then(([projRes, teamsRes, personsRes]) => {
        if (isMounted) {
          setProjectDetail(projRes.data);
          setAllTeams(teamsRes.data || []);
          setAllPersons(personsRes.data || []);
        }
      })
      .catch((err: unknown) => {
        toast.error(err instanceof Error ? err.message : "Failed to load project details");
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const assignedTeams: TeamSimple[] = useMemo(() => {
    if (!projectDetail?.teams) return [];
    return Array.isArray(projectDetail.teams) ? projectDetail.teams : (Object.values(projectDetail.teams) as TeamSimple[]);
  }, [projectDetail]);

  const participants: Participant[] = useMemo(() => {
    if (!projectDetail?.allParticipants) return [];
    return Array.isArray(projectDetail.allParticipants) ? projectDetail.allParticipants : (Object.values(projectDetail.allParticipants) as Participant[]);
  }, [projectDetail]);

  const directPersons: PersonSimple[] = useMemo(() => {
    if (!projectDetail?.persons) return [];
    return Array.isArray(projectDetail.persons) ? projectDetail.persons : (Object.values(projectDetail.persons) as PersonSimple[]);
  }, [projectDetail]);

  const availableTeams = useMemo(() => {
    if (!projectDetail) return [];
    return allTeams.filter((t) => !assignedTeams.some((pt) => pt.id === t.id));
  }, [allTeams, assignedTeams, projectDetail]);

  const availablePersons = useMemo(() => {
    if (!projectDetail) return [];
    return allPersons.filter((p) => !directPersons.some((dp) => dp.id === p.id));
  }, [allPersons, directPersons, projectDetail]);

  const handleAssignTeam = async () => {
    if (!selectedTeamId || !projectDetail || assigningTeam) return;
    try {
      setAssigningTeam(true);
      const res = await api.assignTeamToProject(projectDetail.id, Number(selectedTeamId));
      setProjectDetail(res.data);
      setSelectedTeamId("");
      onUpdate?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to assign team");
    } finally {
      setAssigningTeam(false);
    }
  };

  const handleRemoveTeam = async (teamId: number) => {
    if (!projectDetail) return;
    try {
      const res = await api.removeTeamFromProject(projectDetail.id, teamId);
      setProjectDetail(res.data);
      onUpdate?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to remove team");
    }
  };

  const handleAssignPerson = async () => {
    if (!selectedPersonId || !projectDetail || assigningPerson) return;
    try {
      setAssigningPerson(true);
      const res = await api.assignPersonToProject(projectDetail.id, Number(selectedPersonId));
      setProjectDetail(res.data);
      setSelectedPersonId("");
      onUpdate?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to assign person");
    } finally {
      setAssigningPerson(false);
    }
  };

  const handleRemovePerson = async (personId: number) => {
    if (!projectDetail) return;
    try {
      const res = await api.removePersonFromProject(projectDetail.id, personId);
      setProjectDetail(res.data);
      onUpdate?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to remove person");
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[85vh] overflow-auto" showCloseButton={false}>
      {loading ? (
        <div className="relative">
          <div className="flex justify-end">
            <DialogCloseButton />
          </div>
          <DialogLoading text={t.projects.loadingDetails} />
        </div>
      ) : projectDetail ? (
        <div className="space-y-6">
          <DialogHeader>
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  #{projectDetail.id}
                </Badge>
                <StatusBadge status={projectDetail.status} />
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button variant="outline" size="sm" onClick={() => onEdit(projectDetail)} className="gap-1.5 text-xs h-7 cursor-pointer">
                  <Pencil className="h-3.5 w-3.5" />
                  <span>{t.common.edit}</span>
                </Button>
                <DialogCloseButton />
              </div>
            </div>
            <DialogTitle className="text-xl mt-1">{projectDetail.name}</DialogTitle>
            <DialogDescription className="text-sm">{projectDetail.description || t.projects.noDescription}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 p-3 rounded-lg border bg-muted/30 text-xs">
            <div>
              <span className="text-muted-foreground block">{t.projects.startDate}</span>
              <span className="font-medium font-mono">{formatCzechDate(projectDetail.startDate) || t.common.notSet}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">{t.projects.endDate}</span>
              <span className="font-medium font-mono">{formatCzechDate(projectDetail.endDate) || t.common.notSet}</span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              {format(t.projects.assignedTeams, { count: assignedTeams.length })}
            </h3>
            {assignedTeams.length ? (
              <div className="space-y-2">
                {assignedTeams.map((team) => (
                  <div
                    key={team.id}
                    data-testid={`assigned-team-row-${team.id}`}
                    className="p-2.5 rounded-lg border bg-card hover:bg-muted/20 transition-colors text-xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-foreground text-sm truncate">{team.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="font-normal text-xs flex items-center gap-1.5 px-2.5 py-1">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium text-foreground">{team.membersCount}</span>
                        <span className="text-muted-foreground">{t.common.members}</span>
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTeam(team.id)}
                        title={t.projects.removeTeam}
                        data-testid={`remove-team-btn-${team.id}`}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">{t.projects.noAssignedTeams}</p>
            )}

            {availableTeams.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <div className="relative flex-1">
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    data-testid="assign-team-select"
                    className="w-full h-8 rounded-md border border-input bg-background pl-2.5 pr-8 py-1 text-xs shadow-xs appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">{t.projects.selectTeamPlaceholder}</option>
                    {availableTeams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name} ({team.membersCount} {t.common.members})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={!selectedTeamId || assigningTeam}
                  onClick={handleAssignTeam}
                  data-testid="assign-team-btn"
                  className="h-8 text-xs shrink-0 cursor-pointer"
                >
                  {assigningTeam ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
                  {assigningTeam ? t.projects.assigningTeam : t.projects.assignTeam}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5" />
              {format(t.projects.allParticipants, { count: participants.length })}
            </h3>
            {participants.length ? (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {participants.map((person) => (
                  <div key={person.id} className="p-2 rounded-md border bg-card text-xs flex items-center justify-between gap-2" data-testid={`participant-row-${person.id}`}>
                    <div className="min-w-0">
                      <div className="font-medium text-foreground truncate">{person.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {person.email} • {person.role}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="outline" className="text-[10px] capitalize max-w-[150px] sm:max-w-[220px] truncate" data-testid={`participant-badge-${person.id}`}>
                        {person.assignmentType === "both"
                          ? t.projects.assignmentBoth
                          : person.assignmentType === "team"
                            ? format(t.projects.assignmentTeam, { team: person.viaTeam?.name || person.team?.name || "team" })
                            : t.projects.assignmentDirect}
                      </Badge>
                      {(person.assignmentType === "direct" || person.assignmentType === "both") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePerson(person.id)}
                          title={t.projects.removePerson}
                          data-testid={`remove-person-btn-${person.id}`}
                          className="h-6 w-6 text-muted-foreground hover:text-destructive cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">{t.projects.noParticipants}</p>
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
                    <option value="">{t.projects.selectPersonPlaceholder}</option>
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
                  disabled={!selectedPersonId || assigningPerson}
                  onClick={handleAssignPerson}
                  data-testid="assign-person-btn"
                  className="h-8 text-xs shrink-0 cursor-pointer"
                >
                  {assigningPerson ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
                  {assigningPerson ? t.projects.assigningPerson : t.projects.assignPerson}
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-end">
            <DialogCloseButton />
          </div>
          <p className="text-center py-6 text-xs text-muted-foreground">{t.projects.projectNotFound}</p>
        </div>
      )}
    </DialogContent>
  );
}

export function ProjectDetailDialog({ projectId, open, onOpenChange, onEdit, onUpdate, refreshKey = 0 }: ProjectDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && projectId !== null && <ProjectDetailContent key={`${projectId}-${refreshKey}`} projectId={projectId} onEdit={onEdit} onUpdate={onUpdate} />}
    </Dialog>
  );
}
