import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import CustomButton from "@/components/custom_ui/custom-button";
import { useCookies } from "react-cookie";
import { useRouter } from "next/router";
import postForm from "@/hooks/postForm";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

const userSchema = z.object({
  noTelp: z.string().min(1, {
    message: "Nomor Telp atau E-mail tidak boleh kosong!",
  }),
  password: z.string().min(6, {
    message: "Password minimal 6 karakter!",
  }),
});

export default function Login() {
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(["currentUser"]);

  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      noTelp: "",
      password: "",
    },
  });

  async function onSubmit(values) {
    setIsSubmitLoading(true);
    try {
      const { data, error } = await postForm("/api/login", values);
  
      if (error) {
        toast({
          variant: "destructive",
          title: "Gagal!",
          description: error.message,
        });
      } else {
        toast({
          description: data.message,
        });
  
        setCookie("currentUser", data.data);
        const userRole = data.data.roleName; 
        if (userRole === "bsu") {
          router.push("/monitoring/bsu"); 
        } else if (userRole === "admin") {
          router.push("/admin/monitoring"); 
        } else if (userRole === "nasabah") {
          router.push("/saldo"); 
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error!",
        description: "Terjadi kesalahan saat login.",
      });
    } finally {
      setIsSubmitLoading(false);
    }
  }

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="hidden p-32 lg:block">
        <div className="flex">
          <Image src={"/netrash.png"} alt="simbaci" width={150} height={150} />
          <Image src={"/uplogo.png"} alt="eswka" width={150} height={150} />
        </div>
        <div className="mt-10">
          <h2 className="pb-2 text-3xl font-semibold tracking-tight scroll-m-20 first:mt-0">
            Mari Bergabung Bersama
          </h2>
          <h1 className="text-4xl font-extrabold tracking-tight scroll-m-20 lg:text-5xl">
            NeTrash!
          </h1>
          <p className="leading-7 [&:not(:first-child)]:mt-6">
            Bersama kita wujudkan dunia yang lebih bersih dan hijau menuju NET
            ZERO TRASH! 🌱💚. Setiap langkah kecilmu dalam mengelola sampah
            adalah langkah besar untuk bumi. Yuk, jadikan perubahan dimulai dari
            kita!
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[400px] gap-6 p-6 border border-white-100 shadow-lg rounded-lg">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Log in</h1>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="noTelp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Telepon</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Masukkan Nomor Telepon"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Masukkan Password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <CustomButton
                  isLoading={isSubmitLoading}
                  type="submit"
                  className="w-full"
                >
                  Login
                </CustomButton>
              </div>
            </form>
            <Toaster />
          </Form>
          <div className="mt-4 text-sm text-center">
            Belum Memiliki Akun?{" "}
              <Link href="/signup/nasabah" className="underline text-primary">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
