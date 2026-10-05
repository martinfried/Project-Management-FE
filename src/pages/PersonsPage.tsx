import { useCallback, useMemo, useState } from "react";
import { RefreshCw, Eye, Trash2, Plus, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { ErrorAlert } from "@/components/ui/error-alert";
import { toast } from "@/components/ui/sonner";
import { PageHeader } from "@/components/layout";
import { PersonDetailDialog, PersonFormDialog, PersonToolbar } from "@/components/persons";
import { api } from "@/services/api";
import { useTranslation } from "@/i18n";
import { useDebouncedEffect } from "@/hooks";
import type { PersonSimple, PersonDetail, TeamSimple } from "@/types";

export function PersonsPage() {
  const { t, format } = useTranslation();
  const [persons, setPersons] = useState<PersonSimple[]>([]);
  const [teams, setTeams] = useState<TeamSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");

  // Modals state
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  const [detailRefreshKey, setDetailRefreshKey] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<PersonSimple | PersonDetail | null>(null);

  const loadPersons = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        const [personsRes, teamsRes] = await Promise.all([api.getPersons(search), api.getTeams().catch(() => ({ data: [] }))]);

        setPersons(personsRes.data || []);
        if (teamsRes?.data) setTeams(teamsRes.data);
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

  useDebouncedEffect(loadPersons, 200);

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(format(t.persons.confirmDelete, { name }))) {
      return;
    }
    try {
      await api.deletePerson(id);
      await loadPersons(true);
      if (selectedPersonId === id) {
        setSelectedPersonId(null);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t.common.deleteFailed);
    }
  };

  const handleEditSuccess = (updatedId?: number) => {
    loadPersons(true);
    if (updatedId && selectedPersonId === updatedId) {
      setDetailRefreshKey((k) => k + 1);
    }
  };

  const columns = useMemo<ColumnDef<PersonSimple, unknown>[]>(
    () => [
      {
        accessorKey: "id",
        header: "#",
        cell: ({ row }) => <span className="font-mono text-xs font-semibold text-muted-foreground">#{row.original.id}</span>,
      },
      {
        accessorKey: "name",
        header: t.persons.colName,
        cell: ({ row }) => (
          <button
            onClick={() => setSelectedPersonId(row.original.id)}
            data-testid="person-name"
            className="text-left font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
          >
            {row.original.name}
          </button>
        ),
      },
      {
        accessorKey: "email",
        header: t.persons.colContact,
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.email}</span>,
      },
      {
        accessorKey: "role",
        header: t.persons.colRole,
        cell: ({ row }) => <span className="text-xs font-medium text-foreground">{row.original.role}</span>,
      },
      {
        accessorKey: "team",
        header: t.persons.colTeam,
        cell: ({ row }) =>
          row.original.team ? (
            <span className="text-xs font-medium text-foreground">{row.original.team.name}</span>
          ) : (
            <span className="text-xs text-muted-foreground italic">{t.persons.noTeam}</span>
          ),
      },
      {
        accessorKey: "projectsCount",
        header: t.persons.colProjects,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{(row.original as unknown as { projectsCount?: number }).projectsCount ?? "-"}</span>
            <span>{t.common.assigned}</span>
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">{t.common.actions}</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPersonId(row.original.id)}
              data-testid="person-view-btn"
              className="h-8 w-8 p-0 cursor-pointer"
              title={t.common.view}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingPerson(row.original)}
              data-testid="person-edit-btn"
              className="h-8 w-8 p-0 cursor-pointer"
              title={t.common.edit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(row.original.id, row.original.name)}
              data-testid="person-delete-btn"
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
        title={t.persons.title}
        description={t.persons.subtitle}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => loadPersons(true)} disabled={refreshing || loading} className="gap-1.5 cursor-pointer text-xs">
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span>{t.common.refresh}</span>
            </Button>
            <Button size="sm" onClick={() => setIsCreateOpen(true)} data-testid="create-person-btn" className="gap-1.5 cursor-pointer text-xs">
              <Plus className="h-4 w-4" />
              <span>{t.persons.newPerson}</span>
            </Button>
          </>
        }
      />

      {/* Error Alert */}
      <ErrorAlert message={error} onRetry={() => loadPersons()} />

      {/* Search Toolbar */}
      <PersonToolbar search={search} onSearchChange={setSearch} />

      {/* Main Table */}
      <DataTable columns={columns} data={persons} pageSize={10} loading={loading} loadingText={t.persons.loadingPersons} />

      {/* Person Detail Dialog */}
      <PersonDetailDialog
        open={selectedPersonId !== null}
        personId={selectedPersonId}
        onOpenChange={(open) => !open && setSelectedPersonId(null)}
        onEdit={(person) => setEditingPerson(person)}
        refreshKey={detailRefreshKey}
      />

      {/* Create Person Dialog */}
      <PersonFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} teams={teams} onSuccess={() => loadPersons(true)} />

      {/* Edit Person Dialog */}
      <PersonFormDialog open={!!editingPerson} onOpenChange={(open) => !open && setEditingPerson(null)} person={editingPerson} teams={teams} onSuccess={handleEditSuccess} />
    </div>
  );
}
