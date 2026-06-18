import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Trash, Users, Users2 } from "lucide-react";
import useFetch from "@/hooks/useFetch";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import BackButton from "@/components/custom_ui/back-button";
import BsuForm from "@/components/admin-bsu/bsu-data-form";
export async function getServerSideProps(context) {
  /// mengambil id dari query /survey/add-survey/[id]
  const idBsu = context.query.id;

  return {
    props: {
      idBsu,
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

function DetailBsu({ idBsu }) {
  const {
    data: dataBsu,
    error: errorBsu,
    isLoading: isLoadingBsu,
  } = useFetch(`/api/bsu/${idBsu}`);

  if (errorBsu) {
    toast({
      variant: "destructive",
      title: "Gagal!",
      description: error.message,
    });
  }

  return (
    <Layout>
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Detail Bank Sampah Unit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <BackButton />
          {isLoadingBsu ? (
            <p>Loading...</p>
          ) : (
            <BsuForm data={dataBsu.data} disabled={true} />
          )}
        </CardContent>
      </Card>
      <Toaster />
    </Layout>
  );
}

export default DetailBsu;
