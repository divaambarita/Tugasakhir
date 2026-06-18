import GenTable from "../layout/gen-table";
import KeuanganDataTableAction from "./keuangan-data-table-action";

const columns = [
  {
    accessorKey: "tanggal",
    header: "Tanggal",
    cell: (info) => {
      const date = new Date(info.getValue());
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString("id-ID", options); // Format: tanggal bulan tahun
    },
  },
  {
    accessorKey: "tujuan",
    header: "Uraian",
  },
  {
    accessorKey: "tipe",
    header: "Tipe",
  },
  {
    accessorKey: "saldo",
    header: "Nominal",
  },
  {
    accessorKey: "aksi",
    header: "Aksi",
    cell: ({ row }) => {
      /// mengambil idPemasukan dan idPengeluaran
      const { idPemasukan, idPenjualan, idPengeluaran } = row.original;
      return <KeuanganDataTableAction idPemasukan={idPemasukan} idPenjualan={idPenjualan}idPengeluaran={idPengeluaran} />;
    },
  },
];

function KeuanganDataTable({ data = [] }) {
  // Urutkan data berdasarkan tanggal terbaru
  const sortedData = [...data].sort((a, b) => new Date(b.tanggalPengeluaran) - new Date(a.tanggalPengeluaran));
  return <GenTable data={sortedData} columns={columns} />;
}

export default KeuanganDataTable;
