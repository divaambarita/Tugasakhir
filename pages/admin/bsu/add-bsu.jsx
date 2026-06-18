import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users, Recycle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import CustomButton from "@/components/custom_ui/custom-button";
import RowFormInput from "@/components/custom_ui/row-form-input";
import RowFormRadioGroupGender from "@/components/custom_ui/row-form-radio-group-gender";
import RowFormFile from "@/components/custom_ui/row-form-file";
import RowFormDate from "@/components/custom_ui/row-form-date";
import usePostForm from "@/hooks/usePostForm";
import { useRouter } from "next/router";
import { Toaster } from "@/components/ui/toaster";

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
function Bsu() {
  const { postForm } = usePostForm();

  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const [tab, setTab] = useState(0);

  const router = useRouter();

  const validationSchema = [
    z.object({
      nama: z.string().min(1, {
        message: "Nama Bank Sampah harus diisi",
      }),
      email: z.string().email({ message: "Email tidak valid" }),
      noTelp: z.string().min(9, {
        message: "Nomor Telepon harus minimal 9 karakter",
      }),
      alamat: z.string().min(1, {
        message: "Alamat harus diisi",
      }),
      kecamatan: z.string().min(1, {
        message: "Kecamatan harus diisi",
      }),
      kelurahan: z.string().min(1, {
        message: "Kelurahan harus diisi",
      }),
      password: z.string().min(6, {
        message: "Kata Sandi harus diisi",
      }),
    }),
    z.object({
      pengurus: z.array(
        z.object({
          namaPengurus: z.string().min(3, {
            message: "Nama Harus Diisi",
          }),
          email: z.string().email({ message: "Email tidak valid" }),
          jenisKelamin: z.enum(["Male", "Female"], {
            required_error: "Jenis Kelamin harus diisi",
          }),
          noTelp: z.string().min(10, {
            message: "Nomor Telepon harus minimal 10 karakter",
          }),
          alamat: z.string().min(1, {
            message: "Alamat harus diisi",
          }),
          pekerjaan: z.string().min(3, {
            message: "Pekerjaan Harus Diisi",
          }),
          tempatLahir: z.string().min(3, {
            message: "Tempat Lahir Harus Diisi",
          }),
          tglLahir: z.date({
            required_error: "Tanggal Lahir Harus Diisi.",
          }),
          ktp: z.string().min(1, {
            message: "KTP harus diisi",
          }),
        })
      ),
    }),
  ];
  const currentValidationSchema = validationSchema[tab];

  const form = useForm({
    resolver: zodResolver(currentValidationSchema),
    defaultValues: {
      nama: "",
      email: "",
      noTelp: "",
      alamat: "",
      kecamatan: "",
      kelurahan: "",
      password: "",
      pengurus: [],
      checkBox: false,
    },
  });

  const handleNext = async () => {
    const isStepValid = await form.trigger();
    if (isStepValid) setTab(tab + 1);
  };
  const handleBack = () => {
    setTab(tab - 1);
  };

  const listPengurus = [
    "DIREKTUR",
    "MANAGER UMUM",
    "MANAGER PRODUKSI",
    "MANAGER KEUANGAN",
  ];
  async function onSubmit(value) {
    setIsSubmitLoading(true);
    const pengurus = value.pengurus;
    listPengurus.map((item, index) => {
      pengurus[index].jabatan = item;
    });
    const tmpData = {
      nama: value.nama,
      email: value.email,
      noTelp: value.noTelp,
      alamat: value.alamat,
      kecamatan: value.kecamatan,
      kelurahan: value.kelurahan,
      password: value.password,
      foto: null,
      roleId: 4,
      saldo: null,
      pengurus: value.pengurus,
      fromAdmin: 1,
    };
    const response = await postForm("/api/signup/bsu", tmpData);

    if (response.status != 200) {
      toast({
        variant: "destructive",
        title: "Gagal!",
        description: response.message,
      });
    } else {
      toast({
        description: response.message,
      });
      router.push("/admin/bsu");
    }
    setIsSubmitLoading(false);
  }

  return (
    <Layout>
      <Card>
        <CardHeader>
          <CardTitle>Pendaftaran Bank Sampah Unit (BSU)</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} className="w-full mt-3">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value={0}>Informasi Bank Sampah</TabsTrigger>
              <TabsTrigger value={1}>Data Pengurus</TabsTrigger>
            </TabsList>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(() => {
                  onSubmit(form.getValues());
                })}
              >
                <TabsContent value={0} className="mt-5">
                  <h3 className="mb-3 font-semibold leading-none tracking-tight">
                    Informasi Bank Sampah
                  </h3>
                  <div className="space-y-3">
                    <RowFormInput
                      form={form}
                      name="nama"
                      label="Nama Bank Sampah*"
                      placeholder="Masukkan Nama Bank Sampah"
                    />

                    <RowFormInput
                      form={form}
                      name="email"
                      label="Email*"
                      placeholder="Masukkan E-mail"
                    />
                    <RowFormInput
                      form={form}
                      type="number"
                      name="noTelp"
                      label="Nomor Telepon*"
                      placeholder="Masukkan Nomor Telepon"
                    />

                    <RowFormInput
                      form={form}
                      name="alamat"
                      label="Alamat*"
                      placeholder="Masukkan Alamat"
                    />

                    <RowFormInput
                      form={form}
                      name="kecamatan"
                      label="Kecamatan*"
                      placeholder="Masukkan Kecamatan"
                    />

                    <RowFormInput
                      form={form}
                      name="kelurahan"
                      label="Kelurahan*"
                      placeholder="Masukkan Kelurahan"
                    />

                    <RowFormInput
                      form={form}
                      name="password"
                      type="password"
                      label="Password*"
                      placeholder="Masukkan Password"
                    />
                  </div>

                  <div className="flex mt-7">
                    <Button
                      className="ml-auto"
                      type="button"
                      onClick={handleNext}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value={1} className="mt-5">
                  {listPengurus.map((item, index) => (
                    <>
                      <div key={index} className="space-y-3">
                        <h3 className="mb-3 font-semibold leading-none tracking-tight">
                          {item}
                        </h3>
                        <RowFormInput
                          form={form}
                          name={`pengurus.${index}.namaPengurus`}
                          label="Nama*"
                          placeholder="Masukkan Nama"
                        />

                        <RowFormRadioGroupGender
                          form={form}
                          name={`pengurus.${index}.jenisKelamin`}
                        />

                        <RowFormInput
                          form={form}
                          name={`pengurus.${index}.email`}
                          label="Email*"
                          placeholder="Masukkan E-mail"
                        />

                        <RowFormInput
                          form={form}
                          name={`pengurus.${index}.noTelp`}
                          label="Nomor Telepon*"
                          type="number"
                          placeholder="Masukkan Nomor Telepon"
                        />
                        <RowFormInput
                          form={form}
                          name={`pengurus.${index}.tempatLahir`}
                          label="Tempat Lahir*"
                          placeholder="Masukkan Tempat Lahir"
                        />
                        <RowFormDate
                          form={form}
                          name={`pengurus.${index}.tglLahir`}
                          label="Tanggal Lahir*"
                        />

                        <RowFormInput
                          form={form}
                          name={`pengurus.${index}.alamat`}
                          label="Alamat*"
                          placeholder="Masukkan Alamat"
                        />

                        <RowFormInput
                          form={form}
                          name={`pengurus.${index}.pekerjaan`}
                          label="Pekerjaan*"
                          placeholder="Masukkan Pekerjaan"
                        />

                        <RowFormFile
                          form={form}
                          name={`pengurus.${index}.ktp`}
                          label="KTP*"
                          
                        />
                        {index !== listPengurus.length - 1 && <Separator />}
                      </div>
                      <Separator className="my-4" />
                    </>
                  ))}
                  <div className="flex">
                    <Button
                      type="button"
                      className="ml-auto"
                      variant="outline"
                      onClick={handleBack}
                    >
                      Kembali
                    </Button>
                    <CustomButton
                      type="submit"
                      className="ml-3"
                      isLoading={isSubmitLoading}
                    >
                      Daftar
                    </CustomButton>
                  </div>
                </TabsContent>
              </form>
            </Form>
          </Tabs>
        </CardContent>
      </Card>
      <Toaster />
    </Layout>
  );
}

export default Bsu;
