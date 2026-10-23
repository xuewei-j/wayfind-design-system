import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type FormEvent } from 'react';
import { Alert, Button, Card, Heading, Stack, Tag, Text, TextField } from '@wayfind/react';

const exhibitions = [
  { title: 'Light & Shadow', meta: 'Gallery 4 · Until March 30', tag: { tone: 'success', label: 'On view' } },
  { title: 'Soft Machines', meta: 'Gallery 2 · Opens April 12', tag: { tone: 'brand', label: 'Coming soon' } },
  { title: 'The Long Table', meta: 'Atrium · Members only', tag: { tone: 'accent', label: 'Members first' } },
] as const;

const slots = ['Sat 10am', 'Sat 2pm', 'Sun 11am'];

/** Side padding that shrinks on phones: 16px → 32px. */
const gutter = 'clamp(var(--wf-space-4), 5vw, var(--wf-space-8))';

function BookingForm() {
  const [slot, setSlot] = useState(slots[1]!);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<'idle' | 'saving' | 'done'>('idle');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter an email like name@example.com');
      return;
    }
    setError(undefined);
    setStatus('saving');
    setTimeout(() => setStatus('done'), 900);
  };

  if (status === 'done') {
    return (
      <Alert tone="success" title="Booking confirmed">
        Two tickets for {slot}. We sent them to {email}.
      </Alert>
    );
  }

  return (
    // noValidate: we show our own accessible error instead of the browser's tooltip.
    <form onSubmit={submit} noValidate>
      <Stack gap={5}>
      <Stack as="fieldset" gap={2}>
        <legend style={{ fontWeight: 600, marginBottom: 'var(--wf-space-2)' }}>Time</legend>
        <Stack direction="row" gap={2} wrap>
          {slots.map((s) => (
            <Button key={s} size="sm" variant={s === slot ? 'primary' : 'secondary'} aria-pressed={s === slot} onClick={() => setSlot(s)}>
              {s}
            </Button>
          ))}
        </Stack>
      </Stack>
      {slot === 'Sat 2pm' && (
        <Alert tone="warning" title="Only 4 tickets left">
          Saturday 2pm is almost full.
        </Alert>
      )}
      <TextField
        label="Email address"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error}
        hint="We’ll send your tickets here."
        required
      />
      <Button type="submit" size="lg" fullWidth loading={status === 'saving'}>
        Book 2 tickets · $36
      </Button>
      </Stack>
    </form>
  );
}

function ExhibitionPage() {
  return (
    <div style={{ background: 'var(--wf-color-bg-canvas)' }}>
      <Stack
        as="header"
        direction="row"
        justify="between"
        gap={3}
        wrap
        style={{ padding: `var(--wf-space-5) ${gutter}`, borderBottom: 'var(--wf-border-width-thin) solid var(--wf-color-border-default)' }}
      >
        <Text weight="bold" style={{ fontFamily: 'var(--wf-font-family-display)', letterSpacing: 'var(--wf-font-letter-spacing-display)' }}>
          WAYFIND MUSEUM
        </Text>
        <Stack as="nav" direction="row" gap={2} wrap aria-label="Main">
          <Button variant="ghost" size="sm">
            Exhibitions
          </Button>
          <Button variant="ghost" size="sm">
            Visit
          </Button>
          <Button variant="secondary" size="sm">
            Membership
          </Button>
        </Stack>
      </Stack>

      <Stack as="section" gap={12} style={{ padding: `var(--wf-space-12) ${gutter}`, maxWidth: '72rem', margin: '0 auto' }}>
        <div style={{ display: 'grid', gap: 'var(--wf-space-10)', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', alignItems: 'start' }}>
          <Stack gap={4}>
            <Heading level={2} size="md" tone="brand">
              Now showing
            </Heading>
            <Heading level={1} size="display">
              Light &amp; Shadow
            </Heading>
            <Text size="lg">Forty years of photographs about how cities look after dark — and who is out there to see it.</Text>
            <Stack direction="row" gap={2}>
              <Tag tone="success">On view</Tag>
              <Tag>Photography</Tag>
            </Stack>
          </Stack>
          <Card variant="elevated" padding="lg" as="section" aria-labelledby="book-title">
            <Heading level={2} size="lg" id="book-title">
              Book a visit
            </Heading>
            <BookingForm />
          </Card>
        </div>

        <Stack gap={5}>
          <Stack direction="row" justify="between">
            <Heading level={2}>Also on view</Heading>
            <Button variant="ghost">All exhibitions</Button>
          </Stack>
          <Stack as="ul" direction="row" gap={5} align="stretch" wrap>
            {exhibitions.map((e) => (
              <Card as="li" key={e.title} style={{ flex: '1 1 16rem' }}>
                <Stack gap={2}>
                  <div>
                    <Tag tone={e.tag.tone}>{e.tag.label}</Tag>
                  </div>
                  <Heading level={3}>{e.title}</Heading>
                  <Text size="sm" tone="muted">
                    {e.meta}
                  </Text>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Stack>
      </Stack>

      <footer style={{ background: 'var(--wf-color-bg-inverse)', padding: `var(--wf-space-8) ${gutter}` }}>
        <Text size="sm" style={{ color: 'var(--wf-color-text-inverse)' }}>
          A fictional museum, built only with Wayfind components and tokens.
        </Text>
      </footer>
    </div>
  );
}

const meta = {
  title: 'Patterns/Exhibition booking',
  component: ExhibitionPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A full page composed only from Wayfind components and tokens — no custom colors, no off-grid spacing. Try submitting without an email, then toggle dark mode in the toolbar.',
      },
    },
  },
  tags: ['!autodocs'],
} satisfies Meta<typeof ExhibitionPage>;

export default meta;

export const Page: StoryObj<typeof meta> = {};
