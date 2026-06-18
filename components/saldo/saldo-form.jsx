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
} from "../../components/ui/form";
import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "../../components/custom_ui/custom-button";
import { Toaster } from "../../components/ui/toaster";
import { Button } from "../../components/ui/button";
import { cn } from "@/lib/utils";
import usePostForm from "@/hooks/usePostForm";
import { toast } from "../../components/ui/use-toast";
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
import { Separator } from "../../components/ui/separator";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { format } from "date-fns";
import { Calendar } from "../../components/ui/calendar";
import BackButton from "@/components/custom_ui/back-button";

Date.prototype.addHours = function (h) {
  this.setHours(this.getHours() + h);
  return this;
};

const formSchema = z.object({
  sumber: z.string().min(3, {
    message: "Saldo Pemasukkan Harus Diisi",
  }),
  suberMasuk: z.string().min(3, {
    message: "Saldo Pemasukkan Harud Diisi",
  }),
  tgl: z.date({
    required_error: "Tanggal Harus Diisi.",
  }),
});

function PenarikanForm({ data, disabled = false, idBsu = null, formBsu = 1 }) {
  const router = useRouter();
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const { postForm } = usePostForm();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idNasabah: data?.idNasabah,
      // bsuId: { idBsu: data?.bsuId, nama: data?.bsu.nama },
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
  async function onSubmit(value) {
    setIsSubmitLoading(true);
    // const response = await postForm("/api/signup/nasabah", tmpData);
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
        router.push("/keuangan");
      } else {
        router.push("/login");
      }
    }
    setIsSubmitLoading(false);
  }
  return (
    <Card>
      <CardContent>
        <div className="space-y-3 ">
          <Form {...form}>
            <form>
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
                              disabled={(
                                date //menonaktifkan tanggal berikutnya agar tidak dapat dipilih
                              ) => date > new Date()}
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
                name="saldo"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Jumlah Penarikan</FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <Input
                            disabled={disabled}
                            placeholder="Masukkan Jumlah Penarikan Saldo"
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
                name="metodePenarikan"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Metode Penarikan</FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="-Pilih Metode Penarikan-" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bri">Bank BRI</SelectItem>
                              <SelectItem value="bca">Bank BCA</SelectItem>
                              <SelectItem value="mandiri">
                                Bank Mandiri
                              </SelectItem>
                              <SelectItem value="bni">Bank BNI</SelectItem>
                              <SelectItem value="cash">
                                Tunai (Melalui Bank Sampah Unit Terdaftar)
                              </SelectItem>
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
                name="rekening"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-baseline space-x-2 space-y-3">
                      <FormLabel className="w-1/3">Nomor Rekening</FormLabel>
                      <div className="w-full">
                        <FormControl>
                          <Input
                            disabled={disabled}
                            placeholder="Masukkan Nomor Rekening"
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

export default PenarikanForm;
