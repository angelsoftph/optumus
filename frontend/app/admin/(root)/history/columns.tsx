import { Button } from "@/components/ui/button";
import { HistoryType } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Swal from "sweetalert2";

const sendReminder = () => {
  Swal.fire({
    title: "Success",
    text: "A reminder has been sent to the borrower to return the book.",
    icon: "success",
    confirmButtonText: "Great!",
  });
};

export const HistoryColumns: ColumnDef<HistoryType>[] = [
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
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "fullname",
    header: "Loaned By",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("fullname")}</div>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Loaned On",
    cell: ({ row }) => <div>{formatDate(row.getValue("created_at"))}</div>,
  },
  {
    accessorKey: "updated_at",
    header: "Returned On",
    cell: ({ row }) => <div>{formatDate(row.getValue("updated_at"))}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue("status") === "R" ? "Returned" : "Out"}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const status = row.original.status;

      if (status === "R") return null;

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
            <DropdownMenuItem onClick={sendReminder}>
              Send Reminder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
