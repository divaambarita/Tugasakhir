import TransaksiDataTableAction from "./transaksi-data-table-action";
import GenTable from "../layout/gen-table";

const columns = [
  {
    header: "No",
    cell: ({ row }) => {
      return <span>{row.index + 1}</span>;
    },
  },
  {
    accessorKey: "nasabah.nama",
    header: "Nama Nasabah",
    cell: ({ row }) => {
      return <span>{row.original["nasabah.nama"]}</span>;
    },
  },
  {
    accessorKey: "jenisSampah.nama",
    header: "Jenis Sampah",
    cell: ({ row }) => {
      return <span>{row.original["jenisSampah.nama"]}</span>;
    },
  },
  {
    accessorKey: "beratsampah",
    header: "Berat Sampah",
    cell: ({ row }) => {
      return <span>{row.original.beratsampah} kg</span>;
    },
  },
  {
    accessorKey: "totalhargasampah",
    header: "Total Harga Sampah",
    cell: ({ row }) => {
      return <span>Rp {row.original.totalhargasampah?.toLocaleString('id-ID')}</span>;
    },
  },
  {
    accessorKey: "action",
    header: "Aksi",
    cell: ({ row }) => {
      const transaksi = row.original;
      return (
        <TransaksiDataTableAction 
          idTransaksi={transaksi.idTransaksi}
          idNasabah={transaksi.idNasabah}
          data={transaksi}
          tanggal={transaksi.tanggal}
        />
      );
    },
  },
];

function TransaksiDataTable({ data = [] }) {
  return <GenTable data={data} columns={columns}></GenTable>;
}

export default TransaksiDataTable;
