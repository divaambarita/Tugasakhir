import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Users } from "lucide-react";
import useFetch from "@/hooks/useFetch";
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import BackButton from "@/components/custom_ui/back-button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ApproverDetailBsu from "@/components/approver/approver-detail-bsu";
import CustomButton from "@/components/custom_ui/custom-button";
import usePostForm from "@/hooks/usePostForm";
import { useCookies } from "react-cookie";
import { getIdUserCookies } from "@/lib/utils";
import useUploadFile from "@/hooks/useUploadFile";
import { Input } from "@/components/ui/input";
const navbarContent = [
  {
    title: "Verifikasi Pendaftaran",
    icon: Users,
    href: "approver",
  },
];

export async function getServerSideProps(context) {
  /// mengambil id dari query /approver/[id]
  const idApprover = context.query.id;

  return {
    props: {
      idApprover,
    },
  };
}

function Page({ idApprover }) {
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
    data: dataApprover,
    error: errorApprover,
    isLoading: isLoadingApprover,
  } = useFetch(`/api/approver/${idApprover}`);

  if (errorApprover) {
    toast({
      variant: "destructive",
      title: "Gagal!",
      description: error.message,
    });
  }

  async function onSubmit(value) {
    setIsSubmitLoading(true);

    /// jika status == rejected dan keterangan kosong maka akan muncul toast
    if (value.status == "Rejected" && !value.keterangan) {
      toast({
        variant: "destructive",
        title: "Gagal!",
        description: "Mohon masukkan keterangan penolakan",
      });
      setIsSubmitLoading(false);
      return;
    }
    /// jika roleId == 3 (dlh) dan status == approved maka akan diupload dokumen
    if (dataApprover.data.roleId == 3 && value.status == "Approved") {
      /// jika fileSK kosong maka akan muncul toast
      if (!fileSK) {
        toast({
          variant: "destructive",
          title: "Gagal!",
          description: "Mohon upload SK Pendirian BSU",
        });
        setIsSubmitLoading(false);
        return;
      }
      const resUpload = await uploadFile(fileSK);

      /// ubah value dokumen menjadi resUpload (url file)
      value.dokumen = resUpload;
    }

    const res = await postForm("/api/approver/updateStatus", value);

    if (res.status != 200) {
      toast({
        variant: "destructive",
        title: "Gagal!",
        description: res.message,
      });
    } else {
      toast({
        description: res.message,
      });
      setOpenDialogNo(false);
      setOpenDialogYes(false);
    }
    setIsSubmitLoading(false);
  }

  return (
    <Layout>
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Verifikasi Pendaftaran</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <BackButton />
          {isLoadingApprover ? (
            <p>Loading...</p>
          ) : (
            <>
              <ApproverDetailBsu {...dataApprover.data} />
              <div className="flex pt-5 space-x-2">
                <AlertDialog
                  open={openDialogNo}
                  onOpenChange={setOpenDialogNo}
                  defaultOpen={openDialogNo}
                >
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="ml-auto">
                      Tolak
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Apakah Anda Ingin MENOLAK Pendaftaran?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Masukkan keterangan pendaftaran ditolak
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Textarea
                      placeholder="Masukkan alasan penolakan"
                      className="resize-none"
                      onChange={(e) => setketeranganTolak(e.target.value)}
                    />

                    <AlertDialogFooter>
                      <CustomButton
                        variant="outline"
                        disabled={isSubmitLoading}
                        onClick={() => setOpenDialogNo(false)}
                      >
                        Batal
                      </CustomButton>

                      <CustomButton
                        isLoading={isSubmitLoading}
                        onClick={() => {
                          const value = {
                            idApprover: dataApprover.data.idApprover,
                            createdBy: userId,
                            status: "Rejected",
                            keterangan: keteranganTolak,
                          };
                          onSubmit(value);
                        }}
                      >
                        OK
                      </CustomButton>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog
                  open={openDialogYes}
                  onOpenChange={setOpenDialogYes}
                >
                  <AlertDialogTrigger asChild>
                    <Button>Terima</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Apakah Anda Ingin MENERIMA Pendaftaran?
                      </AlertDialogTitle>
                      {
                       dataApprover.data.roleId == 3 ? (<AlertDialogDescription>
                        Mohon melampirkan SK Pendirian BSU*
                      </AlertDialogDescription>) : ''
                      }
                    </AlertDialogHeader>
                    {
                       dataApprover.data.roleId == 3 ? (<Input
                        type="file"
                        onChange={(e) => setFileSK(e.target.files[0])}
                      />) : ''
                      }
                    <AlertDialogFooter>
                      <CustomButton
                        variant="outline"
                        disabled={isSubmitLoading}
                        onClick={() => setOpenDialogYes(false)}
                      >
                        Batal
                      </CustomButton>

                      <CustomButton
                        isLoading={isSubmitLoading}
                        onClick={() => {
                          const value = {
                            idApprover: dataApprover.data.idApprover,
                            createdBy: userId,
                            status: "Approved",
                            dokumen: null,
                          };
                          onSubmit(value);
                        }}
                      >
                        OK
                      </CustomButton>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <Toaster />
    </Layout>
  );
}

export default Page;
