import { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatCurrency,
  getTokenUserCookies,
  getIdUserCookies,
} from "@/lib/utils";
import { useCookies } from "react-cookie";
import { useRouter } from "next/router";
import TodayTransactionActions from "./today-transaction-actions";
import TransactionDetailActions from "./transaction-detail-actions";
import EditDetailDialog from "./edit-detail-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

export default function TodayTransactionTable() {
  const [transactions, setTransactions] = useState([]);
  const [cookies, setCookie, removeCookie] = useCookies(["currentUser"]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const fetchTodayTransactions = useCallback(async () => {
    try {
      const token = getTokenUserCookies(cookies);
      const userId = getIdUserCookies(cookies);

      if (!userId) {
        removeCookie(["currentUser"]);
        router.replace("/login");
        return;
      }

      const response = await fetch(`/api/transaksi/${userId}?type=today`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.status === 200) {
        setTransactions(result.data);
      } else if (response.status === 401) {
        removeCookie(["currentUser"]);
        router.replace("/login");
      } else {
        console.error("Error:", result.message);
      }
    } catch (error) {
      console.error("Error fetching today transactions:", error);
    }
  }, [cookies, removeCookie, router]);

  useEffect(() => {
    fetchTodayTransactions();
  }, [fetchTodayTransactions]);

  const handleDelete = async (idTransaksi) => {
    try {
      const token = getTokenUserCookies(cookies);
      const response = await fetch(`/api/transaksi/${idTransaksi}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Update transactions state
        setTransactions((prev) =>
          prev.filter((t) => t.idTransaksi !== idTransaksi)
        );
      } else if (response.status === 401) {
        removeCookie(["currentUser"]);
        router.replace("/login");
      } else {
        console.error("Error deleting transaction");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleView = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailDialog(true);
  };

  const handleDetailEdit = (detail) => {
    setSelectedDetail(detail);
    setShowEditDialog(true);
  };

  const handleDetailDelete = async (detail) => {
    try {
      const token = getTokenUserCookies(cookies);
      const response = await fetch(
        `/api/transaksi/detail/${detail.transaksiId}/${detail.jenisSampahId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (result.status === 200) {
        // Update transactions state
        setTransactions((prev) => {
          return prev.map((transaction) => {
            if (transaction.idTransaksi === detail.transaksiId) {
              // Hapus detail yang dihapus
              const updatedDetails = transaction.transaksidetail.filter(
                (d) => d.jenisSampahId !== detail.jenisSampahId
              );

              // Recalculate totals
              const totalBerat = updatedDetails.reduce(
                (sum, d) => sum + (parseFloat(d.berat) || 0),
                0
              );
              const totalHarga = updatedDetails.reduce(
                (sum, d) => sum + (parseFloat(d.hargaTotal) || 0),
                0
              );

              return {
                ...transaction,
                transaksidetail: updatedDetails,
                berat: Number(totalBerat).toFixed(2),
                totalHarga: Number(totalHarga).toFixed(2),
              };
            }
            return transaction;
          });
        });

        // Update selected transaction
        setSelectedTransaction((prev) => {
          if (!prev) return null;

          // Hapus detail yang dihapus
          const updatedDetails = prev.transaksidetail.filter(
            (d) => d.jenisSampahId !== detail.jenisSampahId
          );

          // Recalculate totals
          const totalBerat = updatedDetails.reduce(
            (sum, d) => sum + (parseFloat(d.berat) || 0),
            0
          );
          const totalHarga = updatedDetails.reduce(
            (sum, d) => sum + (parseFloat(d.hargaTotal) || 0),
            0
          );

          return {
            ...prev,
            transaksidetail: updatedDetails,
            berat: Number(totalBerat).toFixed(2),
            totalHarga: Number(totalHarga).toFixed(2),
          };
        });

        // Show success message
        toast({
          title: "Berhasil",
          description: "Detail transaksi berhasil dihapus",
        });
      } else if (response.status === 401) {
        removeCookie(["currentUser"]);
        router.replace("/login");
      } else {
        console.error("Error:", result.message);
        toast({
          variant: "destructive",
          title: "Gagal",
          description: result.message || "Gagal menghapus detail transaksi",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Terjadi kesalahan saat menghapus detail",
      });
    }
  };

  const handleDetailSave = async (updatedDetail) => {
    try {
      const token = getTokenUserCookies(cookies);
      // Gunakan jenis sampah lama untuk URL
      const oldDetail = selectedTransaction.transaksidetail.find(
        (d) => d.transaksiId === updatedDetail.transaksiId
      );
      const oldJenisSampahId = oldDetail?.jenisSampahId;

      const response = await fetch(
        `/api/transaksi/detail/${updatedDetail.transaksiId}/${oldJenisSampahId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedDetail),
        }
      );

      const result = await response.json();

      if (result.status === 200) {
        // Update transactions state
        setTransactions((prev) => {
          return prev.map((transaction) => {
            if (transaction.idTransaksi === updatedDetail.transaksiId) {
              // Jika jenis sampah berubah, hapus yang lama dan tambahkan yang baru
              let updatedDetails;
              if (oldJenisSampahId !== updatedDetail.jenisSampahId) {
                updatedDetails = transaction.transaksidetail
                  .filter((d) => d.jenisSampahId !== oldJenisSampahId) // Hapus yang lama
                  .concat([
                    {
                      // Tambah yang baru
                      ...oldDetail,
                      jenisSampahId: updatedDetail.jenisSampahId,
                      jenissampah: updatedDetail.jenissampah,
                      berat: updatedDetail.berat,
                      hargaTotal: updatedDetail.hargaTotal,
                    },
                  ]);
              } else {
                // Jika hanya update berat/harga
                updatedDetails = transaction.transaksidetail.map((d) =>
                  d.jenisSampahId === oldJenisSampahId
                    ? {
                        ...d,
                        berat: updatedDetail.berat,
                        hargaTotal: updatedDetail.hargaTotal,
                      }
                    : d
                );
              }

              // Recalculate totals
              const totalBerat = updatedDetails.reduce(
                (sum, d) => sum + (parseFloat(d.berat) || 0),
                0
              );
              const totalHarga = updatedDetails.reduce(
                (sum, d) => sum + (parseFloat(d.hargaTotal) || 0),
                0
              );

              return {
                ...transaction,
                transaksidetail: updatedDetails,
                berat: Number(totalBerat).toFixed(2),
                totalHarga: Number(totalHarga).toFixed(2),
              };
            }
            return transaction;
          });
        });

        // Update selected transaction
        setSelectedTransaction((prev) => {
          if (!prev) return null;

          // Jika jenis sampah berubah, hapus yang lama dan tambahkan yang baru
          let updatedDetails;
          if (oldJenisSampahId !== updatedDetail.jenisSampahId) {
            updatedDetails = prev.transaksidetail
              .filter((d) => d.jenisSampahId !== oldJenisSampahId) // Hapus yang lama
              .concat([
                {
                  // Tambah yang baru
                  ...oldDetail,
                  jenisSampahId: updatedDetail.jenisSampahId,
                  jenissampah: updatedDetail.jenissampah,
                  berat: updatedDetail.berat,
                  hargaTotal: updatedDetail.hargaTotal,
                },
              ]);
          } else {
            // Jika hanya update berat/harga
            updatedDetails = prev.transaksidetail.map((d) =>
              d.jenisSampahId === oldJenisSampahId
                ? {
                    ...d,
                    berat: updatedDetail.berat,
                    hargaTotal: updatedDetail.hargaTotal,
                  }
                : d
            );
          }

          // Recalculate totals
          const totalBerat = updatedDetails.reduce(
            (sum, d) => sum + (parseFloat(d.berat) || 0),
            0
          );
          const totalHarga = updatedDetails.reduce(
            (sum, d) => sum + (parseFloat(d.hargaTotal) || 0),
            0
          );

          return {
            ...prev,
            transaksidetail: updatedDetails,
            berat: Number(totalBerat).toFixed(2),
            totalHarga: Number(totalHarga).toFixed(2),
          };
        });

        // Close dialog
        setShowEditDialog(false);

        // Show success message
        toast({
          title: "Berhasil",
          description: "Detail transaksi berhasil diupdate",
        });
      } else if (response.status === 401) {
        removeCookie(["currentUser"]);
        router.replace("/login");
      } else {
        console.error("Error response:", result);
        toast({
          variant: "destructive",
          title: "Gagal",
          description: result.message || "Gagal mengupdate detail transaksi",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Terjadi kesalahan saat mengupdate detail",
      });
    }
  };

  return (
    <>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Transaksi Hari Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Nama Nasabah</TableHead>
                <TableHead>Berat Sampah (kg)</TableHead>
                <TableHead>Total Harga</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction, index) => (
                <TableRow key={transaction.idTransaksi}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{transaction.nama || "-"}</TableCell>
                  <TableCell>
                    {Number(transaction.beratsampah || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(transaction.totalhargasampah || 0)}
                  </TableCell>
                  <TableCell className="flex justify-center">
                    <TodayTransactionActions
                      transaction={transaction}
                      onDelete={handleDelete}
                      onView={handleView}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Belum ada transaksi hari ini
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Detail Transaksi - {selectedTransaction?.nasabah?.nama}
            </DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="grid gap-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Jenis Sampah</TableHead>
                    <TableHead>Berat Sampah (kg)</TableHead>
                    <TableHead>Harga Sampah</TableHead>
                    <TableHead>Total Harga Sampah</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedTransaction.transaksidetail?.map((detail, index) => (
                    <TableRow
                      key={`${detail.transaksiId}-${detail.jenisSampahId}`}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{detail.jenissampah?.nama}</TableCell>
                      <TableCell>{Number(detail.berat).toFixed(2)}</TableCell>
                      <TableCell>
                        {formatCurrency(
                          detail.jenissampah?.hargasampahbsi?.harga || 0
                        )}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(detail.hargaTotal || 0)}
                      </TableCell>
                      <TableCell className="flex justify-center">
                        <TransactionDetailActions
                          detail={detail}
                          onEdit={handleDetailEdit}
                          onDelete={handleDetailDelete}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {!selectedTransaction.transaksidetail?.length && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Tidak ada detail transaksi
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <EditDetailDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        detail={selectedDetail}
        onSave={handleDetailSave}
      />
    </>
  );
}
