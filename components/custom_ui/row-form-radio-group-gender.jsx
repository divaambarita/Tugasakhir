import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

function RowFormRadioGroupGender({ form, name, disabled = false }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-baseline my-6 space-x-2">
            <FormLabel className="w-1/3">Jenis Kelamin*</FormLabel>
            <div className="w-full">
              <FormControl>
                <RadioGroup
                  disabled={disabled}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex items-center space-x-3"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Male" />
                    </FormControl>
                    <FormLabel>Laki-Laki</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Female" />
                    </FormControl>
                    <FormLabel>Perempuan</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage className="mt-1 text-xs" />
            </div>
          </div>
        </FormItem>
      )}
    />
  );
}

export default RowFormRadioGroupGender;
