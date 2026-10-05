import { useState } from "react";
import { flexRender, useReactTable } from "@tanstack/react-table";
import { getCoreRowModel, getPaginationRowModel, getSortedRowModel, type ColumnDef, type SortingState } from "@tanstack/table-core";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { useTranslation } from "@/i18n";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageSize?: number;
  loading?: boolean;
  loadingText?: string;
}

export function DataTable<TData, TValue>({ columns, data, pageSize = 10, loading = false, loadingText }: DataTableProps<TData, TValue>) {
  const { t } = useTranslation();
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: {
        pageSize,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  const pageIndex = table.getState().pagination.pageIndex + 1;
  const pageCount = Math.max(1, table.getPageCount());
  const totalRows = table.getFilteredRowModel().rows.length;

  if (loading && data.length === 0) {
    return (
      <div className="h-48 rounded-lg border bg-card flex items-center justify-center shadow-xs">
        <LoadingState text={loadingText || t.table.loading} />
      </div>
    );
  }

  return (
    <div className={`space-y-4 transition-opacity duration-150 ${loading ? "opacity-70" : ""}`}>
      <div className="rounded-lg border bg-card text-card-foreground shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-semibold">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-muted/40 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {t.table.noRecords}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-3 sm:gap-4 px-1 py-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>
            {t.table.page} <span className="font-semibold text-foreground font-mono">{pageIndex}</span> {t.table.of}{" "}
            <span className="font-semibold text-foreground font-mono">{pageCount}</span>
          </span>
          <span className="text-muted-foreground/30">•</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted/60 text-muted-foreground border border-border/60">
            <span className="font-semibold text-foreground font-mono mr-1">{totalRows}</span>
            <span>{t.table.total}</span>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 gap-1.5 px-3 text-xs font-medium cursor-pointer shadow-2xs"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>{t.table.previous}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 gap-1.5 px-3 text-xs font-medium cursor-pointer shadow-2xs"
          >
            <span>{t.table.next}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export type { ColumnDef, SortingState };
