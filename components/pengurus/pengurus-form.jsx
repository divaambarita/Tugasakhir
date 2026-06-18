import { CardContent, Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CalendarIcon} from "lucide-react";
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
import useUploadFile from "@/hooks/useUploadFile";
import { useCookies } from "react-cookie";
import { cn, getIdUserCookies } from "@/lib/utils";
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
import { Label } from "@radix-ui/react-dropdown-menu";
import Image from "next/image";

Date.prototype. addHours = function (h) {
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
  jabatan: z.string().min(3, {
    message: "Jabatan Harus Diisi",
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
});

let fileKtp = null;

function PengurusForm({ data, disabled = false, idBsu = null, formBsu = 1 }) {
  const router = useRouter();
  const [FileKtp, setFileKtp] = useState(null);
  const { uploadFile } = useUploadFile();
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(["currentUser"]);
  const userId = getIdUserCookies(cookies);
  const { postForm } = usePostForm();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idPengurus: data?.idPengurus,
      bsuId: { idBsu: data?.bsuId, nama: data?.bsu.nama },
      nama: data?.namaPengurus,
      email: data?.email,
      jenisKelamin: data?.jenisKelamin, //Male or Female
      noTelp: data?.noTelp,
      alamat: data?.alamat,
      tempatLahir: data?.tempatLahir,
      tglLahir: data?.tglLahir,
      jabatan: data?.jabatan,
      pekerjaan: data?.pekerjaan,
      ktp: data?.ktp,
    },
  });
  if (data && !FileKtp && data.ktp) {
    setFileKtp(data.ktp);
  }

  const { data: dataBankSampah, isLoading: isLoadingBankSampah } = useFetch(
    "/api/master/getBankSampah"
  );
  const { data: dataJabatan, isLoading: isLoadingJabatan } = useFetch(
    "/api/master/getJabatan"
  );
  async function onFileUpload(file) {
    setIsSubmitLoading(true);
    setFileKtp(await uploadFile(file));
    setIsSubmitLoading(false);
  }
  async function onSubmit(value) {
    setIsSubmitLoading(true);
    let tglLahir = null;
    if (value.tglLahir != null || value.tglLahir != undefined) {
      tglLahir = new Date(value.tglLahir).addHours(7).toISOString().toString();
    }
    const tmpData = {
      idPengurus: value?.idPengurus,
      namaPengurus: value.nama,
      email: value.email,
      jenisKelamin: value.jenisKelamin, //Male or Female
      noTelp: value.noTelp,
      alamat: value.alamat,
      tempatLahir: value.tempatLahir,
      tglLahir: tglLahir,
      jabatan: value.jabatan,
      pekerjaan: value.pekerjaan,
      ktp: FileKtp,
      roleId: 5,
      bsuId: value.bsuId?.idBsu,
    };
    let url = "/api/bsu/pengurus/storePengurus";
    if (!data) {
      delete tmpData.idPengurus;
    }

    const response = await postForm(url, tmpData);
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
      router.push("/pengurus");
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
              <Separator className="my-5" />
              <h3 className="mb-3 font-semibold leading-none tracking-tight">
                Data Pribadi
              </h3>
              <FormField
                control={form.control}
                name="idPengurus"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <div className="w-full">
                        <FormControl>
                          <Input
                            type="hidden"
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
                name="nama"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Nama*</FormLabel>
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Email*</FormLabel>
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
                      <FormLabel className="w-1/3">Nomor Telepon*</FormLabel>
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
                name="jenisKelamin"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline my-6 space-x-2">
                      <FormLabel className="w-1/3">Jenis Kelamin*</FormLabel>
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
                name="jabatan"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Jabatan*</FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value="jabatan"
                            disabled={disabled}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue>
                                  {field.value || "- Pilih Jabatan -"}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>

                            {isLoadingJabatan ? (
                              <SelectContent>
                                <SelectItem disabled value={null}>
                                  Loading...
                                </SelectItem>
                              </SelectContent>
                            ) : (
                              <SelectContent>
                                {dataJabatan.data.map((x, index) => (
                                  <SelectItem value={x.nama} key={index}>
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
                name="alamat"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Alamat*</FormLabel>
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
                name="tempatLahir"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Tempat Lahir*</FormLabel>
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
                      <FormLabel className="w-1/3">Tanggal Lahir*</FormLabel>
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
                name="pekerjaan"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Pekerjaan*</FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <Input
                            disabled={disabled}
                            placeholder="Masukkan Pekerjaan"
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
                name="ktp"
                render={({ field: { value, onChange, ...rest } }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-6">
                      <FormLabel className="w-1/3">Ktp*</FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            {disabled == false ? (
                              <Input
                                {...rest}
                                type="file"
                                accept="image/*"
                                disabled={isSubmitLoading}
                                onChange={(e) => {
                                  onFileUpload(e.target.files[0]);
                                }}
                              />
                            ) : (
                              <Input
                                disabled={disabled}
                                defaultValues={value}
                                placeholder="Masukkan Kondisi Bangunan"
                                {...rest}
                              />
                            )}
                          </div>
                        </FormControl>
                        <FormMessage className="mt-1 text-xs" />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              {FileKtp && (
                <div className="flex items-baseline space-x-2 space-y-6">
                  <Label className="w-1/3"></Label>
                  <div className="flex w-full space-x-2">
                    <Image
                      src={FileKtp || ""}
                      width="400"
                      height="250"
                      alt="Product"
                      className="aspect-auto f"
                    />
                  </div>
                </div>
              )}
              {disabled == false ? (
                <div className="flex mt-5">
                  <CustomButton
                    type="button"
                    className="ml-auto"
                    isLoading={isSubmitLoading}
                    onClick={(e) => {
                      onSubmit(form.getValues());
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

export default PengurusForm;
