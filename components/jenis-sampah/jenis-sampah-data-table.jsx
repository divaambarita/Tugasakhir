import GenTable from "../layout/gen-table";
import JenisSampahDataTableAction from "./jenis-sampah-data-table-action";

let columns = [
  {
    header: "No",
    cell: ({ row }) => {
      return <span>{row.index + 1}</span>;
    },
  },
  {
    accessorKey: "nama",
    header: "Nama",
  },
  {
    accessorKey: "kategori",
    header: "Jenis",
  },
  {
    accessorKey: "hargasampahbsi",
    header: "Harga BSI",
  },
  {
    accessorKey: "hargasampahbsu",
    header: "Harga BSU",
  },
  {
    accessorKey: "lastUpdate",
    header: "Update Terakhir",
  },
  {
    accessorKey: "action",
    header: "Aksi",
    cell: ({ row }) => {
      /// mengambil idBsu
      const idJenisSampah = row.original.idJenisSampah;
      return <JenisSampahDataTableAction idJenisSampah={idJenisSampah} />;
    },
  },
];

function JenisSampahDataTable({ data = [], isBsu = 1 }) {
  if (isBsu == 0) {
    columns = [
      {
        header: "No",
        cell: ({ row }) => {
          return <span>{row.index + 1}</span>;
        },
      },
      {
        accessorKey: "nama",
        header: "Nama",
      },
      {
        accessorKey: "kategori",
        header: "Jenis",
      },
      {
        accessorKey: "hargasampahbsi",
        header: "Harga BSI",
      },
      {
        accessorKey: "lastUpdate",
        header: "Update Terakhir",
      },
      {
        accessorKey: "action",
        header: "Aksi",
        cell: ({ row }) => {
          // mengambil idBsu
          const idJenisSampah = row.original.idJenisSampah;
          return <JenisSampahDataTableAction idJenisSampah={idJenisSampah} />;
        },
      },
    ];
  }
  return <GenTable data={data} columns={columns}></GenTable>;
}

export default JenisSampahDataTable;
