import { useCallback, useMemo, useState } from "react";
import { RefreshCw, Eye, Trash2, Plus, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { ErrorAlert } from "@/components/ui/error-alert";
import { toast } from "@/components/ui/sonner";
import { PageHeader } from "@/components/layout";
import { TeamDetailDialog, TeamFormDialog, TeamToolbar } from "@/components/teams";
import { api } from "@/services/api";
import { useTranslation } from "@/i18n";
import { useDebouncedEffect } from "@/hooks";
import type { TeamSimple, TeamDetail } from "@/types";

export function TeamsPage() {
  const { t, format } = useTranslation();
  const [teams, setTeams] = useState<TeamSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");

  // Modals state
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [detailRefreshKey, setDetailRefreshKey] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamSimple | TeamDetail | null>(null);

  const loadTeams = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        const res = await api.getTeams(search);
        setTeams(res.data || []);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : t.common.backendError;
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, t.common.backendError],
  );

  useDebouncedEffect(loadTeams, 200);

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(format(t.teams.confirmDelete, { name }))) {
      return;
    }
    try {
      await api.deleteTeam(id);
      await loadTeams(true);
      if (selectedTeamId === id) {
        setSelectedTeamId(null);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t.common.deleteFailed);
    }
  };

  const handleEditSuccess = (updatedId?: number) => {
    loadTeams(true);
    if (updatedId && selectedTeamId === updatedId) {
      setDetailRefreshKey((k) => k + 1);
    }
  };

  const columns = useMemo<ColumnDef<TeamSimple, unknown>[]>(
    () => [
      {
        accessorKey: "id",
        header: "#",
        cell: ({ row }) => <span className="font-mono text-xs font-semibold text-muted-foreground">#{row.original.id}</span>,
      },
      {
        accessorKey: "name",
        header: t.teams.colName,
        cell: ({ row }) => (
          <div className="max-w-md">
            <button
              onClick={() => setSelectedTeamId(row.original.id)}
              data-testid="team-name"
              className="text-left font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              {row.original.name}
            </button>
            {(row.original as unknown as { description?: string }).description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{(row.original as unknown as { description?: string }).description}</p>
            )}
          </div>
        ),
      },
      {
        accessorKey: "membersCount",
        header: t.teams.colMembers,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{row.original.membersCount ?? 0}</span>
            <span>{t.common.assigned}</span>
          </div>
        ),
      },
      {
        id: "projectsCount",
        accessorFn: (row) => (row as unknown as { projectsCount?: number }).projectsCount ?? 0,
        header: t.teams.colProjects,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{(row.original as unknown as { projectsCount?: number }).projectsCount ?? "-"}</span>
            <span>{t.common.active}</span>
          </div>
        ),
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => <div className="text-right">{t.common.actions}</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTeamId(row.original.id)}
              data-testid="team-view-btn"
              className="h-8 w-8 p-0 cursor-pointer"
              title={t.common.view}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setEditingTeam(row.original)} data-testid="team-edit-btn" className="h-8 w-8 p-0 cursor-pointer" title={t.common.edit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(row.original.id, row.original.name)}
              data-testid="team-delete-btn"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive cursor-pointer"
              title={t.common.delete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.teams.title}
        description={t.teams.subtitle}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => loadTeams(true)} disabled={refreshing || loading} className="gap-1.5 cursor-pointer text-xs">
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span>{t.common.refresh}</span>
            </Button>
            <Button size="sm" onClick={() => setIsCreateOpen(true)} data-testid="create-team-btn" className="gap-1.5 cursor-pointer text-xs">
              <Plus className="h-4 w-4" />
              <span>{t.teams.newTeam}</span>
            </Button>
          </>
        }
      />

      {/* Error Alert */}
      <ErrorAlert message={error} onRetry={() => loadTeams()} />

      {/* Search Toolbar */}
      <TeamToolbar search={search} onSearchChange={setSearch} />

      {/* Main Table */}
      <DataTable columns={columns} data={teams} pageSize={10} loading={loading} loadingText={t.teams.loadingTeams} />

      {/* Team Detail Dialog */}
      <TeamDetailDialog
        open={selectedTeamId !== null}
        teamId={selectedTeamId}
        onOpenChange={(open) => !open && setSelectedTeamId(null)}
        onEdit={(team) => setEditingTeam(team)}
        onUpdate={() => loadTeams(true)}
        refreshKey={detailRefreshKey}
      />

      {/* Create Team Dialog */}
      <TeamFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSuccess={() => loadTeams(true)} />

      {/* Edit Team Dialog */}
      <TeamFormDialog open={!!editingTeam} onOpenChange={(open) => !open && setEditingTeam(null)} team={editingTeam} onSuccess={handleEditSuccess} />
    </div>
  );
}
