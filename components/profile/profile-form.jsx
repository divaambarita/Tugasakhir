import { CardContent, Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
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
import { Checkbox } from "../ui/checkbox";
import CustomButton from "../custom_ui/custom-button";
import { Toaster } from "../ui/toaster";
import { Button } from "../ui/button";
import useUploadFile from "@/hooks/useUploadFile";
import { useCookies } from "react-cookie";
import { getIdUserCookies } from "@/lib/utils";
import usePostForm from "@/hooks/usePostForm";
import { toast } from "../ui/use-toast";
import { useRouter } from "next/router";

const formSchema = z.object({
  nama: z.string().min(3, {
    message: "nama Harus Diisi",
  }),
  alamat: z.string().min(3, {
    message: "alamat Harus Diisi",
  }),
  jamMulai: z.string().min(1, {
    message: "Jam mulai harus diisi",
  }),
  jamSelesai: z.string().min(1, {
    message: "Jam selesai harus diisi",
  }),
});
let finalFileDokumentasi;

function ProfileForm({ data, disabled = false }) {
  const router = useRouter();
  const [fileDokumentasi, setfileDokumentasi] = useState(null);
  const { uploadFile } = useUploadFile();
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(["currentUser"]);
  const userId = getIdUserCookies(cookies);
  const { postForm } = usePostForm();

  finalFileDokumentasi = data?.foto;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: data?.nama,
      alamat: data?.alamat,
      senin: data?.jadwal?.hari[0].value,
      selasa: data?.jadwal?.hari[1].value,
      rabu: data?.jadwal?.hari[2].value,
      kamis: data?.jadwal?.hari[3].value,
      jumat: data?.jadwal?.hari[4].value,
      sabtu: data?.jadwal?.hari[5].value,
      minggu: data?.jadwal?.hari[6].value,
      jamMulai: data?.jadwal?.jamMulai,
      jamSelesai: data?.jadwal?.jamSelesai,
    },
  });
  async function onFileUpload(file) {
    setIsSubmitLoading(true);
    setfileDokumentasi(await uploadFile(file));
    setIsSubmitLoading(false);
  }
  async function onSubmit(value) {
    if (value.jamMulai == value.jamSelesai) {
      toast({
        variant: "destructive",
        title: "Gagal!",
        description: "Jam mulai dan jam selesai tidak boleh sama",
      });
      return;
    }
    
    setIsSubmitLoading(true);
    console.log(value);
    finalFileDokumentasi = fileDokumentasi;
    const arrHari = [
      {
        key: "senin",
        nama: "Senin",
        value: value.senin,
      },
      {
        key: "selasa",
        nama: "Selasa",
        value: value.selasa,
      },
      { key: "rabu", nama: "Rabu", value: value.rabu },
      {
        key: "kamis",
        nama: "Kamis",
        value: value.kamis,
      },
      {
        key: "jumat",
        nama: "Jumat",
        value: value.jumat,
      },
      {
        key: "sabtu",
        nama: "Sabtu",
        value: value.sabtu,
      },
      {
        key: "minggu",
        nama: "Minggu",
        value: value.minggu,
      },
    ];

    const tmpData = {
      nama: value.nama,
      noTelp: data.noTelp,
      alamat: value.alamat,
      foto: finalFileDokumentasi,
      idAkun: data.idBsu,
      jadwal: {
        hari: JSON.stringify(arrHari),
        jamMulai: `${value.jamMulai}`,
        jamSelesai: `${value.jamSelesai}`,
        bsuId: data.idBsu,
      },
    };

    const response = await postForm("/api/updateProfile", tmpData);
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
      router.reload();
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
                name="nama"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Nama Bank Sampah*</FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <Input
                            placeholder="Masukkan Nama Bank Sampah"
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
                name="foto"
                render={({ field: { value, onChange, ...rest } }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-6">
                      <FormLabel className="w-1/3">Foto</FormLabel>
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
                                placeholder="Masukkan foto"
                                {...rest}
                              />
                            )}
                          </div>
                        </FormControl>
                        <FormMessage className="mt-1 text-xs" />
                        {fileDokumentasi && (
                          <div className="flex items-center mt-2 space-x-2">
                            <small>{fileDokumentasi}</small>
                            <Button
                              variant="destructive"
                              type="button"
                              size="icon"
                              className="w-5 h-5 p-1"
                              onClick={() => {
                                setfileDokumentasi(null);
                              }}
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormItem className="mt-5">
                <FormLabel>Jadwal Operasional</FormLabel>
                <div className="flex flex-wrap">
                  <div className="w-1/4 mr-2"></div>
                  <div className="grid items-end w-1/3 grid-cols-3 gap-3">
                    {[
                      "Senin",
                      "Selasa",
                      "Rabu",
                      "Kamis",
                      "Jumat",
                      "Sabtu",
                      "Minggu",
                    ].map((day) => (
                      <FormField
                        key={day}
                        control={form.control}
                        name={day.toLowerCase()}
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  id={day.toLowerCase()}
                                  checked={field.value}
                                  disabled={disabled}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="m-0">{day}</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
              </FormItem>
              <FormItem className="mt-5">
                <div className="flex items-center space-x-2">
                  <div className="w-1/4">
                    <FormLabel>Jam</FormLabel>
                  </div>
                  <FormField
                    control={form.control}
                    name="jamMulai"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Input type="time" disabled={disabled} {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <span>-</span>
                  <FormField
                    control={form.control}
                    name="jamSelesai"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Input type="time" disabled={disabled} {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </FormItem>
              {disabled == false ? (
                <div className="flex mt-8">
                  <CustomButton
                    type="button"
                    className="ml-auto"
                    isLoading={isSubmitLoading}
                    onClick={() => {
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

export default ProfileForm;
