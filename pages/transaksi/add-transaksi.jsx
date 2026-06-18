import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Trash, Users, Users2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import BackButton from "@/components/custom_ui/back-button";
import TransaksiForm from "@/components/transaksi/transaksi-form";
import TodayTransactionTable from "@/components/transaksi/today-transaction-table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function AddTransaksi() {
  return (
    <Layout>
       <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/monitoring/bsu">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/nasabah">Daftar Transaksi</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Tambah Sesi Transaksi</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Tambah Sesi Transaksi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <BackButton />
          <TransaksiForm data={null} />
          <TodayTransactionTable />
        </CardContent>
      </Card>
      <Toaster />
    </Layout>
  );
}

export default AddTransaksi;
