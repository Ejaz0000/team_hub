export default function Input({ label, className = "", ...props }) {
  return (
    <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
      {label}
      <input
        className={`rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 focus:border-amber-300 focus:outline-none ${className}`}
        {...props}
      />
    </label>
  );
}
