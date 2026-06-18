import React, { useState, useEffect } from "react";
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

function KeuanganListJenisSampah({ data = [], isBsu = 1, onItemsChange }) {
  const [beratSampah, setBeratSampah] = useState({});
  const [hargaSampah, setHargaSampah] = useState({});
  const [totalHarga, setTotalHarga] = useState({});

  // Format number untuk display (dengan pemisah ribuan)
  const formatCurrency = (value) => {
    if (!value || value === 0) return "Rp 0";
    return `Rp ${Number(value).toLocaleString("id-ID")}`;
  };

  // Format input harga (hilangkan karakter non-numeric)
  const formatHargaInput = (value) => {
    return value.replace(/[^0-9]/g, "");
  };

  const handleInputChange = (index, field, value) => {
    if (field === "berat") {
      const numericValue = Math.max(0, Number(value));
      setBeratSampah((prev) => ({
        ...prev,
        [index]: numericValue,
      }));

      const currentHarga = hargaSampah[index] || 0;
      setTotalHarga((prev) => ({
        ...prev,
        [index]: numericValue * currentHarga,
      }));
    } else if (field === "harga") {
      const cleanValue = formatHargaInput(value);
      const numericValue = Math.max(0, Number(cleanValue));

      setHargaSampah((prev) => ({
        ...prev,
        [index]: numericValue,
      }));

      const currentBerat = beratSampah[index] || 0;
      setTotalHarga((prev) => ({
        ...prev,
        [index]: numericValue * currentBerat,
      }));
    }
  };

  useEffect(() => {
    const items = Object.keys(beratSampah)
      .filter((index) => beratSampah[index] > 0 && data[index])
      .map((index) => ({
        berat: beratSampah[index],
        harga: hargaSampah[index] || 0,
        jenisSampahId:
          data[index].idJenisSampah?.toString() || data[index].id?.toString(),
      }))
      .filter((item) => item.jenisSampahId && item.harga > 0); // Filter items with valid data

    onItemsChange(items);
  }, [beratSampah, hargaSampah, data, onItemsChange]);

  const totalHargaSemua = Object.values(totalHarga).reduce(
    (acc, curr) => acc + curr,
    0
  );

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Data Transaksi Penjualan Sampah
        </h2>

        {/* Header Kolom */}
        <div className="grid grid-cols-4 gap-3 mb-3 pb-2 border-b border-gray-200">
          <div className="text-sm font-medium text-gray-700">Jenis Sampah</div>
          <div className="text-sm font-medium text-gray-700 text-center">
            Berat (kg)
          </div>
          <div className="text-sm font-medium text-gray-700 text-center">
            Harga/kg
          </div>
          <div className="text-sm font-medium text-gray-700 text-center">
            Subtotal
          </div>
        </div>

        <div
          className="space-y-3"
          style={{ maxHeight: "300px", overflowY: "auto" }}
        >
          {data.length > 0 ? (
            data.map((sampah, index) => {
              const isActive =
                (beratSampah[index] || 0) > 0 && (hargaSampah[index] || 0) > 0;
              const defaultHarga = sampah?.hargasampahbsu || 0;
              const currentHarga = hargaSampah[index] || 0;

              return (
                <div
                  key={index}
                  className={`grid grid-cols-4 gap-3 p-3 rounded-lg border transition-all ${
                    isActive
                      ? "border-green-300 bg-green-50"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  {/* Nama Jenis Sampah */}
                  <div className="flex items-center">
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        {sampah.nama}
                      </span>
                      {defaultHarga > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Harga standar: Rp{" "}
                          {defaultHarga.toLocaleString("id-ID")}/kg
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Input Berat */}
                  <div>
                    <Input
                      type="number"
                      placeholder="0"
                      value={beratSampah[index] || ""}
                      onChange={(e) =>
                        handleInputChange(index, "berat", e.target.value)
                      }
                      className="text-center h-9"
                      min="0"
                      step="0.1"
                      title="Masukkan berat sampah dalam kilogram"
                    />
                    {/* {(beratSampah[index] || 0) > 0 && (
                      <div className="text-xs text-green-600 text-center mt-1">
                        {beratSampah[index]} kg
                      </div>
                    )} */}
                  </div>

                  {/* Input Harga */}
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Masukkan harga"
                      value={
                        currentHarga > 0
                          ? currentHarga.toLocaleString("id-ID")
                          : ""
                      }
                      onChange={(e) =>
                        handleInputChange(index, "harga", e.target.value)
                      }
                      className="text-center h-9 pr-8"
                      title="Masukkan harga per kilogram"
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                      /kg
                    </span>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-center">
                    <span
                      className={`text-sm font-semibold ${
                        (totalHarga[index] || 0) > 0
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {formatCurrency(totalHarga[index] || 0)}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl text-gray-400">📦</span>
              </div>
              <p className="text-gray-500 font-medium">
                Data sampah tidak ditemukan
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Silakan coba kata kunci pencarian lain
              </p>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-lg font-semibold text-gray-900">
            Total Keseluruhan:
          </span>
          <span className="text-2xl font-bold text-blue-600">
            {formatCurrency(totalHargaSemua)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default KeuanganListJenisSampah;
