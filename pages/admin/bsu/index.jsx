import { Layout } from "@/components/layout/layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SquarePlus } from "lucide-react";
import useFetch from "@/hooks/useFetch";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import CustomButton from "@/components/custom_ui/custom-button";
import Link from "next/link";
import BsuDataTable from "@/components/admin-bsu/bsu-data-table";
import { useEffect, useState } from "react";
import SearchInput from "@/components/custom_ui/search-input";

function Bsu() {
  const {
    data: dataBsu,
    error: errorBsu,
    isLoading: isLoading,
  } = useFetch("/api/bsu/getDataBsu", {
    method: "GET",
  });

  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    if (search) {
      const filteredData = dataBsu?.data?.filter((item) => {
        const lowerCaseSearch = search.toLowerCase();
        return (
          item.nama.toLowerCase().includes(lowerCaseSearch) ||
          item.noTelp.toString().includes(search) ||
          item.alamat.toLowerCase().includes(lowerCaseSearch) ||
          item.kelurahan.toLowerCase().includes(lowerCaseSearch) ||
          item.status.toLowerCase().includes(lowerCaseSearch) 
        );
      });
      setFiltered(filteredData);
    } else {
      setFiltered(dataBsu?.data ?? []);
    }
  }, [search, dataBsu?.data]);
  
  if (errorBsu) {
    toast({
      variant: "destructive",
      title: "Gagal!",
      description: errorBsu.message,
    });
  }
  return (
    <Layout>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Daftar BSU</CardTitle>
        </CardHeader>

        <CardContent>
          <>
            <div className="flex my-3">
              <Link
                // href="#"
                href={`/admin/bsu/add-bsu`}
                className="ml-auto"
              >
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
                  <BsuDataTable data={filtered} />
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

export default Bsu;
