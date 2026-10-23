import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils';
import './Heading.css';

export interface HeadingOwnProps {
  /** Document outline level (h1–h4). Choose by structure, not by looks. */
  level: 1 | 2 | 3 | 4;
  /** Visual size, independent of level. Defaults to the size that matches the level. */
  size?: 'display' | 'xl' | 'lg' | 'md';
  tone?: 'default' | 'brand';
  children: ReactNode;
}

export type HeadingProps = HeadingOwnProps & Omit<HTMLAttributes<HTMLHeadingElement>, keyof HeadingOwnProps>;

const defaultSize = { 1: 'display', 2: 'xl', 3: 'lg', 4: 'md' } as const;

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  { level, size, tone = 'default', className, children, ...rest },
  ref,
) {
  const Tag = `h${level}` as const;
  return (
    <Tag ref={ref} className={cx('wf-heading', className)} data-size={size ?? defaultSize[level]} data-tone={tone} {...rest}>
      {children}
    </Tag>
  );
});
