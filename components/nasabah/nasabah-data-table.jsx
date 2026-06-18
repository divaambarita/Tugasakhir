import NasabahDataTableAction from "./nasabah-data-table-action";
import GenTable from "../layout/gen-table";

const columns = [
  {
    accessorKey: "nomorNasabah",
    header: "Nomor Nasabah",
  },
  {
    accessorKey: "nama",
    header: "Nama",
  },
  {
    accessorKey: "noTelp",
    header: "Nomor Telepon",
  },
  {
    accessorKey: "saldo",
    header: "Total Tabungan",
    cell: ({ row }) => {
      const saldo = row.original.saldo || 0;
      return (
        <span>
          Rp{" "}
          {saldo.toLocaleString("id-ID", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </span>
      );
    },
  },
  {
    accessorKey: "action",
    header: "Aksi",
    cell: ({ row }) => {
      /// mengambil idBsu
      const idNasabah = row.original.idNasabah;
      return <NasabahDataTableAction idNasabah={idNasabah} />;
    },
  },
];

function NasabahDataTable({ data = [] }) {
  return <GenTable data={data} columns={columns}></GenTable>;
}

export default NasabahDataTable;
