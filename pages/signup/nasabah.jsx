import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users, Recycle } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import * as React from "react";
import AddNasabahForm from "@/components/nasabah/nasabah-add-form";

const navbarContent = [
  {
    title: "Nasabah",
    icon: User,
    href: "signup/nasabah",
  },
  {
    title: "Mitra",
    icon: Users,
    href: "signup/mitra",
  },
  {
    title: "Bank Sampah Unit (BSU)",
    icon: Recycle,
    href: "signup/bsu",
  },
];

export default function Nasabah({ idBsu = null }) {
  return (
    <Layout navbarContent={navbarContent}>
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Pendaftaran Nasabah</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <AddNasabahForm data={null} fromBsu={0} />
        </CardContent>
      </Card>
      <Toaster />
    </Layout>
  );
}
