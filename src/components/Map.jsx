import React from 'react';
import { LOCATIONS, MAP_CONFIG } from '../game/constants';

const Map = ({ children }) => {
  return (
    <div 
      className="relative bg-slate-900 border-4 border-slate-700 overflow-hidden shadow-2xl rounded-lg"
      style={{ width: MAP_CONFIG.WIDTH, height: MAP_CONFIG.HEIGHT }}
    >
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
          backgroundSize: `${MAP_CONFIG.TILE_SIZE}px ${MAP_CONFIG.TILE_SIZE}px`,
        }}
      ></div>

      {/* Locations */}
      {LOCATIONS.map((loc) => (
        <div
          key={loc.id}
          className="absolute flex items-center justify-center text-white font-bold text-center p-2 rounded shadow-md border-2 border-white/20"
          style={{
            left: loc.x,
            top: loc.y,
            width: loc.width,
            height: loc.height,
            backgroundColor: loc.color,
          }}
        >
          <div className="flex flex-col">
            <span className="text-sm">{loc.name}</span>
            <span className="text-[10px] opacity-75 font-normal">Interaction Area</span>
          </div>
        </div>
      ))}

      {/* Character and other game objects */}
      {children}
    </div>
  );
};

export default Map;
