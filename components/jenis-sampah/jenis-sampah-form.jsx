import { CardContent, Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { useCookies } from "react-cookie";
import { getIdUserCookies } from "@/lib/utils";
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
import NamaJenisSampah from "../transaksi/transaksi-list-jenis-sampah";

Date.prototype.addHours = function (h) {
  this.setHours(this.getHours() + h);
  return this;
};

const formSchema = z.object({
  nama: z.string().min(1, {
    message: "Nama Sampah harus diisi",
  }),
  hargaBsi: z.string().min(1, {
    message: "Harga Sampah BSI harus diisi",
  }),
  hargaBsu: z.nullable(),
});

let fileKtp = null;

function JenisSampahForm({ data, disabled = false, fromBsu = 1 }) {
  const router = useRouter();
  const [FileKtp, setFileKtp] = useState(null);
  // const { uploadFile } = useUploadFile();
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(["currentUser"]);
  const userId = getIdUserCookies(cookies);
  const { postForm } = usePostForm();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kategori: {
        idJenisSampah: data?.idJenisSampah,
        nama: data?.nama,
        kategori: data?.kategori,
      },
      idJenisSampah: data?.idJenisSampah,
      nama: data?.nama,
      hargaBsi: data?.hargasampahbsi,
      hargaBsu: data?.hargasampahbsu,
    },
  });

  const { data: getKategoriSampah, isLoading: isLoadingKategoriSampah } =
    useFetch("/api/master/getKategoriSampah");
  const { data: dataListSampah, isLoading: isLoadingListSampah } = useFetch(
    "/api/jenisSampah/getData/0"
  );
  const listSampah =
    fromBsu == 1 ? dataListSampah?.data.bsi : getKategoriSampah?.data;

  async function onChangeJenisFile(value) {
    let tmpData = {
      idJenisSampah: value?.idJenisSampah,
      bsuId: userId,
    };
    const response = await postForm("/api/jenisSampah/detail", tmpData);
    if (response && response.status === 200) {
      form.setValue("nama", response.data.nama);
      form.setValue("idJenisSampah", response.data.idJenisSampah);
      form.setValue("hargaBsi", response.data.hargasampahbsi);
      form.setValue("hargaBsu", response.data?.hargasampahbsu || "");
    }
    if (response && response.status != 200) {
      setIsSubmitLoading(false);
      toast({
        variant: "destructive",
        title: "Gagal!",
        description: response.message,
      });
    }
  }
  async function onSubmit(value) {
    setIsSubmitLoading(true);

    let tmpData = {
      idJenisSampah: value?.idJenisSampah,
      nama: value.nama,
      kategori: value.kategori.kategori,
      hargaBsi: parseFloat(value.hargaBsi),
    };
    if (fromBsu == 1) {
      tmpData.hargaBsu = parseFloat(value.hargaBsu);
      tmpData.bsuId = parseFloat(userId);
    }
    let url = "/api/jenisSampah/store";
    if (!data && fromBsu == 0) {
      delete tmpData.idJenisSampah;
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
      router.push((fromBsu == 0 ? "/admin" : "") + "/jenis-sampah");
    }
    setIsSubmitLoading(false);
  }
  return (
    <Card>
      <CardContent>
        <div className="space-y-3">
          <Form {...form}>
            <form>
              {fromBsu == 1 ? (
                <FormField
                  control={form.control}
                  name="kategori"
                  render={({ field: { value, onChange, ...rest } }) => (
                    <FormItem>
                      <div className="flex items-baseline space-x-2 space-y-3">
                        <FormLabel className="w-1/3">Jenis Sampah*</FormLabel>
                        <div className="w-full">
                          <FormControl>
                            <Select
                              onValueChange={(e) => {
                                onChange(e);
                                onChangeJenisFile(e);
                              }}
                              defaultValue={value}
                              value="kategori"
                              disabled={disabled}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue>
                                    {value?.nama || "- Pilih Bank Sampah -"}
                                  </SelectValue>
                                </SelectTrigger>
                              </FormControl>

                              {isLoadingListSampah ? (
                                <SelectContent>
                                  <SelectItem disabled value={null}>
                                    Loading...
                                  </SelectItem>
                                </SelectContent>
                              ) : (
                                <SelectContent>
                                  {listSampah.map((x, index) => (
                                    <SelectItem
                                      value={{
                                        idJenisSampah: x?.idJenisSampah,
                                        kategori: x?.kategori || x?.nama,
                                        nama: x?.nama,
                                      }}
                                      key={index}
                                    >
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
              ) : (
                <FormField
                  control={form.control}
                  name="kategori"
                  render={({ field: { value, onChange, ...rest } }) => (
                    <FormItem>
                      <div className="flex items-baseline space-x-2 space-y-3">
                        <FormLabel className="w-1/3">Jenis Sampah*</FormLabel>
                        <div className="w-full">
                          <FormControl>
                            <Select
                              onValueChange={(e) => {
                                onChange(e);
                              }}
                              defaultValue={value}
                              value="kategori"
                              disabled={disabled}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue>
                                    {value?.kategori || "- Pilih Jenis Sampah -"}
                                  </SelectValue>
                                </SelectTrigger>
                              </FormControl>

                              {isLoadingKategoriSampah ? (
                                <SelectContent>
                                  <SelectItem disabled value={null}>
                                    Loading...
                                  </SelectItem>
                                </SelectContent>
                              ) : (
                                <SelectContent>
                                  {listSampah.map((x, index) => (
                                    <SelectItem
                                      value={{
                                        idJenisSampah: null,
                                        kategori: x?.nama,
                                        nama: x?.nama,
                                      }}
                                      key={index}
                                    >
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
              )}
              <FormField
                control={form.control}
                name="idJenisSampah"
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
                            placeholder="Masukkan Nama"
                            disabled={disabled}
                            readOnly={fromBsu == 1 ? true : false}
                            style={
                              fromBsu == 1 ? { backgroundColor: "#e9ecef" } : ""
                            }
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
                name="hargaBsi"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Harga BSI*</FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <Input
                            type="number"
                            disabled={disabled}
                            readOnly={fromBsu == 1 ? true : false}
                            style={
                              fromBsu == 1 ? { backgroundColor: "#e9ecef" } : ""
                            }
                            placeholder="Masukkan Harga BSI"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="mt-1 text-xs" />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              {fromBsu == 1 ? (
                <FormField
                  control={form.control}
                  name="hargaBsu"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-baseline space-x-2 space-y-3">
                        <FormLabel className="w-1/3">Harga BSU*</FormLabel>
                        <div className="w-full">
                          <FormControl>
                            <Input
                              type="number"
                              disabled={disabled}
                              placeholder="Masukkan Harga BSU"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="mt-1 text-xs" />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              ) : (
                ""
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

export default JenisSampahForm;
