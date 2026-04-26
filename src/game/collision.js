/**
 * Axis-Aligned Bounding Box (AABB) Collision Detection
 * @param {Object} rect1 {x, y, width, height}
 * @param {Object} rect2 {x, y, width, height}
 * @returns {Boolean}
 */
export const checkCollision = (rect1, rect2) => {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
};

/**
 * Checks if a position is within the map boundaries
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} width 
 * @param {Number} height 
 * @param {Object} mapConfig {WIDTH, HEIGHT}
 * @returns {Boolean}
 */
export const isWithinBounds = (x, y, width, height, mapConfig) => {
  return (
    x >= 0 &&
    y >= 0 &&
    x + width <= mapConfig.WIDTH &&
    y + height <= mapConfig.HEIGHT
  );
};
