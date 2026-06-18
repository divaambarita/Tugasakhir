import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ButtonLoading({ className }) {
  return (
    <Button disabled className={className}>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      Tunggu
    </Button>
  );
}
