// import React, { useEffect, useState } from 'react'
// import GenTable from '@/components/layout/gen-table'
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

// const RankingTableSaldo = () => {
//   const [data, setData] = useState([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const idBsu = 5

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch(`/api/monitoring/saldo/getSaldoBsu`)
//         const result = await response.json()
//         if (result.success) {
//           setData(result.data)
//         } else {
//           setError(new Error('Failed to fetch data'))
//         }
//         setIsLoading(false)
//       } catch (error) {
//         console.error('Fetch Error:', error) // Tambahkan log untuk melihat error
//         setError(error)
//         setIsLoading(false)
//       }
//     }

//     fetchData()
//   }, [])

//   const top5Data = data.slice(0, 5)
//   const currentBsuData = data.find((item) => item.idBsu === idBsu)

//   let displayData = []
//   if (currentBsuData && currentBsuData.ranking > 5) {
//     displayData = [
//       ...top5Data,
//       { idBsu: 'ellipsis', nama: '...', saldo: '...', ranking: '...' },
//       currentBsuData,
//     ]
//   } else {
//     displayData = top5Data
//   }

//   const columns = [
//     { header: 'No', cell: ({ row }) => <span>{row.original.ranking}</span> },
//     {
//       header: 'Nama',
//       accessor: 'nama',
//       cell: ({ row }) => <span>{row.original.nama}</span>,
//     },
//     {
//       header: 'Saldo',
//       accessor: 'saldo',
//       cell: ({ row }) => {
//         return <span>Rp. {row.original.saldo?.toLocaleString('id-ID')}</span>
//       },
//     },
//   ]

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Ranking Saldo BSU</CardTitle>
//       </CardHeader>
//       <CardContent>
//         {isLoading ? (
//           <p>Loading...</p>
//         ) : (
//           <GenTable
//             columns={columns}
//             data={displayData}
//             getRowProps={(row) => ({
//               className: row.original.idBsu === idBsu ? 'bg-yellow-100' : '',
//             })}
//           />
//         )}
//       </CardContent>
//     </Card>
//   )
// }

// export default RankingTableSaldo
