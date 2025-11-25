export interface Drink {
  id: string;
  name: string;
  volumeMl: number;
  abv: number;
  standardDrinks: number;
  timestamp: number;
}

export enum CalculationMode {
  MANUAL = 'MANUAL',
  AI = 'AI'
}

export type Gender = 'male' | 'female';

export const COMMON_SIZES = [
  { label: 'Nip/Shot', volume: 30 },
  { label: 'Small Wine', volume: 100 },
  { label: 'Std Wine', volume: 150 },
  { label: 'Pot/Middy', volume: 285 },
  { label: 'Stubby/Can', volume: 375 },
  { label: 'Schooner', volume: 425 },
  { label: 'Pint', volume: 570 },
  { label: 'Bottle (Wine)', volume: 750 },
  { label: 'Jug', volume: 1140 },
];

export const COMMON_ABV = [
  { label: 'Light Beer', value: 2.7 },
  { label: 'Mid Strength', value: 3.5 },
  { label: 'Full Strength', value: 4.8 },
  { label: 'IPA/Craft', value: 6.5 },
  { label: 'White Wine', value: 11.5 },
  { label: 'Champagne', value: 12.0 },
  { label: 'Red Wine', value: 13.5 },
  { label: 'Fortified', value: 18.0 },
  { label: 'Spirits', value: 40.0 },
];
