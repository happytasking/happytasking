type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export function Button({
  children,
  loading,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center
        h-10
        rounded-md
        px-5
        font-medium
        text-white

        bg-[linear-gradient(150deg,#d946ef_0%,#9333ea_50%,#4338ca_100%)]
        from-fuchsia-500
        via-purple-600
        to-indigo-700

        transition-all
        duration-300
        ease-out

        hover:-translate-y-px

        active:translate-y-0
        active:scale-[0.98]

        disabled:cursor-not-allowed
        disabled:opacity-50
        disabled:hover:translate-y-0
        disabled:hover:shadow-none
        disabled:hover:brightness-100

        cursor-pointer

        ${className ?? ""}
      `}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
