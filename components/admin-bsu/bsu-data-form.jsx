import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users, Recycle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import RowFormInput from "@/components/custom_ui/row-form-input";
import usePostForm from "@/hooks/usePostForm";
import { useRouter } from "next/router";

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
function BsuForm({ data = null, disabled = false }) {
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
    }),
  ];
  const currentValidationSchema = validationSchema[tab];

  const form = useForm({
    resolver: zodResolver(currentValidationSchema),
    defaultValues: {
      nama: data?.nama,
      email: data?.email,
      noTelp: data?.noTelp,
      alamat: data?.alamat,
      kecamatan: data?.kecamatan,
      kelurahan: data?.kelurahan,
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
  async function onSubmit(value, isActive = null) {
    setIsSubmitLoading(true);
    
    const tmpData = {
      nama: value.nama,
      email: value.email,
      noTelp: value.noTelp,
      alamat: value.alamat,
      kecamatan: value.kecamatan,
      kelurahan: value.kelurahan,
      password: value.password ?? null,
      foto: null,
      roleId: 4,
      saldo: null,
      pengurus: value.pengurus,
      idBsu: data.idBsu,
      fromAdmin: 1,
      isActive: isActive ?? null,
    };
    const response = await postForm("/api/bsu/updateBsu", tmpData);

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

  // const listPengurus = [
  //   "DIREKTUR",
  //   "MANAGER UMUM",
  //   "MANAGER PRODUKSI",
  //   "MANAGER KEUANGAN",
  // ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Bank Sampah Unit (BSU)</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(() => {
              onSubmit(form.getValues());
            })}
          >
            <h3 className="mb-3 font-semibold leading-none tracking-tight">
              Informasi Bank Sampah
            </h3>
            <div className="space-y-3">
              <RowFormInput
                form={form}
                disabled={disabled}
                name="nama"
                label="Nama Bank Sampah*"
                placeholder="Masukkan Nama Bank Sampah"
              />

              <RowFormInput
                form={form}
                disabled={disabled}
                name="email"
                label="Email*"
                placeholder="Masukkan E-mail"
              />
              <RowFormInput
                form={form}
                disabled={disabled}
                type="number"
                name="noTelp"
                label="Nomor Telepon*"
                placeholder="Masukkan Nomor Telepon"
              />

              <RowFormInput
                form={form}
                disabled={disabled}
                name="alamat"
                label="Alamat*"
                placeholder="Masukkan Alamat"
              />

              <RowFormInput
                form={form}
                disabled={disabled}
                name="kecamatan"
                label="Kecamatan*"
                placeholder="Masukkan Kecamatan"
              />

              <RowFormInput
                form={form}
                disabled={disabled}
                name="kelurahan"
                label="Kelurahan*"
                placeholder="Masukkan Kelurahan"
              />

              <RowFormInput
                form={form}
                disabled={disabled}
                name="password"
                type="password"
                label="Password*"
                placeholder="Masukkan Password"
              />
            </div>
            {disabled == false ? (
              <div className="flex justify-end space-x-4 mt-7">
                {data != null ? (
                  <Button
                    type="button"
                    onClick={() =>
                      onSubmit(form.getValues(), data?.isActive == 1 ? 0 : 1)
                    }
                    variant={data?.isActive === 0 ? "secondary" : "destructive"}
                  >
                    {data?.isActive === 0
                      ? "Aktifkan Akun"
                      : "Nonaktifkan Akun"}
                  </Button>
                ) : (
                  <></>
                )}
                <Button type="submit">Simpan</Button>
              </div>
            ) : (
              <></>
            )}
          </form>
        </Form>
      </CardContent>
      <Toaster />
    </Card>
  );
}

export default BsuForm;
