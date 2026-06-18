import { Layout } from "@/components/layout/layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown } from "lucide-react";
import { useCookies } from "react-cookie";
import { getIdUserCookies, isRoleBSU } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import ChartSampah from "@/components/monitoring/bsu/chart-sampah";
import StatisticDataSampah from "@/components/monitoring/bsu/statistic-data-sampah";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import * as React from "react";
import {
  useHydration,
  useSafeCookies,
  useSafeDate,
} from "@/hooks/useHydration";

export default function MonitoringPage() {
  const [cookies] = useCookies(["currentUser"]);
  const hasMounted = useHydration();
  const { idBsu, namaBsu, isReady: cookiesReady } = useSafeCookies(cookies);
  const { currentYear, currentMonth, isReady: dateReady } = useSafeDate();

  const [filterYear, setFilterYear] = useState(2025);
  const [filterMonth, setFilterMonth] = useState(1);
  const [transactions, setTransactions] = useState([]);

  // Update filter values when date is ready
  useEffect(() => {
    if (dateReady) {
      setFilterYear(currentYear);
      setFilterMonth(currentMonth);
    }
  }, [dateReady, currentYear, currentMonth]);

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

    if (idBsu && hasMounted && cookiesReady) {
      fetchTransactions();
    }
  }, [idBsu, filterYear, filterMonth, hasMounted, cookiesReady]);

  // Don't render until fully mounted and ready to prevent hydration mismatch
  if (!hasMounted || !cookiesReady || !dateReady) {
    return (
      <Layout>
        <div className="text-2xl font-bold text-center mb-4">Loading...</div>
      </Layout>
    );
  }

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
                  : `Bulan: ${new Date(
                      currentYear,
                      filterMonth - 1
                    ).toLocaleString("id-ID", { month: "long" })}`}
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
                  {new Date(currentYear, index).toLocaleString("id-ID", {
                    month: "long",
                  })}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <ChartSampah filterYear={filterYear} filterMonth={filterMonth} />
          <StatisticDataSampah
            filterYear={filterYear}
            filterMonth={filterMonth}
          />
        </div>
      </ScrollArea>
      <Toaster />
    </Layout>
  );
}
