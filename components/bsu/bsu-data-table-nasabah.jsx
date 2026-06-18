import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import ApproverDataTableAction from "./bsu-data-table-action-approver";

  const columns = [
    {
      accessorKey: "nasabah.nama",
      header: "Nama",
    },
    {
      accessorKey: "nasabah.nik",
      header: "NIK",
    },
    {
      accessorKey: "nasabah.jabatan",
      header: "Jabatan",
    },
    {
      accessorKey: "bsu.nama",
      header: "Bank Sampah Unit (BSU)",
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
  function BsuDataTableNasabah({ data = [] }) {
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
  
  export default BsuDataTableNasabah;
  