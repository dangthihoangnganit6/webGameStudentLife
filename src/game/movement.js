/**
 * Movement logic utility for testing
 * @param {Object} currentPos {x, y}
 * @param {String} key ArrowUp, ArrowDown, etc.
 * @param {Number} speed
 * @param {Array} locations
 * @returns {Object} {x, y}
 */
export const movePlayer = (currentPos, key, speed, locations, playerSize = 32) => {
  let nextX = currentPos.x;
  let nextY = currentPos.y;

  if (key === 'ArrowUp') nextY -= speed;
  if (key === 'ArrowDown') nextY += speed;
  if (key === 'ArrowLeft') nextX -= speed;
  if (key === 'ArrowRight') nextX += speed;

  const isColliding = locations.some(loc => (
    nextX < loc.x + loc.width &&
    nextX + playerSize > loc.x &&
    nextY < loc.y + loc.height &&
    nextY + playerSize > loc.y
  ));

  return isColliding ? currentPos : { x: nextX, y: nextY };
};
