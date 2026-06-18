import { Layout } from "@/components/layout/layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SquarePlus } from "lucide-react";
import useFetch from "@/hooks/useFetch";
import { useCookies } from "react-cookie";
import { getIdUserCookies, isRoleAdmin } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import CustomButton from "@/components/custom_ui/custom-button";
import Link from "next/link";
import PengurusDataTable from "@/components/pengurus/pengurus-data-table";
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


function Pengurus() {
  const [cookies, setCookie, removeCookie] = useCookies(["currentUser"]);
  let userId = getIdUserCookies(cookies);
  if (isRoleAdmin(cookies)) {
    userId = "";
  }

  const {
    data: dataPengurus,
    error: errorPengurus,
    isLoading: isLoadingPengurus,
  } = useFetch("/api/bsu/pengurus/getPengurus", {
    method: "POST",
    body: JSON.stringify({
      idBsu: getIdUserCookies(cookies),
    }),
  });

  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    if (search) {
      const filteredData = dataPengurus?.data?.filter((item) => {
        const lowerCaseSearch = search.toLowerCase();
        return (
          item.namaPengurus.toLowerCase().includes(lowerCaseSearch) ||
          item.noTelp.toString().includes(search) ||
          item.jabatan.toLowerCase().includes(lowerCaseSearch) ||
          item.bsu.nama.toLowerCase().includes(lowerCaseSearch)
        );
      });
      setFiltered(filteredData);
    } else {
      setFiltered(dataPengurus?.data ?? []);
    }
  }, [search, dataPengurus?.data]);

  if (errorPengurus) {
    toast({
      variant: "destructive",
      title: "Gagal!",
      description: errorPengurus.message,
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
            <BreadcrumbPage>Daftar Pengurus</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Daftar Pengurus</CardTitle>
        </CardHeader>

        <CardContent>
          <>
            <div className="flex my-3">
              <Link
                href={`/pengurus/add-pengurus?id=` + userId}
                className="ml-auto"
              >
                <CustomButton type="button">
                  <SquarePlus className="w-4 h-4 mr-2" /> Tambah
                </CustomButton>
              </Link>
              <SearchInput className={"ml-5"} onChange={handleSearch} />
            </div>
            {isLoadingPengurus ? (
              <p>loading...</p>
            ) : (
              <>
                <ScrollArea className="border rounded-md h-[calc(100vh-200px)]">
                  <PengurusDataTable data={filtered} />
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

export default Pengurus;
