import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Eye } from "lucide-react";
import { getTokenUserCookies } from "@/lib/utils";
import { useCookies } from "react-cookie";

export default function TodayTransactionActions({ transaction, onDelete, onView }) {
  const [cookies] = useCookies(["currentUser"]);
  const [details, setDetails] = useState([]);

  const fetchTransactionDetails = useCallback(async () => {
    try {
      const token = getTokenUserCookies(cookies);
      const res = await fetch(`/api/transaksi/${transaction.idTransaksi}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (result.status === 200) {
        setDetails(result.data);
      }
    } catch (error) {
      console.error("Error fetching transaction details:", error);
    }
  }, [cookies, transaction.idTransaksi]);

  useEffect(() => {
    fetchTransactionDetails();
  }, [fetchTransactionDetails]);

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onView(transaction)}
        title="Lihat Detail"
        className="border border-gray-200 hover:border-gray-300"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="border border-red-200 hover:border-red-300 hover:bg-red-50"
            title="Hapus Transaksi"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Transaksi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => onDelete(transaction.idTransaksi)}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
