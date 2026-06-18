import { useState } from "react";
import { useCookies } from "react-cookie";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Trash2, Pencil } from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";
import useDeleteForm from "@/hooks/useDeleteForm";
import { toast } from "../ui/use-toast";
import GenTable from "../layout/gen-table";
import { getTokenUserCookies } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TransaksiSessionTable = ({ data = [] }) => {
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetailDeleteConfirm, setShowDetailDeleteConfirm] = useState(false);
  const [showDetailEditForm, setShowDetailEditForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteDetailTarget, setDeleteDetailTarget] = useState(null);
  const [editDetailTarget, setEditDetailTarget] = useState(null);
  const [editForm, setEditForm] = useState({
    transaksiId: "",
    oldJenisSampahId: "",
    jenisSampahId: "",
    beratsampah: "",
  });
  const [jenisSampahList, setJenisSampahList] = useState([]);
  const router = useRouter();
  const [cookies] = useCookies(["currentUser"]);
  const { deleteForm } = useDeleteForm();

  // Group transactions by nasabah
  const groupedData = data.reduce((acc, curr) => {
    const key = curr["nasabah.nama"];
    if (!acc[key]) {
      acc[key] = {
        idNasabah: curr.idNasabah,
        "nasabah.nama": key,
        totalHarga: 0,
        details: []
      };
    }
    acc[key].totalHarga += curr.totalhargasampah;
    acc[key].details.push(curr);
    return acc;
  }, {});

  const summaryData = Object.values(groupedData);

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
      accessorKey: "beratsampah",
      header: "Berat Sampah",
      cell: ({ row }) => {
        return <span>{row.original.beratsampah} Kg</span>;
      },
    },
    {
      accessorKey: "action",
      header: "Aksi",
      cell: ({ row }) => {
        const transaksi = row.original;
        return (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0 text-black hover:text-black hover:bg-gray-100 border border-gray-200"
              onClick={() => {
                setSelectedTransaksi(transaksi);
                setShowDetail(true);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-100 border border-red-200"
              onClick={() => {
                setDeleteTarget(transaksi);
                setShowDeleteConfirm(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const detailColumns = [
    {
      header: "Jenis Sampah",
      cell: ({ row }) => {
        return <span>{row.original["jenisSampah.nama"]}</span>;
      },
    },
    {
      header: "Berat Sampah",
      cell: ({ row }) => {
        return <span>{row.original.beratsampah} Kg</span>;
      },
    },
    {
      accessorKey: "action",
      header: "Aksi",
      cell: ({ row }) => {
        const detail = row.original;
        return (
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              className="h-8 w-8 p-0 text-black hover:text-black hover:bg-gray-100 border border-gray-200"
              onClick={() => {
                setEditDetailTarget(detail);
                setEditForm({
                  transaksiId: detail.transaksiId,
                  oldJenisSampahId: detail.jenisSampahId || detail.idJenisSampah,
                  jenisSampahId: (detail.jenisSampahId || detail.idJenisSampah).toString(),
                  beratsampah: detail.beratsampah.toString(),
                });
                fetchJenisSampah();
                setShowDetailEditForm(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline"
              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-100 border border-red-200"
              onClick={() => {
                setDeleteDetailTarget(detail);
                setShowDetailDeleteConfirm(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Fetch jenis sampah data
  const fetchJenisSampah = async () => {
    try {
      const token = getTokenUserCookies(cookies);
      const response = await fetch(`/api/jenisSampah/getData/1`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        }
      });
      const data = await response.json();
      
      if (response.ok && data.data?.bsi) {
        const rawData = data.data.bsi;
        const validJenisSampah = rawData
          .filter((item) => item && typeof item === 'object' && (item.id || item.idJenisSampah) && item.nama)
          .map(item => ({
            ...item,
            id: item.id || item.idJenisSampah,
          }));
        setJenisSampahList(validJenisSampah);
      } else {
        toast({
          variant: "destructive",
          title: "Error!",
          description: "Gagal mengambil data jenis sampah",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error!",
        description: "Gagal mengambil data jenis sampah",
      });
    }
  };

  return (
    <>
      <GenTable columns={columns} data={summaryData} />
      
      {/* Detail Dialog */}
      <AlertDialog open={showDetail} onOpenChange={setShowDetail}>
        <AlertDialogContent className="max-w-4xl">
          <div className="flex justify-between items-start">
            <AlertDialogHeader>
              <AlertDialogTitle>
                Detail Transaksi - {selectedTransaksi?.["nasabah.nama"]}
              </AlertDialogTitle>
            </AlertDialogHeader>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 text-black rounded-full hover:bg-gray-500 hover:rounded-full hover:text-white"
              onClick={() => setShowDetail(false)}
            >
              <span className="sr-only">Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M18 6 6 18"></path>
                <path d="M6 6l12 12"></path>
              </svg>
            </Button>
          </div>
          <div className="mt-4">
            <GenTable 
              columns={detailColumns} 
              data={selectedTransaksi?.details || []} 
            />
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah anda yakin ingin menghapus semua transaksi hari ini untuk nasabah{" "}
              {deleteTarget?.["nasabah.nama"]}? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  const res = await deleteForm(
                    `/api/transaksi/delete-by-nasabah/${deleteTarget?.idTransaksi}`,
                    {
                      nasabahId: deleteTarget?.idNasabah,
                    }
                  );

                  if (!res || res.error) {
                    toast({
                      variant: "destructive",
                      title: "Gagal!",
                      description: res?.message || "Gagal menghapus transaksi",
                    });
                  } else {
                    toast({
                      description: "Berhasil menghapus semua transaksi",
                    });
                    // Refresh the page to update the data
                    router.replace(router.asPath);
                  }
                  setShowDeleteConfirm(false);
                } catch (error) {
                  toast({
                    variant: "destructive",
                    title: "Error!",
                    description: "Terjadi kesalahan saat menghapus transaksi",
                  });
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Detail Confirmation Dialog */}
      <AlertDialog open={showDetailDeleteConfirm} onOpenChange={setShowDetailDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah anda yakin ingin menghapus transaksi {deleteDetailTarget?.["jenisSampah.nama"]} seberat {deleteDetailTarget?.beratsampah} Kg?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDetailDeleteConfirm(false)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  const res = await deleteForm(`/api/transaksi/detail/delete/${deleteDetailTarget?.transaksiId}`, {
                    transaksiId: deleteDetailTarget?.transaksiId,
                    jenisSampahId: deleteDetailTarget?.jenisSampahId
                  });

                  if (!res || res.error) {
                    toast({
                      variant: "destructive",
                      title: "Gagal!",
                      description: res?.message || "Gagal menghapus detail transaksi",
                    });
                  } else {
                    toast({
                      description: "Berhasil menghapus detail transaksi",
                    });
                    // Refresh the page to update the data
                    router.replace(router.asPath);
                    setShowDetail(false);
                  }
                  setShowDetailDeleteConfirm(false);
                } catch (error) {
                  toast({
                    variant: "destructive",
                    title: "Error!",
                    description: "Terjadi kesalahan saat menghapus detail transaksi",
                  });
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Detail Form Dialog */}
      <AlertDialog open={showDetailEditForm} onOpenChange={setShowDetailEditForm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Transaksi</AlertDialogTitle>
            <AlertDialogDescription>
              Ubah detail transaksi untuk {editDetailTarget?.["jenisSampah.nama"]}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="jenisSampah" className="text-right">
                Jenis Sampah
              </Label>
              <Select
                value={editForm.jenisSampahId}
                onValueChange={(value) => 
                  setEditForm((prev) => ({ ...prev, jenisSampahId: value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih jenis sampah" />
                </SelectTrigger>
                <SelectContent>
                  {jenisSampahList.map((item) => (
                    <SelectItem 
                      key={item.id} 
                      value={item.id.toString()}
                    >
                      {item.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="beratsampah" className="text-right">
                Berat (Kg)
              </Label>
              <Input
                id="beratsampah"
                type="number"
                step="0.1"
                value={editForm.beratsampah}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, beratsampah: e.target.value }))
                }
                className="col-span-3"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDetailEditForm(false)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  const token = getTokenUserCookies(cookies);
                  const requestData = {
                    jenisSampahId: Number(editForm.jenisSampahId),
                    beratsampah: Number(editForm.beratsampah)
                  };
                  
                  const res = await fetch(
                    `/api/transaksi/detail/update/${editForm.transaksiId}?oldJenisSampahId=${editForm.oldJenisSampahId}`, 
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                      },
                      body: JSON.stringify(requestData),
                    }
                  );

                  const data = await res.json();
                  
                  if (!res.ok) {
                    toast({
                      variant: "destructive",
                      title: "Gagal!",
                      description: data?.message || "Gagal mengubah detail transaksi",
                    });
                  } else {
                    toast({
                      title: "Berhasil!",
                      description: "Detail transaksi berhasil diubah",
                    });
                    setShowDetailEditForm(false);
                    setShowDetail(false); // Menutup modal Detail Transaksi
                    router.push('/transaksi/add-transaksi');
                  }
                } catch (error) {
                  toast({
                    variant: "destructive",
                    title: "Error!",
                    description: "Terjadi kesalahan saat mengubah detail transaksi",
                  });
                }
              }}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Simpan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TransaksiSessionTable;
