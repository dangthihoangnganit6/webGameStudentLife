import React, { useState, useEffect } from 'react';

// Nhiệm vụ 4: Figma Readiness - Tọa độ nhà
const LOCATIONS = [
  { id: 'school', name: 'Trường Học', x: 100, y: 100, width: 120, height: 100, color: 'bg-blue-500' },
  { id: 'home', name: 'Nhà Trọ', x: 500, y: 150, width: 120, height: 100, color: 'bg-orange-500' },
  { id: 'work', name: 'Chỗ Làm', x: 300, y: 400, width: 120, height: 100, color: 'bg-red-500' },
];

const PLAYER_SIZE = 32;
const SPEED = 10;

function App() {
  const [position, setPosition] = useState({ x: 250, y: 250 });

  useEffect(() => {
    const handleKeyDown = (e) => {
      setPosition((prev) => {
        let nextX = prev.x;
        let nextY = prev.y;

        if (e.key === 'ArrowUp') nextY -= SPEED;
        if (e.key === 'ArrowDown') nextY += SPEED;
        if (e.key === 'ArrowLeft') nextX -= SPEED;
        if (e.key === 'ArrowRight') nextX += SPEED;

        // Collision Check (Simple)
        const isColliding = LOCATIONS.some(loc => (
          nextX < loc.x + loc.width &&
          nextX + PLAYER_SIZE > loc.x &&
          nextY < loc.y + loc.height &&
          nextY + PLAYER_SIZE > loc.y
        ));

        // Boundary Check
        if (nextX < 0 || nextY < 0 || nextX > window.innerWidth - PLAYER_SIZE || nextY > window.innerHeight - PLAYER_SIZE) {
          return prev;
        }

        return isColliding ? prev : { x: nextX, y: nextY };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-screen h-screen bg-green-100 overflow-hidden relative font-sans">
      {/* Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <h1 className="text-2xl font-black text-green-800 tracking-tight">STUDENT LIFE SIMULATOR</h1>
      </div>

      {/* Locations */}
      {LOCATIONS.map((loc) => (
        <div
          key={loc.id}
          className={`absolute ${loc.color} flex items-center justify-center text-white font-bold rounded-lg shadow-lg border-4 border-white/20`}
          style={{
            left: loc.x,
            top: loc.y,
            width: loc.width,
            height: loc.height,
          }}
        >
          {loc.name}
        </div>
      ))}

      {/* Character */}
      <div
        className="absolute w-8 h-8 bg-black rounded-full border-2 border-white shadow-xl transition-all duration-75 flex items-center justify-center"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <div className="w-1.5 h-1.5 bg-white rounded-full translate-y-[-4px]"></div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur rounded p-2 text-xs text-green-900 font-bold border border-green-200 shadow-sm">
        Sử dụng phím mũi tên để di chuyển
      </div>
    </div>
  );
}

export default App;
