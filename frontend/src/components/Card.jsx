export default function Card({ children, className = '' }) {
  return (
    <div className={`p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}
