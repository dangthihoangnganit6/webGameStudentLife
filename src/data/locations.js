import { LOCATIONS as CONST_LOCATIONS } from '../game/constants';

// Merge layout tĩnh với logic tương tác và đảo ngược hướng xoay
export const LOCATIONS = CONST_LOCATIONS.map(loc => {
  // 1. Tạo bản sao của interaction và đảo dấu rotation nếu có
  const updatedInteraction = loc.interaction
    ? {
      ...loc.interaction,
      rotation: loc.interaction.rotation ? -loc.interaction.rotation : 0
    }
    : null;

  // 2. Xử lý riêng cho trường hợp 'school'
  if (loc.id === 'school') {
    return {
      ...loc,
      interaction: updatedInteraction, // Ghi đè interaction đã đảo dấu
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

  // 3. Trả về các địa điểm khác với interaction đã đảo dấu
  return {
    ...loc,
    interaction: updatedInteraction
  };
});