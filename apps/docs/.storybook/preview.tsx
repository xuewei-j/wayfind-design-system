import type { Decorator, Preview } from '@storybook/react-vite';
// Self-hosted fonts (SIL OFL): no third-party requests, and they render offline.
import '@fontsource/chivo/400.css';
import '@fontsource/chivo/900.css';
import '@fontsource/overpass/400.css';
import '@fontsource/overpass/500.css';
import '@fontsource/overpass/600.css';
import '@fontsource/overpass/700.css';
import '@wayfind/tokens/tokens.css';
import '@wayfind/react/styles.css';
import './preview.css';

/** Applies the toolbar theme to the whole preview document, the same way an app would. */
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  return <Story />;
};

const preview: Preview = {
  decorators: [withTheme],
  tags: ['autodocs'],
  globalTypes: {
    theme: {
      description: 'Color mode',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  parameters: {
    layout: 'padded',
    controls: { expanded: true, sort: 'requiredFirst' },
    a11y: { test: 'error' },
    options: {
      storySort: {
        order: ['Introduction', 'Foundations', ['Colors', 'Typography', 'Spacing & shape'], 'Components', 'Patterns', 'Agents'],
      },
    },
  },
};

export default preview;
