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
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "../custom_ui/custom-button";
import { Toaster } from "../ui/toaster";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import usePostForm from "@/hooks/usePostForm";
import { toast } from "../ui/use-toast";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { isRoleBSU } from "@/lib/utils";
import { useCookies } from "react-cookie";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";

Date.prototype.addHours = function (h) {
  this.setHours(this.getHours() + h);
  return this;
};

const formSchema = z.object({
  nasabahId: z.preprocess(
    (val) => parseInt(val, 10),
    z.number().min(1, {
      message: "Nasabah ID Harus Diisi",
    })
  ),
  tanggalPenarikan: z.date({
    required_error: "Tanggal Penarikan Harus Diisi.",
  }),
  totalPenarikan: z.number().min(1, {
    message: "Total Penarikan Harus Diisi",
  }),
  metodePembayaran: z
    .string()
    .min(3, {
      message: "Metode Pembayaran Harus Diisi",
    })
    .default("Tunai"),
});

function PenarikanSaldoForm({
  data,
  disabled = false,
  idBsu = 4,
  formBsu = 1,
}) {
  const router = useRouter();
  const [cookies] = useCookies(["currentUser"]);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const { postForm } = usePostForm();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nasabahId: data?.nasabahId,
      tanggalPenarikan: data?.tanggalPenarikan,
      totalPenarikan: data?.totalPenarikan,
      metodePembayaran: data?.metodePembayaran,
    },
  });
  const [dataListNasabah, setDataListNasabah] = useState([]);
  const [isLoadingListNasabah, setIsLoadingListNasabah] = useState(true);

  useEffect(() => {
    async function fetchNasabah() {
      try {
        // Ambil ID BSU dari cookies
        const userId = cookies.currentUser?.idAkun;

        if (!userId) {
          console.log("User ID tidak ditemukan");
          return;
        }

        // Gunakan API yang sudah ada untuk mendapatkan nasabah berdasarkan BSU
        const response = await fetch("/api/bsu/nasabah/getNasabah", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies.currentUser?.token}`,
          },
          body: JSON.stringify({
            idBsu: userId,
          }),
        });

        const result = await response.json();

        if (result.success) {
          setDataListNasabah(result.data || []);
          console.log(
            "Nasabah berhasil dimuat:",
            result.data?.length || 0,
            "nasabah"
          );
        } else {
          console.error("Error dari API:", result.message);
          toast({
            variant: "destructive",
            title: "Gagal!",
            description: result.message || "Gagal mengambil data nasabah.",
          });
        }
      } catch (error) {
        console.error("Error fetching nasabah:", error);
        toast({
          variant: "destructive",
          title: "Gagal!",
          description: "Terjadi kesalahan saat mengambil data nasabah.",
        });
      } finally {
        setIsLoadingListNasabah(false);
      }
    }

    if (cookies.currentUser?.idAkun) {
      fetchNasabah();
    }
  }, [cookies]);

  useEffect(() => {
    if (!isRoleBSU(cookies)) {
      router.push("/saldo");
    }
  }, [cookies, router]);

  const formatRupiah = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const parseRupiah = (value) => {
    return parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
  };

  async function onSubmit(value) {
    setIsSubmitLoading(true);

    // Validasi saldo nasabah
    const selectedNasabah = dataListNasabah.find(
      (nasabah) => nasabah.idNasabah.toString() === value.nasabahId.toString()
    );

    if (selectedNasabah && selectedNasabah.saldo < value.totalPenarikan) {
      setIsSubmitLoading(false);
      toast({
        variant: "destructive",
        title: "Gagal!",
        description: `Saldo nasabah (${formatRupiah(
          selectedNasabah.saldo
        )}) tidak mencukupi untuk penarikan sebesar ${formatRupiah(
          value.totalPenarikan
        )}.`,
      });
      return;
    }

    // Hapus statusKonfirmasi karena langsung berhasil
    // value.statusKonfirmasi = "Pending";
    if (value.tanggalPenarikan != null || value.tanggalPenarikan != undefined) {
      value.tanggalPenarikan = new Date(value.tanggalPenarikan)
        .addHours(7)
        .toISOString()
        .toString();
    }
    const response = await postForm("/api/penarikan/storePenarikan", value);
    if (response.status != 200) {
      setIsSubmitLoading(false);
      toast({
        variant: "destructive",
        title: "Gagal!",
        description: response.message,
      });
    } else {
      toast({
        description:
          "Penarikan berhasil diproses dan saldo nasabah telah dikurangi.",
      });
      router.push("/penarikan-saldo");
    }
  }

  return (
    <Card>
      <CardContent>
        <div className="space-y-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="nasabahId"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Nasabah</FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <Controller
                            name="nasabahId"
                            control={form.control}
                            render={({ field }) => (
                              <Select
                                onValueChange={field.onChange}
                                value={
                                  field.value ? field.value.toString() : ""
                                }
                                disabled={disabled}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih Nasabah" />
                                </SelectTrigger>
                                <SelectContent>
                                  {isLoadingListNasabah ? (
                                    <SelectItem disabled value="loading">
                                      Loading...
                                    </SelectItem>
                                  ) : dataListNasabah.length > 0 ? (
                                    dataListNasabah.map((nasabah) => (
                                      <SelectItem
                                        key={nasabah.idNasabah}
                                        value={nasabah.idNasabah.toString()}
                                      >
                                        {nasabah.nama} - Saldo:{" "}
                                        {formatRupiah(nasabah.saldo || 0)}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem disabled value="no-data">
                                      Tidak ada nasabah tersedia
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            )}
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
                name="tanggalPenarikan"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Tanggal Penarikan</FormLabel>
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
                name="totalPenarikan"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Total Penarikan</FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <Controller
                            name="totalPenarikan"
                            control={form.control}
                            render={({ field }) => (
                              <input
                                type="text"
                                id="totalPenarikan"
                                {...field}
                                value={formatRupiah(field.value || 0)}
                                onChange={(e) =>
                                  field.onChange(parseRupiah(e.target.value))
                                }
                                disabled={disabled}
                                className="border border-gray-300 rounded p-2 w-full"
                              />
                            )}
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
                name="metodePembayaran"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Metode Pembayaran</FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <Controller
                            name="metodePembayaran"
                            control={form.control}
                            render={({ field }) => (
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || "Tunai"}
                                disabled={disabled}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih Metode Pembayaran" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Tunai">Tunai</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </FormControl>
                        <FormMessage className="mt-1 text-xs" />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <CustomButton
                type="submit"
                disabled={isSubmitLoading || disabled}
              >
                {isSubmitLoading ? "Loading..." : "Submit"}
              </CustomButton>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}

export default PenarikanSaldoForm;
