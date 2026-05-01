import { LOCATIONS as CONST_LOCATIONS } from '../game/constants';

// Merge layout tĩnh với logic tương tác và đảo ngược hướng xoay
export const LOCATIONS = CONST_LOCATIONS.map(loc => {
  // 1. Xử lý interaction singular
  const updatedInteraction = loc.interaction
    ? {
      ...loc.interaction,
      rotation: loc.interaction.rotation || 0
    }
    : null;

  // 2. Xử lý interactions plural (nhiều vùng va chạm)
  const updatedInteractions = loc.interactions
    ? loc.interactions.map(inter => ({
        ...inter,
        rotation: inter.rotation || 0
      }))
    : null;

  // 3. Xử lý logic riêng cho 'school'
  if (loc.id === 'school') {
    return {
      ...loc,
      interaction: updatedInteraction,
      interactions: updatedInteractions,
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

  return {
    ...loc,
    interaction: updatedInteraction,
    interactions: updatedInteractions
  };
});