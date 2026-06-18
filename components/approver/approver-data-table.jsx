import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import ApproverDataTableAction from "./approver-data-table-action";

const columns = [
  {
    header: "No",
    cell: ({ row }) => {
      return <span>{row.index + 1}</span>;
    },
  },
  {
    accessorKey: "akun.nama",
    header: "Nama",
  },
  {
    accessorKey: "akun.noTelp",
    header: "Nomor Telepon",
  },
  {
    accessorKey: "akun.email",
    header: "Email",
  },
  {
    accessorKey: "typePengajuan",
    header: "Jenis Akun",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      if (row.original.status === "WaitApv") {
        return <Badge variant="outline">Belum Terverifikasi</Badge>;
      } else if (row.original.status === "Approved") {
        return <Badge>Terverifikasi</Badge>;
      } else if (row.original.status === "Rejected") {
        return <Badge variant="destructive">Ditolak</Badge>;
      }
    },
  },
  {
    accessorKey: "action",
    header: "Aksi",
    cell: ({ row }) => {
      /// mengambil idApprover
      const idApprover = row.original.idApprover;
      return <ApproverDataTableAction idApprover={idApprover} />;
    },
  },
];
function ApproverDataTable({ data = [] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              Tidak ada data.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default ApproverDataTable;
