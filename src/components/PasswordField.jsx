function PasswordField({
  id,
  name,
  label,
  value,
  show = false,
  onToggle,
  onChange,
  error,
  success,
  helperText,
  status = "neutral",
  autoComplete,
  required = true,
  variant = "customer",
  children,
}) {
  const hasError = Boolean(error);
  const hasSuccess = Boolean(success);

  if (variant === "admin") {
    const borderClasses = hasError
      ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-200/30"
      : hasSuccess
        ? "border-emerald-400 bg-emerald-50/20 focus:border-emerald-500 focus:ring-emerald-200/30"
        : "border-night-sky-100/30 bg-night-sky-100/10 focus:border-night-sky-300 focus:ring-night-sky-200/20";

    return (
      <div className="flex flex-col gap-1.5 text-xs font-bold text-night-sky-300">
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          name={name}
          type="password"
          value={value}
          required={required}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          className={`rounded-xl border px-3 py-2.5 text-sm font-medium text-night-sky-500 outline-none transition focus:ring-2 ${borderClasses}`}
        />
        {hasError && <FieldMessage tone="error">{error}</FieldMessage>}
        {hasSuccess && !hasError && (
          <FieldMessage tone="success">{success}</FieldMessage>
        )}
        {children}
      </div>
    );
  }

  let borderClasses =
    "border-night-sky-100/30 bg-slate-50 focus:border-night-sky-400 focus:bg-white focus:ring-night-sky-200/20";
  if (status === "error" || hasError) {
    borderClasses =
      "border-rose-400 bg-rose-50/15 focus:border-rose-500 focus:bg-white focus:ring-rose-200/30";
  } else if (status === "success" || hasSuccess) {
    borderClasses =
      "border-emerald-400 bg-emerald-50/15 focus:border-emerald-500 focus:bg-white focus:ring-emerald-200/30";
  }

  return (
    <div>
      <label htmlFor={id} className="text-xs font-bold text-night-sky-300">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          required={required}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          className={`h-10 w-full rounded-xl border px-3 pr-10 text-sm text-night-sky-500 outline-none transition focus:ring-2 ${borderClasses}`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-night-sky-200 hover:text-night-sky-400"
          aria-label={show ? `Hide ${label}` : `Show ${label}`}
        >
          {show ? (
            <svg
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
              />
            </svg>
          ) : (
            <svg
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 3.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          )}
        </button>
      </div>
      {helperText && !hasError && !hasSuccess && (
        <p className="mt-1.5 text-xs font-medium text-night-sky-200">
          {helperText}
        </p>
      )}
      {hasError && <FieldMessage tone="error">{error}</FieldMessage>}
      {hasSuccess && !hasError && (
        <FieldMessage tone="success">{success}</FieldMessage>
      )}
      {children}
    </div>
  );
}

function FieldMessage({ tone, children }) {
  return (
    <p
      className={`mt-1.5 flex items-center gap-1.5 text-xs font-medium ${
        tone === "success" ? "text-emerald-600" : "text-rose-600"
      }`}
    >
      <svg
        className="size-3.5 shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d={
            tone === "success"
              ? "M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
              : "M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75Zm0 10a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z"
          }
          clipRule="evenodd"
        />
      </svg>
      <span>{children}</span>
    </p>
  );
}

export default PasswordField;
