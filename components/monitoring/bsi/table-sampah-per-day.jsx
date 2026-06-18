// import React, { useEffect, useState } from 'react'
// import GenTable from '@/components/layout/gen-table'
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

// const TableSampahPerDay = ({ filter }) => {
//   const [data, setData] = useState([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [currentPage, setCurrentPage] = useState(1)
//   const [itemsPerPage, setItemsPerPage] = useState(5)
//   const [searchTerm, setSearchTerm] = useState('')

//   useEffect(() => {
//     // Hardcoded data
//     const fetchData = async () => {
//       const data = [
//         {
//           tanggal: '2023-01-01',
//           idNasabah: 'N001',
//           sampahKg: 100,
//           nilaiJual: 50000,
//         },
//         {
//           tanggal: '2023-01-02',
//           idNasabah: 'N002',
//           sampahKg: 150,
//           nilaiJual: 75000,
//         },
//         {
//           tanggal: '2023-01-03',
//           idNasabah: 'N003',
//           sampahKg: 200,
//           nilaiJual: 100000,
//         },
//         {
//           tanggal: '2023-01-04',
//           idNasabah: 'N004',
//           sampahKg: 120,
//           nilaiJual: 60000,
//         },
//         {
//           tanggal: '2023-01-05',
//           idNasabah: 'N005',
//           sampahKg: 130,
//           nilaiJual: 65000,
//         },
//         {
//           tanggal: '2023-01-06',
//           idNasabah: 'N006',
//           sampahKg: 140,
//           nilaiJual: 70000,
//         },
//         {
//           tanggal: '2023-01-07',
//           idNasabah: 'N007',
//           sampahKg: 160,
//           nilaiJual: 80000,
//         },
//         {
//           tanggal: '2023-01-08',
//           idNasabah: 'N008',
//           sampahKg: 170,
//           nilaiJual: 85000,
//         },
//         {
//           tanggal: '2025-01-09',
//           idNasabah: 'N009',
//           sampahKg: 180,
//           nilaiJual: 90000,
//         },
//         {
//           tanggal: '2025-01-10',
//           idNasabah: 'N010',
//           sampahKg: 190,
//           nilaiJual: 95000,
//         },
//       ]
//       setData(data)
//       setIsLoading(false)
//     }

//     fetchData()
//   }, [])

//   const columns = [
//     {
//       header: 'No',
//       cell: ({ row }) => (
//         <span>{(currentPage - 1) * itemsPerPage + row.index + 1}</span>
//       ),
//     },
//     {
//       header: 'Tanggal',
//       accessor: 'tanggal',
//       cell: ({ row }) => <span>{row.original.tanggal}</span>,
//     },
//     {
//       header: 'Nasabah',
//       accessor: 'idNasabah',
//       cell: ({ row }) => <span>{row.original.idNasabah}</span>,
//     },
//     {
//       header: 'Sampah (kg)',
//       accessor: 'sampahKg',
//       cell: ({ row }) => <span>{row.original.sampahKg}</span>,
//     },
//     {
//       header: 'Nilai Jual',
//       accessor: 'nilaiJual',
//       cell: ({ row }) => (
//         <span>Rp {row.original.nilaiJual.toLocaleString('id-ID')}</span>
//       ),
//     },
//     {
//       accessorKey: 'action',
//       header: 'Aksi',
//       cell: ({ row }) => (
//         <button
//           onClick={() => console.log('Detail sampah', row.original)}
//           className="btn btn-primary"
//         >
//           Detail Sampah
//         </button>
//       ),
//     },
//   ]

//   const handlePageChange = (page) => {
//     if (page >= 1 && page <= totalPages) {
//       setCurrentPage(page)
//     }
//   }

//   const handleItemsPerPageChange = (e) => {
//     setItemsPerPage(parseInt(e.target.value))
//     setCurrentPage(1) // Reset to first page when items per page changes
//   }

//   const handlePageInputChange = (e) => {
//     const page = parseInt(e.target.value)
//     if (!isNaN(page) && page >= 1 && page <= totalPages) {
//       setCurrentPage(page)
//     }
//   }

//   const handleSearchChange = (e) => {
//     setSearchTerm(e.target.value)
//     setCurrentPage(1) // Reset to first page when search term changes
//   }

//   const currentYear = new Date().getFullYear()
//   const filteredData = data.filter((item) => {
//     const itemYear = new Date(item.tanggal).getFullYear()
//     return (
//       (filter === 'all' || itemYear === currentYear) &&
//       (item.tanggal.includes(searchTerm) ||
//         item.idNasabah.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         item.sampahKg.toString().includes(searchTerm) ||
//         item.nilaiJual.toString().includes(searchTerm))
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
//         <div className="flex justify-between items-center mb-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Rows per page:
//               <select
//                 value={itemsPerPage}
//                 onChange={handleItemsPerPageChange}
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//               >
//                 <option value={5}>5</option>
//                 <option value={10}>10</option>
//                 <option value={15}>15</option>
//               </select>
//             </label>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Go to page:
//               <input
//                 type="number"
//                 value={currentPage}
//                 onChange={handlePageInputChange}
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                 min={1}
//                 max={totalPages}
//               />
//             </label>
//           </div>
//         </div>
//         <GenTable columns={columns} data={paginatedData} />
//         <div className="flex justify-between items-center mt-4">
//           <div className="flex justify-start w-full">
//             <button
//               onClick={() => handlePageChange(currentPage - 1)}
//               disabled={currentPage === 1}
//               className="btn btn-secondary mx-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
//             >
//               Previous
//             </button>
//             <button
//               onClick={() => handlePageChange(currentPage + 1)}
//               disabled={currentPage === totalPages}
//               className="btn btn-secondary mx-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
//             >
//               Next
//             </button>
//           </div>
//           <div className="text-right w-full">
//             <span>
//               Page {currentPage} of {totalPages}
//             </span>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// export default TableSampahPerDay
