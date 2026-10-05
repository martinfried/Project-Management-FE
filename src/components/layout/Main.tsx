import { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface MainProps extends ComponentProps<"main"> {
  containerClassName?: string;
}

export function Main({ children, className, containerClassName, ...props }: MainProps) {
  return (
    <main id="main-content" className={cn("flex-1 w-full", className)} {...props}>
      <div className={cn("max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8", containerClassName)}>{children}</div>
    </main>
  );
}
