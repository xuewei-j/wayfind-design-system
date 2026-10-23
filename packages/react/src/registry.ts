/**
 * Machine-readable component registry.
 *
 * This entry point imports no React at runtime (component files are only
 * referenced for their types), so the MCP server and docs can load it anywhere.
 */
import type { ComponentMeta } from './meta';
import { buttonMeta } from './components/Button/Button.meta';
import { textFieldMeta } from './components/TextField/TextField.meta';
import { tagMeta } from './components/Tag/Tag.meta';
import { cardMeta } from './components/Card/Card.meta';
import { alertMeta } from './components/Alert/Alert.meta';
import { stackMeta } from './components/Stack/Stack.meta';
import { headingMeta } from './components/Heading/Heading.meta';
import { textMeta } from './components/Text/Text.meta';

export type { ComponentMeta, PropDoc, Example } from './meta';

export const components: readonly ComponentMeta[] = [
  buttonMeta,
  textFieldMeta,
  tagMeta,
  cardMeta,
  alertMeta,
  stackMeta,
  headingMeta,
  textMeta,
] as ComponentMeta[];

export {
  buttonMeta,
  textFieldMeta,
  tagMeta,
  cardMeta,
  alertMeta,
  stackMeta,
  headingMeta,
  textMeta,
};
