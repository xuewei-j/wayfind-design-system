import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils';
import './Card.css';

export interface CardOwnProps {
  variant?: 'outlined' | 'elevated' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Pick the element that matches the content: article for self-contained items, li inside lists. */
  as?: 'div' | 'article' | 'section' | 'li';
  children: ReactNode;
}

export type CardProps = CardOwnProps & Omit<HTMLAttributes<HTMLElement>, keyof CardOwnProps>;

export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { variant = 'outlined', padding = 'md', as: Element = 'div', className, children, ...rest },
  ref,
) {
  return (
    <Element
      // The union of element refs is safe here: all four are plain HTMLElements.
      ref={ref as never}
      className={cx('wf-card', className)}
      data-variant={variant}
      data-padding={padding}
      {...rest}
    >
      {children}
    </Element>
  );
});
