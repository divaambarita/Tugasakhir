import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import CustomButton from "../custom_ui/custom-button";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/router";
import useDeleteForm from "@/hooks/useDeleteForm";
import { toast } from "../ui/use-toast";
import { getIdUserCookies, isRoleAdmin } from "@/lib/utils";
import { useCookies } from "react-cookie";

const NasabahDataTableAction = ({ idNasabah }) => {
  const router = useRouter();
  const { deleteForm } = useDeleteForm();
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(["currentUser"]);
  let userId = getIdUserCookies(cookies);
  if (isRoleAdmin(cookies)) {
    userId = "";
  }

  const confirmDelete = async () => {
    setIsSubmitLoading(true);
    const res = await deleteForm(`/api/bsu/nasabah/${idNasabah}`, {
      method: "DELETE",
    });
    if (res.status != 200) {
      toast({
        variant: "destructive",
        title: "Gagal!",
        description: res.message,
      });
    } else {
      toast({
        description: res.message,
      });
    }
    router.push("/nasabah");
    setIsSubmitLoading(false);
    setOpenDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-8 h-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <Link
            href={{
              pathname: "/nasabah/detail/[id]",
              query: { id: idNasabah },
            }}
          >
            <DropdownMenuItem>Detail</DropdownMenuItem>
          </Link>
          <Link
            href={{
              pathname: "/nasabah/update-nasabah/[id]",
              query: { id: idNasabah, userId: userId },
            }}
          >
            <DropdownMenuItem>Edit</DropdownMenuItem>
          </Link>
          <DropdownMenuItem
            className="text-red-500"
            onClick={() => setOpenDialog(true)}
          >
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        defaultOpen={openDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Apakah Anda Ingin MENGHAPUS Data Nasabah ini?
            </AlertDialogTitle>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <CustomButton
              variant="outline"
              disabled={isSubmitLoading}
              onClick={() => setOpenDialog(false)}
            >
              Batal
            </CustomButton>
            <CustomButton isLoading={isSubmitLoading} onClick={confirmDelete}>
              Setuju
            </CustomButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default NasabahDataTableAction;
