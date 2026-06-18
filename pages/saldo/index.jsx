
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useFetch from "@/hooks/useFetch";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import SaldoDataTable from "@/components/saldo/saldo-data-table";
import CustomButton from "@/components/custom_ui/custom-button";

import CustomCard from "@/components/custom_ui/custom-card";
import SearchInput from "@/components/custom_ui/search-input";
import Link from "next/link";
import { Upload, FilterIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useEffect, useMemo } from "react";
import { useCookies } from "react-cookie";
import { formatCurrency, getIdUserCookies } from "@/lib/utils";

function formatTanggal(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("id-ID");
}

function Saldo() {
  const [cookies] = useCookies(["currentUser"]);
  const nasabahId = getIdUserCookies(cookies);

  const {
    data: nasabahResponse,
    error: nasabahError,
    isLoading: isLoadingNasabah,
  } = useFetch(nasabahId ? `/api/bsu/nasabah/${nasabahId}` : null);

  const nasabah = nasabahResponse?.data ?? null;

  const {
    data: penarikanResponse,
    error: penarikanError,
    isLoading: isLoadingPenarikan,
  } = useFetch(
    nasabahId ? `/api/penarikan/storePenarikan?nasabahId=${nasabahId}` : null
  );

  const tableRows = useMemo(() => {
    const list = penarikanResponse?.data;
    if (!Array.isArray(list)) return [];
    return list.map((item) => ({
      tanggal: formatTanggal(item?.tanggalPenarikan),
      metode: item?.metodePembayaran ?? "-",
      jumlahPenarikan: formatCurrency(item?.totalPenarikan),
    }));
  }, [penarikanResponse]);

  const isLoading = isLoadingNasabah || isLoadingPenarikan;

  useEffect(() => {
    const error = nasabahError || penarikanError;
    if (!error) return;
    toast({
      variant: "destructive",
      title: "Gagal!",
      description: error?.message || "Terjadi kesalahan.",
    });
  }, [nasabahError, penarikanError]);

  return (
    <Layout>
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Laporan Saldo Nasabah</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            <CustomCard
              title="Sisa Saldo"
              value={formatCurrency(nasabah?.saldo)}
            />
            <CustomCard
              title="Total Pemasukkan"
              value="-"
            />
            <CustomCard
              title="Total Pengeluaran"
              value="-"
            />
          </div>
        </CardContent>
        <CardContent>
          <div className="flex my-3 justify-between">
            <Button variant="outline" className="ml-3">
              <FilterIcon className="w-4 h-4 mr-2" /> {/* Ikon Filter */}
              Filter
            </Button>
            <div className="flex my-3">
              <Link href={"/saldo/add-penarikan-saldo"} className="ml-auto">
                <CustomButton type="button">
                  <Upload className="w-4 h-4 mr-2" /> Penarikan Saldo
                </CustomButton>
              </Link>
              <SearchInput/>
            </div>
          </div>
          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "10px",
            }}
          >
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              // Panggilan data ke tabel keuangan
              <SaldoDataTable data={tableRows} />
            )}
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </Layout>
  );
}

export default Saldo;
