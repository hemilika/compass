import React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  fullWidth?: boolean;
};

const VARIANTS = {
  primary:
    "bg-zinc-900 text-white hover:bg-zinc-700 focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200 dark:focus:ring-zinc-100",
  secondary:
    "bg-zinc-200 text-zinc-900 hover:bg-zinc-300 focus:ring-2 focus:ring-zinc-200 focus:ring-offset-2 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700 dark:border-zinc-600 dark:focus:ring-zinc-800",
  outline:
    "bg-transparent text-zinc-900 hover:bg-zinc-100 focus:ring-2 focus:ring-zinc-200 focus:ring-offset-2 border border-zinc-300 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:border-zinc-600 dark:focus:ring-zinc-800",
  ghost:
    "bg-transparent text-zinc-900 hover:bg-zinc-100 focus:ring-2 focus:ring-zinc-200 focus:ring-offset-2 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:ring-zinc-800",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-600 focus:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-800 dark:focus:ring-red-700",
};

const SIZES = {
  sm: "text-xs px-3 py-2 rounded-md font-medium",
  md: "text-sm px-4 py-2.5 rounded-lg font-medium",
  lg: "text-base px-6 py-3 rounded-lg font-semibold",
  icon: "p-2.5 rounded-lg",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const {
      variant = "primary",
      size = "md",
      isLoading,
      fullWidth,
      children,
      className = "",
      ...rest
    } = props;

    const baseClasses =
      "transition-all duration-200 inline-flex items-center justify-center font-medium focus:outline-none disabled:opacity-50 disabled:pointer-events-none";
    const variantClasses = VARIANTS[variant];
    const sizeClasses = SIZES[size];
    const widthClasses = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClasses} ${className}`.trim()}
        disabled={isLoading || rest.disabled}
        {...rest}
      >
        {isLoading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export default Button;
