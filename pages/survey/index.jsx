import { Layout } from "@/components/layout/layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ApproverDataTable from "@/components/approver/approver-data-table";
import { BadgeCheck, CalendarRange, Home, Users } from "lucide-react";
import useFetch from "@/hooks/useFetch";
import { useCookies } from "react-cookie";
import { getIdUserCookies } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import SurveyDataTable from "@/components/survey/survey-data-table";

const navbarContent = [
  {
    title: "Dashboard",
    icon: Home,
    href: "dashboard",
  },
  {
    title: "Tugas Survey",
    key: "verifikasi",
    icon: BadgeCheck,
    href: "survey",
  },
];

function Survey() {
  const [cookies, setCookie, removeCookie] = useCookies(["currentUser"]);
  const userId = getIdUserCookies(cookies);

  const {
    data: dataSurvey,
    error: errorSurvey,
    isLoading: isLoadingSurvey,
  } = useFetch("/api/volunteer/getDataVerifikasi", {
    method: "POST",
    body: JSON.stringify({
      status:"WaitApv" 
    }),
  });

  if (errorSurvey) {
    toast({
      variant: "destructive",
      title: "Gagal!",
      description: errorSurvey.message,
    });
  }

  return (
    <Layout>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Tugas Survey Lokasi Bank Sampah Unit (BSU)</CardTitle>
        </CardHeader>

        <CardContent>
          {isLoadingSurvey ? (
            <div>Loading...</div>
          ) : (
            <ScrollArea className="border rounded-md h-[calc(100vh-200px)]">
              <SurveyDataTable data={dataSurvey?.data} />
            </ScrollArea>
          )}
        </CardContent>
      </Card>
      <Toaster />
    </Layout>
  );
}

export default Survey;
