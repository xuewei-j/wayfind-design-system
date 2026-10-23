import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Alert, Button, Card, Heading, Stack, Tag, Text, TextField } from '../src';
import { axeViolations } from './axe';

describe('Button', () => {
  it('defaults to a non-submitting primary button', () => {
    render(<Button>Book tickets</Button>);
    const button = screen.getByRole('button', { name: 'Book tickets' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('data-variant', 'primary');
  });

  it('calls onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('while loading: ignores clicks, announces busy, stays focusable', async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Save' });
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toBeDisabled();
    button.focus();
    expect(button).toHaveFocus();
  });

  it('while loading inside a form: does not submit', async () => {
    const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit" loading>
          Pay
        </Button>
      </form>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('hides decorative icons from assistive tech', () => {
    render(<Button iconStart={<svg data-testid="icon" />}>Next</Button>);
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('button')).toHaveAccessibleName('Next');
  });

  it('has no axe violations across variants', async () => {
    const { container } = render(
      <div>
        {(['primary', 'secondary', 'ghost', 'danger'] as const).map((v) => (
          <Button key={v} variant={v}>
            {v}
          </Button>
        ))}
        <Button disabled>Disabled</Button>
        <Button loading>Loading</Button>
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('TextField', () => {
  it('associates label, hint and error with the input', () => {
    render(<TextField label="Email address" hint="We’ll send tickets here." error="Enter a valid email" />);
    const input = screen.getByLabelText('Email address');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Enter a valid email We’ll send tickets here.');
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email');
  });

  it('keeps a caller-provided aria-describedby', () => {
    render(
      <>
        <p id="extra">Extra context</p>
        <TextField label="Name" aria-describedby="extra" hint="As on your ID" />
      </>,
    );
    expect(screen.getByLabelText('Name')).toHaveAccessibleDescription('Extra context As on your ID');
  });

  it('can visually hide the label without removing it', () => {
    render(<TextField label="Search exhibitions" hideLabel type="search" />);
    expect(screen.getByRole('searchbox', { name: 'Search exhibitions' })).toBeInTheDocument();
  });

  it('marks required fields natively', () => {
    render(<TextField label="Name" required />);
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeRequired();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <TextField label="Name" hint="Hint" />
        <TextField label="Email" error="Error" />
        <TextField label="Disabled" disabled />
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('Alert', () => {
  it('interrupts for danger and stays polite otherwise', () => {
    render(
      <>
        <Alert tone="danger" title="Payment failed" />
        <Alert tone="success" title="Saved" />
      </>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Payment failed');
    expect(screen.getByRole('status')).toHaveTextContent('Saved');
  });

  it('renders an action', () => {
    render(<Alert title="Only 4 left" action={<Button size="sm">Book now</Button>} />);
    expect(screen.getByRole('button', { name: 'Book now' })).toBeInTheDocument();
  });
});

describe('Heading', () => {
  it('separates document level from visual size', () => {
    render(
      <Heading level={2} size="display">
        Big but second-level
      </Heading>,
    );
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveAttribute('data-size', 'display');
  });

  it('picks the matching size by default', () => {
    render(<Heading level={3}>Card title</Heading>);
    expect(screen.getByRole('heading', { level: 3 })).toHaveAttribute('data-size', 'lg');
  });
});

describe('Stack, Card, Tag, Text', () => {
  it('maps gap to a space token', () => {
    render(<Stack gap={6} data-testid="stack" />);
    expect(screen.getByTestId('stack').style.getPropertyValue('--_gap')).toBe('var(--wf-space-6)');
  });

  it('keeps list semantics for card collections', () => {
    render(
      <Stack as="ul">
        <Card as="li">One</Card>
        <Card as="li">Two</Card>
      </Stack>,
    );
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('renders tone and element choices', () => {
    render(
      <>
        <Tag tone="danger">Sold out</Tag>
        <Text as="span" tone="muted">
          Gallery 4
        </Text>
      </>,
    );
    expect(screen.getByText('Sold out')).toHaveAttribute('data-tone', 'danger');
    expect(screen.getByText('Gallery 4').tagName).toBe('SPAN');
  });

  it('forwards refs', () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<Button ref={ref}>Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
