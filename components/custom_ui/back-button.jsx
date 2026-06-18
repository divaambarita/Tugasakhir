import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

function BackButton() {
  const router = useRouter();
  return (
    <Button variant="ghost" className="pl-0" onClick={() => router.back()}>
      <ChevronLeft /> Kembali
    </Button>
  );
}

export default BackButton;
