import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils';
import './Button.css';

export interface ButtonOwnProps {
  /** Visual emphasis. One primary action per view. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  /** Shows a spinner, sets aria-busy and blocks clicks while keeping the button's width. */
  loading?: boolean;
  /** Stretches to the container width (mobile forms, dialogs). */
  fullWidth?: boolean;
  /** Decorative icon before the label. Hidden from screen readers. */
  iconStart?: ReactNode;
  /** Decorative icon after the label. Hidden from screen readers. */
  iconEnd?: ReactNode;
  children: ReactNode;
}

export type ButtonProps = ButtonOwnProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    iconStart,
    iconEnd,
    children,
    className,
    disabled,
    type = 'button',
    onClick,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx('wf-button', className)}
      data-variant={variant}
      data-size={size}
      data-full-width={fullWidth || undefined}
      data-loading={loading || undefined}
      disabled={disabled}
      // aria-disabled instead of disabled while loading keeps the button focusable,
      // so keyboard users don't lose their place mid-submit.
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      onClick={loading ? (event) => event.preventDefault() : onClick}
      {...rest}
    >
      {iconStart && (
        <span className="wf-button__icon" aria-hidden="true">
          {iconStart}
        </span>
      )}
      <span className="wf-button__label">{children}</span>
      {iconEnd && (
        <span className="wf-button__icon" aria-hidden="true">
          {iconEnd}
        </span>
      )}
      {loading && <span className="wf-button__spinner" aria-hidden="true" />}
    </button>
  );
});
