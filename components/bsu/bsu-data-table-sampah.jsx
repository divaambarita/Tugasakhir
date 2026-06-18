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
//   import BsuDataTableAction from "./bsu-data-table-action";
  
  const columns = [
    {
      accessorKey: "jenissampah.nama",
      header: "Nama Sampah",
    },
    {
      accessorKey: "jenissampah.kategori",
      header: "Kategori Sampah",
    },
    {
      accessorKey: "hargasampahbasi.harga",
      header: "Harga Sampah BSI",
    },
    {
      accessorKey: "hargasampahbsu.harga",
      header: "Harga Sampah BSU",
    },
    {
      accessorKey: "action",
      header: "Aksi",
    //   cell: ({ row }) => {
    //     /// mengambil idApprover
    //     const idApprover = row.original.idApprover;
    //     return <ApproverDataTableAction idApprover={idApprover} />;
    //   },
    },
  ];
  function BsuDataTableSampah({ data = [] }) {
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
  
  export default BsuDataTableSampah;
  