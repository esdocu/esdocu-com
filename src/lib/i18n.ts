import es from './dictionaries/es.json';
import fr from './dictionaries/fr.json';
import de from './dictionaries/de.json';

const dictionaries = {
  es,
  fr,
  de
};

export type Locale = keyof typeof dictionaries;

export function getLocale(): Locale {
  const locale = process.env.BUILD_LOCALE || 'es';
  // Check if it's a supported locale, fallback to es
  if (locale in dictionaries) {
    return locale as Locale;
  }
  return 'es';
}

export function getDictionary() {
  const locale = getLocale();
  return dictionaries[locale];
}
