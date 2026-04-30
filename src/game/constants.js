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
  { id: 'veggie', name: 'Rau', price: 5000, energy: 12, cookTime: 5 },
  { id: 'rice', name: 'Cơm', price: 10000, energy: 15, cookTime: 5 }
];

export const CANTEEN_MENU = [
  { id: 'com_ga', name: 'Cơm gà', price: 40000, energy: 20 },
  { id: 'bun_bo', name: 'Bún bò', price: 55000, energy: 35 },
  { id: 'nuoc_ngot', name: 'Nước ngọt', price: 15000, energy: 5 },
  { id: 'tra_sua', name: 'Trà sữa', price: 30000, energy: 15 }
];

export const LOCATIONS = [
  {
    id: 'school',
    name: 'Trường học',
    image: 'university.png',
    display: { x: 894, y: 26, rotation: 0, w: 397, h: 401 },
    interaction: { x: 962.12, y: 211.57, rotation: -30, w: 107.1, h: 112.04 }
  },
  {
    id: 'university',
    name: 'Trường đại học',
    image: 'university1.png',
    display: { x: 882, y: -36, rotation: 0, w: 624, h: 406 }
  },
  {
    id: 'market',
    name: 'Siêu thị',
    image: 'supermarket.png',
    display: { x: 302, y: 617, rotation: 0, w: 254.9, h: 250.82 },
    interaction: { x: 392.14, y: 729.72, rotation: 30, w: 92.59, h: 72.94 }
  },
  {
    id: 'home',
    name: 'Nhà trọ',
    image: 'apartment.png',
    display: { x: 2, y: 568, rotation: 0, w: 442, h: 418 },
    interaction: { x: 103, y: 833, rotation: 30, w: 188, h: 50.85 }
  },
  {
    id: 'work',
    name: 'Làm thêm',
    image: 'job_center.png',
    display: { x: 598, y: -62, rotation: 0, w: 239, h: 241 },
    interaction: { x: 718, y: 59, rotation: 30, w: 87.87, h: 65 }
  },
  {
    id: 'hospital',
    name: 'Bệnh viện',
    image: 'hospital.png',
    display: { x: 158.72, y: 59.44, rotation: 0, w: 412.02, h: 367.63 },
    interaction: { x: 343, y: 240.63, rotation: 30, w: 144.45, h: 94.16 }
  },
  {
    id: 'coffee',
    name: 'Quán cà phê',
    image: 'coffee.png',
    display: { x: 78, y: 150, rotation: 0, w: 251, h: 212 }
  },
  {
    id: 'parents_home',
    name: 'Nhà (Bố mẹ)',
    image: 'home.png',
    display: { x: 1178, y: 724, rotation: 180, w: 347, h: 331 },
    interaction: { x: 1231.61, y: 875.54, rotation: -30, w: 131.55, h: 82.66 }
  },
  {
    id: 'parking',
    name: 'Bãi đỗ xe',
    image: 'park.png',
    display: { x: 392, y: 287, rotation: 0, w: 618, h: 404 },
    interactions: [{ x: 529, y: 460, rotation: 30, w: 120.15, h: 118 },
    { x: 727.13, y: 472.51, rotation: 30, w: 165.58, h: 74 }
    ]
  },
  {
    id: 'student_house',
    name: 'Nhà học sinh',
    image: 'home_of_student.png',
    display: { x: 1282, y: 318, rotation: 0, w: 315, h: 284 },
    interaction: { x: 1327, y: 450, rotation: -30, w: 131.64, h: 84.37 }
  },
  {
    id: 'sell_transport_station',
    name: 'Trạm bán xe',
    image: 'shop.png',
    display: { x: 856, y: 431, rotation: 0, w: 509, h: 459 },
    interaction: { x: 979, y: 708.7, rotation: -30, w: 116, h: 91.62 }
  },
  {
    id: 'cantin',
    name: 'Căng tin',
    image: 'cantin.png',
    display: { x: 534, y: 753, rotation: 0, w: 381, h: 274 },
    interaction: { x: 577.33, y: 874.88, rotation: -30, w: 148.72, h: 105.02 }
  }
];

