import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, fullWidth, className = "", ...props }, ref) => {
    const hasError = !!error;

    const inputClasses = `
      w-full px-3 py-2.5 text-sm rounded-lg border transition-colors duration-200
      placeholder:text-zinc-400 dark:placeholder:text-zinc-500
      focus:outline-none focus:ring-2 focus:ring-offset-1
      disabled:opacity-50 disabled:cursor-not-allowed
      ${
        hasError
          ? "border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-600 dark:focus:border-red-500 dark:focus:ring-red-900"
          : "border-zinc-300 focus:border-zinc-500 focus:ring-zinc-200 dark:border-zinc-600 dark:focus:border-zinc-400 dark:focus:ring-zinc-800"
      }
      bg-white dark:bg-zinc-900
      text-zinc-900 dark:text-zinc-100
      ${className}
    `.trim();

    return (
      <div className={`space-y-1 ${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <input ref={ref} className={inputClasses} {...props} />
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
