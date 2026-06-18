import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/useFetch";
import { getIdUserCookies } from "@/lib/utils";
import Link from "next/link";
import { useCookies } from "react-cookie";

export default function Dashboard() {
  const [cookies, setCookie, removeCookie] = useCookies(["currentUser"]);
  const idBsu = getIdUserCookies(cookies);

  const { data, error, isLoading } = useFetch(`api/bsu/${idBsu}`);

  return (
    <Layout>
      <h1>Dashboard</h1>
      {data?.data?.keteranganApprover && (
        <div>
          <p className="text-red-500">
            Maaf Pendaftaran anda ditolak karena {data?.data.keteranganApprover}
          </p>
          <p className="text-red-500">Silahkan lakukan pendftaran ulang!!!</p>
          <Link
            href={{
              pathname: "/signup/bsu",
              query: { id: idBsu },
            }}
          >
            <Button>Daftar</Button>
          </Link>
        </div>
      )}
    </Layout>
  );
}

// --------------------------------------------
// import { Layout } from "@/components/layout/layout";
// import { Button } from "@/components/ui/button";
// import useFetch from "@/hooks/useFetch";
// import { getIdUserCookies } from "@/lib/utils";
// import Link from "next/link";
// import { useCookies } from "react-cookie";
// import SampahChart from "@/components/monitoring/bsu/chart-sampah";
// import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"; // Pastikan sudah ada komponen Card
// import { UserIcon } from "lucide-react";

// export default function Dashboard() {
//   const [cookies, setCookie, removeCookie] = useCookies(["currentUser"]);
//   const idBsu = getIdUserCookies(cookies);

//   const { data, error, isLoading } = useFetch(`api/bsu/${idBsu}`);

//   // Data hardcode untuk total bank sampah, nasabah, dan sampah terkumpul
//   const totalBankSampah = 5;
//   const totalNasabah = 150;
//   const totalSampahTerkumpul = 12000; // dalam kg

//   return (
//     <Layout>
//       {data?.data?.keteranganApprover && (
//         <div>
//           <p className="text-red-500">
//             Maaf Pendaftaran anda ditolak karena {data?.data.keteranganApprover}
//           </p>
//           <p className="text-red-500">Silahkan lakukan pendaftaran ulang!!!</p>
//           <Link
//             href={{
//               pathname: "/signup/bsu",
//               query: { id: idBsu },
//             }}
//           >
//             <Button>Daftar</Button>
//           </Link>
//         </div>
//       )}

//       {/* Menampilkan card untuk Total Bank Sampah */}
//       <div style={{ marginBottom: "30px" }}>
//         <strong style={{ fontSize: "25px" }}>Dashboard Monitoring</strong>

//         {/* Card untuk Total Bank Sampah */}

//         {/* Row untuk Total Nasabah dan Total Sampah Terkumpul */}
//         {/* <div
//           style={{
//             display: "flex",
//             justifyContent: "space-around",
//             marginTop: "10px",
//             marginBottom: "10px",
//           }}
//         >
//           <Card>
//             <CardHeader>
//               <UserIcon
//                 style={{ width: "24px", height: "24px", marginRight: "10px" }}
//               />
//               <div>
//                 <p style={{ fontSize: "25px" }}>
//                   <strong>{totalBankSampah}</strong>
//                 </p>
//                 Total Bank Sampah
//               </div>
//             </CardHeader>
//           </Card>
//           <Card>
//             <CardHeader>
//               <p style={{ fontSize: "25px" }}>
//                 <strong>{totalNasabah}</strong>
//               </p>
//               Total Nasabah
//             </CardHeader>
//           </Card>
//           <Card>
//             <CardHeader>
//               <p style={{ fontSize: "25px" }}>
//                 <strong>{totalSampahTerkumpul} kg</strong>
//               </p>
//               Total Sampah Terkumpul
//             </CardHeader>
//           </Card>
//         </div> */}

//         {/* Mengirimkan idBsu sebagai prop untuk ChartSampah */}
//         <Card style={{ marginTop: "30px" }}>
//           <CardContent className="pt-7 space-y-10">
//             <SampahChart />
//           </CardContent>
//         </Card>
//       </div>
//     </Layout>
//   );
// }
