import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils';
import './Stack.css';

/** Steps on the 4px space scale (space.N in the tokens). */
export type SpaceStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;

export interface StackOwnProps {
  direction?: 'column' | 'row';
  /** Gap between children, as a step on the space scale. Off-scale values are a type error. */
  gap?: SpaceStep | `${SpaceStep}`;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between';
  /** Let row items wrap onto new lines. */
  wrap?: boolean;
  as?: 'div' | 'section' | 'ul' | 'ol' | 'nav' | 'header' | 'footer' | 'form' | 'fieldset';
  children?: ReactNode;
}

export type StackProps = StackOwnProps & Omit<HTMLAttributes<HTMLElement>, keyof StackOwnProps>;

export const Stack = forwardRef<HTMLElement, StackProps>(function Stack(
  { direction = 'column', gap = 4, align, justify, wrap = false, as: Element = 'div', className, style, children, ...rest },
  ref,
) {
  return (
    <Element
      ref={ref as never}
      className={cx('wf-stack', className)}
      data-direction={direction}
      data-align={align}
      data-justify={justify}
      data-wrap={wrap || undefined}
      style={{ '--_gap': `var(--wf-space-${gap})`, ...style } as CSSProperties}
      {...rest}
    >
      {children}
    </Element>
  );
});
