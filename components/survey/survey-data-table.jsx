import { Badge } from "@/components/ui/badge";
import SurveyDataTableAction from "./survey-data-table-action";
import GenTable from "../layout/gen-table";
import CustomButton from "../custom_ui/custom-button";
import { useRouter } from 'next/router';

function SurveyDataTable({ data = [] }) {
  const router = useRouter(); // ✅ di dalam komponen utama

  const columns = [
    {
      accessorKey: "nama",
      header: "Nama",
    },
    {
      accessorKey: "noTelp",
      header: "Nomor Telepon",
    },
    {
      accessorKey: "alamat",
      header: "Alamat",
    },
    {
      accessorKey: "hasilverifikasi",
      header: "Status Survey",
      cell: ({ row }) => {
        if (row.original.hasilverifikasi == null) {
          return <Badge variant="destructive">Ditugaskan</Badge>;
        } else {
          return <Badge variant="secondary">Selesai</Badge>;
        }
      },
    },
    {
      accessorKey: "action",
      header: "Aksi",
      cell: ({ row }) => {
        const idBsu = row.original.idBsu;
        if (row.original.hasilverifikasi == null) {
          return (
            <CustomButton onClick={() => router.push('/survey/add-survey/' + idBsu)}>
              Tambah
            </CustomButton>
          );
        } else {
          return <SurveyDataTableAction idBsu={idBsu} />;
        }
      },
    },
  ];

  return <GenTable data={data} columns={columns} />;
}

export default SurveyDataTable;
