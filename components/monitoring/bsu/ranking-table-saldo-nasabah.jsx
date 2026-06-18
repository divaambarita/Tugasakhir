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
//         const response = await fetch(`/api/monitoring/saldo/bsu/${idBsu}`)
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

//   const columns = [
//     { header: 'No', cell: ({ row }) => <span>{row.index + 1}</span> },
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
//     {
//       header: 'Aksi',
//       cell: ({ row }) => (
//         <a
//           href={`/monitoring/${row.original.idNasabah}`}
//           class="btn btn-secondary mx-2 px-4 py-2 bg-blue-500 text-white rounded-md hover"
//           role="button"
//           aria-pressed="true"
//         >
//           Details
//         </a>
//       ),
//     },
//   ]

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Ranking Saldo Nasabah BSU {}</CardTitle>
//       </CardHeader>
//       <CardContent>
//         {isLoading ? (
//           <p>Loading...</p>
//         ) : error ? (
//           <p>Error: {error.message}</p>
//         ) : (
//           <GenTable columns={columns} data={data} />
//         )}
//       </CardContent>
//     </Card>
//   )
// }

// export default RankingTableSaldo
