import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCookies } from "react-cookie";
import { getIdUserCookies, isRoleBSU } from "@/lib/utils";
import useFetch from "@/hooks/useFetch";

export default function EditDetailDialog({ 
  open, 
  onOpenChange, 
  detail,
  onSave 
}) {
  const [berat, setBerat] = useState(detail?.berat || 0);
  const [selectedJenisSampah, setSelectedJenisSampah] = useState(detail?.jenisSampahId?.toString() || "");
  const [cookies] = useCookies(["currentUser"]);
  const userId = getIdUserCookies(cookies);
  const isRoleBsu = isRoleBSU(cookies);

  const {
    data: dataJenisSampah,
    error: errorJenisSampah,
    isLoading,
  } = useFetch("/api/jenisSampah/getData/" + userId, {
    method: "GET",
  });

  const jenisSampahList = isRoleBsu 
    ? dataJenisSampah?.data?.bsu ?? []
    : dataJenisSampah?.data?.bsi ?? [];

  useEffect(() => {
    // Reset form ketika dialog dibuka
    if (open && detail) {
      setBerat(detail.berat || 0);
      setSelectedJenisSampah(detail.jenisSampahId?.toString() || "");
    }
  }, [open, detail]);

  const handleSave = () => {
    const selectedSampah = jenisSampahList.find(item => item.idJenisSampah.toString() === selectedJenisSampah);
    const hargaSatuan = isRoleBsu 
      ? selectedSampah?.hargasampahbsu 
      : selectedSampah?.hargasampahbsi?.harga;
    
    const beratFloat = parseFloat(berat);
    const hargaSatuanFloat = parseFloat(hargaSatuan || 0);
    const hargaTotal = beratFloat * hargaSatuanFloat;

    onSave({
      ...detail,
      jenisSampahId: parseInt(selectedJenisSampah),
      jenissampah: selectedSampah,
      berat: beratFloat,
      hargaTotal: Number(hargaTotal).toFixed(2)
    });
  };

  const handleCancel = () => {
    if (detail) {
      setBerat(detail.berat || 0);
      setSelectedJenisSampah(detail.jenisSampahId?.toString() || "");
    }
    onOpenChange(false);
  };

  if (!detail) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Detail Transaksi</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="jenisSampah" className="text-right">
              Jenis Sampah
            </Label>
            <Select
              value={selectedJenisSampah}
              onValueChange={setSelectedJenisSampah}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih jenis sampah" />
              </SelectTrigger>
              <SelectContent>
                {jenisSampahList.map((item) => (
                  <SelectItem 
                    key={item.idJenisSampah} 
                    value={item.idJenisSampah.toString()}
                  >
                    {item.nama}
                  </SelectItem>
                ))}
                {jenisSampahList.length === 0 && (
                  <SelectItem value="" disabled>
                    Tidak ada data
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="berat" className="text-right">
              Berat (kg)
            </Label>
            <Input
              id="berat"
              type="number"
              value={berat}
              onChange={(e) => setBerat(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Batal
          </Button>
          <Button onClick={handleSave}>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
