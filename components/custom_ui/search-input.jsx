import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

function SearchInput({ className, ...props }) {
  return (
    <div className={cn("relative flex-1 md:grow-0", className)}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Cari..."
        className="w-full rounded-full bg-background pl-8 md:w-[200px] lg:w-[336px]"
        {...props}
      />
    </div>
  );
}

export default SearchInput;
