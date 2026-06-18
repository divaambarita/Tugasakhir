import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useCookies } from "react-cookie";
import { getIdUserCookies, isRoleBSU } from "@/lib/utils";
import { useHydration, useSafeCookies } from "@/hooks/useHydration";

const getColorForCategory = (category) => {
  const colors = {
    "Limbah B3": "#FF9F40",
    "Sampah Organik (Mudah Terurai)": "#28A745",
    "Sampah Anorganik (Plastik)": "#FF6384",
    "Sampah Anorganik (Kertas)": "#FFCE56",
    "Sampah Anorganik (Logam)": "#36A2EB",
    "Sampah Anorganik (Kaca)": "#4BC0C0",
    "Sampah Anorganik (Karet)": "#9966FF",
    "Sampah Anorganik (Tekstil)": "#C9CBCF",
  };
  return colors[category] || "#000000";
};

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

const initializeChartData = () => {
  const initialData = {};
  categories.forEach((category) => {
    initialData[category] = {
      labels: [],
      datasets: [
        {
          label: category,
          data: [],
          borderColor: getColorForCategory(category),
          fill: false,
        },
      ],
    };
  });
  return initialData;
};

const StatisticDataSampah = ({ filterYear, filterMonth }) => {
  const [chartData, setChartData] = useState(initializeChartData());
  const [isLoading, setIsLoading] = useState(true);
  const [cookies] = useCookies(["currentUser"]);
  const hasMounted = useHydration();
  const { idBsu, isReady } = useSafeCookies(cookies);

  useEffect(() => {
    const fetchData = async () => {
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

        const response = await fetch(apiUrl);
        const result = await response.json();
        if (result.success) {
          const { beratPerKategoriByMonthYear } = result.data;
          const formattedData = initializeChartData();

          Object.keys(beratPerKategoriByMonthYear).forEach((date) => {
            const [year, month] = date.split("-");
            if (
              (filterYear === "all" || parseInt(year) === filterYear) &&
              (filterMonth === "all" || parseInt(month) === filterMonth)
            ) {
              const categoriesData = beratPerKategoriByMonthYear[date];
              Object.keys(categoriesData).forEach((category) => {
                if (category !== "totalKeseluruhan") {
                  formattedData[category].labels.push(date);
                  formattedData[category].datasets[0].data.push(
                    categoriesData[category]
                  );
                }
              });
            }
          });

          setChartData(formattedData);
        } else {
          throw new Error("Failed to fetch data");
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Fetch Error:", error);
        setIsLoading(false);
      }
    };

    if (idBsu && hasMounted && isReady) {
      fetchData();
    }
  }, [idBsu, filterYear, filterMonth, hasMounted, isReady]);

  if (!hasMounted || !isReady || typeof window === "undefined") {
    return (
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Statistik Data Sampah per Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Statistik Data Sampah per Kategori</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(chartData).map((category) => (
              <div key={category} className="mb-4">
                <h3 className="text-lg font-semibold mb-2">{category}</h3>
                <Line data={chartData[category]} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatisticDataSampah;
