import React from 'react';

const Character = ({ position, direction }) => {
  const directionRotation = {
    up: 'rotate-0',
    down: 'rotate-180',
    left: '-rotate-90',
    right: 'rotate-90',
  };

  return (
    <div
      className={`absolute w-8 h-8 transition-all duration-75 flex items-center justify-center`}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className={`relative w-full h-full bg-game-accent rounded-full border-2 border-white shadow-lg ${directionRotation[direction]}`}>
        {/* Simple "face" to indicate direction */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>
      </div>
    </div>
  );
};

export default Character;
