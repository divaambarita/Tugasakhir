import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useFetch from "@/hooks/useFetch";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import KeuanganDataTable from "@/components/keuangan/keuangan-data-table";
import CustomCard from "@/components/custom_ui/custom-card";
import SearchInput from "@/components/custom_ui/search-input";
import Link from "next/link";
import { PlusSquare, Upload, FilterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export async function getServerSideProps(context) {
  const idBsu = context.query.id; // Mengambil id dari query
  return {
    props: {
      idBsu,
    },
  };
}

function Keuangan({ idBsu }) {
  const {
    data: dataKeuangan,
    error: errorKeuangan,
    isLoading: isLoadingKeuangan,
  } = useFetch(`/api/keuangan/pengeluaran/getPengeluaran?bsuId=${idBsu}`, {
    method: "GET",
  });

  const {
    data: dataPemasukan,
    error: errorPemasukan,
    isLoading: isLoadingPemasukan,
  } = useFetch(`/api/keuangan/pemasukan/getPemasukan?bsuId=${idBsu}`, {
    method: "GET",
  });

  const {
    data: dataPenjualan,
    error: errorPenjualan,
    isLoading: isLoadingPenjualan,
  } = useFetch(`/api/keuangan/pemasukan/getPenjualan?bsuId=${idBsu}`, {
    method: "GET",
  });

  // Fetch data BSU untuk mendapatkan nama BSU
  const {
    data: dataBsu,
    error: errorBsu,
    isLoading: isLoadingBsu,
  } = useFetch(`/api/master/getBankSampah`);

  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [totalPengeluaran, setTotalPengeluaran] = useState(0);
  const [totalPemasukan, setTotalPemasukan] = useState(0);
  const [namaBsu, setNamaBsu] = useState("");

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  // Set nama BSU
  useEffect(() => {
    if (dataBsu?.data && idBsu) {
      const bsu = dataBsu.data.find(
        (b) => b.idBsu.toString() === idBsu.toString()
      );
      if (bsu) {
        setNamaBsu(bsu.nama);
      }
    }
  }, [dataBsu, idBsu]);

  useEffect(() => {
    if (dataKeuangan) {
      const totalPengeluaranCalc = Array.isArray(dataKeuangan?.data)
        ? dataKeuangan.data.reduce((acc, item) => acc + (item.saldo || 0), 0)
        : 0;
      setTotalPengeluaran(totalPengeluaranCalc);
    }

    if (dataPemasukan || dataPenjualan) {
      const totalPemasukanCalc =
        (Array.isArray(dataPemasukan?.data)
          ? dataPemasukan.data.reduce((acc, item) => acc + (item.saldo || 0), 0)
          : 0) +
        (Array.isArray(dataPenjualan?.data)
          ? dataPenjualan.data.reduce((acc, item) => acc + (item.saldo || 0), 0)
          : 0);
      setTotalPemasukan(totalPemasukanCalc);
    }
  }, [dataKeuangan, dataPemasukan, dataPenjualan]);

  // untuk menggabungkan data pengeluaran, pemasukan dan penjualan
  useEffect(() => {
    if (dataKeuangan && dataPemasukan && dataPenjualan) {
      console.log("Response API:", dataKeuangan, dataPemasukan, dataPenjualan);

      const pengeluaranData = Array.isArray(dataKeuangan?.data)
        ? dataKeuangan.data.map((item) => ({
            ...item,
            tipe: "Pengeluaran",
          }))
        : [];

      const pemasukanData = Array.isArray(dataPemasukan?.data)
        ? dataPemasukan.data.map((item) => ({
            ...item,
            tipe: "Pemasukan Lainnya",
          }))
        : [];

      const penjualanData = Array.isArray(dataPenjualan?.data)
        ? dataPenjualan.data.map((item) => ({
            ...item,
            tipe: "Penjualan Sampah",
          }))
        : [];

      const combinedData = [
        ...pengeluaranData,
        ...pemasukanData,
        ...penjualanData,
      ];

      console.log("Combined Data:", combinedData);

      if (search) {
        const filteredData = combinedData.filter((item) => {
          const lowerCaseSearch = search.toLowerCase();
          return (
            item.tanggal.toLowerCase().includes(lowerCaseSearch) ||
            item.tujuan.toLowerCase().includes(lowerCaseSearch) ||
            item.saldo.toString().includes(search)
          );
        });
        setFiltered(filteredData);
      } else {
        setFiltered(combinedData);
      }
    }
  }, [search, dataKeuangan, dataPemasukan, dataPenjualan]);

  if (errorKeuangan || errorPemasukan || errorPenjualan || errorBsu) {
    toast({
      variant: "destructive",
      title: "Gagal!",
      description:
        errorKeuangan?.message ||
        errorPemasukan?.message ||
        errorPenjualan?.message ||
        errorBsu?.message,
    });
  }

  return (
    <Layout>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Laporan Keuangan</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Laporan Keuangan Bank Sampah</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            <CustomCard
              title="Sisa Saldo"
              value={(totalPemasukan - totalPengeluaran).toLocaleString(
                "id-ID"
              )}
            />
            <CustomCard
              title="Pemasukan"
              value={`Rp ${totalPemasukan.toLocaleString("id-ID")}`}
            />
            <CustomCard
              title="Pengeluaran"
              value={`Rp ${totalPengeluaran.toLocaleString("id-ID")}`}
            />
          </div>
        </CardContent>

        <CardContent>
          <div className="flex my-3 justify-between">
            <Link href={"/keuangan/add-pengeluaran"} className="ml-auto">
              <Button
                variant="outline"
                className="flex items-center"
                style={{ backgroundColor: "green", color: "white" }}
              >
                <PlusSquare className="w-4 h-4 mr-2" /> Tambah Pengeluaran
              </Button>
            </Link>
            <div className="flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center"
                    style={{ backgroundColor: "green", color: "white" }}
                  >
                    <PlusSquare className="w-4 h-4 mr-2" /> Tambah Pemasukan
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuSeparator />
                  <Link href={"/keuangan/add-penjualan-sampah"}>
                    <DropdownMenuItem>
                      <PlusSquare className="mr-2" />
                      <span>Penjualan Sampah</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href={"/keuangan/add-pemasukan-lainnya"}>
                    <DropdownMenuItem>
                      <Upload className="mr-2" />
                      <span>Pemasukan Lainnya</span>
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
              <SearchInput
                className={"ml-5"}
                placeholder="Cari..."
                value={search}
                onChange={handleSearch}
              />
            </div>
          </div>
          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "10px",
            }}
          >
            {isLoadingKeuangan || isLoadingPemasukan || isLoadingPenjualan ? (
              <p>Loading...</p>
            ) : (
              <KeuanganDataTable data={filtered} />
            )}
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </Layout>
  );
}

export default Keuangan;
