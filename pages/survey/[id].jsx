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
import BackButton from "@/components/custom_ui/back-button";
import SurveyForm from "@/components/survey/survey-form";
import usePostForm from "@/hooks/usePostForm";
import useUploadFile from "@/hooks/useUploadFile";
import { useState } from "react";

export async function getServerSideProps(context) {
  /// mengambil id dari query /survey/add-survey/[id]
  const idBsu = context.query.id;

  return {
    props: {
      idBsu,
    },
  };
}

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


function DetailSurvey({idBsu}) {
  const { postForm } = usePostForm();
  const { uploadFile } = useUploadFile();
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [openDialogNo, setOpenDialogNo] = useState(false);
  const [openDialogYes, setOpenDialogYes] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(["currentUser"]);
  const userId = getIdUserCookies(cookies);

  const [keteranganTolak, setketeranganTolak] = useState(null);
  const [fileSK, setFileSK] = useState(null);
  const {
    data: dataSurvey,
    error: errorSurvey,
    isLoading: isLoadingSurvey,
    } = useFetch(`/api/volunteer/${idBsu}`);
    
  if (errorSurvey) {
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
        <CardTitle>Laporan Hasil Kunjungan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <BackButton />
        {isLoadingSurvey ? (<p>Loading...</p>):(<SurveyForm data={dataSurvey.data} disabled={true} />)}
      </CardContent>
    </Card>
    <Toaster />
  </Layout>
  )
}

export default DetailSurvey;
