// import React, { useEffect, useState } from 'react'
// import { useCookies } from 'react-cookie'
// import { Bar } from 'react-chartjs-2'
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
// import {
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js'
// import ChartJS from 'chart.js/auto'
// import { useRouter } from 'next/router'

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// )

// const ChartSampah = ({ filter, idNasabah }) => {
//   const [cookies] = useCookies(['currentUser'])
//   // const idNasabah = cookies.currentUser?.idAkun
//   const idNasabah = 16

//   const [chartData, setChartData] = useState(null)
//   const [jenisSampahData, setJenisSampahData] = useState({})
//   const [totalBerat, setTotalBerat] = useState(0)
//   const [totalEmisi, setTotalEmisi] = useState(0)

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await fetch(`/api/monitoring/sampah/nasabah/${idNasabah}`)
//         const result = await res.json()
//         if (result.success) {
//           const data = []
//           const jenisSampahDataTemp = {}
//           let totalBeratTemp = 0
//           let totalEmisiTemp = 0
//           const {
//             beratPerKategoriByMonthYear,
//             emisiKarbonPerKategoriByMonthYear,
//           } = result.data
//           Object.keys(beratPerKategoriByMonthYear).forEach((key) => {
//             const [year, month] = key.split('-')
//             if (
//               filter === 'all' ||
//               (filter === 'current' &&
//                 parseInt(year) === new Date().getFullYear())
//             ) {
//               Object.keys(beratPerKategoriByMonthYear[key]).forEach(
//                 (kategori) => {
//                   if (kategori !== 'totalKeseluruhan') {
//                     const berat = beratPerKategoriByMonthYear[key][kategori]
//                     const emisi =
//                       emisiKarbonPerKategoriByMonthYear[key][kategori]
//                     data.push({
//                       bulan: month,
//                       tahun: parseInt(year),
//                       totalBerat: berat,
//                       totalEmisiKarbon: emisi,
//                       jenisSampah: kategori,
//                     })
//                     if (!jenisSampahDataTemp[kategori]) {
//                       jenisSampahDataTemp[kategori] = { totalBerat: 0 }
//                     }
//                     jenisSampahDataTemp[kategori].totalBerat += berat
//                     totalBeratTemp += berat
//                     totalEmisiTemp += emisi
//                   }
//                 }
//               )
//             }
//           })
//           setChartData(data)
//           setJenisSampahData(jenisSampahDataTemp)
//           setTotalBerat(totalBeratTemp)
//           setTotalEmisi(totalEmisiTemp)
//         } else {
//           throw new Error('Failed to fetch data')
//         }
//       } catch (error) {
//         console.error('Fetch Error:', error)
//       }
//     }

//     if (idNasabah) {
//       fetchData()
//     }
//   }, [idNasabah, filter])

//   if (!chartData) {
//     return <p>Loading...</p>
//   }

//   const chartDataFormatted = {
//     labels: [
//       ...new Set(chartData.map((item) => `${item.bulan}-${item.tahun}`)),
//     ],
//     datasets: [
//       {
//         label: 'Total Berat Sampah',
//         data: chartData.reduce((acc, item) => {
//           const label = `${item.bulan}-${item.tahun}`
//           if (!acc[label]) acc[label] = 0
//           acc[label] += item.totalBerat
//           return acc
//         }, {}),
//         backgroundColor: 'rgba(75, 192, 192, 0.6)',
//       },
//       {
//         label: 'Total Emisi Karbon',
//         data: chartData.reduce((acc, item) => {
//           const label = `${item.bulan}-${item.tahun}`
//           if (!acc[label]) acc[label] = 0
//           acc[label] += item.totalEmisiKarbon
//           return acc
//         }, {}),
//         backgroundColor: 'rgba(153, 102, 255, 0.6)',
//       },
//     ],
//   }

//   return (
//     <div className="space-y-4">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <Card>
//           <CardHeader>
//             <CardTitle>Total Berat Sampah</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-lg">{totalBerat} kg</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader>
//             <CardTitle>Total Emisi Karbon</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-lg">{totalEmisi} kg CO2-eq</p>
//           </CardContent>
//         </Card>
//       </div>
//       <Card>
//         <CardHeader>
//           <CardTitle>Jenis Sampah Terkumpul</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {Object.keys(jenisSampahData).map((jenis) => (
//               <Card key={jenis}>
//                 <CardHeader>
//                   <CardTitle>{jenis}</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <p className="text-lg">
//                     {jenisSampahData[jenis].totalBerat} kg
//                   </p>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//       <Card>
//         <CardHeader>
//           <CardTitle>Chart Sampah</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <Bar data={chartDataFormatted} />
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

// export default ChartSampah
