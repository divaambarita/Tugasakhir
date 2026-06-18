import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useFetch from "@/hooks/useFetch";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import BackButton from "@/components/custom_ui/back-button";
import BsuForm from "@/components/admin-bsu/bsu-data-form";
export async function getServerSideProps(context) {
  /// mengambil id dari query /survey/add-survey/[id]
  const idBsu = context.query.id;

  return {
    props: {
      idBsu,
    },
  };
}

function UpdateBsu({ idBsu }) {
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

  return (
    <Layout>
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Edit Bank Sampah Unit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <BackButton />
          {isLoadingBsu ? <p>Loading...</p> : <BsuForm data={dataBsu.data} />}
        </CardContent>
      </Card>
      <Toaster />
    </Layout>
  );
}

export default UpdateBsu;
