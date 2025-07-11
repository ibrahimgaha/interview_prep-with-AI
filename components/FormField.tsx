import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  FormControl,
 
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'file';
  description?: string;
}

const FormField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder = '',
  type = 'text',
}: FormFieldProps<T>) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl >
          <Input type={type} placeholder={placeholder} {...field} className="input"/>
        </FormControl>
        
        <FormMessage />
      </FormItem>
    )}
  />
);

export default FormField;
