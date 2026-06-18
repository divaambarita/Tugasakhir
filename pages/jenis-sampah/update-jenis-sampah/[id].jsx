import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useFetch from "@/hooks/useFetch";
import { useCookies } from "react-cookie";
import { getIdUserCookies } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import BackButton from "@/components/custom_ui/back-button";
import JenisSampahForm from "@/components/jenis-sampah/jenis-sampah-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export async function getServerSideProps(context) {
  /// mengambil id dari query /survey/add-survey/[id]
  const idJenisSampah = context.query.id;

  return {
    props: {
      idJenisSampah,
    },
  };
}

function UpdateJenisSampah({ idJenisSampah }) {
  const [cookies, setCookie, removeCookie] = useCookies(["currentUser"]);
  const userId = getIdUserCookies(cookies);
  const {
    data: dataJenisSampah,
    error: errorJenisSampah,
    isLoading: isLoadingJenisSampah,
  } = useFetch("/api/jenisSampah/detail", {
    method: "POST",
    body: JSON.stringify({
      idJenisSampah: parseFloat(idJenisSampah),
      bsuId: userId,
    }),
  });

  if (errorJenisSampah) {
    toast({
      variant: "destructive",
      title: "Gagal!",
      description: error.message,
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
            <BreadcrumbLink href="/nasabah">Daftar Jenis Sampah</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit Harga Sampah BSU</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Edit Harga Sampah BSU</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <BackButton />
          {isLoadingJenisSampah ? (
            <p>Loading...</p>
          ) : (
            <JenisSampahForm data={dataJenisSampah.data} />
          )}
        </CardContent>
      </Card>
      <Toaster />
    </Layout>
  );
}

export default UpdateJenisSampah;
