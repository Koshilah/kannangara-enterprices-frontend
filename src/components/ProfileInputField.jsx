function ProfileInputField({
  id,
  name,
  label,
  type = "text",
  value,
  draftValue,
  isEditing,
  onChange,
  placeholder,
  icon,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-bold text-night-sky-300"
      >
        {label}
      </label>

      {isEditing ? (
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
            onChange={onChange}
            placeholder={placeholder}
            className={`h-11 w-full rounded-xl border border-night-sky-100/30 bg-slate-50/50 pr-3 text-sm font-medium text-night-sky-500 outline-none transition focus:border-night-sky-400 focus:bg-white focus:ring-2 focus:ring-night-sky-200/20 ${
              icon ? "pl-10" : "px-3"
            }`}
          />
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

export default ProfileInputField;
