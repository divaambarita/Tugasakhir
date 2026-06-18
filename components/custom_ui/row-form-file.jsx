import { useState } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import useUploadFile from "@/hooks/useUploadFile";
import Image from "next/image";

function RowFormFile({
  form,
  name,
  label,
  disabled = false,
  defaultValues = null,
}) {
  const { uploadFile } = useUploadFile();
  const [FileKtp, setFileKtp] = useState(defaultValues);
  const [isLoading, setIsLoading] = useState();

  async function onFileUpload(file) {
    setIsLoading(true);
    const urlFile = await uploadFile(file);
    setFileKtp(urlFile);
    setIsLoading(false);
    return urlFile;
  }

  return (
    <>
      <FormField
        control={form.control}
        name={name}
        render={({ field: { value, onChange, ...rest } }) => (
          <FormItem>
            <div className="flex items-baseline space-x-2 ">
              <FormLabel className="w-1/3">{label}</FormLabel>
              <div className="w-full">
                <FormControl>
                  <div className="flex items-center space-x-2">
                    {disabled == false ? (
                      <Input
                        {...rest}
                        type="file"
                        accept="image/*"
                        disabled={isLoading}
                        onChange={async (e) => {
                          const urlFile = await onFileUpload(e.target.files[0]);
                          /// set value to form control
                          onChange(urlFile);
                        }}
                      />
                    ) : (
                      <Input
                        disabled={disabled}
                        defaultValues={value}
                        placeholder={value || "No File"}
                        {...rest}
                      />
                    )}
                  </div>
                </FormControl>
                <FormMessage className="mt-1 text-xs" />
                {isLoading && (
                  <div className="text-xs text-gray-500">Uploading...</div>
                )}
                {FileKtp && (
                  <div className="aspect-auto ">
                    <Image
                      src={FileKtp}
                      width={400}
                      height={250}
                      alt={FileKtp.name || label}
                    />
                  </div>
                )}
              </div>
            </div>
          </FormItem>
        )}
      />
    </>
  );
}

export default RowFormFile;
