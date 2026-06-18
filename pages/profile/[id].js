import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useFetch from "@/hooks/useFetch";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import BackButton from "@/components/custom_ui/back-button";
import ProfileForm from "@/components/profile/profile-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export async function getServerSideProps(context) {
  /// mengambil id dari query /survey/add-survey/[id]
  const idBsu = context.query.id;

  return {
    props: {
      idBsu,
    },
  };
}

function Profile({ idBsu }) {
  const {
    data: dataPengurus,
    error: errorPengurus,
    isLoading: isLoadingPengurus,
  } = useFetch(`/api/bsu/${idBsu}`);

  if (errorPengurus) {
    toast({
      variant: "destructive",
      title: "Gagal!",
      description: error.message,
    });
  }

  return (
    <Layout>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/monitoring/bsu">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Profil Bank Sampah</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Profil Bank Sampah </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <BackButton />
          {isLoadingPengurus ? (
            <p>Loading...</p>
          ) : (
            <ProfileForm data={dataPengurus.data} />
          )}
        </CardContent>
      </Card>
      <Toaster />
    </Layout>
  );
}

export default Profile;
