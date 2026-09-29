import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  labelClassName?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
  iconRight?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, labelClassName, error, hint, icon, iconRight, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
    const errorId = inputId ? `${inputId}-error` : undefined
    const hintId = inputId ? `${inputId}-hint` : undefined

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className={cn("text-sm font-semibold text-[var(--text)] tracking-wide", labelClassName)}>
            {label}
            {props.required && <span className="text-emerald-500 ml-1 font-bold">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4 pointer-events-none transition-colors">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={cn(
              'w-full px-3.5 py-2.5 rounded-xl text-sm font-medium',
              'bg-[var(--input-bg)] text-[var(--text)]',
              'border border-[var(--border)]',
              'placeholder:text-[var(--text-muted)] placeholder:text-sm',
              'transition-all duration-200',
              'focus:outline-none focus:border-primary-500',
              'focus:ring-2 focus:ring-primary-500/20',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
              icon && 'pl-10',
              iconRight && 'pr-10',
              className
            )}
            {...props}
          />
          {iconRight && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-[var(--text-muted)]">
              {iconRight}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} role="alert" className="text-sm text-rose-400 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="text-xs text-[var(--text-muted)] leading-relaxed">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
