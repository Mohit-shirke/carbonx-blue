'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { clsx } from 'clsx'
import { forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'xs' | 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref' | 'children'> {
  children?: React.ReactNode
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
  iconRight?: React.ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary-500 hover:bg-primary-600 text-white border border-primary-500 shadow-green-glow/30',
  secondary:
    'bg-primary-500/10 hover:bg-primary-500/20 text-primary-500 dark:text-primary-400 border border-primary-500/30',
  ghost:
    'bg-transparent hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] border border-transparent',
  danger:
    'bg-red-500 hover:bg-red-600 text-white border border-red-500',
  outline:
    'bg-transparent hover:bg-[var(--border)] text-[var(--text)] border border-[var(--border)] hover:border-primary-500',
}

const sizeClasses: Record<Size, string> = {
  xs: 'px-3 py-1.5 text-xs rounded-[10px] gap-1.5 min-h-[36px] sm:min-h-[40px]',
  sm: 'px-3.5 py-2 text-sm rounded-[10px] gap-2 min-h-[44px]',
  md: 'px-4 py-2.5 text-sm rounded-[10px] gap-2 min-h-[44px]',
  lg: 'px-6 py-3.5 text-base rounded-xl gap-2.5 min-h-[48px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, iconRight, children, className, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={
          disabled || loading
            ? {}
            : { scale: 1.015, boxShadow: '0px 0px 10px rgba(52, 211, 153, 0.35)' }
        }
        whileTap={disabled || loading ? {} : { scale: 0.975 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        className={clsx(
          'inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <svg
            className="w-4 h-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
        {iconRight && !loading && <span className="shrink-0">{iconRight}</span>}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
