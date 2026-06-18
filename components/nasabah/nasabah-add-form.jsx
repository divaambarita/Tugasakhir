import { CardContent, Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CalendarIcon } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "../custom_ui/custom-button";
import { Toaster } from "../ui/toaster";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import usePostForm from "@/hooks/usePostForm";
import { toast } from "../ui/use-toast";
import { useRouter } from "next/router";
import useFetch from "@/hooks/useFetch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "../ui/separator";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";

Date.prototype.addHours = function (h) {
  this.setHours(this.getHours() + h);
  return this;
};

const formSchema = z.object({
  bsuId: z.object(
    {
      idBsu: z.number(),
      nama: z.string(),
    },
    {
      message: "Bank Sampah harus diisi",
    }
  ),
  nama: z.string().min(3, {
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
  password: z.string().min(6, {
    message: "Kata Sandi harus diisi",
  }),
  Nik: z.string().max(16, {
    message: "NIK harus minimal 16 karakter",
  }),
  tempatLahir: z.string().min(3, {
    message: "Tempat Lahir Harus Diisi",
  }),
  tglLahir: z.date({
    required_error: "Tanggal Lahir Harus Diisi.",
  }),
  kelurahan: z.string().min(3, {
    message: "Kelurahan Harus Diisi",
  }),
  kecamatan: z.string().min(3, {
    message: "Kecamatan Harus Diisi",
  }),
});

function AddNasabahForm({ data, disabled = false, idBsu = null, formBsu = 1 }) {
  const router = useRouter();
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const { postForm } = usePostForm();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idNasabah: data?.idNasabah,
      nomorNasabah: data?.nomorNasabah,
      bsuId: { idBsu: data?.bsuId, nama: data?.bsu.nama },
      nama: data?.nama,
      email: data?.email,
      noTelp: data?.noTelp,
      jenisKelamin: data?.jenisKelamin,
      Nik: data?.Nik,
      alamat: data?.alamat,
      tempatLahir: data?.tempatLahir,
      tglLahir: data?.tglLahir,
      kelurahan: data?.kelurahan,
      kecamatan: data?.kecamatan,
      saldo: data?.saldo,
    },
  });

  const { data: dataBankSampah, isLoading: isLoadingBankSampah } = useFetch(
    "/api/master/getBankSampah"
  );
  async function onSubmit(value) {
    setIsSubmitLoading(true);
    let tglLahir = null;
    if (value.tglLahir != null || value.tglLahir != undefined) {
      tglLahir = new Date(value.tglLahir).addHours(7).toISOString().toString();
    }
    const tmpData = {
      fromBsu: formBsu,
      idNasabah: value.idNasabah,
      nomorNasabah: value.nomorNasabah,
      nama: value.nama,
      email: value.email,
      jenisKelamin: value.jenisKelamin, //Male or Female
      Nik: value.Nik,
      noTelp: value.noTelp,
      alamat: value.alamat,
      tempatLahir: value.tempatLahir,
      tglLahir: tglLahir,
      kelurahan: value.kelurahan,
      kecamatan: value.kelurahan,
      foto: null,
      saldo: null,
      password: value.password,
      roleId: 6,
      bsuId: value.bsuId?.idBsu,
    };
    if (!data) {
      delete tmpData.idNasabah;
    }

    const response = await postForm("/api/signup/nasabah", tmpData);
    if (response.status != 200) {
      setIsSubmitLoading(false);
      toast({
        variant: "destructive",
        title: "Gagal!",
        description: response.message,
      });
    } else {
      toast({
        description: response.message,
      });
      if (formBsu == 1) {
        router.push("/nasabah");
      } else {
        router.push("/login");
      }
    }
    setIsSubmitLoading(false);
  }
  return (
    <Card>
      <CardContent>
        <div className="space-y-3">
          <Form {...form}>
            <form>
              <FormField
                control={form.control}
                name="bsuId"
                render={({ field }) => (
                  <FormItem>
                    <h3 className="my-5 font-semibold leading-none tracking-tight">
                      Data Bank Sampah
                    </h3>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Nama Bank Sampah*</FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value="bsuId"
                            disabled={disabled}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue>
                                  {field.value?.nama || "- Pilih Bank Sampah -"}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>

                            {isLoadingBankSampah ? (
                              <SelectContent>
                                <SelectItem disabled value={null}>
                                  Loading...
                                </SelectItem>
                              </SelectContent>
                            ) : (
                              <SelectContent>
                                {idBsu
                                  ? dataBankSampah?.data
                                      .filter(function (obj) {
                                        return obj.idBsu == idBsu;
                                      })
                                      .map((x, index) => (
                                        <SelectItem value={x} key={index}>
                                          {x.nama}
                                        </SelectItem>
                                      ))
                                  : dataBankSampah.data.map((x, index) => (
                                      <SelectItem value={x} key={index}>
                                        {x.nama}
                                      </SelectItem>
                                    ))}
                              </SelectContent>
                            )}
                          </Select>
                        </FormControl>
                        <FormMessage className="mt-1 text-xs" />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nomorNasabah"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Nomor Nasabah</FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <Input
                            disabled={disabled}
                            placeholder="Masukkan Nomor Nasabah"
                            {...field}
                          />
                        </FormControl>
                        <p className="mt-1 text-xs text-red-500">
                          *Biarkan kosong, nomor ini akan diisi oleh admin BSU
                        </p>
                        <FormMessage className="mt-1 text-xs" />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <Separator className="my-5" />
              <h3 className="mb-3 font-semibold leading-none tracking-tight">
                Data Pribadi
              </h3>
              <FormField
                control={form.control}
                name="nama"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Nama</FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <Input
                            disabled={disabled}
                            placeholder="Masukkan Nama"
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
                name="Nik"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">
                        Nomor Induk Kependudukan (NIK)
                      </FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <Input
                            type="number"
                            disabled={disabled}
                            placeholder="Masukkan Nomor Induk Kependudukan (NIK)"
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
                name="jenisKelamin"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline my-6 space-x-2">
                      <FormLabel className="w-1/3">Jenis Kelamin</FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <RadioGroup
                            disabled={disabled}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center space-x-3"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Male" />
                              </FormControl>
                              <FormLabel>Laki-Laki</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Female" />
                              </FormControl>
                              <FormLabel>Perempuan</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage className="mt-1 text-xs" />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tempatLahir"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Tempat Lahir</FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <Input
                            disabled={disabled}
                            placeholder="Masukkan Tempat Lahir"
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
                name="tglLahir"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Tanggal Lahir</FormLabel>
                      <div className="w-full">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                type="button"
                                variant={"outline"}
                                disabled={disabled}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="w-4 h-4 ml-auto opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              captionLayout="dropdown-buttons"
                              fromYear={1900}
                              toYear={new Date().getFullYear()}
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
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
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Email</FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <Input
                            disabled={disabled}
                            placeholder="Masukkan Email"
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
                name="noTelp"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Nomor Telepon</FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <Input
                            type="number"
                            disabled={disabled}
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
                name="alamat"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Alamat</FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <Input
                            disabled={disabled}
                            placeholder="Masukkan Alamat"
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
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Kelurahan</FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <Input
                            disabled={disabled}
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
              <FormField
                control={form.control}
                name="kecamatan"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Kecamatan</FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <Input
                            disabled={disabled}
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Password</FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <Input
                            type="password"
                            disabled={disabled}
                            placeholder="Masukkan Password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="mt-1 text-xs" />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              {disabled == false ? (
                <div className="flex mt-5">
                  <CustomButton
                    type="button"
                    className="ml-auto"
                    isLoading={isSubmitLoading}
                    onClick={async (e) => {
                      const isValid = await form.trigger();
                      if (isValid) {
                        onSubmit(form.getValues());
                      } else {
                        console.log("error", form.formState.errors);
                      }
                    }}
                  >
                    Simpan
                  </CustomButton>
                </div>
              ) : (
                ""
              )}
            </form>
            <Toaster />
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}

export default AddNasabahForm;
