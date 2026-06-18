// import { useEffect, useState } from "react";
// import { Layout } from "@/components/layout/layout";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import useFetch from "@/hooks/useFetch";
// import { Toaster } from "@/components/ui/toaster";
// import { toast } from "@/components/ui/use-toast";
// import BackButton from "@/components/custom_ui/back-button";
// import LeaderboardTable from "@/components/leaderboard/leaderboard-data-table";

// export async function getServerSideProps(context) {
//   const idBsu = context.query.id ?? null;
//   return { props: { idBsu } };
// }

// function Leaderboard({ idBsu }) {
//   const [leaderboard, setLeaderboard] = useState([]);
//   const [loading, setLoading] = useState(true);

//  useEffect(() => {
//   if (!idBsu) {
//     setLeaderboard([]);
//     setLoading(false);
//     return;
//   }
//   setLoading(true);
//   fetch(`/api/monitoring/leaderboard/nasabah`)
//     .then((res) => res.json())
//     .then((res) => {
//       if (res.success) setLeaderboard(res.data);
//       setLoading(false);
//     });
// }, [idBsu]);

//   return (
//     <Layout>
//       <Card className="border-none shadow-none">
//         <CardHeader>
//           <CardTitle style={{ textAlign: "center" }}>
//             Daftar Peringkat Nasabah Bank Sampah
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-3">
//           <BackButton />
//           {loading ? (
//             <p>Loading...</p>
//           ) : (
//             <LeaderboardTable data={leaderboard} />
//           )}
//         </CardContent>
//       </Card>
//       <Toaster />
//     </Layout>
//   );
// }

// export default Leaderboard;

import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import BackButton from "@/components/custom_ui/back-button";
import Image from "next/image";

export async function getServerSideProps(context) {
  const idBsu = context.query.id ?? null;
  return { props: { idBsu } };
}

function Leaderboard({ idBsu }) {
  return (
    <Layout>
      <Card className="border-none shadow-none">
        <CardContent className="space-y-3">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="mb-6">
              <Image
                src={"/perbaikan.png"}
                alt="Under Construction"
                width={500}
                height={500}
                className="mx-auto"
              />
            </div>
            <p className="text-2xl text-black-800 font-bold">
              Mohon maaf, laman sedang dalam tahap pengembangan
            </p>
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </Layout>
  );
}

export default Leaderboard;