import React from 'react';
import { Link } from 'react-router-dom';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidthOnMobile = true,
  fullWidth = false,
  to,
  href,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:transform-none text-center select-none';

  const variants = {
    primary:
      'bg-[#14532D] hover:bg-[#0E3D20] text-white shadow-xs hover:shadow-md border border-transparent dark:bg-emerald-700 dark:hover:bg-emerald-800',
    secondary:
      'bg-secondary hover:bg-secondary/90 text-on-secondary shadow-xs border border-transparent',
    ghost:
      'bg-surface-container/60 hover:bg-surface-container text-on-surface border border-outline-variant/40 dark:bg-stone-800 dark:hover:bg-stone-700 dark:border-stone-700',
    outline:
      'bg-transparent hover:bg-surface-container-low text-on-surface border border-outline-variant dark:text-stone-100 dark:border-stone-700 dark:hover:bg-stone-800',
    'dark-ghost':
      'bg-white/10 hover:bg-white/20 text-amber-100 border border-amber-200/30 backdrop-blur-md',
    danger:
      'bg-error hover:bg-error/90 text-on-error shadow-xs border border-transparent',
  };

  const sizes = {
    sm: 'px-4 py-2 min-h-[44px] text-xs font-label-md uppercase tracking-[0.14em]',
    md: 'px-6 py-3 min-h-[44px] sm:min-h-[48px] text-xs sm:text-sm font-label-md uppercase tracking-[0.16em]',
    lg: 'px-8 py-3.5 min-h-[44px] sm:min-h-[52px] text-xs sm:text-sm font-label-md uppercase tracking-[0.18em]',
  };

  const widthClass = fullWidth
    ? 'w-full'
    : fullWidthOnMobile
    ? 'w-full sm:w-auto'
    : '';

  const combinedClasses = `${baseStyles} ${variants[variant] || variants.primary} ${
    sizes[size] || sizes.md
  } ${widthClass} ${className}`.trim();

  const content = (
    <>
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 flex-shrink-0" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 flex-shrink-0" />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={combinedClasses} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={combinedClasses} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
      {...props}
    >
      {content}
    </button>
  );
}
