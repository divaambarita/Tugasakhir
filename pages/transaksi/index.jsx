import { Layout } from "@/components/layout/layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SquarePlus } from "lucide-react";
import useFetchStable from "@/hooks/useFetchStable";
import { useCookies } from "react-cookie";
import { getIdUserCookies, isRoleBSU } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import CustomButton from "@/components/custom_ui/custom-button";
import Link from "next/link";
import { useEffect, useState } from "react";
import SearchInput from "@/components/custom_ui/search-input";
import SesiTransaksiDataTable from "@/components/transaksi/sesi-transaksi-data-table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function Transaksi() {
  const [cookies] = useCookies(["currentUser"]);
  const userId = getIdUserCookies(cookies);
  const isRoleBsu = isRoleBSU(cookies);

  const {
    data: transaksiData,
    error: transaksiError,
    isLoading,
  } = useFetchStable("/api/transaksi/" + userId + "?type=all", {
    method: "GET",
  });

  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    console.log("Transaksi Data:", transaksiData);
    console.log("Transaksi Error:", transaksiError);
    console.log("Transaksi Loading:", isLoading);

    if (transaksiData?.data) {
      setFiltered(transaksiData.data);
    }
  }, [transaksiData, transaksiError, isLoading]);

  // Fungsi untuk memperbarui data transaksi
  const updateTransaksiList = (newList) => {
    setFiltered(newList);
  };

  if (transaksiError) {
    toast({
      variant: "destructive",
      title: "Gagal!",
      description: transaksiError.message,
    });
  }

  return (
    <Layout>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/monitoring/bsu">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Daftar Transaksi</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="h-full">
        <CardHeader>
          <CardTitle>
            {isLoading ? <p>loading...</p> : "Daftar Transaksi"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <>
            <div className="flex my-3">
              <Link href={`/transaksi/add-transaksi`} className="ml-auto">
                <CustomButton type="button">
                  <SquarePlus className="w-4 h-4 mr-2" /> Tambah
                </CustomButton>
              </Link>
              <SearchInput className={"ml-5"} onChange={handleSearch} />
            </div>
            {isLoading ? (
              <p>loading...</p>
            ) : (
              <>
                <ScrollArea className="border rounded-md h-[calc(100vh-200px)]">
                  <SesiTransaksiDataTable
                    data={filtered}
                    setTransaksiList={updateTransaksiList}
                  />
                </ScrollArea>
              </>
            )}
          </>
        </CardContent>
      </Card>
      <Toaster />
    </Layout>
  );
}

export default Transaksi;
