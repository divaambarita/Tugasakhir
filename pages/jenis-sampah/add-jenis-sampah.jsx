import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Trash, Users, Users2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
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

function AddPengurus() {
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
                  <BreadcrumbPage>Tambah Jenis Sampah</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
      
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Tambah Jenis Sampah</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <BackButton />
          <JenisSampahForm data={null} />
        </CardContent>
      </Card>
      <Toaster />
    </Layout>
  );
}

export default AddPengurus;
