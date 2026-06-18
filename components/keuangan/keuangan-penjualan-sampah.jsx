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
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "../custom_ui/custom-button";
import { Toaster } from "../ui/toaster";
import { Button } from "../ui/button";
import { Label } from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import usePostForm from "@/hooks/usePostForm";
import { useCookies } from "react-cookie";
import { getIdUserCookies, isRoleBSU } from "@/lib/utils";
import { toast } from "../ui/use-toast";
import { useRouter } from "next/router";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "../ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import Image from "next/image";
import useFetch from "@/hooks/useFetch";
import KeuanganListJenisSampah from "./keuangan-jenis-sampah";

const formSchema = z.object({
  tanggal: z.date({
    required_error: "Tanggal harus diisi",
  }),
  nama: z.string().min(1, {
    message: "Nama Pengepul harus diisi",
  }),
  bsuId: z.string({
    required_error: "Bank Sampah harus dipilih",
  }),
  items: z
    .array(
      z.object({
        berat: z.number().min(0.1, "Berat harus lebih dari 0"),
        harga: z.number().min(1, "Harga harus lebih dari 0"),
        jenisSampahId: z.string(),
      })
    )
    .min(1, "Minimal harus ada 1 item penjualan"),
});

function KeuanganPenjualanSampahForm({
  data,
  disabled = false,
  fromBsu = 1,
  idBsu = null,
}) {
  const router = useRouter();
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(["currentUser"]);
  const userId = getIdUserCookies(cookies);
  const isRoleBsu = isRoleBSU(cookies);
  const [totalPenjualan, setTotalPenjualan] = useState(0);

  const {
    data: dataJenisSampah,
    error: errorJenisSampah,
    isLoading: isLoading,
  } = useFetch("/api/jenisSampah/getData/" + userId, {
    method: "GET",
  });

  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    if (search) {
      let filteredData = [];
      if (isRoleBsu) {
        filteredData = dataJenisSampah?.data?.bsu.filter((item) => {
          const lowerCaseSearch = search.toLowerCase();
          return item.nama.toLowerCase().includes(lowerCaseSearch);
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

  if (errorJenisSampah) {
    toast({
      variant: "destructive",
      title: "Gagal!",
      description: errorJenisSampah.message,
    });
  }

  const { postForm } = usePostForm();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tanggal: null,
      nama: "",
      bsuId: "",
      items: [],
    },
  });

  const { data: dataBankSampah, isLoading: isLoadingBankSampah } = useFetch(
    "/api/master/getBankSampah"
  );

  useEffect(() => {
    console.log("Data Bank Sampah:", dataBankSampah);
  }, [dataBankSampah]);

  const handleItemsChange = (items) => {
    form.setValue("items", items);

    // Hitung total penjualan
    const total = items.reduce((acc, item) => {
      return acc + parseFloat(item.berat) * parseFloat(item.harga);
    }, 0);
    setTotalPenjualan(total);
  };

  async function onSubmit(values) {
    setIsSubmitLoading(true);
    console.log("Form values:", values);

    try {
      const formData = {
        tanggal: values.tanggal,
        nama: values.nama,
        bsuId: parseInt(values.bsuId),
        penjualanItems: values.items.map((item) => ({
          berat: parseFloat(item.berat),
          harga: parseFloat(item.harga),
          jenisSampahId: item.jenisSampahId,
        })),
      };

      console.log("Sending data to API:", formData);

      const response = await postForm(
        "/api/keuangan/pemasukan/tambahPenjualan",
        formData
      );

      console.log("API Response:", response);

      setIsSubmitLoading(false);

      if (response.status !== 200) {
        toast({
          variant: "destructive",
          title: "Gagal!",
          description: response.message || "Penjualan Sampah Gagal Ditambahkan",
        });
      } else {
        toast({
          description: `Penjualan Sampah berhasil ditambahkan. Total penjualan: Rp ${totalPenjualan.toLocaleString(
            "id-ID"
          )}`,
        });
        router.push("/keuangan/" + userId);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsSubmitLoading(false);
      toast({
        variant: "destructive",
        title: "Error!",
        description: error.message || "Terjadi kesalahan. Silakan coba lagi.",
      });
    }
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardContent>
          <div className="space-y-3">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="bsuId"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-baseline space-x-2 space-y-3">
                        <FormLabel className="w-1/3">
                          Nama Bank Sampah
                        </FormLabel>
                        <div className="w-full">
                          <FormControl>
                            <Select
                              onValueChange={(value) => {
                                console.log("Selected Bank Sampah:", value);
                                field.onChange(value);
                              }}
                              value={field.value}
                              disabled={disabled}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="- Pilih Bank Sampah -">
                                    {
                                      dataBankSampah?.data?.find(
                                        (x) =>
                                          x?.idBsu &&
                                          field.value &&
                                          x.idBsu.toString() === field.value
                                      )?.nama
                                    }
                                  </SelectValue>
                                </SelectTrigger>
                              </FormControl>

                              <SelectContent>
                                {isLoadingBankSampah ? (
                                  <SelectItem disabled value="loading">
                                    Loading...
                                  </SelectItem>
                                ) : dataBankSampah?.data?.length > 0 ? (
                                  dataBankSampah.data.map((x) => {
                                    console.log("Bank Sampah item:", x);
                                    return (
                                      <SelectItem
                                        key={x.idBsu}
                                        value={x.idBsu.toString()}
                                      >
                                        {x.nama}
                                      </SelectItem>
                                    );
                                  })
                                ) : (
                                  <SelectItem disabled value="no-data">
                                    Tidak ada data bank sampah
                                  </SelectItem>
                                )}
                              </SelectContent>
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
                  name="tanggal"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-baseline space-x-2 space-y-3">
                        <FormLabel className="w-1/3">
                          Tanggal Penjualan Sampah
                        </FormLabel>
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
                                    <span>Pilih Tanggal</span>
                                  )}
                                  <CalendarIcon className="w-4 h-4 ml-auto opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
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
                  name="nama"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-baseline space-x-2 space-y-3">
                        <FormLabel className="w-1/3">Nama Pengepul</FormLabel>
                        <div className="w-full">
                          <FormControl>
                            <Input
                              disabled={disabled}
                              placeholder="Masukkan Nama Pengepul"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="mt-1 text-xs" />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                <Separator className="my-5" />

                {/* Search Input untuk Jenis Sampah */}
                <div className="mb-4">
                  <FormLabel className="text-base font-medium text-gray-900 mb-2 block">
                    Cari Jenis Sampah
                  </FormLabel>
                  <Input
                    placeholder="Ketik nama jenis sampah untuk mencari..."
                    value={search}
                    onChange={handleSearch}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {filtered.length} jenis sampah ditemukan
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="items"
                  render={() => (
                    <FormItem>
                      <KeuanganListJenisSampah
                        data={filtered}
                        isBsu={isRoleBSU ? 1 : 0}
                        onItemsChange={handleItemsChange}
                      />
                      <FormMessage className="mt-1 text-xs" />
                    </FormItem>
                  )}
                />

                {/* Ringkasan Total */}
                {/* {totalPenjualan > 0 && (
                  <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-semibold text-gray-900">
                        Total Penjualan Sampah:
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        Rp {totalPenjualan.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="text-sm text-gray-700">
                        Jumlah ini akan masuk ke tabel keuangan dengan tipe{" "}
                        <strong>"Penjualan Sampah"</strong>
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <p className="text-sm text-gray-700">
                        Saldo BSU akan otomatis bertambah sebesar nominal di
                        atas
                      </p>
                    </div>
                  </div>
                )} */}
                {!disabled && (
                  <div className="flex mt-5">
                    <CustomButton
                      type="submit"
                      className="ml-auto"
                      isLoading={isSubmitLoading}
                    >
                      Simpan
                    </CustomButton>
                  </div>
                )}
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}

export default KeuanganPenjualanSampahForm;
