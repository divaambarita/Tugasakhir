import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Trash, Users, Users2 } from "lucide-react";
import useFetch from "@/hooks/useFetch";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import BackButton from "@/components/custom_ui/back-button";
import NasabahForm from "@/components/nasabah/nasabah-add-form";
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
  const idNasabah = context.query.id;

  return {
    props: {
      idNasabah,
    },
  };
}

const navbarContent = [
  {
    title: "Dashboard",
    icon: Home,
    href: "dashboard",
  },
  {
    title: "Daftar Nasabah",
    key: "bsu",
    icon: Users,
    href: "nasabah",
  },
  {
    title: "Daftar Pengurus",
    icon: Users2,
    key: "bsu",
    href: "pengurus",
  },
  {
    title: "Daftar Jenis Sampah",
    icon: Trash,
    key: "bsu",
    href: "jenis-sampah",
  },
];

function DetailNasabah({ idNasabah }) {
  const {
    data: dataNasabah,
    error: errorNasabah,
    isLoading: isLoadingNasabah,
  } = useFetch(`/api/bsu/nasabah/${idNasabah}`);

  if (errorNasabah) {
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
            <BreadcrumbLink href="/nasabah">Daftar Nasabah</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Detail Nasabah</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Detail Nasabah</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <BackButton />
          {isLoadingNasabah ? (
            <p>Loading...</p>
          ) : (
            <NasabahForm
              data={dataNasabah.data}
              idBsu={dataNasabah.data.bsuId}
              disabled={true}
            />
          )}
        </CardContent>
      </Card>
      <Toaster />
    </Layout>
  );
}

export default DetailNasabah;
