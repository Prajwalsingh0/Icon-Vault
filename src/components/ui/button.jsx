// @ts-nocheck
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[background-color,color,box-shadow,transform,opacity] duration-150 ease-out disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:opacity-90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-accent",
        outline: "border border-border bg-card text-foreground shadow-border hover:bg-accent",
        ghost: "text-foreground hover:bg-accent",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-10 px-3",
        lg: "h-12 px-5",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({ className, variant, size, type = "button", ...props }) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
