import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
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
  const idBsu = context?.query?.id;
  return {
    props: {
      idBsu,
    },
  };
}

function AddPengurus({ idBsu = null }) {
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
            <BreadcrumbPage>Tambah Pengurus</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Tambah Pengurus</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <BackButton />
          <PengurusForm data={null} idBsu={idBsu == "" ? null : idBsu} />
        </CardContent>
      </Card>
      <Toaster />
    </Layout>
  );
}

export default AddPengurus;
