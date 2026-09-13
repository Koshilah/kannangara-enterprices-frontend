import { Link } from "react-router";

function ProfileShortcut({ to, icon, title, subtitle }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3.5 rounded-xl border border-night-sky-100/20 bg-slate-50/50 p-4 transition-all hover:-translate-y-0.5 hover:border-night-sky-300 hover:bg-white hover:shadow-sm"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-2xs transition group-hover:bg-night-sky-100/10">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-night-sky-500 transition group-hover:text-night-sky-400">
          {title}
        </p>
        <p className="truncate text-[11px] text-night-sky-100">{subtitle}</p>
      </div>
      <svg
        className="size-4 text-night-sky-200 transition group-hover:translate-x-0.5 group-hover:text-night-sky-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </Link>
  );
}

export default ProfileShortcut;
