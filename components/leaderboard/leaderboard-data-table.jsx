import { Card, CardContent } from "@/components/ui/card";

const rankIcons = ["🥇", "🥈", "🥉"];

const LeaderboardTable = ({ data }) => {
  const topThree = data.slice(0, 3);
  const others = data.slice(3);

  return (
    <div className="space-y-6">
      {/* Top 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topThree.map((row, idx) => (
          <Card key={row.nomorNasabah} className="flex items-center gap-4 p-4">
            <div className="flex flex-col items-center justify-center w-16">
              <span className="text-3xl">
                {rankIcons[idx]}
              </span>
              <span className="text-xs text-gray-500">Peringkat</span>
            </div>
            <CardContent className="flex-1">
              <div className="font-semibold text-lg">{row.nama}</div>
              <div className="text-sm text-gray-600 mb-2">No. Nasabah: {row.nomorNasabah}</div>
              <div className="flex flex-col gap-1">
                <span>
                  <b>Total Tabungan:</b> Rp {row.totalTabungan.toLocaleString("id-ID")}
                </span>
                <span>
                  <b>Total Sampah:</b> {row.totalSampah} kg
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table for 4th and below */}
      {others.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="border px-4 py-2">Peringkat</th>
                <th className="border px-4 py-2">No. Nasabah</th>
                <th className="border px-4 py-2">Nama</th>
                <th className="border px-4 py-2">Total Tabungan</th>
                <th className="border px-4 py-2">Total Sampah (kg)</th>
              </tr>
            </thead>
            <tbody>
              {others.map((row, idx) => (
                <tr key={row.nomorNasabah}>
                  <td className="border px-4 py-2">{idx + 4}</td>
                  <td className="border px-4 py-2">{row.nomorNasabah}</td>
                  <td className="border px-4 py-2">{row.nama}</td>
                  <td className="border px-4 py-2">
                    Rp {row.totalTabungan.toLocaleString("id-ID")}
                  </td>
                  <td className="border px-4 py-2">{row.totalSampah}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaderboardTable;