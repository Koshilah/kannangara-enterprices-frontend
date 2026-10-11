function InputField({
  id,
  name,
  label,
  type = "text",
  value,
  draftValue,
  isEditing,
  disabled = false,
  onChange,
  placeholder,
  icon,
  error,
  success,
  minLength,
  required = false,
  variant = "customer",
  children,
}) {
  if (variant === "admin") {
    const hasError = Boolean(error);
    const hasSuccess = Boolean(success);
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
          type={type}
          value={value}
          disabled={disabled}
          required={required}
          onChange={onChange}
          placeholder={placeholder}
          minLength={minLength}
          className={`rounded-xl border px-3 py-2.5 text-sm font-medium text-night-sky-500 outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70 ${borderClasses}`}
        />
        {hasError && <FieldMessage tone="error">{error}</FieldMessage>}
        {hasSuccess && !hasError && (
          <FieldMessage tone="success">{success}</FieldMessage>
        )}
        {children}
      </div>
    );
  }

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-bold text-night-sky-300"
      >
        {label}
      </label>

      {isEditing ? (
        <div>
          <div className="relative">
            {icon && (
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                {icon}
              </div>
            )}
            <input
              id={id}
              name={name}
              type={type}
              value={draftValue}
              disabled={disabled}
              required={required}
              onChange={onChange}
              placeholder={placeholder}
              className={`h-11 w-full rounded-xl border bg-slate-50/50 pr-3 text-sm font-medium text-night-sky-500 outline-none transition focus:bg-white focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70 ${
                error
                  ? "border-red-400 focus:border-red-400 focus:ring-red-200/20"
                  : "border-night-sky-100/30 focus:border-night-sky-400 focus:ring-night-sky-200/20"
              } ${icon ? "pl-10" : "px-3"}`}
            />
          </div>
          {error && <FieldMessage tone="customer-error">{error}</FieldMessage>}
        </div>
      ) : (
        <div className="flex h-11 items-center gap-3 rounded-xl border border-night-sky-100/15 bg-slate-50/60 px-3.5 text-sm font-medium text-night-sky-500">
          {icon && <div className="shrink-0">{icon}</div>}
          <span className="truncate">
            {value || (
              <span className="italic text-night-sky-200">Not set</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}

function FieldMessage({ tone, children }) {
  const color =
    tone === "success"
      ? "text-emerald-600"
      : tone === "customer-error"
        ? "text-red-500"
        : "text-rose-600";

  return (
    <p className={`flex items-center gap-1.5 text-xs font-medium ${color}`}>
      <svg
        className="size-3.5 shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
          clipRule="evenodd"
        />
      </svg>
      <span>{children}</span>
    </p>
  );
}

export default InputField;
