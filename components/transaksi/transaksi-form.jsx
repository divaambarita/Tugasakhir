import { CardContent, Card } from "@/components/ui/card";
import { useCallback } from "react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "../custom_ui/custom-button";
import { Toaster } from "../ui/toaster";
import { useCookies } from "react-cookie";
import { getIdUserCookies, isRoleBSU } from "@/lib/utils";
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
import { Separator } from "../ui/separator";
import { useState, useEffect } from "react";
import ListJenisSampah from "@/components/transaksi/transaksi-list-jenis-sampah";

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

function TransaksiForm({
  data,
  disabled = false,
  idNasabah = null,
  fromBsu = 1,
}) {
  const router = useRouter();
  const [FileKtp, setFileKtp] = useState(null);
  // const { uploadFile } = useUploadFile();
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [beratSampah, setBeratSampah] = useState({});
  const [totalHarga, setTotalHarga] = useState({});
  const [cookies, setCookie, removeCookie] = useCookies(["currentUser"]);
  const userId = getIdUserCookies(cookies);
  const isRoleBsu = isRoleBSU(cookies);

  const {
    data: dataJenisSampah,
    error: errorJenisSampah,
    isLoading: isLoading,
  } = useFetch("/api/jenisSampah/getData/" + userId, {
    method: "GET",
  });

  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (search) {
      let filteredData = [];
      if (isRoleBsu) {
        filteredData = dataJenisSampah?.data?.bsu.filter((item) => {
          const lowerCaseSearch = search.toLowerCase();
          return (
            item.nama.toLowerCase().includes(lowerCaseSearch) ||
            item.hargasampahbsu.toString().includes(search)
          );
        });
      } else {
        filteredData = dataJenisSampah?.data?.bsi.filter((item) => {
          const lowerCaseSearch = search.toLowerCase();
          return item.nama.toLowerCase().includes(lowerCaseSearch);
        });
      }

      setFiltered(filteredData);
    } else {
      setFiltered(
        isRoleBsu
          ? dataJenisSampah?.data?.bsu ?? []
          : dataJenisSampah?.data?.bsi ?? []
      );
    }
  }, [search, dataJenisSampah?.data, isRoleBsu]);

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

  // Menggunakan API yang sesuai berdasarkan role user:
  // - Jika user adalah BSU: gunakan API khusus untuk nasabah BSU tersebut
  // - Jika user bukan BSU (admin/role lain): gunakan API umum untuk semua nasabah
  const { data: dataListNasabah, isLoading: isLoadingListNasabah } = useFetch(
    isRoleBsu && userId
      ? "/api/bsu/nasabah/getNasabah"
      : "/api/master/getNasabah",
    isRoleBsu && userId
      ? {
          method: "POST",
          body: JSON.stringify({
            idBsu: userId, // Menggunakan ID BSU dari user yang login
          }),
        }
      : {
          method: "GET",
        }
  );

  // Debug: Log data nasabah yang diterima
  useEffect(() => {
    if (dataListNasabah?.data) {
      console.log("Data nasabah loaded:", {
        isRoleBsu,
        userId,
        totalNasabah: dataListNasabah.data.length,
        data: dataListNasabah.data,
      });
    }
  }, [dataListNasabah, isRoleBsu, userId]);

  const { data: dataListSampah, isLoading: isLoadingListSampah } = useFetch(
    "/api/jenisSampah/getData/1"
  );
  const listSampah =
    fromBsu == 1 ? dataListSampah?.data : getKategoriSampah?.data;

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
    try {
      setIsSubmitLoading(true);

      // Validasi data sebelum submit
      if (!value.nasabah?.idNasabah) {
        toast({
          variant: "destructive",
          title: "Gagal!",
          description: "Silakan pilih nasabah terlebih dahulu",
        });
        return;
      }

      // Filter item yang memiliki berat
      const validItems = filtered
        .map((item, index) => ({
          idJenisSampah: item.idJenisSampah,
          berat: beratSampah[index] || 0,
          harga: totalHarga[index] || 0,
          hargaSatuan: isRoleBsu
            ? item.hargasampahbsu || 0
            : item.hargasampahbsi || 0,
        }))
        .filter((item) => item.berat > 0);

      if (validItems.length === 0) {
        toast({
          variant: "destructive",
          title: "Gagal!",
          description: "Silakan masukkan berat sampah minimal 1 item",
        });
        return;
      }

      let tmpData = {
        idNasabah: value.nasabah.idNasabah,
        tanggal: new Date().toISOString(),
        items: validItems,
      };

      if (fromBsu == 1) {
        tmpData.bsuId = userId;
      }

      const response = await postForm("/api/transaksi/store", tmpData);

      if (!response) {
        throw new Error("Gagal menyimpan transaksi");
      }

      if (response.status === 200) {
        toast({
          description: response.message || "Transaksi berhasil disimpan",
        });
        router.push("/transaksi");
      } else {
        toast({
          variant: "destructive",
          title: "Gagal!",
          description:
            response.message || "Terjadi kesalahan saat menyimpan transaksi",
        });
      }
    } catch (error) {
      console.error("Error submitting transaction:", error);
      toast({
        variant: "destructive",
        title: "Gagal!",
        description:
          error.message || "Terjadi kesalahan saat menyimpan transaksi",
      });
    } finally {
      setIsSubmitLoading(false);
    }
  }

  const currentDate = new Date().toLocaleString("id-ID", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-3">
      <Card>
        <CardContent>
          <div className="space-y-3">
            <Form {...form}>
              <form>
                <FormField
                  control={form.control}
                  name="nasabah"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-baseline space-x-2 space-y-3">
                        <FormLabel className="w-1/3">Nama Nasabah</FormLabel>
                        <div className="w-full">
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value="idNasabah"
                              disabled={disabled}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue>
                                    {field.value?.nama || "- Pilih Nasabah -"}
                                  </SelectValue>
                                </SelectTrigger>
                              </FormControl>

                              {isLoadingListNasabah ? (
                                <SelectContent>
                                  <SelectItem disabled value={null}>
                                    Loading...
                                  </SelectItem>
                                </SelectContent>
                              ) : dataListNasabah?.data &&
                                dataListNasabah.data.length > 0 ? (
                                <SelectContent>
                                  {idNasabah
                                    ? dataListNasabah.data
                                        ?.filter(function (obj) {
                                          return obj.idNasabah == idNasabah;
                                        })
                                        .map((x) => (
                                          <SelectItem
                                            key={x.idNasabah}
                                            value={x}
                                          >
                                            {x.nama}
                                          </SelectItem>
                                        ))
                                    : dataListNasabah.data.map((x) => (
                                        <SelectItem key={x.idNasabah} value={x}>
                                          {x.nama}
                                        </SelectItem>
                                      ))}
                                </SelectContent>
                              ) : (
                                <SelectContent>
                                  <SelectItem disabled value={null}>
                                    {isRoleBsu
                                      ? "Tidak ada nasabah terdaftar di BSU ini"
                                      : "Tidak ada data nasabah"}
                                  </SelectItem>
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
                <ListJenisSampah
                  data={filtered}
                  isBsu={isRoleBsu ? 1 : 0}
                  beratSampah={beratSampah}
                  setBeratSampah={setBeratSampah}
                  totalHarga={totalHarga}
                  setTotalHarga={setTotalHarga}
                />

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
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TransaksiForm;
