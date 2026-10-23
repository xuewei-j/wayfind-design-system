import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils';
import './TextField.css';

export interface TextFieldOwnProps {
  /** Visible label. Required — placeholders are not labels. */
  label: ReactNode;
  /** Visually hides the label but keeps it for screen readers (e.g. a lone search box). */
  hideLabel?: boolean;
  /** Helper text under the field. */
  hint?: ReactNode;
  /** Error message. When set, the field is marked invalid and the message is announced. */
  error?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export type TextFieldProps = TextFieldOwnProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, keyof TextFieldOwnProps>;

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hideLabel = false, hint, error, size = 'md', id, className, required, 'aria-describedby': describedBy, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `wf-field-${autoId}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedByIds = [describedBy, errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cx('wf-field', className)} data-size={size} data-invalid={error ? true : undefined}>
      <label htmlFor={inputId} className={cx('wf-field__label', hideLabel && 'wf-visually-hidden')}>
        {label}
        {required && (
          <span className="wf-field__required" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      <input
        ref={ref}
        id={inputId}
        className="wf-field__input"
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedByIds}
        {...rest}
      />
      {error && (
        <p id={errorId} className="wf-field__error" role="alert">
          {error}
        </p>
      )}
      {hint && (
        <p id={hintId} className="wf-field__hint">
          {hint}
        </p>
      )}
    </div>
  );
});
