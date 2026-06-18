import { useState, useEffect, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import CustomButton from "../custom_ui/custom-button";
import { useRouter } from "next/router";
import useDeleteForm from "@/hooks/useDeleteForm";
import { toast } from "../ui/use-toast";
import { useCookies } from "react-cookie";
import TransaksiDetailModal from "./transaksi-detail-modal";
import { Eye, Trash2 } from "lucide-react";

const TransaksiDataTableAction = ({ idTransaksi, idNasabah, data, tanggal, onDataChange, setTransaksiList }) => {
  const router = useRouter();
  const { deleteForm } = useDeleteForm();
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [cookies] = useCookies(["currentUser"]);
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const confirmDelete = async () => {
    try {
      setIsSubmitLoading(true);
      
      // Convert the Indonesian formatted date back to a proper date object
      const dateParts = tanggal.split(', ')[1].split(' '); // Split "Senin, 18 Desember 2024" into parts
      const monthMap = {
        'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5,
        'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
      };
      
      const day = parseInt(dateParts[0]);
      const month = monthMap[dateParts[1]];
      const year = parseInt(dateParts[2]);
      
      const date = new Date(year, month, day);
      const isoDate = date.toISOString();

      const res = await deleteForm(`/api/transaksi/delete-by-date/${encodeURIComponent(isoDate)}`);

      if (!res) {
        throw new Error('Tidak ada respons dari server');
      }

      if (res.error || !res.success) {
        throw new Error(res.message || 'Gagal menghapus transaksi');
      }

      toast({
        title: "Berhasil!",
        description: "Semua transaksi pada tanggal ini berhasil dihapus",
      });
      
      setShowDetail(false);
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      console.error('Error deleting transactions:', error);
      toast({
        variant: "destructive",
        title: "Error!",
        description: error.message || "Terjadi kesalahan saat menghapus transaksi",
      });
    } finally {
      setIsSubmitLoading(false);
      setOpenDialog(false);
    }
  };

 const fetchTransactionDetails = useCallback(async () => {
  try {
    setIsLoadingDetail(true);

    const dateParts = tanggal.split(', ')[1].split(' ');
    const monthMap = {
      'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5,
      'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
    };

    const day = parseInt(dateParts[0]);
    const month = monthMap[dateParts[1]];
    const year = parseInt(dateParts[2]);

    const date = new Date(year, month, day);
    const isoDate = date.toISOString();

    const response = await fetch(`/api/transaksi/detail/get/${encodeURIComponent(isoDate)}`, {
      headers: {
        'Authorization': `Bearer ${cookies.currentUser?.token}`
      }
    });

    const result = await response.json();

    if (response.ok) {
      setDetailData(result.data);
    } else {
      toast({
        variant: "destructive",
        title: "Error!",
        description: result.message || "Gagal mengambil detail transaksi",
      });
    }
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    toast({
      variant: "destructive",
      title: "Error!",
      description: "Terjadi kesalahan saat mengambil detail transaksi",
    });
  } finally {
    setIsLoadingDetail(false);
  }
}, [cookies, tanggal]); // <-- dependency yang digunakan dalam fungsi

// lalu gunakan di useEffect:
useEffect(() => {
  if (showDetail) {
    fetchTransactionDetails();
  }
}, [showDetail, fetchTransactionDetails]);

  return (
    <>
      <div className="flex space-x-2">
        <Button 
          variant="outline"
          className="h-8 w-8 p-0 text-black hover:text-black hover:bg-gray-100 border border-gray-200"
          onClick={() => setShowDetail(true)}
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
      </div>

      <TransaksiDetailModal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        data={detailData}
        tanggal={tanggal}
        onDataChange={onDataChange}
        setTransaksiList={setTransaksiList}
      />

      <AlertDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        defaultOpen={openDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Apakah Anda Ingin MENGHAPUS Semua Transaksi pada tanggal {tanggal}?
            </AlertDialogTitle>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <CustomButton
              variant="outline"
              type="button"
              onClick={() => setOpenDialog(false)}
              disabled={isSubmitLoading}
            >
              Batal
            </CustomButton>
            <CustomButton
              type="button"
              onClick={confirmDelete}
              disabled={isSubmitLoading}
            >
              {isSubmitLoading ? "Loading..." : "Hapus"}
            </CustomButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TransaksiDataTableAction;