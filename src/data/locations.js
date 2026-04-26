import { LOCATIONS as CONST_LOCATIONS } from '../game/constants';

// We merge the static layout from constants with the interactive options
export const LOCATIONS = CONST_LOCATIONS.map(loc => {
  if (loc.id === 'school') {
    return {
      ...loc,
      options: {
        credits: [
          { label: '15 Tín chỉ', value: 15 },
          { label: '20 Tín chỉ', value: 20 }
        ],
        difficulties: [
          { label: 'Dễ', value: 'easy' },
          { label: 'Khó', value: 'hard' }
        ]
      }
    };
  }
  return loc;
});
