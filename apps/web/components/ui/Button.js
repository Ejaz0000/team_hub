export default function Button({ children, className = "", variant = "primary", ...props }) {
  const base = "rounded-full px-4 py-2 text-sm font-semibold transition";
  const variants = {
    primary: "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30 hover:bg-amber-300",
    ghost: "border border-slate-700 text-slate-100 hover:border-slate-500",
    soft: "bg-white/5 text-slate-100 hover:bg-white/10"
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}
