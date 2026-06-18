import React from "react";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";

// Helper function untuk format angka dengan pemisah ribuan
const formatRupiah = (angka) => {
  return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

function ListJenisSampah({ 
  data = [], 
  isBsu = 1, 
  beratSampah,
  setBeratSampah,
  totalHarga,
  setTotalHarga 
}) {
  const handleInputChange = (index, value) => {
    const numericValue = Math.max(0, Number(value));
    setBeratSampah((prev) => ({
      ...prev,
      [index]: numericValue,
    }));
    
    // Pastikan data[index] ada sebelum mengakses propertinya
    const hargaSatuan = isBsu === 1 ? data[index]?.hargasampahbsu : data[index]?.hargasampahbsi;
    setTotalHarga((prev) => ({
      ...prev,
      [index]: numericValue * (hargaSatuan || 0),
    }));
  };

  // Hitung total harga semua sampah
  const totalHargaSemua = Object.values(totalHarga || {}).reduce(
    (acc, curr) => acc + (curr || 0),
    0
  );

  return (
    <Card style={{ border: "none" }}>
      <h2 className="mb-3 font-semibold leading-none tracking-tight">
        Data Transaksi
      </h2>
      <div style={{ maxHeight: '250px', overflowY: 'auto' }} className="custom-scrollbar">
        <CardContent>
          <div className="space-y-2">
            {Array.isArray(data) && data.length > 0 ? (
              data.slice(0, Math.max(5, data.length)).map((sampah, index) => (
                <div key={sampah.idJenisSampah || index} className="flex items-baseline space-x-3">
                  {/* Nama Sampah */}
                  <FormLabel className="w-1/4">{sampah.nama || '-'}</FormLabel>

                  {/* Input Berat Sampah */}
                  <div className="w-3/5">
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Masukkan Berat Sampah /kg"
                        value={beratSampah[index] || ""}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        className="border p-2 w-full"
                        min="0"
                      />
                    </FormControl>
                    <FormMessage className="mt-1 text-xs" />
                  </div>

                  {/* Harga Sampah */}
                  <span className="w-1 pl-6">
                    Rp{formatRupiah(totalHarga[index] || 0)}
                  </span>
                </div>
              ))
            ) : (
              <p>Data sampah tidak ditemukan.</p>
            )}
          </div>
        </CardContent>
      </div>
      <Separator className="my-5" />
      <div className="mt-4 text-lg flex justify-between">
        <h2 className="mb-3 font-semibold leading-none tracking-tight">
          Total Harga Sampah
        </h2>
        <span>Rp{formatRupiah(totalHargaSemua)}</span>
      </div>
    </Card>
  );
}

export default ListJenisSampah;