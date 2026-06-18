import Link from "next/link";
import Image from "next/image";
import {
  UploadIcon,
  BadgeCheck,
  CircleUser,
  Home,
  Menu,
  Package,
  ShoppingCart,
  Trash,
  User,
  UserCircle,
  Users,
  Users2,
  Receipt,
  HandshakeIcon,
  AlignEndHorizontal,
  BookUp,
  Monitor,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import { cn, getRoleNameUserCookies, isStatusRejected } from "@/lib/utils";
import { useRouter } from "next/router";
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import Head from "next/head";
import { list } from "postcss";

function ListSideBar() {
  const [cookies, setCookie, removeCookie] = useCookies(["currentUser"]);

  const defaultNavbarContent = [
    // {
    //   title: 'Monitoring',
    //   icon: Home,
    //   key: 'all',
    //   href: 'monitoring',
    // },
    // {
    //   title: "Papan Peringkat",
    //   icon: AlignEndHorizontal,
    //   key: "bsu",
    //   href: "leaderboard",
    // },
    {
      title: "Tugas Survey",
      key: "verifikasi",
      icon: BadgeCheck,
      href: "survey",
    },
    {
      title: "Penarikan Saldo",
      key: "saldo",
      icon: UploadIcon,
      href: "saldo",
    },
    {
      title: "Verifikasi Pendaftaran",
      key: "approver",
      icon: BadgeCheck,
      href: "approver",
    },
    {
      title: "Keuangan",
      key: "keuangan",
      icon: Receipt,
      href: "keuangan",
    },
    {
      title: "Transaksi",
      key: "transaksi",
      icon: HandshakeIcon,
      href: "transaksi",
    },
    // {
    //   title: "Daftar Nasabah",
    //   key: "bsu",
    //   icon: Users,
    //   href: "nasabah",
    // },
    // {
    //   title: "Daftar Pengurus",
    //   icon: Users2,
    //   key: "bsu",
    //   href: "pengurus",
    // },
  ];
  const [listData, setList] = useState([]);
  if (cookies.currentUser) {
    getRoleNameUserCookies(cookies).then(function (res) {
      let listSide = [];
      res.push("all");

      if (isStatusRejected(cookies)) {
        listSide.push({
          title: "Dashboard",
          icon: Home,
          key: "all",
          href: "dashboard",
        });
        return setList(listSide);
      }

      if (cookies.currentUser?.roleName == "bsu") {
        listSide.push({
          title: "Dashboard",
          icon: Monitor,
          key: "bsu",
          href: "monitoring/bsu",
        });
        listSide.push({
          title: "Papan Peringkat",
          icon: AlignEndHorizontal,
          key: "bsu",
          href: "leaderboard",
        });
        listSide.push({
          title: "Profile",
          icon: User,
          key: "profile",
          href: "profile/" + cookies.currentUser?.idAkun,
        });
        listSide.push({
          title: "Keuangan",
          icon: Receipt,
          key: "keuangan",
          href: "keuangan/" + cookies.currentUser?.idAkun,
        });
        listSide.push({
          title: "Transaksi",
          icon: HandshakeIcon,
          key: "transaksi",
          href: "transaksi",
        });
        listSide.push({
          title: "Penarikan Saldo Nasabah",
          icon: BookUp,
          key: "bsu",
          href: "penarikan-saldo",
        });
            listSide.push({
          title: "Daftar Nasabah",
          icon: Users,
          key: "bsu",
          href: "nasabah",
        });
        listSide.push({
          title: "Daftar Pengurus",
          icon: Users2,
          key: "bsu",
          href: "pengurus",
        });
      }

      if (cookies.currentUser?.roleName == "admin") {
        listSide.push({
          title: "Dashboard",
          icon: Monitor,
          key: "bsi",
          href: "admin/monitoring",
        });
        listSide.push({
          title: "Daftar Nasabah",
          icon: Users,
          key: "bsi",
          href: "nasabah",
        });
        listSide.push({
          title: "Daftar Pengurus",
          icon: Users2,
          key: "bsi",
          href: "pengurus",
        });
        listSide.push({
          title: "Daftar Jenis Sampah",
          icon: Trash,
          key: "bsi",
          href: "admin/jenis-sampah",
        });
        listSide.push({
          title: "Daftar Bank Sampah Unit",
          icon: UserCircle,
          key: "bsi",
          href: "admin/bsu",
        });
      }

      defaultNavbarContent.forEach((x) => {
        if (res.includes(x.key)) {
          listSide.push(x);
        }
      });
      if (cookies.currentUser?.roleName == "bsu") {
        listSide.push({
          title: "Daftar Jenis Sampah",
          icon: Trash,
          key: "bsu",
          href: "jenis-sampah",
        });
      }
      if (cookies.currentUser?.roleName == "nasabah") {
        listSide.push({
          title: "Penarikan Saldo",
          icon: UploadIcon,
          key: "saldo",
          href: "saldo",
        });
        // listSide.push({
        //   title: "Monitoring",
        //   icon: Monitor,
        //   key: "nasabah",
        //   href: "monitoring/" + cookies.currentUser?.idAkun,
        // });
      }
      if (listData.length == 0) {
        setList(listSide);
      }
    });
  }
  return listData;
}

export function Layout({ children, navbarContent = null, pageTitle = null }) {
  /**
   * Mendapatkan nama path terakhir dari URL.
   * @type {string}
   */
  const pathname = usePathname();
  const router = useRouter();
  const [cookies, setCookie, removeCookie] = useCookies(["currentUser"]);

  const toAppHref = (href) => {
    if (!href) return "/";
    return href.startsWith("/") ? href : `/${href}`;
  };

  const logOut = () => {
    removeCookie("currentUser");
    router.push("/login");
  };
  if (navbarContent == null) {
    navbarContent = ListSideBar();
  }

  let normalizePathname = pathname ? pathname.slice(1, pathname.length) : ""; // remove first slash if pathname is not null

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Head>
        <title>{pageTitle ? `${pageTitle} | Netrash` : "Netrash"}</title>
      </Head>
      <div className="hidden border-r bg-muted/40 md:block bg-green">
        <div className="flex flex-col h-full max-h-screen gap-2">
          <div className="flex h-14 items-center px-4 lg:h-[100px] lg:px-6">
            <div className="flex justify-center items-center mt-10 mb-10 mx-auto">
              <Link href={"/dashboard"}>
                <Image
                  src={"/netrash.png"}
                  alt="netrash logo"
                  width={110}
                  height={110}
                />
              </Link>
            </div>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4 mt-5">
              {navbarContent.map((item) => (
                <Link
                  key={item.title}
                  href={toAppHref(item.href)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 transition-all rounded-lg text-muted-foreground hover:text-primary",
                    normalizePathname === item.href && "bg-selected"
                  )}
                >
                  {item.icon && (
                    <item.icon className="w-4 h-4 text-brandAccent" />
                  )}
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[100px] lg:px-6">
          <Image src={"/uplogo.png"} alt="eswka" width={150} height={150} />

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="w-5 h-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              {/* Mobile Nav */}
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="#"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <span className="">NetTrash</span>
                </Link>
                {navbarContent.map((item) => (
                  <Link
                    key={item.title}
                    href={toAppHref(item.href)}
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    {item.icon && (
                      <item.icon className="w-5 h-5 text-brandAccent" />
                    )}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full"
                >
                  <CircleUser className="w-10 h-10" />
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={logOut}>Keluar</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex flex-col flex-1 gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
