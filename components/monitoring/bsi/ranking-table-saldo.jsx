// import React, { useEffect, useState } from 'react'
// import GenTable from '@/components/layout/gen-table'
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

// const RankingTableSaldo = () => {
//   const [data, setData] = useState([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState(null)

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch('/api/monitoring/saldo/getSaldoBsu')
//         const result = await response.json()
//         if (result.success) {
//           setData(result.data)
//         } else {
//           setError(new Error('Failed to fetch data'))
//         }
//         setIsLoading(false)
//       } catch (error) {
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
//   ]

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Ranking Saldo BSU</CardTitle>
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
