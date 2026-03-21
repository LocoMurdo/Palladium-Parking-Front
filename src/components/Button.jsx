import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  loading = false,
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-md font-semibold border transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 active:translate-y-px';

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm min-h-10',
    md: 'px-4 py-2 text-sm min-h-10',
    lg: 'px-6 py-3 text-base min-h-12',
  };

  const variants = {
    primary:
      'bg-[#0A5FFF] text-white border-[#0A5FFF] shadow-md shadow-blue-300/60 hover:bg-[#084ecc] hover:border-[#084ecc] focus:ring-blue-400',
    secondary:
      'bg-[#6B7280] text-white border-[#6B7280] shadow-md shadow-slate-300/60 hover:bg-[#4B5563] hover:border-[#4B5563] focus:ring-slate-400',
    danger:
      'bg-[#EF4444] text-white border-[#EF4444] shadow-md shadow-rose-300/60 hover:bg-[#dc2626] hover:border-[#dc2626] focus:ring-red-400',
    success:
      'bg-[#10B981] text-white border-[#10B981] shadow-md shadow-emerald-300/60 hover:bg-[#059669] hover:border-[#059669] focus:ring-emerald-400',
    outline:
      'bg-[#6B7280] text-white border-[#6B7280] shadow-md shadow-slate-300/60 hover:bg-[#4B5563] hover:border-[#4B5563] focus:ring-slate-300',
    info:
      'bg-[#0A5FFF] text-white border-[#0A5FFF] shadow-md shadow-blue-300/60 hover:bg-[#084ecc] hover:border-[#084ecc] focus:ring-blue-300',
  };

  const disabledClass = disabled || loading
    ? 'opacity-60 cursor-not-allowed shadow-none'
    : 'cursor-pointer';

  const classes = `${baseClasses} ${sizeClasses[size]} ${variants[variant]} ${disabledClass} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
    >
      {loading ? 'Cargando...' : children}
    </button>
  );
};

export default Button;