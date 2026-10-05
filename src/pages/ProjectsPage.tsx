import { useCallback, useMemo, useState } from "react";
import { RefreshCw, Eye, Trash2, Loader2, Plus, Pencil, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { ErrorAlert } from "@/components/ui/error-alert";
import { toast } from "@/components/ui/sonner";
import { PageHeader } from "@/components/layout";
import { ProjectDetailDialog, ProjectFormDialog, ProjectToolbar } from "@/components/projects";
import { api } from "@/services/api";
import { useTranslation } from "@/i18n";
import { useDebouncedEffect } from "@/hooks";
import { formatCzechDate } from "@/lib/date";
import type { ProjectSimple, ProjectDetail, ProjectStatus, FilterStatus } from "@/types";

const NEXT_PROJECT_STATUS: Record<ProjectStatus, ProjectStatus> = {
  Planned: "In Progress",
  "In Progress": "Completed",
  Completed: "On Hold",
  "On Hold": "Planned",
};

export function ProjectsPage() {
  const { t, format } = useTranslation();
  const [projects, setProjects] = useState<ProjectSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("All");

  // Modals state
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [detailRefreshKey, setDetailRefreshKey] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectSimple | ProjectDetail | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

  const loadProjects = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        const res = await api.getProjects(search, statusFilter);
        setProjects(res.data || []);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : t.common.backendError;
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, statusFilter, t.common.backendError],
  );

  useDebouncedEffect(loadProjects, 200);

  const handleNextStatus = useCallback(
    async (project: ProjectSimple) => {
      const nextStatus = NEXT_PROJECT_STATUS[project.status];
      if (!nextStatus || updatingStatusId !== null) return;
      try {
        setUpdatingStatusId(project.id);
        await api.updateProject(project.id, { status: nextStatus });

        // If user is currently filtering by a specific status, update filter to nextStatus
        // so the project remains visible in its new stage and the filter menu stays in sync
        if (statusFilter !== "All") {
          setStatusFilter(nextStatus);
        } else {
          // If viewing All, optimistically update the project in place and reload
          setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, status: nextStatus } : p)));
          await loadProjects(true);
        }

        if (selectedProjectId === project.id) {
          setDetailRefreshKey((k) => k + 1);
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to update project status");
      } finally {
        setUpdatingStatusId(null);
      }
    },
    [loadProjects, selectedProjectId, statusFilter, updatingStatusId],
  );

  const handleDelete = useCallback(
    async (id: number, name: string) => {
      if (!window.confirm(format(t.projects.confirmDelete, { name }))) {
        return;
      }
      try {
        await api.deleteProject(id);
        await loadProjects(true);
        if (selectedProjectId === id) {
          setSelectedProjectId(null);
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : t.common.deleteFailed);
      }
    },
    [format, loadProjects, selectedProjectId, t.common.deleteFailed, t.projects.confirmDelete],
  );

  const handleEditSuccess = useCallback(
    (updatedId?: number) => {
      loadProjects(true);
      if (updatedId && selectedProjectId === updatedId) {
        setDetailRefreshKey((k) => k + 1);
      }
    },
    [loadProjects, selectedProjectId],
  );

  const columns = useMemo<ColumnDef<ProjectSimple, unknown>[]>(
    () => [
      {
        accessorKey: "id",
        header: t.projects.colId,
        cell: ({ row }) => <span className="font-mono text-xs font-semibold text-muted-foreground">#{row.original.id}</span>,
      },
      {
        accessorKey: "name",
        header: t.projects.colName,
        cell: ({ row }) => (
          <div className="max-w-md">
            <button
              onClick={() => setSelectedProjectId(row.original.id)}
              data-testid="project-name"
              className="text-left font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              {row.original.name}
            </button>
            {row.original.description && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{row.original.description}</p>}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: t.projects.colStatus,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "startDate",
        header: t.projects.colTimeline,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground font-mono">
            {formatCzechDate(row.original.startDate) || t.common.tbd} → {formatCzechDate(row.original.endDate) || t.common.tbd}
          </span>
        ),
      },
      {
        accessorKey: "totalParticipantsCount",
        header: t.projects.colParticipants,
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{row.original.totalParticipantsCount}</span>
            <span className="text-[11px] opacity-75">
              {format(t.projects.directAndTeams, {
                direct: row.original.directPersonsCount,
                teams: row.original.teamsCount,
              })}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">{t.common.actions}</div>,
        cell: ({ row }) => {
          const nextStatus = NEXT_PROJECT_STATUS[row.original.status];
          const isUpdating = updatingStatusId === row.original.id;

          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNextStatus(row.original)}
                disabled={isUpdating}
                data-testid="project-next-status-btn"
                className="h-8 w-8 p-0 cursor-pointer text-primary hover:text-primary hover:bg-primary/10"
                title={format(t.projects.nextStatusAction, { status: t.status[nextStatus] })}
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <ArrowRight className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProjectId(row.original.id)}
                data-testid="project-view-btn"
                className="h-8 w-8 p-0 cursor-pointer"
                title={t.projects.viewDetails}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingProject(row.original)}
                data-testid="project-edit-btn"
                className="h-8 w-8 p-0 cursor-pointer"
                title={t.common.edit}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(row.original.id, row.original.name)}
                data-testid="project-delete-btn"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive cursor-pointer"
                title={t.projects.deleteProject}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [t, format, updatingStatusId, handleNextStatus, handleDelete],
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={t.projects.title}
        description={t.projects.subtitle}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => loadProjects(true)} disabled={refreshing || loading} className="gap-1.5 cursor-pointer text-xs">
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span>{t.common.refresh}</span>
            </Button>
            <Button size="sm" onClick={() => setIsCreateOpen(true)} data-testid="create-project-btn" className="gap-1.5 cursor-pointer text-xs">
              <Plus className="h-4 w-4" />
              <span>{t.projects.newProject}</span>
            </Button>
          </>
        }
      />

      {/* Error Alert */}
      <ErrorAlert message={error} onRetry={() => loadProjects()} />

      {/* Search and Status Filters */}
      <ProjectToolbar search={search} onSearchChange={setSearch} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} />

      {/* Main Table */}
      <DataTable columns={columns} data={projects} pageSize={10} loading={loading} loadingText={t.projects.loadingProjects} />

      {/* Detail Dialog */}
      <ProjectDetailDialog
        open={selectedProjectId !== null}
        projectId={selectedProjectId}
        onOpenChange={(open) => !open && setSelectedProjectId(null)}
        onEdit={(project) => setEditingProject(project)}
        onUpdate={() => loadProjects(true)}
        refreshKey={detailRefreshKey}
      />

      {/* Create Project Dialog */}
      <ProjectFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSuccess={() => loadProjects(true)} />

      {/* Edit Project Dialog */}
      <ProjectFormDialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)} project={editingProject} onSuccess={handleEditSuccess} />
    </div>
  );
}
