import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import BackButton from "@/components/custom_ui/back-button";
import KeuanganPemasukanForm from "@/components/keuangan/keuangan-pemasukan-form";
import { useState } from "react";
import { BreadcrumbPemasukan } from "@/components/keuangan/breadcrumb-pemasukan";

function AddKeuanganLainnya() {
  const [selectedForm, setSelectedForm] = useState("pemasukan");
  return (
    <Layout>
      <Card className="border-none shadow-none">
        <BreadcrumbPemasukan/>
        <CardHeader>
          <CardTitle>Tambah Riwayat Pemasukan Lainnya</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <BackButton />
          <KeuanganPemasukanForm />
        </CardContent>
      </Card>
      <Toaster />
    </Layout>
  );
}

export default AddKeuanganLainnya;
