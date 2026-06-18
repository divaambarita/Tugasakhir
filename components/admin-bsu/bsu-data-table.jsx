import { Badge } from "@/components/ui/badge";

import GenTable from "../layout/gen-table";
import BsuDataTableAction from "./bsu-data-table-action";

const columns = [
  {
    header: "No",
    cell: ({ row }) => {
      console.log(row);
      return <span>{row.index + 1}</span>;
    },
  },
  {
    accessorKey: "nama",
    header: "Nama Bank Sampah",
  },
  {
    accessorKey: "noTelp",
    header: "Nomor Telepon",
  },
  {
    accessorKey: "alamat",
    header: "Alamat",
  },
  {
    accessorKey: "kelurahan",
    header: "Kelurahan",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      if (row.original.status == "Rejected") {
        return <Badge variant="destructive">Rejected</Badge>;
      } else if (row.original.status == "Approved") {
        return <Badge variant="secondary">Approved</Badge>;
      } else {
        return <Badge>Waiting Approval</Badge>;
      }
    },
  },
  {
    accessorKey: "isActive",
    header: "Status Keaktifan",
    cell: ({ row }) => {
      if (row.original.isActive == 0) {
        return <Badge variant="destructive">Not Active</Badge>;
      } else if (row.original.isActive == 1) {
        return <Badge>Actived</Badge>;
      }
    },
  },
  {
    accessorKey: "action",
    header: "Aksi",
    cell: ({ row }) => {
      /// mengambil idBsu
      const idBsu = row.original.idBsu;
      return <BsuDataTableAction idBsu={idBsu} />;
    },
  },
];

function BsuDataTable({ data = [] }) {
  return <GenTable data={data} columns={columns}></GenTable>;
}

export default BsuDataTable;
