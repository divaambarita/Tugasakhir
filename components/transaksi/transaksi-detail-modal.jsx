import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import CustomButton from "../custom_ui/custom-button";
import { useRouter } from "next/router";
import useDeleteForm from "@/hooks/useDeleteForm";
import { toast } from "../ui/use-toast";
import GenTable from "../layout/gen-table";
import { Pencil, Trash2, Eye } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  formatCurrency,
  getTokenUserCookies,
  getIdUserCookies,
} from "@/lib/utils";

const NasabahDetailModal = ({
  isOpen,
  onClose,
  data,
  nasabahNama,
  tanggal,
  onDataChange,
  setTransaksiList,
}) => {
  const columns = [
    {
      header: "No",
      cell: ({ row }) => <span>{row.index + 1}</span>,
    },
    {
      accessorKey: "jenisSampah.nama",
      header: "Jenis Sampah",
      cell: ({ row }) => <span>{row.original["jenisSampah.nama"]}</span>,
    },
    {
      accessorKey: "beratsampah",
      header: "Berat Sampah",
      cell: ({ row }) => (
        <span>{Number(row.original.beratsampah).toFixed(2)} Kg</span>
      ),
    },
    {
      header: "Harga Sampah",
      cell: ({ row }) => {
        const rowData = row.original;
        const hargaSatuan = rowData.hargasatuan;
        return <span>Rp{Number(hargaSatuan).toLocaleString("id-ID")}/Kg</span>;
      },
    },
    {
      accessorKey: "totalhargasampah",
      header: "Total Harga Sampah",
      cell: ({ row }) => (
        <span>
          Rp{Number(row.original.totalhargasampah).toLocaleString("id-ID")}
        </span>
      ),
    },
  ];

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cookies] = useCookies(["currentUser"]);
  const [jenisSampah, setJenisSampah] = useState([]);

  // Fetch jenis sampah saat komponen dimount
  useEffect(() => {
    const fetchJenisSampah = async () => {
      try {
        // Menggunakan ID user dari cookies (BSU ID)
        const bsuId = getIdUserCookies(cookies);
        if (!bsuId) {
          console.error("BSU ID not found in cookies");
          return;
        }

        const response = await fetch(
          `/api/jenisSampah/listsampah?id=${bsuId}`,
          {
            headers: {
              Authorization: `Bearer ${getTokenUserCookies(cookies)}`,
            },
          }
        );
        const result = await response.json();
        if (response.ok) {
          console.log("Jenis Sampah:", result.data); // Debugging
          setJenisSampah(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching jenis sampah:", error);
        setJenisSampah([]);
      }
    };

    // Fetch jenis sampah saat modal dibuka, tidak perlu menunggu selectedTransaksi
    if (isOpen) {
      fetchJenisSampah();
    }
  }, [isOpen, cookies]);

  const handleEdit = (transaksi) => {
    console.log("Selected Transaksi:", transaksi); // Debugging
    setSelectedTransaksi(transaksi);
    setEditModalOpen(true);
  };

  const handleDelete = async (transaksi) => {
    try {
      setIsDeleting(true);

      // Pastikan kita memiliki ID transaksi dan jenis sampah
      if (!transaksi?.transaksiId || !transaksi?.jenisSampahId) {
        throw new Error("Data transaksi tidak lengkap");
      }

      const response = await fetch(
        `/api/transaksi/detail/delete/${transaksi.transaksiId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies.currentUser?.token}`,
          },
          body: JSON.stringify({
            transaksiId: transaksi.transaksiId,
            jenisSampahId: transaksi.jenisSampahId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menghapus transaksi");
      }

      // Update state lokal dengan menghapus transaksi yang dihapus
      setTransaksiList((prevList) =>
        prevList.filter(
          (t) =>
            !(
              t.transaksiId === transaksi.transaksiId &&
              t.jenisSampahId === transaksi.jenisSampahId
            )
        )
      );

      toast({
        title: "Berhasil!",
        description: "Transaksi berhasil dihapus",
      });

      // Tutup dialog konfirmasi
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast({
        variant: "destructive",
        title: "Error!",
        description:
          error.message || "Terjadi kesalahan saat menghapus transaksi",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const jenisSampahId = formData.get("jenissampah");
    const beratSampah = formData.get("beratsampah");

    try {
      // Pastikan kita memiliki ID transaksi dan jenis sampah lama
      if (
        !selectedTransaksi?.transaksiId ||
        !selectedTransaksi?.jenisSampahId
      ) {
        throw new Error("Data transaksi tidak lengkap");
      }

      const response = await fetch(
        `/api/transaksi/detail/update/${selectedTransaksi.transaksiId}?oldJenisSampahId=${selectedTransaksi.jenisSampahId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies.currentUser?.token}`,
          },
          body: JSON.stringify({
            jenisSampahId: parseInt(jenisSampahId),
            beratsampah: parseFloat(beratSampah),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengupdate transaksi");
      }

      // Update state lokal dengan data terbaru
      const selectedJenisSampah = jenisSampah.find(
        (j) => j.idJenisSampah === parseInt(jenisSampahId)
      );
      const hargaSatuan = selectedJenisSampah?.hargasampahbsu || 0;
      const updatedTransaksi = {
        ...selectedTransaksi,
        jenisSampahId: parseInt(jenisSampahId),
        beratsampah: parseFloat(beratSampah),
        "jenisSampah.nama": selectedJenisSampah?.nama,
        hargasatuan: hargaSatuan,
        totalhargasampah: parseFloat(beratSampah) * hargaSatuan,
      };

      // Update data transaksi di parent component
      setTransaksiList((prevList) =>
        prevList.map((t) =>
          t.transaksiId === updatedTransaksi.transaksiId &&
          t.jenisSampahId === selectedTransaksi.jenisSampahId
            ? updatedTransaksi
            : t
        )
      );

      toast({
        title: "Berhasil!",
        description: "Transaksi berhasil diupdate",
      });

      setEditModalOpen(false);
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast({
        variant: "destructive",
        title: "Error!",
        description:
          error.message || "Terjadi kesalahan saat mengupdate transaksi",
      });
    }
  };

  columns.push({
    id: "action",
    header: "Aksi",
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0 text-black hover:text-black hover:bg-gray-100 border border-gray-200"
            onClick={() => handleEdit(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-100 border border-red-200"
            onClick={() => {
              setSelectedTransaksi(row.original);
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <AlertDialog
            open={
              deleteDialogOpen &&
              selectedTransaksi?.transaksiId === row.original.transaksiId &&
              selectedTransaksi?.jenisSampahId === row.original.jenisSampahId
            }
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Apakah Anda yakin ingin menghapus transaksi{" "}
                  {row.original["jenisSampah.nama"]} untuk nasabah {nasabahNama}
                  ?
                </AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <CustomButton
                  variant="outline"
                  type="button"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={isDeleting}
                >
                  Batal
                </CustomButton>
                <CustomButton
                  type="button"
                  onClick={() => handleDelete(row.original)}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Menghapus..." : "Hapus"}
                </CustomButton>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
  });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Detail Transaksi - {nasabahNama}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[500px]">
            <GenTable data={data} columns={columns} />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modal Edit Transaksi */}
      {selectedTransaksi && (
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Transaksi</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="jenissampah" className="text-right">
                    Jenis Sampah
                  </Label>
                  <div className="col-span-3">
                    <Select
                      name="jenissampah"
                      defaultValue={selectedTransaksi.jenisSampahId?.toString()}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih jenis sampah" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(jenisSampah) &&
                        jenisSampah.length > 0 ? (
                          jenisSampah.map((jenis) => (
                            <SelectItem
                              key={jenis.idJenisSampah}
                              value={jenis.idJenisSampah.toString()}
                            >
                              {jenis.nama}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                            Tidak ada data jenis sampah
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="beratsampah" className="text-right">
                    Berat Sampah
                  </Label>
                  <Input
                    id="beratsampah"
                    name="beratsampah"
                    type="number"
                    step="0.01"
                    defaultValue={selectedTransaksi.beratsampah}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <div className="flex space-x-2 justify-end">
                  <CustomButton
                    type="button"
                    variant="outline"
                    onClick={() => setEditModalOpen(false)}
                  >
                    Batal
                  </CustomButton>
                  <CustomButton type="submit">Simpan</CustomButton>
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

// Component untuk action cell yang membutuhkan hooks
const ActionCell = ({ row, tanggal, onClose, onDataChange, onShowDetail }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cookies] = useCookies(["currentUser"]);

  // Fungsi untuk mengkonversi format tanggal Indonesia ke ISO string
  const convertToISODate = (tanggalStr) => {
    const [hari, tanggalLengkap] = tanggalStr.split(", ");
    const [tanggal, bulan, tahun] = tanggalLengkap.split(" ");

    const bulanMap = {
      Januari: 0,
      Februari: 1,
      Maret: 2,
      April: 3,
      Mei: 4,
      Juni: 5,
      Juli: 6,
      Agustus: 7,
      September: 8,
      Oktober: 9,
      November: 10,
      Desember: 11,
    };

    const date = new Date(tahun, bulanMap[bulan], parseInt(tanggal));
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const isoDate = convertToISODate(tanggal);

      const response = await fetch(
        "/api/transaksi/delete-by-date-and-nasabah/" +
          encodeURIComponent(row.original["nasabah.nama"]),
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies.currentUser?.token}`,
          },
          body: JSON.stringify({
            tanggal: isoDate,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menghapus transaksi");
      }

      toast({
        title: "Berhasil!",
        description: "Transaksi berhasil dihapus",
      });

      if (onDataChange) {
        onDataChange();
      }

      onClose();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast({
        variant: "destructive",
        title: "Error!",
        description:
          error.message || "Terjadi kesalahan saat menghapus transaksi",
      });
    } finally {
      setIsDeleting(false);
      setOpenDialog(false);
    }
  };

  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        className="h-8 w-8 p-0 text-black hover:text-black hover:bg-gray-100 border border-gray-200"
        onClick={() => onShowDetail(row.original["nasabah.nama"])}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-100 border border-red-200"
        onClick={() => setOpenDialog(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Apakah Anda yakin ingin menghapus semua transaksi untuk nasabah{" "}
              {row.original["nasabah.nama"]} pada tanggal {tanggal}?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <CustomButton
              variant="outline"
              type="button"
              onClick={() => setOpenDialog(false)}
              disabled={isDeleting}
            >
              Batal
            </CustomButton>
            <CustomButton
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </CustomButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const TransaksiDetailModal = ({
  isOpen,
  onClose,
  data,
  tanggal,
  onDataChange,
  setTransaksiList,
}) => {
  const [selectedNasabah, setSelectedNasabah] = useState(null);
  const [nasabahDetailOpen, setNasabahDetailOpen] = useState(false);
  const [nasabahDetailData, setNasabahDetailData] = useState([]);

  // Mengelompokkan data berdasarkan nasabah
  const groupedData = data.reduce((acc, curr) => {
    const nasabahNama = curr["nasabah.nama"];

    if (!acc[nasabahNama]) {
      acc[nasabahNama] = {
        "nasabah.nama": nasabahNama,
        beratsampah: 0,
        hargasatuan: curr.hargasatuan,
        totalhargasampah: 0,
        detailTransaksi: [], // Menyimpan semua transaksi detail
      };
    }

    acc[nasabahNama].beratsampah += Number(curr.beratsampah);
    acc[nasabahNama].totalhargasampah += Number(curr.totalhargasampah);
    acc[nasabahNama].detailTransaksi.push(curr); // Menambahkan transaksi ke array detail

    return acc;
  }, {});

  const processedData = Object.values(groupedData);

  const handleShowDetail = (nasabahNama) => {
    const nasabahData = groupedData[nasabahNama];
    if (nasabahData) {
      setSelectedNasabah(nasabahNama);
      setNasabahDetailData(nasabahData.detailTransaksi);
      setNasabahDetailOpen(true);
    }
  };

  const columns = [
    {
      header: "No",
      cell: ({ row }) => <span>{row.index + 1}</span>,
    },
    {
      accessorKey: "nasabah.nama",
      header: "Nama Nasabah",
      cell: ({ row }) => <span>{row.original["nasabah.nama"]}</span>,
    },
    {
      accessorKey: "beratsampah",
      header: "Berat Sampah",
      cell: ({ row }) => (
        <span>{Number(row.original.beratsampah).toFixed(2)} Kg</span>
      ),
    },
    {
      accessorKey: "totalhargasampah",
      header: "Total Harga Sampah",
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
        return (
          <ActionCell
            row={row}
            tanggal={tanggal}
            onClose={onClose}
            onDataChange={onDataChange}
            onShowDetail={handleShowDetail}
          />
        );
      },
    },
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Detail Transaksi {tanggal}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[500px]">
            <GenTable data={processedData} columns={columns} />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <NasabahDetailModal
        isOpen={nasabahDetailOpen}
        onClose={() => setNasabahDetailOpen(false)}
        data={nasabahDetailData}
        nasabahNama={selectedNasabah}
        tanggal={tanggal}
        onDataChange={onDataChange}
        setTransaksiList={setTransaksiList}
      />
    </>
  );
};

export default TransaksiDetailModal;
