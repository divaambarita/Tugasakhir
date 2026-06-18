import { Layout } from "@/components/layout/layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ApproverDataTable from "@/components/approver/approver-data-table";
import { Users } from "lucide-react";
import useFetch from "@/hooks/useFetch";
import { useCookies } from "react-cookie";
import { getIdUserCookies } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import CustomCard from "@/components/custom_ui/custom-card";

function Approver() {
  const [cookies, setCookie, removeCookie] = useCookies(["currentUser"]);
  const userId = getIdUserCookies(cookies);

  const {
    data: dataApprover,
    error: errorApprover,
    isLoading: isLoadingApprover,
  } = useFetch("/api/approver/getApprover", {
    method: "POST",
    body: JSON.stringify({
      id: userId,
    }),
  });

  const {
    data: datacountApproval,
    error: errorcountApproval,
    isLoading: isLoadingcountApproval,
  } = useFetch("api/approver/countApproval");

  if (errorApprover || errorcountApproval) {
    toast({
      variant: "destructive",
      title: "Gagal!",
      description: errorApprover.message || errorcountApproval.message,
    });
  }

  return (
    <Layout>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <CustomCard
          title="Menunggu Verifikasi"
          value={datacountApproval?.data.waitApv ?? ""}
        />
        <CustomCard
          title="Terverifikasi"
          value={datacountApproval?.data.approved ?? ""}
        />
        <CustomCard
          title="Ditolak"
          value={datacountApproval?.data.rejected ?? ""}
        />
      </div>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Verifikasi Pendaftaran</CardTitle>
        </CardHeader>

        <CardContent>
          {isLoadingApprover ? (
            <div>Loading...</div>
          ) : (
            <ScrollArea className="border rounded-md h-[calc(100vh-200px)]">
              <ApproverDataTable data={dataApprover?.data} />
            </ScrollArea>
          )}
        </CardContent>
      </Card>
      <Toaster />
    </Layout>
  );
}

export default Approver;
