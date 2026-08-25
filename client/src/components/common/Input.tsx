import { useState } from "react";
import { EyeOff, Eye, Search } from "lucide-react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
  isSearch?: boolean;
};

export function Input({
  leftIcon,
  label,
  error,
  isPassword,
  isSearch,
  className,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const togglePasswordShowIcon = () => {
    setShowPassword((prev) => !prev);
  };
  return (
    <div className="flex flex-col gap-1 relative bg-bg-card rounded-lg">
      {label && (
        <label className="text-sm font-medium text-text-primary">{label}</label>
      )}

      <input
        type={isPassword ? (showPassword ? "text" : "password") : props.type}
        className={`
          h-10.5 w-full border
          border-border-subtle
           px-3
            rounded-lg
          text-sm outline-none
          font-medium
          placeholder:font-medium
          placeholder:text-sm
          focus:border-gray-700 focus:border-2
          transition-colors
          ${isSearch ? "pl-10" : ""}
          ${error ? "border-red-500" : ""}
          ${className ?? ""}
        `}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          onClick={togglePasswordShowIcon}
          className="absolute right-4 bottom-1 -translate-y-1/2 cursor-pointer"
        >
          {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      )}
      {isSearch && (
        <div className="absolute left-3 text-text-secondary bottom-1 -translate-y-1/2 cursor-pointer">
          <Search className="size-4.5" />
        </div>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
