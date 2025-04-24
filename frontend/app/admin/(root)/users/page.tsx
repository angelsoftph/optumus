"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { API_URL } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/app/loading";
import { debounce } from "lodash";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { fetchWithAuth } from "@/hooks/useAuthFetch";
import { UserType } from "@/lib/types";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import { AdminSidebar } from "../sidebar";

interface FetchUsersParams {
  page: number;
  limit: number;
}

interface FetchUsersResponse {
  users: UserType[];
  total: number;
}

export const columns: ColumnDef<UserType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "fullname",
    header: "Full Name",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("fullname")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "username",
    header: "username",
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("username")}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const fetchUsers = async ({
  page,
  limit,
}: FetchUsersParams): Promise<FetchUsersResponse> => {
  const response = await fetchWithAuth(
    `${API_URL}/api/get-users?limit=${limit}&offset=${page}`
  );

  if (!response || response.status === 401) {
    throw new Error("Token expired or unauthorized");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  const data = await response.json();
  return {
    users: Array.isArray(data?.users) ? data.users : [],
    total: data?.total || 0,
  };
};

const ManageUsersPage = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pageIndex, setPageIndex] = useState(0);
  const limit = 15;

  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("optlib_auth_token")
      : null;
  const [showLoading, setShowLoading] = useState(true);

  const { data, isLoading, isError } = useQuery<FetchUsersResponse, Error>({
    queryKey: ["users", pageIndex],
    queryFn: () => fetchUsers({ page: pageIndex, limit }),
    placeholderData: (previousData) => previousData,
  });

  const users = data?.users ?? [];
  const total = data?.total ?? 0;

  const table = useReactTable({
    data: users,
    columns,
    manualPagination: true,
    pageCount: Math.ceil(total / limit),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex,
        pageSize: limit,
      },
    },
    onPaginationChange: (updater) => {
      const newPageIndex =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize: limit }).pageIndex
          : updater.pageIndex;
      setPageIndex(newPageIndex);
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const debouncedFilter = useMemo(
    () =>
      debounce((value: string) => {
        table.getColumn("fullname")?.setFilterValue(value);
      }, 300),
    [table]
  );

  useEffect(() => {
    const token = localStorage.getItem("optlib_auth_token");

    if (token) {
      setShowLoading(false);
    }
  }, [router, user]);

  if (!token || !user || (user && user.usertype !== "A")) {
    return <p className="p-5">You are not authorized to access this page.</p>;
  }

  if (showLoading) {
    return (
      <div className="flex flex-row h-screen items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading users...</p>;
  }
  if (isError) {
    return <p className="text-sm text-red-500">Error loading users.</p>;
  }

  return (
    <>
      <AdminSidebar />
      <main className="flex flex-col w-full h-screen">
        <SidebarTrigger className="text-black" />
        <div className="flex flex-col w-full h-screen gap-4 px-6 py-0 text-black">
          <h1 className="text-2xl font-semibold">Manage Users</h1>
          <div className="flex flex-col w-full p-6 text-black">
            <div className="flex items-center py-4">
              <Input
                placeholder="Filter fullname..."
                onChange={(event) => debouncedFilter(event.target.value)}
                className="max-w-sm"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                    Columns <ChevronDown />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="flex-1 text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
                  disabled={pageIndex === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPageIndex((prev) =>
                      prev + 1 < Math.ceil(total / limit) ? prev + 1 : prev
                    )
                  }
                  disabled={pageIndex + 1 >= Math.ceil(total / limit)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ManageUsersPage;
