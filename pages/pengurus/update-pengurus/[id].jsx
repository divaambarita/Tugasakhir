import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useFetch from "@/hooks/useFetch";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import BackButton from "@/components/custom_ui/back-button";
import PengurusForm from "@/components/pengurus/pengurus-form";
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
  const idPengurus = context.query.id;

  return {
    props: {
      idPengurus,
    },
  };
}

function UpdatePengurus({ idPengurus }) {
  const {
    data: dataPengurus,
    error: errorPengurus,
    isLoading: isLoadingPengurus,
  } = useFetch(`/api/bsu/pengurus/${idPengurus}`);

  if (errorPengurus) {
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
            <BreadcrumbLink href="/nasabah">Daftar Pengurus</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit Pengurus</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Edit Pengurus</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <BackButton />
          {isLoadingPengurus ? (
            <p>Loading...</p>
          ) : (
            <PengurusForm
              data={dataPengurus.data}
              idBsu={dataPengurus.data.bsu.idBsu}
            />
          )}
        </CardContent>
      </Card>
      <Toaster />
    </Layout>
  );
}

export default UpdatePengurus;
