import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

function RowFormInput({
  form,
  name,
  label,
  placeholder,
  type = "text",
  disabled = false,
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-baseline space-x-2">
            <FormLabel className="w-1/3">{label}</FormLabel>
            <div className="w-full">
              <FormControl>
                <Input
                  type={type}
                  disabled={disabled}
                  placeholder={placeholder}
                  {...field}
                />
              </FormControl>
              <FormMessage className="mt-1 text-xs" />
            </div>
          </div>
        </FormItem>
      )}
    />
  );
}

export default RowFormInput;
