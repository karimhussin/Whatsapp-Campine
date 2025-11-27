import { CountryOption, Tone } from './types';

export const DEFAULT_COUNTRY_CODE = '+20'; // Defaulting to Egypt code

export const COMMON_COUNTRIES: CountryOption[] = [
  { code: '+20', name: 'Egypt', flag: '🇪🇬' },
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+971', name: 'UAE', flag: '🇦🇪' },
  { code: '+965', name: 'Kuwait', flag: '🇰🇼' },
  { code: '+974', name: 'Qatar', flag: '🇶🇦' },
  { code: '+968', name: 'Oman', flag: '🇴🇲' },
  { code: '+973', name: 'Bahrain', flag: '🇧🇭' },
  { code: '+962', name: 'Jordan', flag: '🇯🇴' },
  { code: '+1', name: 'USA/Canada', flag: '🇺🇸' },
  { code: '+44', name: 'UK', flag: '🇬🇧' },
  { code: '+91', name: 'India', flag: '🇮🇳' },
];

export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash';

export const TONE_PROMPTS: Record<Tone, string> = {
  Professional: 'Rewrite the following text to sound professional, polite, and concise suitable for business communication.',
  Casual: 'Rewrite the following text to sound casual, friendly, and relaxed.',
  Friendly: 'Rewrite the following text to be warm, approachable, and friendly.',
  Formal: 'Rewrite the following text to be formal, respectful, and structured.',
  Enthusiastic: 'Rewrite the following text to convey excitement and enthusiasm.'
};