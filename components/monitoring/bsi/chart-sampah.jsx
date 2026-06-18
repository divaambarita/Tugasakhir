import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartJS from "chart.js/auto";
import { useCookies } from "react-cookie";
import { getIdUserCookies } from "@/lib/utils";
import {
  Leaf,
  FileText,
  FlameKindling,
  Users,
  DollarSign,
  Trash2,
  CloudDrizzle,
} from "lucide-react";
import {
  FaTshirt,
  FaRecycle,
  FaCog,
  FaLifeRing,
  FaGlassWhiskey,
} from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const categories = [
  "Limbah B3",
  "Sampah Organik (Mudah Terurai)",
  "Sampah Anorganik (Plastik)",
  "Sampah Anorganik (Kertas)",
  "Sampah Anorganik (Logam)",
  "Sampah Anorganik (Kaca)",
  "Sampah Anorganik (Karet)",
  "Sampah Anorganik (Tekstil)",
];

const categoryIcons = {
  "Limbah B3": FlameKindling,
  "Sampah Organik (Mudah Terurai)": Leaf,
  "Sampah Anorganik (Plastik)": FaRecycle,
  "Sampah Anorganik (Kertas)": FileText,
  "Sampah Anorganik (Logam)": FaCog,
  "Sampah Anorganik (Kaca)": FaGlassWhiskey,
  "Sampah Anorganik (Karet)": FaLifeRing,
  "Sampah Anorganik (Tekstil)": FaTshirt,
};

const ChartSampah = ({ filterYear, filterMonth }) => {
  const [cookies] = useCookies(["currentUser"]);
  const idBsu = getIdUserCookies(cookies);

  const [chartData, setChartData] = useState(null);
  const [jenisSampahData, setJenisSampahData] = useState({});
  const [totalBerat, setTotalBerat] = useState(0);
  const [totalEmisi, setTotalEmisi] = useState(0);
  const [totalNasabah, setTotalNasabah] = useState(0);
  const [totalBSU, setTotalBSU] = useState(0); // Tambahkan state baru
  const [totalHargaKeseluruhan, setTotalHargaKeseluruhan] = useState(0); // Tambahkan state baru

  useEffect(() => {
    const fetchData = async () => {
      try {
        let apiUrl = `/api/monitoring/sampah/bsi/getMonitoringBsi`;
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
          const data = [];
          const jenisSampahDataTemp = {};
          let totalBeratTemp = 0;
          let totalEmisiTemp = 0;

          const {
            beratPerKategoriByMonthYear,
            emisiKarbonPerKategoriByMonthYear,
            totalHargaKeseluruhan,
            totalBSU, // Ambil totalBSU dari API
          } = result.data;

          Object.keys(beratPerKategoriByMonthYear).forEach((key) => {
            const [year, month] = key.split("-");
            if (
              (filterYear === "all" || parseInt(year) === filterYear) &&
              (filterMonth === "all" || parseInt(month) === filterMonth)
            ) {
              Object.keys(beratPerKategoriByMonthYear[key]).forEach(
                (kategori) => {
                  if (kategori !== "totalKeseluruhan") {
                    const berat = beratPerKategoriByMonthYear[key][kategori];
                    const emisi =
                      emisiKarbonPerKategoriByMonthYear[key][kategori];
                    data.push({
                      bulan: month,
                      tahun: parseInt(year),
                      totalBerat: berat,
                      totalEmisiKarbon: emisi,
                      jenisSampah: kategori,
                    });
                    if (!jenisSampahDataTemp[kategori]) {
                      jenisSampahDataTemp[kategori] = { totalBerat: 0 };
                    }
                    jenisSampahDataTemp[kategori].totalBerat += berat;
                    totalBeratTemp += berat;
                    totalEmisiTemp += emisi;
                  }
                }
              );
            }
          });

          setChartData(data);
          setJenisSampahData(jenisSampahDataTemp);
          setTotalBerat(totalBeratTemp);
          setTotalEmisi(totalEmisiTemp);
          setTotalNasabah(result.data.totalNasabah);
          setTotalHargaKeseluruhan(totalHargaKeseluruhan);
          setTotalBSU(totalBSU); // Simpan totalBSU ke state
        } else {
          throw new Error("Failed to fetch data");
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      }
    };

    if (idBsu) {
      fetchData();
    }
  }, [idBsu, filterYear, filterMonth]);

  if (!chartData) {
    return <p>Loading...</p>;
  }

  const chartDataFormatted = {
    labels: [
      ...new Set(chartData.map((item) => `${item.bulan}-${item.tahun}`)),
    ],
    datasets: [
      {
        label: "Total Berat Sampah",
        data: chartData.reduce((acc, item) => {
          const label = `${item.bulan}-${item.tahun}`;
          if (!acc[label]) acc[label] = 0;
          acc[label] += item.totalBerat;
          return acc;
        }, {}),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Total Emisi Karbon",
        data: chartData.reduce((acc, item) => {
          const label = `${item.bulan}-${item.tahun}`;
          if (!acc[label]) acc[label] = 0;
          acc[label] += item.totalEmisiKarbon;
          return acc;
        }, {}),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
      },
    ],
  };

  const getCombinedBarChartData = () => {
    const labels = [
      ...new Set(chartData.map((item) => `${item.bulan}-${item.tahun}`)),
    ];

    const datasets = categories.map((kategori) => {
      const data = labels.map((label) => {
        const [bulan, tahun] = label.split("-");
        const totalBerat = chartData
          .filter(
            (item) =>
              item.jenisSampah === kategori &&
              item.bulan === bulan &&
              item.tahun === parseInt(tahun)
          )
          .reduce((sum, item) => sum + item.totalBerat, 0);
        return totalBerat;
      });

      return {
        label: kategori,
        data,
        backgroundColor: getCategoryColor(kategori), 
      };
    });

    return {
      labels,
      datasets,
    };
  };

  const getCategoryColor = (kategori) => {
    const colors = {
      "Limbah B3": "rgba(255, 99, 132, 0.6)",
      "Sampah Organik (Mudah Terurai)": "rgba(54, 162, 235, 0.6)",
      "Sampah Anorganik (Plastik)": "rgba(255, 206, 86, 0.6)",
      "Sampah Anorganik (Kertas)": "rgba(75, 192, 192, 0.6)",
      "Sampah Anorganik (Logam)": "rgba(153, 102, 255, 0.6)",
      "Sampah Anorganik (Kaca)": "rgba(255, 159, 64, 0.6)",
      "Sampah Anorganik (Karet)": "rgba(199, 199, 199, 0.6)",
      "Sampah Anorganik (Tekstil)": "rgba(255, 99, 71, 0.6)",
    };
    return colors[kategori] || "rgba(0, 0, 0, 0.6)";
  };

  <Card>
    <CardHeader className="flex items-center justify-between">
      <CardTitle>Total Emisi Karbon per Kategori</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {categories.map((kategori) => {
          const Icon = categoryIcons[kategori];
          return (
            <Card key={kategori} className="flex items-center gap-4 p-4">
              <div className="flex items-center justify-center w-12 h-12">
                {Icon ? (
                  <Icon className="text-black-500 text-xl" />
                ) : (
                  "Ikon Tidak Ditemukan"
                )}
              </div>
              <div>
                <p className="text-lg font-semibold">{kategori}</p>
                <p className="text-lg">
                  {chartData
                    .filter((item) => item.jenisSampah === kategori)
                    .reduce((sum, item) => sum + item.totalEmisiKarbon, 0)
                    .toFixed(2)}{" "}
                  kg CO2-eq
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </CardContent>
  </Card>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="flex items-center gap-6 p-6">
          <div className="flex items-center justify-center w-12 h-12 ">
            <Users className="text-black-500 text-xl" />
          </div>
          <div>
            <p className="text-2xl font-semibold">Total Nasabah</p>
            <p className="text-xl">{totalNasabah} Orang</p>
          </div>
        </Card>
        <Card className="flex items-center gap-6 p-6">
          <div className="flex items-center justify-center w-12 h-12">
            <Users className="text-black-500 text-xl" />
          </div>
          <div>
            <p className="text-2xl font-semibold">Total BSU</p>
            <p className="text-xl">{totalBSU} Unit</p>
          </div>
        </Card>
        <Card className="flex items-center gap-6 p-6">
          <div className="flex items-center justify-center w-12 h-12">
            <Trash2 className="text-black-500 text-xl" />
          </div>
          <div>
            <p className="text-2xl font-semibold">Total Sampah Terkumpul</p>
            <p className="text-xl">{totalBerat} kg</p>
          </div>
        </Card>
        <Card className="flex items-center gap-6 p-6">
          <div className="flex items-center justify-center w-12 h-12">
            <CloudDrizzle className="text-black-500 text-xl" />
          </div>
          <div>
            <p className="text-2xl font-semibold">Total Emisi Karbon</p>
            <p className="text-xl">{totalEmisi.toFixed(2)} kg CO2-eq</p>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Jenis Sampah Terkumpul</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {categories.map((kategori) => {
              const Icon = categoryIcons[kategori];
              return (
                <Card key={kategori} className="flex items-center gap-4 p-4">
                  <div className="flex items-center justify-center w-12 h-12">
                    {Icon ? (
                      <Icon className="text-black-500 text-xl" />
                    ) : (
                      "Ikon Tidak Ditemukan"
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{kategori}</p>
                    <p className="text-lg">
                      {jenisSampahData[kategori]?.totalBerat || 0} kg
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Total Emisi Karbon per Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {categories.map((kategori) => {
              const Icon = categoryIcons[kategori];
              return (
                <Card key={kategori} className="flex items-center gap-4 p-4">
                  <div className="flex items-center justify-center w-12 h-12">
                    {Icon ? (
                      <Icon className="text-black-500 text-xl" />
                    ) : (
                      "Ikon Tidak Ditemukan"
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{kategori}</p>
                    <p className="text-lg">
                      {chartData
                        .filter((item) => item.jenisSampah === kategori)
                        .reduce((sum, item) => sum + item.totalEmisiKarbon, 0)
                        .toFixed(2)}{" "}
                      kg CO2-eq
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Grafik Produksi Sampah dan Emisi Karbon</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar data={chartDataFormatted} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Grafik Produksi Sampah per Kategori</CardTitle>  
        </CardHeader>
        <CardContent>
          <Bar data={getCombinedBarChartData()} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartSampah;
