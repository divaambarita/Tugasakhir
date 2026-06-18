import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useFetch from "@/hooks/useFetch";
import { useCookies } from "react-cookie";
import { getIdUserCookies } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import BackButton from "@/components/custom_ui/back-button";
import JenisSampahForm from "@/components/jenis-sampah/jenis-sampah-form";
export async function getServerSideProps(context) {
  /// mengambil id dari query /survey/add-survey/[id]
  const idJenisSampah = context.query.id;

  return {
    props: {
      idJenisSampah,
    },
  };
}

function DetailJenisSampah({ idJenisSampah }) {
  const [cookies, setCookie, removeCookie] = useCookies(["currentUser"]);
  const userId = getIdUserCookies(cookies);
  const {
    data: dataJenisSampah,
    error: errorJenisSampah,
    isLoading: isLoadingJenisSampah,
  } = useFetch("/api/jenisSampah/detail", {
    method: "POST",
    body: JSON.stringify({
      idJenisSampah: parseFloat(idJenisSampah),
      bsuId: userId,
    }),
  });

  if (errorJenisSampah) {
    toast({
      variant: "destructive",
      title: "Gagal!",
      description: error.message,
    });
  }

  return (
    <Layout>
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Detail Jenis Sampah</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <BackButton />
          {isLoadingJenisSampah ? (
            <p>Loading...</p>
          ) : (
            <JenisSampahForm data={dataJenisSampah.data} disabled={true} fromBsu={0}/>
          )}
        </CardContent>
      </Card>
      <Toaster />
    </Layout>
  );
}

export default DetailJenisSampah;
