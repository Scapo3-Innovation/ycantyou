import { DEFAULT_LANGUAGE } from './constants';

/**
 * Single source of truth for the content language.
 *
 * Returns English for now. Every content query already takes a `language` argument, so
 * switching this to read the user's profile language (and adding translated rows) later
 * needs no screen changes.
 */
export function useContentLanguage(): string {
  return DEFAULT_LANGUAGE;
}
