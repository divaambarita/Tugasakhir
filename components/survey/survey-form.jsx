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
  lokasi: z.string().min(3, {
    message: "Lokasi Harus Diisi",
  }),
  luasTempat: z.string().min(3, {
    message: "Luas Tempat Harus Diisi",
  }),
  kondisiBangunan: z.string().min(3, {
    message: "Kondisi Bangunan Harus Diisi",
  }),
});
let finalFileDokumentasi;

function SurveyForm({ data, disabled = false }) {
  const router = useRouter();
  const [fileDokumentasi, setfileDokumentasi] = useState(null);
  const { uploadFile } = useUploadFile();
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(["currentUser"]);
  const userId = getIdUserCookies(cookies);
  const { postForm } = usePostForm();

  let hasilVerifikasi = data.hasilverifikasi;
  finalFileDokumentasi = hasilVerifikasi?.fotoKunjungan;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      namaBsu: data.nama,
      bsuId: data.idBsu,
      lokasi: hasilVerifikasi?.lokasi,
      luasTempat: hasilVerifikasi?.luasTempat,
      kondisiBangunan: hasilVerifikasi?.kondisiBangunan,
      fotoKunjungan: hasilVerifikasi?.fotoKunjungan,
      tempat_penyimpanan_sampah: hasilVerifikasi?.fasilitas[0].value,
      alat_penimbangan_sampah: hasilVerifikasi?.fasilitas[1].value,
      gudang_penyimpanan: hasilVerifikasi?.fasilitas[2].value,
      tempat_pemilahan_sampah: hasilVerifikasi?.fasilitas[3].value,
      tempat_pengolahan_sampah: hasilVerifikasi?.fasilitas[4].value,
      lokasi_mudah_diakses: hasilVerifikasi?.fasilitas[5].value,
      tidak_mencemari_lingkungan: hasilVerifikasi?.fasilitas[5].value,
    },
  });
  async function onFileUpload(file) {
    setIsSubmitLoading(true);
    setfileDokumentasi(await uploadFile(file));
    setIsSubmitLoading(false);
  }
  async function onSubmit(value) {
    setIsSubmitLoading(true);
    finalFileDokumentasi = fileDokumentasi;
    const arrFasilitas = [
      {
        key: "tempat_penyimpanan_sampah",
        nama: "Tempat penyimpanan sampah",
        value: value.tempat_penyimpanan_sampah,
      },
      {
        key: "alat_penimbangan_sampah",
        nama: "Alat penimbangan sampah",
        value: value.alat_penimbangan_sampah,
      },
      { key: "gudang_penyimpanan", nama: "Gudang penyimpanan", value: value.gudang_penyimpanan },
      {
        key: "tempat_pemilahan_sampah",
        nama: "Tempat pemilahan sampah",
        value: value.tempat_pemilahan_sampah,
      },
      {
        key: "tempat_pengolahan_sampah",
        nama: "Tempat pengolahan sampah",
        value: value.tempat_pengolahan_sampah,
      },
      {
        key: "lokasi_mudah_diakses",
        nama: "Lokasi Mudah Diakses",
        value: value.lokasi_mudah_diakses,
      },
      {
        key: "tidak_mencemari_lingkungan",
        nama: "Tidak Mencemari Lingkungan",
        value: value.tidak_mencemari_lingkungan,
      },
    ];

    const tmpData = {
      volunteerId: userId,
      bsuId: value.bsuId,
      lokasi: value.lokasi,
      luasTempat: value.luasTempat,
      kondisiBangunan: value.kondisiBangunan,
      fasilitas: arrFasilitas,
      dokumen: finalFileDokumentasi,
    };

    const response = await postForm("/api/volunteer/verifikasi", tmpData);
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
      router.back();
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
                name="namaBsu"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Nama Bank Sampah*</FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <Input
                            placeholder="Masukkan Nama Bank Sampah"
                            disabled
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
                name="bsuId"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="hidden"
                        disabled={disabled}
                        placeholder="Masukkan Nama Bank Sampah"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lokasi"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Lokasi*</FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <Input
                            disabled={disabled}
                            placeholder="Masukkan Lokasi"
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
                name="luasTempat"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Luas Tempat*</FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <Input
                            disabled={disabled}
                            placeholder="Masukkan Luas Tempat"
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
                name="kondisiBangunan"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Kondisi Bangunan*</FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <Input
                            disabled={disabled}
                            placeholder="Masukkan Kondisi Bangunan"
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
                name="tempat_penyimpanan_sampah"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-6">
                      <FormLabel className="w-1/3 w">Fasilitas*</FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="tempat_penyimpanan_sampah"
                              checked={field.value}
                              disabled={disabled}
                              onCheckedChange={field.onChange}
                            />
                            <label
                              htmlFor="tempat_penyimpanan_sampah"
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Tempat penyimpanan sampah
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage className="mt-1 text-xs" />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="alat_penimbangan_sampah"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-4">
                      <FormLabel className="w-1/3"></FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="alat_penimbangan_sampah"
                              checked={field.value}
                              disabled={disabled}
                              onCheckedChange={field.onChange}
                            />
                            <label
                              htmlFor="alat_penimbangan_sampah"
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Alat penimbangan sampah
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage className="mt-1 text-xs" />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gudang_penyimpanan"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-4">
                      <FormLabel className="w-1/3"></FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="gudang_penyimpanan"
                              checked={field.value}
                              disabled={disabled}
                              onCheckedChange={field.onChange}
                            />
                            <label
                              htmlFor="gudang_penyimpanan"
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Gudang penyimpanan
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage className="mt-1 text-xs" />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tempat_pemilahan_sampah"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-4">
                      <FormLabel className="w-1/3"></FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="tempat_pemilahan_sampah"
                              checked={field.value}
                              disabled={disabled}
                              onCheckedChange={field.onChange}
                            />
                            <label
                              htmlFor="tempat_pemilahan_sampah"
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Tempat pemilahan sampah
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage className="mt-1 text-xs" />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tempat_pengolahan_sampah"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-4">
                      <FormLabel className="w-1/3"></FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="tempat_pengolahan_sampah"
                              checked={field.value}
                              disabled={disabled}
                              onCheckedChange={field.onChange}
                            />
                            <label
                              htmlFor="tempat_pengolahan_sampah"
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Tempat pengolahan sampah
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage className="mt-1 text-xs" />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lokasi_mudah_diakses"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-4">
                      <FormLabel className="w-1/3"></FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="lokasi_mudah_diakses"
                              checked={field.value}
                              disabled={disabled}
                              onCheckedChange={field.onChange}
                            />
                            <label
                              htmlFor="lokasi_mudah_diakses"
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Lokasi Mudah Diakses
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage className="mt-1 text-xs" />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tidak_mencemari_lingkungan"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-4">
                      <FormLabel className="w-1/3"></FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="tidak_mencemari_lingkungan"
                              checked={field.value}
                              disabled={disabled}
                              onCheckedChange={field.onChange}
                            />
                            <label
                              htmlFor="tidak_mencemari_lingkungan"
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Tidak Mencemari Lingkungan
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage className="mt-1 text-xs" />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fotoKunjungan"
                render={({ field: { value, onChange, ...rest } }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-6">
                      <FormLabel className="w-1/3">
                        Dokumentasi Kunjungan*
                      </FormLabel>
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
              {disabled == false ? (
                <div className="flex mt-8">
                  <CustomButton
                    type="submit"
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

export default SurveyForm;
