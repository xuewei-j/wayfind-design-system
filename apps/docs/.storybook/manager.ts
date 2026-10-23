import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'Wayfind — a design system for humans and AI agents',
    brandUrl: 'https://github.com/xuewei-j/wayfind-design-system',
    colorPrimary: '#267f8c',
    colorSecondary: '#267f8c',
    fontBase: "\"Helvetica Neue\", Arial, sans-serif",
    appBorderRadius: 2,
    inputBorderRadius: 2,
    textColor: '#333333',
    barSelectedColor: '#267f8c',
  }),
});
