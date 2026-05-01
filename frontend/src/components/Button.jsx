export default function Button({ children, onClick, variant = 'primary', className = '' }) {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900";
  
  const variants = {
    primary: "bg-eco-600 hover:bg-eco-500 text-white focus:ring-eco-500",
    secondary: "bg-slate-700 hover:bg-slate-600 text-slate-100 focus:ring-slate-500",
    outline: "border border-slate-600 hover:bg-slate-800 text-slate-200 focus:ring-slate-500"
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
