import { Label } from "@/components/ui/label";

function RowForm({ label, children }) {
  return (
    <div className="flex items-baseline space-x-2">
      <Label className="w-1/3">{label}</Label>
      <div className="w-full">{children}</div>
    </div>
  );
}

export default RowForm;
