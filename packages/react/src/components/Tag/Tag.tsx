import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils';
import './Tag.css';

export interface TagOwnProps {
  /** Meaning, not decoration: success = done/available, warning = needs attention, danger = blocked/sold out. */
  tone?: 'neutral' | 'brand' | 'accent' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  children: ReactNode;
}

export type TagProps = TagOwnProps & Omit<HTMLAttributes<HTMLSpanElement>, keyof TagOwnProps>;

export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { tone = 'neutral', size = 'md', className, children, ...rest },
  ref,
) {
  return (
    <span ref={ref} className={cx('wf-tag', className)} data-tone={tone} data-size={size} {...rest}>
      {children}
    </span>
  );
});
