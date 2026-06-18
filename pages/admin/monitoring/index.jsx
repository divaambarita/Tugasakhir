import { Layout } from "@/components/layout/layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import useFetch from "@/hooks/useFetch";
import { useCookies } from "react-cookie";
import { getIdUserCookies, isRoleBSU } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import CustomButton from "@/components/custom_ui/custom-button";
import Link from "next/link";
import JenisSampahDataTable from "@/components/jenis-sampah/jenis-sampah-data-table";
import { useEffect, useState } from "react";
import SearchInput from "@/components/custom_ui/search-input";
import TransaksiDataTable from "@/components/transaksi/transaksi-data-table";
import SesiTransaksiDataTable from "@/components/transaksi/sesi-transaksi-data-table";
import ChartSampah from "@/components/monitoring/bsi/chart-sampah";
import TableSampahPerDay from "@/components/monitoring/bsu/table-sampah-per-day";
// import StatisticDataSampah from "@/components/monitoring/bsi/statistic-data-sampah";
import RankingTableSaldo from "@/components/monitoring/bsu/ranking-table-saldo";
import RankingTableSaldoNasabah from "@/components/monitoring/bsu/ranking-table-saldo-nasabah";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import * as React from "react";

export default function MonitoringPage() {
  const [cookies] = useCookies(["currentUser"]);
  const idBsu = getIdUserCookies(cookies);
  const namaBsu = cookies.currentUser?.nama ;

  const currentYear = new Date().getFullYear();

  const [filterYear, setFilterYear] = useState(currentYear);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        let apiUrl = `/api/monitoring/sampah/bsu/${idBsu}`;
        if (filterYear !== "all") {
          apiUrl += `?year=${filterYear}`;
          if (filterMonth !== "all") {
            apiUrl += `&month=${filterMonth}`;
          }
        } else if (filterMonth !== "all") {
          apiUrl += `?month=${filterMonth}`;
        }

        const res = await fetch(apiUrl);
        const result = await res.json();
        if (result.success) {
          setTransactions(result.data.transactions);
        } else {
          throw new Error("Gagal mengambil data transaksi");
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      }
    };

    if (idBsu) {
      fetchTransactions();
    }
  }, [idBsu, filterYear, filterMonth]);

  return (
    <Layout>
      <div className="text-2xl font-bold text-center mb-4">
        Monitoring Bank Sampah {namaBsu}
      </div>
      <ScrollArea>
        <div className="flex gap-4 mb-4 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                {filterYear === "all"
                  ? "Seluruh Tahun"
                  : `Tahun: ${filterYear}`}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setFilterYear("all")}>
                Seluruh Tahun
              </DropdownMenuItem>
              {[...Array(currentYear - 1998)].map((_, index) => {
                const year = currentYear - index;
                return (
                  <DropdownMenuItem
                    key={year}
                    onClick={() => setFilterYear(year)}
                  >
                    {year}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                {filterMonth === "all"
                  ? "Seluruh Bulan"
                  : `Bulan: ${new Date(2023, filterMonth - 1).toLocaleString(
                      "id-ID",
                      { month: "long" }
                    )}`}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setFilterMonth("all")}>
                Seluruh Bulan
              </DropdownMenuItem>
              {[...Array(12)].map((_, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => setFilterMonth(index + 1)}
                >
                  {new Date(2023, index).toLocaleString("id-ID", {
                    month: "long",
                  })}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <ChartSampah filterYear={filterYear} filterMonth={filterMonth}/>
          {/* <StatisticDataSampah filterYear={filterYear} filterMonth={filterMonth} /> */}
        </div>
      </ScrollArea>
      <Toaster />
    </Layout>
  );
}
