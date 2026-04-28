export const MAP_CONFIG = {
  WIDTH: 1440,
  HEIGHT: 1024,
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
    image: 'university.png',
    display: { x: 864, y: 0, rotation: 0, w: 430, h: 434 },
    interaction: { x: 976, y: 217, rotation: -10, w: 74.08, h: 112.04 }
  },
  {
    id: 'market',
    name: 'Siêu thị',
    image: 'supermarket.png',
    display: { x: 340, y: 613, rotation: 0, w: 254.9, h: 250.82 },
    interaction: { x: 444, y: 742, rotation: 30, w: 94, h: 51 }
  },
  {
    id: 'home',
    name: 'Nhà trọ',
    image: 'apartment.png',
    display: { x: 93, y: 653, rotation: 0, w: 352, h: 333 },
    interaction: { x: 177, y: 845, rotation: 30, w: 188, h: 70.51 }
  },
  {
    id: 'work',
    name: 'Làm thêm',
    image: 'job_center.png',
    display: { x: 587, y: -36, rotation: 0, w: 239, h: 241 },
    interaction: { x: 707, y: 93.07, rotation: 30, w: 87.87, h: 65 }
  },
  {
    id: 'hospital',
    name: 'Bệnh viện',
    image: 'hospital.png',
    display: { x: 158.72, y: 59.44, rotation: 0, w: 412.02, h: 367.63 },
    interaction: { x: 343, y: 245.79, rotation: 30, w: 134.13, h: 94.16 }
  },
  {
    id: 'parents_home',
    name: 'Nhà (Bố mẹ)',
    image: 'home.png',
    display: { x: 1120, y: 693, rotation: 180, w: 347, h: 331 },
    interaction: { x: 1187, y: 833.36, rotation: -30, w: 111, h: 128.2 }
  }
];

