import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils';
import './Alert.css';

export interface AlertOwnProps {
  tone?: 'info' | 'success' | 'warning' | 'danger';
  /** Short headline. The body explains what happened and what to do next. */
  title?: ReactNode;
  /** Optional action, usually a small secondary or ghost Button. */
  action?: ReactNode;
  children?: ReactNode;
}

export type AlertProps = AlertOwnProps & Omit<HTMLAttributes<HTMLDivElement>, keyof AlertOwnProps>;

const icons: Record<NonNullable<AlertOwnProps['tone']>, ReactNode> = {
  info: <path d="M10 9v5M10 6.5v.01" />,
  success: <path d="m6.5 10.5 2.5 2.5 4.5-5" />,
  warning: <path d="M10 7v4M10 13.5v.01" />,
  danger: <path d="m7.5 7.5 5 5m0-5-5 5" />,
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { tone = 'info', title, action, className, children, role, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      // Danger interrupts (role="alert"); everything else is announced politely.
      role={role ?? (tone === 'danger' ? 'alert' : 'status')}
      className={cx('wf-alert', className)}
      data-tone={tone}
      {...rest}
    >
      <svg className="wf-alert__icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <circle cx="10" cy="10" r="8.25" />
        {icons[tone]}
      </svg>
      <div className="wf-alert__content">
        {title && <p className="wf-alert__title">{title}</p>}
        {children && <div className="wf-alert__body">{children}</div>}
      </div>
      {action && <div className="wf-alert__action">{action}</div>}
    </div>
  );
});
