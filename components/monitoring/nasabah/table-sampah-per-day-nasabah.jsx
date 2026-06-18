// import React, { useEffect, useState } from 'react'
// import GenTable from '@/components/layout/gen-table'
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
// import { useCookies } from 'react-cookie'

// const TableSampahPerDay = ({ filter }) => {
//   const [cookies] = useCookies(['currentUser'])
//   // const idNasabah = cookies.currentUser?.idAkun
//   const idNasabah = 13
//   const [data, setData] = useState([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [currentPage, setCurrentPage] = useState(1)
//   const [itemsPerPage, setItemsPerPage] = useState(5)
//   const [searchTerm, setSearchTerm] = useState('')

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch(
//           `/api/monitoring/transaksi/nasabah/${idNasabah}`
//         )
//         const result = await response.json()
//         if (result.success) {
//           setData(result.data.transaksi)
//         } else {
//           throw new Error('Failed to fetch data')
//         }
//         setIsLoading(false)
//       } catch (error) {
//         console.error('Fetch Error:', error)
//         setIsLoading(false)
//       }
//     }

//     if (idNasabah) {
//       fetchData()
//     }
//   }, [idNasabah, filter])

//   const handleSearchChange = (e) => {
//     setSearchTerm(e.target.value)
//   }

//   const currentYear = new Date().getFullYear()
//   const filteredData = data.filter((item) => {
//     const itemYear = new Date(item.createdAt).getFullYear()
//     return (
//       ((filter === 'all' || itemYear === currentYear) &&
//         (item.createdAt.includes(searchTerm) ||
//           item.nasabahId.toString().includes(searchTerm) ||
//           item.totalBerat.toString().includes(searchTerm) ||
//           item.totalHarga.toString().includes(searchTerm))) ||
//       item.nasabah.nama.toLowerCase().includes(searchTerm.toLowerCase())
//     )
//   })

//   const paginatedData = filteredData.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   )
//   const totalPages = Math.ceil(filteredData.length / itemsPerPage)

//   if (isLoading) {
//     return <p>Loading...</p>
//   }

//   if (data.length === 0) {
//     return <p>Tidak ada data</p>
//   }

//   const columns = [
//     {
//       header: 'No',
//       cell: ({ row }) => (
//         <span>{(currentPage - 1) * itemsPerPage + row.index + 1}</span>
//       ),
//     },
//     {
//       header: 'Tanggal',
//       accessorKey: 'createdAt',
//       cell: ({ cell }) => new Date(cell.getValue()).toLocaleDateString('id-ID'),
//     },
//     {
//       header: 'Sampah (kg)',
//       accessorKey: 'totalBerat',
//     },
//     {
//       header: 'Nilai Jual',
//       accessorKey: 'totalHarga',
//       cell: ({ cell }) => `Rp ${cell.getValue().toLocaleString('id-ID')}`,
//     },
//     {
//       header: 'Aksi',
//       cell: ({ row }) => (
//         <button
//           onClick={() => console.log('Detail sampah', row.original)}
//           className="btn btn-primary mx-2 px-4 py-2 bg-blue-500 text-white rounded-md"
//         >
//           Detail Sampah
//         </button>
//       ),
//     },
//   ]

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Statistik Sampah BSU per Hari</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">
//             Search:
//             <input
//               type="text"
//               value={searchTerm}
//               onChange={handleSearchChange}
//               className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//             />
//           </label>
//         </div>
//         <GenTable columns={columns} data={paginatedData} />
//         <div className="flex justify-between items-center mt-4">
//           <div>
//             <label>
//               Items per page:
//               <select
//                 value={itemsPerPage}
//                 onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
//                 className="ml-2 p-2 border rounded-md"
//               >
//                 {[5, 10, 20, 30, 40, 50].map((size) => (
//                   <option key={size} value={size}>
//                     {size}
//                   </option>
//                 ))}
//               </select>
//             </label>
//           </div>
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//               disabled={currentPage === 1}
//               className="btn btn-secondary mx-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
//             >
//               Previous
//             </button>
//             <span className="mx-2">
//               Page {currentPage} of {totalPages}
//             </span>
//             <button
//               onClick={() =>
//                 setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//               }
//               disabled={currentPage === totalPages}
//               className="btn btn-secondary mx-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
//             >
//               Next
//             </button>
//           </div>
//           <div>
//             <label>
//               Go to page:
//               <input
//                 type="number"
//                 value={currentPage}
//                 onChange={(e) => setCurrentPage(Number(e.target.value))}
//                 min="1"
//                 max={totalPages}
//                 className="ml-2 w-16 text-center p-2 border rounded-md"
//               />
//             </label>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// export default TableSampahPerDay
