export interface MessageState {
  phoneNumber: string;
  countryCode: string;
  message: string;
  attachment?: File | null;
}

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
}

export interface Recipient {
  id: string;
  original: string;
  number: string;
  status: 'pending' | 'sent' | 'skipped';
  sentAt?: string;
}

export type Tone = 'Professional' | 'Casual' | 'Friendly' | 'Formal' | 'Enthusiastic';