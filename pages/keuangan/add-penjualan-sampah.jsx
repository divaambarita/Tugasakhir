import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import BackButton from "@/components/custom_ui/back-button";
import { useState } from "react";
import { BreadcrumbPemasukan } from "@/components/keuangan/breadcrumb-pemasukan";
import KeuanganPenjualanSampahForm from "@/components/keuangan/keuangan-penjualan-sampah";

function AddKeuangan() {
  const [selectedForm, setSelectedForm] = useState("pemasukan");
  return (
    <Layout>
      <Card className="border-none shadow-none">
        <BreadcrumbPemasukan />
        <CardHeader>
          <CardTitle>Tambah Riwayat Pemasukan Penjualan Sampah</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <BackButton />
          <KeuanganPenjualanSampahForm />
        </CardContent>
      </Card>
      <Toaster />
    </Layout>
  );
}

export default AddKeuangan;
