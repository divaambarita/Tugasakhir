import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Trash, Users, Users2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import BackButton from "@/components/custom_ui/back-button";
import JenisSampahForm from "@/components/jenis-sampah/jenis-sampah-form";

const navbarContent = [
  {
    title: "Dashboard",
    icon: Home,
    href: "dashboard",
  },

  {
    title: "Daftar Nasabah",
    key: "bsu",
    icon: Users,
    href: "nasabah",
  },
  {
    title: "Daftar Pengurus",
    icon: Users2,
    key: "bsu",
    href: "pengurus",
  },
  {
    title: "Daftar Jenis Sampah",
    icon: Trash,
    key: "bsu",
    href: "jenis-sampah",
  },
];

function AddPengurus() {
  return (
    <Layout>
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Tambah Jenis Sampah</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <BackButton />
          <JenisSampahForm data={null} fromBsu={0} />
        </CardContent>
      </Card>
      <Toaster />
    </Layout>
  );
}

export default AddPengurus;
