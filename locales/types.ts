/**
 * i18next type augmentation for autocompletion.
 * Import the English locale files as the canonical key set.
 */

import 'i18next';

import type common from './en/common.json';
import type nav from './en/nav.json';
import type modeling from './en/modeling.json';
import type discovery from './en/discovery.json';
import type integration from './en/integration.json';
import type ai from './en/ai.json';
import type delivery from './en/delivery.json';
import type academy from './en/academy.json';
import type archetypes from './en/archetypes.json';
import type settings from './en/settings.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      nav: typeof nav;
      modeling: typeof modeling;
      discovery: typeof discovery;
      integration: typeof integration;
      ai: typeof ai;
      delivery: typeof delivery;
      academy: typeof academy;
      archetypes: typeof archetypes;
      settings: typeof settings;
    };
  }
}
