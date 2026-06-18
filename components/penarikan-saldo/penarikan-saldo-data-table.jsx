import React from "react";
import GenTable from "../layout/gen-table";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

const formatRupiah = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const columns = [
  {
    header: "No",
    cell: ({ row }) => {
      return <span>{row.index + 1}</span>;
    },
  },
  {
    accessorKey: "tanggalPenarikan",
    header: "Tanggal Penarikan",
    cell: ({ row }) => {
      const date = new Date(row.original.tanggalPenarikan);
      return <span>{format(date, "dd MMMM yyyy")}</span>;
    },
  },
  {
    accessorKey: "nasabah.nama",
    header: "Nama",
  },
  {
    accessorKey: "metodePembayaran",
    header: "Metode Pembayaran",
  },
  {
    accessorKey: "totalPenarikan",
    header: "Total Penarikan",
    cell: ({ row }) => {
      return <span>{formatRupiah(row.original.totalPenarikan)}</span>;
    },
  },
];

function PenarikanSaldoDataTable({ data, onLihat }) {
  const handleLihat = (dataRow) => {
    if (onLihat) {
      onLihat(dataRow);
    } else {
      // Default action jika onLihat tidak disediakan
      console.log("Melihat detail penarikan:", dataRow);
      // Bisa tambahkan modal atau redirect ke halaman detail
    }
  };

  // Tambahkan kolom aksi ke columns
  const columnsWithActions = [
    ...columns,
    {
      header: "Aksi",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleLihat(row.original)}
          className="flex items-center gap-1"
        >
          <Eye className="w-4 h-4" />
          Lihat
        </Button>
      ),
    },
  ];

  return <GenTable columns={columnsWithActions} data={data} />;
}

export default PenarikanSaldoDataTable;
