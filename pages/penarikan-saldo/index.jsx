import { Layout } from "@/components/layout/layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { useCookies } from "react-cookie";
import { getIdUserCookies, isRoleAdmin } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import PenarikanSaldoDataTable from "@/components/penarikan-saldo/penarikan-saldo-data-table";
import CustomButton from "@/components/custom_ui/custom-button";
import Link from "next/link";
import SearchInput from "@/components/custom_ui/search-input";
import { useEffect, useState } from "react";
import useFetchStable from "@/hooks/useFetchStable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function PenarikanSaldoPage() {
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [cookies] = useCookies(["currentUser"]);
  const [filter, setFilter] = useState("");
  let userId = getIdUserCookies(cookies);
  if (isRoleAdmin(cookies)) {
    userId = "";
  }

  // Gunakan hook yang stabil untuk fetch data
  const {
    data: penarikanData,
    error: penarikanError,
    isLoading,
  } = useFetchStable(
    `/api/penarikan/storePenarikan${userId ? `?bsuId=${userId}` : ""}`,
    {
      method: "GET",
    }
  );

  // Debug dan setup data
  useEffect(() => {
    if (penarikanError) {
      console.error("Penarikan Error:", penarikanError);
    }

    if (penarikanData?.data) {
      setFiltered(penarikanData.data);
    } else if (penarikanData && Array.isArray(penarikanData)) {
      // Jika response langsung berupa array
      setFiltered(penarikanData);
    }
  }, [penarikanData, penarikanError, isLoading]);

  useEffect(() => {
    const data = penarikanData?.data || penarikanData || [];

    if (search) {
      const filteredData = data.filter((item) => {
        const lowerCaseSearch = search.toLowerCase();
        return (
          item.nasabah?.nama?.toLowerCase().includes(lowerCaseSearch) ||
          item.totalPenarikan?.toString().includes(search) ||
          item.metodePembayaran?.toLowerCase().includes(lowerCaseSearch) ||
          item.statusKonfirmasi?.toLowerCase().includes(lowerCaseSearch)
        );
      });
      setFiltered(filteredData);
    } else {
      setFiltered(data);
    }
  }, [search, penarikanData]);

  useEffect(() => {
    const today = new Date();
    const data = penarikanData?.data || penarikanData || [];
    let filteredData = data;

    if (filter === "today") {
      const todayString = today.toDateString();
      filteredData = data.filter((item) => {
        const itemDate = new Date(item.tanggalPenarikan).toDateString();
        return itemDate === todayString;
      });
    } else if (filter === "thisMonth") {
      const month = today.getMonth();
      const year = today.getFullYear();
      filteredData = data.filter((item) => {
        const itemDate = new Date(item.tanggalPenarikan);
        return itemDate.getMonth() === month && itemDate.getFullYear() === year;
      });
    } else if (filter === "thisYear") {
      const year = today.getFullYear();
      filteredData = data.filter((item) => {
        const itemDate = new Date(item.tanggalPenarikan);
        return itemDate.getFullYear() === year;
      });
    }

    setFiltered(filteredData);
  }, [filter, penarikanData]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleFilterChange = (value) => {
    setFilter(value);
  };

  // Handle error
  if (penarikanError) {
    toast({
      variant: "destructive",
      title: "Gagal!",
      description: penarikanError.message || "Error fetching data",
    });
  }

  const handleLihatDetail = (penarikanData) => {
    // Implementasi untuk menampilkan detail
    toast({
      title: "Detail Penarikan",
      description: `Penarikan ${
        penarikanData.nasabah?.nama
      } sebesar ${new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(penarikanData.totalPenarikan)}`,
    });
  };

  return (
    <Layout>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/monitoring/bsu">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Penarikan Saldo Nasabah</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Riwayat Penarikan Saldo Nasabah</CardTitle>
        </CardHeader>

        <CardContent>
          <>
            <div className="flex my-3 justify-end space-x-2">
              <Link href={`/saldo/add-penarikan-saldo`} className="ml-auto">
                <CustomButton type="button">
                  <Upload className="w-4 h-4 mr-2" /> Tarik Saldo Nasabah
                </CustomButton>
              </Link>
              <SearchInput className="ml-5" onChange={handleSearch} />
              {/* <Select onValueChange={handleFilterChange} defaultValue="">
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="today">Hari Ini</SelectItem>
                  <SelectItem value="thisMonth">Bulan Ini</SelectItem>
                  <SelectItem value="thisYear">Tahun Ini</SelectItem>
                </SelectContent>
              </Select> */}
            </div>
            {isLoading ? (
              <p>loading...</p>
            ) : (
              <>
                {filtered.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      Belum ada data penarikan saldo
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="border rounded-md h-[calc(100vh-200px)]">
                    <PenarikanSaldoDataTable
                      data={filtered}
                      onLihat={handleLihatDetail}
                    />
                  </ScrollArea>
                )}
              </>
            )}
          </>
        </CardContent>
      </Card>
      <Toaster />
    </Layout>
  );
}

export default PenarikanSaldoPage;
