import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import BackButton from "@/components/custom_ui/back-button";
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
  const idBsu = context?.query?.id;
  return {
    props: {
      idBsu,
    },
  };
}

function AddNasabah({ idBsu = null }) {
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
            <BreadcrumbPage>Tambah Nasabah</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Tambah Nasabah</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <BackButton />
          <AddNasabahForm data={null} idBsu={idBsu == "" ? null : idBsu} />
        </CardContent>
      </Card>
      <Toaster />
    </Layout>
  );
}

export default AddNasabah;
