export const MAP_CONFIG = {
  WIDTH: 800,
  HEIGHT: 600,
  TILE_SIZE: 32,
  CHARACTER_SPEED: 4,
};

export const HOUSING_TYPES = [
  { id: 'cheap', label: 'Giá rẻ', price: 2000000, energyRecovery: 20, description: 'Phòng nhỏ, chung chủ.' },
  { id: 'standard', label: 'Bình dân', price: 5000000, energyRecovery: 50, description: 'Phòng khép kín, thoải mái.' },
  { id: 'premium', label: 'Cao cấp', price: 10000000, energyRecovery: 100, description: 'Chung cư mini, đầy đủ tiện nghi.' }
];

export const INGREDIENTS = [
  { id: 'egg', name: 'Trứng', price: 5000, energy: 10, cookTime: 3 },
  { id: 'meat', name: 'Thịt', price: 50000, energy: 40, cookTime: 8 },
  { id: 'veggie', name: 'Rau', price: 5000, energy: 12, cookTime: 5 }
];

export const LOCATIONS = [
  {
    id: 'school',
    name: 'Trường học',
    x: 150,
    y: 150,
    color: 'bg-blue-600'
  },
  {
    id: 'home',
    name: 'Nhà trọ',
    x: 600,
    y: 200,
    color: 'bg-amber-600'
  },
  {
    id: 'work',
    name: 'Làm thêm',
    x: 400,
    y: 450,
    color: 'bg-rose-600'
  },
  {
    id: 'market',
    name: 'Siêu thị',
    x: 200,
    y: 450,
    color: 'bg-emerald-600'
  },
  {
    id: 'hospital',
    name: 'Bệnh viện',
    x: 50,
    y: 450,
    color: 'bg-red-600'
  },
  {
    id: 'parents_home',
    name: 'Nhà (Bố mẹ)',
    x: 750,
    y: 450,
    color: 'bg-emerald-600'
  }
];

