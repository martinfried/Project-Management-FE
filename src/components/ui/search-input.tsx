import { ComponentProps } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SearchInputProps extends ComponentProps<typeof Input> {
  wrapperClassName?: string;
}

export function SearchInput({ className, wrapperClassName, ...props }: SearchInputProps) {
  return (
    <div className={cn("relative w-full sm:w-96 md:w-[440px] lg:w-[480px]", wrapperClassName)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input className={cn("pl-9 text-xs", className)} {...props} />
    </div>
  );
}
