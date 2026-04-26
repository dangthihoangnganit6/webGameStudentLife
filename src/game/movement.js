/**
 * Calculates the next position based on key input and map constraints
 * @param {Object} currentPos {x, y}
 * @param {String} key ArrowUp, ArrowDown, etc.
 * @param {Number} speed
 * @param {Object} boundaries {width, height}
 * @returns {Object} {x, y}
 */
export const calculateNextMove = (currentPos, key, speed = 5, boundaries = { width: 1200, height: 800 }) => {
  let { x, y } = currentPos;

  if (key === 'ArrowUp' && y > 0) y -= speed;
  if (key === 'ArrowDown' && y < boundaries.height) y += speed;
  if (key === 'ArrowLeft' && x > 0) x -= speed;
  if (key === 'ArrowRight' && x < boundaries.width) x += speed;

  return { x, y };
};

/**
 * Checks distance between two points
 */
export const getDistance = (p1, p2) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};
