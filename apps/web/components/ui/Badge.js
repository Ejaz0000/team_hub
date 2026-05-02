export default function Badge({ children, className = "" }) {
  return (
    <span
      className={`rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 ${className}`}
    >
      {children}
    </span>
  );
}
