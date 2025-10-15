import { configActions } from '@atlantis-gr/svelte-config';

/**
 * Safe configuration utilities that don't access Svelte context
 * These can be called from anywhere, including event handlers
 */

export function safeUpdateConfig(updates: any) {
  configActions.updateSettings(updates);
}

export function safeResetConfig() {
  configActions.reset();
}

export function safeInitializeDefaults(defaults: any) {
  configActions.initializeDefaults(defaults);
}