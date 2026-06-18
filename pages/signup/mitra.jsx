import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users, Recycle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import useFetch from "@/hooks/useFetch";
import CustomButton from "@/components/custom_ui/custom-button";
import postForm from "@/hooks/postForm";

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

const formSchema = z.object({
  namaPerusahaan: z.string().min(1, {
    message: "Nama Perusahaan harus diisi",
  }),
  email: z.string().email({ message: "Email tidak valid" }),
  noTelp: z.string().min(10, {
    message: "Nomor Telepon harus minimal 10 karakter",
  }),
  alamatPerusahaan: z.string().min(1, {
    message: "Alamat harus diisi",
  }),
  kecamatan: z.string().min(1, {
    message: "Kecamatan harus diisi",
  }),
  kelurahan: z.string().min(1, {
    message: "Kelurahan harus diisi",
  }),
  jenisMitra: z.object(
    {
      idJenisMitra: z.number(),
      nama: z.string(),
    },
    {
      message: "Jenis Mitra harus dipilih",
    }
  ),
  jenisInstansi: z.object(
    {
      idJenisInstansi: z.number(),
      nama: z.string(),
    },
    {
      message: "Jenis Instansi harus dipilih",
    }
  ),
  password: z.string().min(6, {
    message: "Kata Sandi harus diisi",
  }),
  checkBox: z.boolean().refine((data) => data === true, {
    message: "Syarat dan Ketentuan harus disetujui",
  }),
});
function Mitra() {
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const { data: dataJenisMitra, isLoading: isLoadingJenisMitra } = useFetch(
    "/api/master/getJenisMitra"
  );

  const { data: dataJenisInstansi, isLoading: isLoadingJenisInstansi } =
    useFetch("/api/master/getJenisInstansi");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      namaPerusahaan: "",
      email: "",
      noTelp: "",
      alamatPerusahaan: "",
      kelurahan: "",
      kecamatan: "",
      jenisMitra: "",
      jenisInstansi: "",
      password: "",
      checkBox: false,
    },
  });

  async function onSubmit(value) {
    setIsSubmitLoading(true);

    const tmpData = {
      namaPerusahaan: value.namaPerusahaan,
      alamatPerusahaan: value.alamatPerusahaan,
      email: value.email,
      kelurahan: value.kelurahan,
      kecamatan: value.kecamatan,
      jenisMitra: value.jenisMitra.nama,
      jenisInstansi: value.jenisInstansi.nama,
      foto: value.foto,
      noTelp: value.noTelp,
      password: value.password,
      roleId: 7, // Mitra,
      foto: null,
    };

    const { data, error } = await postForm("/api/signup/mitra", tmpData);

    if (error) {
      toast({
        variant: "destructive",
        title: "Gagal!",
        description: error.message,
      });
    } else {
      toast({
        description: data.message,
      });
    }
    setIsSubmitLoading(false);
  }
  return (
    <Layout navbarContent={navbarContent}>
      <Card>
        <CardHeader>
          <CardTitle>Pendaftaran Mitra</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form>
              <h3 className="mb-3 font-semibold leading-none tracking-tight">
                Data Mitra
              </h3>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="namaPerusahaan"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-baseline space-x-2">
                        <FormLabel className="w-1/3">
                          Nama Perusahaan*
                        </FormLabel>
                        <div className="w-full">
                          <FormControl>
                            <Input
                              placeholder="Masukkan Nama Perusahaan"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="mt-1 text-xs" />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jenisInstansi"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center space-x-2">
                        <FormLabel className="w-1/3">Jenis Instansi*</FormLabel>
                        <div className="flex flex-col w-full">
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value="jenisInstansi"
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue>
                                  {field.value?.nama ||
                                    "- Pilih Jenis Instansi -"}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>

                            {isLoadingJenisMitra ? (
                              <SelectContent>
                                <SelectItem disabled value={null}>
                                  Loading...
                                </SelectItem>
                              </SelectContent>
                            ) : (
                              <SelectContent>
                                {dataJenisInstansi?.data.map((x, index) => (
                                  <SelectItem key={index} value={x}>
                                    {x.nama}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            )}
                          </Select>

                          <FormMessage className="mt-1 text-xs" />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-baseline space-x-2">
                        <FormLabel className="w-1/3">Email*</FormLabel>
                        <div className="w-full">
                          <FormControl>
                            <Input placeholder="Masukkan E-mail" {...field} />
                          </FormControl>
                          <FormMessage className="mt-1 text-xs" />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="noTelp"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-baseline space-x-2">
                        <FormLabel className="w-1/3">Nomor Telepon*</FormLabel>
                        <div className="w-full">
                          <FormControl>
                            <Input
                              placeholder="Masukkan Nomor Telepon"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="mt-1 text-xs" />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="alamatPerusahaan"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-baseline space-x-2">
                        <FormLabel className="w-1/3">Alamat*</FormLabel>
                        <div className="w-full">
                          <FormControl>
                            <Input placeholder="Masukkan Alamat" {...field} />
                          </FormControl>
                          <FormMessage className="mt-1 text-xs" />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="kecamatan"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-baseline space-x-2">
                        <FormLabel className="w-1/3">Kecamatan*</FormLabel>
                        <div className="w-full">
                          <FormControl>
                            <Input
                              placeholder="Masukkan Kecamatan"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="mt-1 text-xs" />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="kelurahan"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-baseline space-x-2">
                        <FormLabel className="w-1/3">Kelurahan*</FormLabel>
                        <div className="w-full">
                          <FormControl>
                            <Input
                              placeholder="Masukkan Kelurahan"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="mt-1 text-xs" />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <Separator className="my-5" />
              <h3 className="mb-3 font-semibold leading-none tracking-tight">
                Jenis Mitra
              </h3>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="jenisMitra"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center space-x-2">
                        <FormLabel className="w-1/3">Jenis Mitra*</FormLabel>
                        <div className="flex flex-col w-full">
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value="jenisMitra"
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue>
                                  {field.value?.nama || "- Pilih Jenis Mitra -"}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>

                            {isLoadingJenisMitra ? (
                              <SelectContent>
                                <SelectItem disabled value={null}>
                                  Loading...
                                </SelectItem>
                              </SelectContent>
                            ) : (
                              <SelectContent>
                                {dataJenisMitra?.data.map((x, index) => (
                                  <SelectItem key={index} value={x}>
                                    {x.nama}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            )}
                          </Select>

                          <FormMessage className="mt-1 text-xs" />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <Separator className="my-5" />
              <h3 className="mb-3 font-semibold leading-none tracking-tight">
                Password
              </h3>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-baseline space-x-2">
                        <FormLabel className="w-1/3">Password*</FormLabel>
                        <div className="w-full">
                          <FormControl>
                            <Input placeholder="Masukkan Password" {...field} />
                          </FormControl>
                          <FormMessage className="mt-1 text-xs" />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="checkBox"
                render={({ field }) => (
                  <div className="flex items-baseline space-x-2 mt-7">
                    <FormItem>
                      <FormControl>
                        <Checkbox
                          id="terms"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                    <div>
                      <Label htmlFor="terms">
                        Setujui syarat dan ketentuan yang berlaku
                      </Label>
                      <FormMessage className="mt-1 text-xs" />
                    </div>
                  </div>
                )}
              />
              <div className="flex">
                <CustomButton
                  type="button"
                  className="ml-auto"
                  isLoading={isSubmitLoading}
                  onClick={async () => {
                    const isValid = await form.trigger();
                    if (isValid) {
                      onSubmit(form.getValues());
                    } else {
                      console.log("error", form.formState.errors);
                    }
                  }}
                >
                  Daftar
                </CustomButton>
              </div>
            </form>
            <Toaster />
          </Form>
        </CardContent>
      </Card>
    </Layout>
  );
}

export default Mitra;
