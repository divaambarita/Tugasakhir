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
import { Label } from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import usePostForm from "@/hooks/usePostForm";
import useUploadFile from "@/hooks/useUploadFile";
import { useCookies } from "react-cookie";
import { getIdUserCookies } from "@/lib/utils";
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

Date.prototype.addHours = function (h) {
  this.setHours(this.getHours() + h);
  return this;
};

const formSchema = z.object({
  tanggal: z.date({
    message: "Tanggal Pemasukan Harus Diisi",
  }),
  tujuan: z.string().min(3, {
    message: "Tujuan Pemasukan Harus Diisi",
  }),
  saldo: z.string().min(3, {
    required_error: "Masukkan Nominal Saldo Pemasukan",
  }),
});

function KeuanganPemasukanForm({
  data,
  disabled = false,
  idBsu = null,
  formBsu = 1,
}) {
  const router = useRouter();
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(["currentUser"]);
  const { postForm } = usePostForm();
  const userId = getIdUserCookies(cookies);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idpemasukan: data?.idpemasukan,
      bsuId: { idBsu: data?.bsuId, nama: data?.bsu.nama },
      tanggal: data?.tanggal,
      tujuan: data?.tujuan,
      saldo: data?.saldo,
      keterangan: data?.keterangan,
    },
  });

  const { data: dataBankSampah, isLoading: isLoadingBankSampah } = useFetch(
    "/api/master/getBankSampah"
  );

  async function onSubmit(value) {
    setIsSubmitLoading(true);
    let tanggal = null;
    if (value.tanggal != null || value.tanggal != undefined) {
      tanggal = new Date(value.tanggal)
        .addHours(7)
        .toISOString()
        .toString();
    }
    const tmpData = {
      idpemasukan: value?.idpemasukan,
      bsuId: value.bsuId?.idBsu,
      tanggal: tanggal,
      tujuan: value.tujuan,
      saldo: value.saldo,
      keterangan: value.keterangan,
    };
    let url = "/api/keuangan/pemasukan/tambahPemasukanLainnya";
    if (!data) {
      delete tmpData.idpemasukan;
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
      router.push("/keuangan/" + cookies.currentUser?.idAkun);
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
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Nama Bank Sampah</FormLabel>
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
                name="tanggal"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Tanggal</FormLabel>
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
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date()}
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
                name="tujuan"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Sumber Pemasukkan</FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <Input
                            disabled={disabled}
                            placeholder="Masukkan Sumber Pemasukkan"
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
                name="saldo"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Nominal Pemasukan</FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <Input
                            disabled={disabled}
                            placeholder="Masukkan Nominal Pemasukan"
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
                name="keterangan"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Keterangan</FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <Input
                            disabled={disabled}
                            placeholder="Masukkan Keterangan"
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

export default KeuanganPemasukanForm;
