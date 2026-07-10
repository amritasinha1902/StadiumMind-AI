import clsx from 'clsx';

let _counter = 0;
const uid = () => `nexus-input-${++_counter}`;

export default function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}) {
  const inputId = id || uid();

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-nexus-text">
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-muted pointer-events-none">
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          className={clsx(
            'nexus-input',
            leftIcon  && 'pl-9',
            rightIcon && 'pr-9',
            error     && '!border-nexus-danger focus:!border-nexus-danger focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.2)]',
            className
          )}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          aria-invalid={!!error}
          {...props}
        />

        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-nexus-muted pointer-events-none">
            {rightIcon}
          </span>
        )}
      </div>

      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-nexus-danger">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="text-xs text-nexus-muted">
          {helperText}
        </p>
      )}
    </div>
  );
}
