import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import BackButton from "@/components/custom_ui/back-button";
import NasabahForm from "@/components/nasabah/nasabah-add-form";
import PenarikanForm from "@/components/saldo/saldo-form";
import KeuanganPemasukanForm from "@/components/keuangan/keuangan-pemasukan-form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectedForm,
} from "@radix-ui/react-select";
import KeuanganPengeluaranForm from "@/components/keuangan/keuangan-pengeluaran-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  BreadcrumbDemo,
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
