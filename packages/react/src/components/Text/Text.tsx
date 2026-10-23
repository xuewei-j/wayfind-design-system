import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils';
import './Text.css';

export interface TextOwnProps {
  size?: 'sm' | 'md' | 'lg';
  tone?: 'default' | 'muted' | 'brand' | 'success' | 'warning' | 'danger';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  as?: 'p' | 'span' | 'div' | 'strong' | 'em' | 'small';
  children: ReactNode;
}

export type TextProps = TextOwnProps & Omit<HTMLAttributes<HTMLElement>, keyof TextOwnProps>;

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  { size = 'md', tone = 'default', weight = 'regular', as: Element = 'p', className, children, ...rest },
  ref,
) {
  return (
    <Element
      ref={ref as never}
      className={cx('wf-text', className)}
      data-size={size}
      data-tone={tone}
      data-weight={weight}
      {...rest}
    >
      {children}
    </Element>
  );
});
