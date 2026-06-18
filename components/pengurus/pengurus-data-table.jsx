import PengurusDataTableAction from "./pengurus-data-table-action";
import GenTable from "../layout/gen-table";

const columns = [
  {
    header: "No",
    cell: ({ row }) => {
      return <span>{row.index + 1}</span>;
    },
  },
  {
    accessorKey: "namaPengurus",
    header: "Nama",
  },
  {
    accessorKey: "noTelp",
    header: "Nomor Telepon",
  },
  {
    accessorKey: "jabatan",
    header: "Jabatan",
  },
  {
    accessorKey: "bsu.nama",
    header: "Bank Sampah Unit",
  },
  {
    accessorKey: "action",
    header: "Aksi",
    cell: ({ row }) => {
      /// mengambil idBsu
      const idPengurus = row.original.idPengurus;
      return <PengurusDataTableAction idPengurus={idPengurus} />;
    },
  },
];

function PengurusDataTable({ data = [] }) {
  return <GenTable data={data} columns={columns}></GenTable>;
}

export default PengurusDataTable;
