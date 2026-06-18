import TransaksiDataTableAction from "./transaksi-data-table-action";
import GenTable from "../layout/gen-table";

function SesiTransaksiDataTable({ data = [], onDataChange, setTransaksiList }) {
  // Group by date and sum up the values
  const groupedData = data.reduce((acc, item) => {
    const date = item.tanggal.split('T')[0];
    
    if (!acc[date]) {
      acc[date] = {
        idTransaksi: item.idTransaksi,
        idNasabah: item.idNasabah,
        tanggal: item.tanggal,
        beratsampah: 0,
        totalhargasampah: 0
      };
    }
    
    acc[date].beratsampah += Number(item.beratsampah);
    acc[date].totalhargasampah += Number(item.totalhargasampah);
    
    return acc;
  }, {});

  const processedData = Object.values(groupedData);
  
  const columns = [
    {
      header: "No",
      cell: ({ row }) => <span>{row.index + 1}</span>,
    },
    {
      accessorKey: "tanggal",
      header: "Tanggal",
      cell: ({ row }) => {
        const date = new Date(row.original.tanggal);
        return <span>{date.toLocaleDateString("id-ID", {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</span>;
      },
    },
    {
      accessorKey: "beratsampah",
      header: "Total Berat Setoran",
      cell: ({ row }) => <span>{Number(row.original.beratsampah).toFixed(2)} Kg</span>,
    },
    {
      accessorKey: "totalhargasampah",
      header: "Total Tabungan Nasabah",
      cell: ({ row }) => (
        <span>
          Rp{Number(row.original.totalhargasampah).toLocaleString("id-ID")}
        </span>
      ),
    },
    {
      id: "action",
      header: "Aksi",
      cell: ({ row }) => {
        const date = new Date(row.original.tanggal);
        const formattedDate = date.toLocaleDateString("id-ID", {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        // Get all transactions for this date
        const dateTransactions = data.filter(item => {
          const itemDate = new Date(item.tanggal);
          return itemDate.toDateString() === date.toDateString();
        });
        
        return (
          <TransaksiDataTableAction
            idTransaksi={row.original.idTransaksi}
            idNasabah={row.original.idNasabah}
            data={dateTransactions}
            tanggal={formattedDate}
            onDataChange={onDataChange}
            setTransaksiList={setTransaksiList}
          />
        );
      },
    },
  ];
  
  return <GenTable data={processedData} columns={columns} />;
}

export default SesiTransaksiDataTable;
