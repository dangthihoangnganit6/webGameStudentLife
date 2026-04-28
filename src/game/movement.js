/**
 * Calculates the next position based on key input and map constraints
 * @param {Object} currentPos {x, y}
 * @param {String} key ArrowUp, ArrowDown, etc.
 * @param {Number} speed
 * @param {Object} boundaries {width, height}
 * @returns {Object} {x, y}
 */
export const calculateNextMove = (currentPos, key, speed = 5, boundaries = { width: 1200, height: 800 }, scaleFactor = 1) => {
  let dx = 0;
  let dy = 0;

  // Bản đồ gốc là Không gian 2D Grid thẳng góc. 
  if (key === 'ArrowUp') dy -= speed;
  if (key === 'ArrowDown') dy += speed;
  if (key === 'ArrowLeft') dx -= speed;
  if (key === 'ArrowRight') dx += speed;

  // Góc nghiêng của map. Theo số liệu Interaction (rotation: 30) thì map dùng hằng số 30 độ.
  // Lưu ý: Nếu road bị lệch, có thể map sử dụng True Isometric (26.565 độ). Thay Math.atan(0.5) vào theta.
  const theta = (30 * Math.PI) / 180; 

  // Ma trận chuyển đổi từ (x, y) sang màn hình Isometric (sx, sy) chuẩn mực:
  // dx_mới = (dx - dy) * cos(theta)
  // dy_mới = (dx + dy) * sin(theta)
  let iso_dx = (dx - dy) * Math.cos(theta);
  let iso_dy = (dx + dy) * Math.sin(theta);

  // Áp dụng responsive scale
  iso_dx *= scaleFactor;
  iso_dy *= scaleFactor;

  let newX = currentPos.x + iso_dx;
  let newY = currentPos.y + iso_dy;

  // Chặn ranh giới bản đồ: Đứng yên hoàn toàn nếu bước tiếp theo ra khỏi viền (Không trượt)
  const CHAR_W = 20;
  const CHAR_H = 50;
  if (
    newX < 0 || 
    newX > boundaries.width - CHAR_W || 
    newY < 0 || 
    newY > boundaries.height - CHAR_H
  ) {
    return currentPos;
  }

  return { x: newX, y: newY };
};

/**
 * Checks distance between two points
 */
export const getDistance = (p1, p2) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};
