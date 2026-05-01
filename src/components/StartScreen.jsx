import React from 'react';
import backgroundStart from '../assets/background_start.png';
import logo from '../assets/logo.png';
import buttonImg from '../assets/button.png';

export default function StartScreen({ onStart }) {
  return (
    <div className="absolute inset-0 w-full h-full bg-[#FFFFFF] m-0 p-0 overflow-hidden">
      <div 
        className="absolute"
        style={{
          width: '1551px',
          height: '1104px',
          left: '-56px',
          top: '-80px',
          backgroundImage: `url(${backgroundStart})`,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <div 
        className="absolute pointer-events-none"
        style={{
          width: '1432px',
          height: '1018px',
          left: '0px',
          top: '-178px',
          backgroundImage: `url(${logo})`,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Button container */}
      <div 
        className="absolute cursor-pointer hover:scale-105 transition-transform"
        onClick={onStart}
        style={{
          width: '352.34px',
          height: '182px',
          left: '543.77px',
          top: '444px',
        }}
      >
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${buttonImg})`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div 
          className="absolute flex items-center justify-center text-center select-none"
          style={{
            width: '165px',
            height: '53px',
            left: '90px',
            top: '57px',
            fontFamily: '"Bungee Outline", sans-serif',
            fontStyle: 'normal',
            fontWeight: 400,
            fontSize: '40px',
            lineHeight: '30px',
            color: '#000000',
          }}
        >
          CHƠI
        </div>
      </div>
    </div>
  );
}
