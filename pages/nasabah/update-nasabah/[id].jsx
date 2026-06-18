import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useFetch from "@/hooks/useFetch";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import BackButton from "@/components/custom_ui/back-button";
import EditNasabahForm from "@/components/nasabah/nasabah-edit-form";
import AddNasabahForm from "@/components/nasabah/nasabah-add-form";
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
  const userId = context.query.userId;

  return {
    props: {
      userId,
      idNasabah,
    },
  };
}

function UpdateNasabah({ idNasabah, userId }) {
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
            <BreadcrumbPage>Edit Nasabah</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Edit Nasabah</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <BackButton />
          {isLoadingNasabah ? (
            <p>Loading...</p>
          ) : (
            <AddNasabahForm
              data={dataNasabah.data}
              idBsu={dataNasabah?.data.bsu.idBsu}
            />
          )}
        </CardContent>
      </Card>
      <Toaster />
    </Layout>
  );
}

export default UpdateNasabah;
