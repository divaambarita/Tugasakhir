import { Layout } from "@/components/layout/layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SquarePlus } from "lucide-react";
import useFetch from "@/hooks/useFetch";
import { useCookies } from "react-cookie";
import { getIdUserCookies, isRoleBSU } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import CustomButton from "@/components/custom_ui/custom-button";
import Link from "next/link";
import JenisSampahDataTable from "@/components/jenis-sampah/jenis-sampah-data-table";
import { useEffect, useState } from "react";
import SearchInput from "@/components/custom_ui/search-input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function JenisSampah() {
  const [cookies, setCookie, removeCookie] = useCookies(["currentUser"]);
  const userId = getIdUserCookies(cookies);
  const isRoleBsu = isRoleBSU(cookies);

  const {
    data: dataJenisSampah,
    error: errorJenisSampah,
    isLoading: isLoading,
  } = useFetch("/api/jenisSampah/getData/" + userId, {
    method: "GET",
  });

  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };
  useEffect(() => {
    if (search) {
      let filteredData = [];
      if (isRoleBsu) {
        filteredData = dataJenisSampah?.data?.bsu.filter((item) => {
          const lowerCaseSearch = search.toLowerCase();
          return (
            item.nama.toLowerCase().includes(lowerCaseSearch) ||
            item.kategori.toLowerCase().includes(lowerCaseSearch) ||
            item.hargasampahbsi.toString().includes(search) ||
            item.hargasampahbsu.toString().includes(search) ||
            item.lastUpdate.toString().includes(search)
          );
        });
      } else {
        filteredData = dataJenisSampah?.data?.bsi.filter((item) => {
          const lowerCaseSearch = search.toLowerCase();
          return (
            item.nama.toLowerCase().includes(lowerCaseSearch) ||
            item.kategori.toLowerCase().includes(lowerCaseSearch) ||
            item.hargasampahbsi.toString().includes(search) ||
            item.lastUpdate.toString().includes(search)
          );
        });
      }

      setFiltered(filteredData);
    } else {
      setFiltered(
        isRoleBsu
          ? dataJenisSampah?.data?.bsu ?? []
          : dataJenisSampah?.data?.bsi ?? []
      );
    }
  }, [search, dataJenisSampah?.data, isRoleBsu]);

  if (errorJenisSampah) {
    toast({
      variant: "destructive",
      title: "Gagal!",
      description: errorJenisSampah.message,
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
            <BreadcrumbPage>Daftar Jenis Sampah</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>
            {isLoading ? (
              <p>loading...</p>
            ) : isRoleBsu ? (
              "List Sampah BSU"
            ) : (
              "Daftar Jenis Sampah"
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex my-3">
            <Link href={`/jenis-sampah/add-jenis-sampah`} className="ml-auto">
              <CustomButton type="button">
                <SquarePlus className="w-4 h-4 mr-2" /> Tambah
              </CustomButton>
            </Link>
            <SearchInput className={"ml-5"} onChange={handleSearch} />
          </div>
          <p style={{ color: "red" }}>
            *Masukkan harga sampah BSU lebih tinggi dari harga sampah BSI
          </p>
          {isLoading ? (
            <p>loading...</p>
          ) : (
            <>
              <ScrollArea className="border rounded-md h-[calc(100vh-200px)]">
                <JenisSampahDataTable
                  data={filtered}
                  isBsu={isRoleBsu ? 1 : 0}
                />
              </ScrollArea>
            </>
          )}
        </CardContent>
      </Card>
      <Toaster />
    </Layout>
  );
}

export default JenisSampah;
