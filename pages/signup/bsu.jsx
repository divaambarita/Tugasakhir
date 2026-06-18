import { Layout } from "@/components/layout/layout";
import { Recycle, User, Users, MonitorDown } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import SignupBsuForm from "@/components/bsu/signup-bsu-form";
import useFetch from "@/hooks/useFetch";

export async function getServerSideProps(context) {
  const idBsu = context.query.id || null;

  return {
    props: {
      idBsu,
    },
  };
}

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
    href: "signup/bsu",
    icon: Recycle,
  },
];
function Bsu({ idBsu = null }) {
  return (
    <Layout navbarContent={navbarContent}>
      {idBsu ? <BsuRejectedForm idBsu={idBsu} /> : <SignupBsuForm />}
      <Toaster />
    </Layout>
  );
}

function BsuRejectedForm({ idBsu }) {
  const {
    data: dataBsu,
    error: errorBsu,
    isLoading: isLoadingBsu,
  } = useFetch(`/api/bsu/${idBsu}`);

  if (errorBsu) {
    toast({
      variant: "destructive",
      title: "Gagal!",
      description: error.message,
    });
  }

  return isLoadingBsu && !dataBsu ? (
    <p>Loading...</p>
  ) : (
    <SignupBsuForm data={dataBsu?.data} />
  );
}

export default Bsu;
