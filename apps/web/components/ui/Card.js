export default function Card({ children, className = "" }) {
  return <div className={`surface-card rounded-3xl p-5 ${className}`}>{children}</div>;
}
