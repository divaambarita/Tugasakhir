import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import BackButton from "@/components/custom_ui/back-button";
import KeuanganPengeluaranForm from "@/components/keuangan/keuangan-pengeluaran-form";
import { useState } from "react";
import {
  BreadcrumbPengeluaran,
} from "@/components/keuangan/breadcrumb-pengeluaran";

function AddKeuanganPengeluaran() {
  const [selectedForm, setSelectedForm] = useState("pengeluaran");
  return (
    <Layout>
      <Card className="border-none shadow-none">
        <BreadcrumbPengeluaran />
        <CardHeader>
          <CardTitle>Tambah Riwayat Pengeluaran</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <BackButton />
          <KeuanganPengeluaranForm />
        </CardContent>
      </Card>
      <Toaster />
    </Layout>
  );
}

export default AddKeuanganPengeluaran;
