import React from 'react';
import bgGameOver from '../assets/background_gameover.png';
import game_over_title from '../assets/game_over.png';
import buttonGameOver from '../assets/button_gameover.png';

const GameOver = ({ onReset, type = "expelled", title, message }) => {
  return (
    <div className="absolute inset-0 w-full h-full bg-[#FFFFFF] m-0 p-0 overflow-hidden z-[20000]">
      {/* background_gameover 1 */}
      <div 
        className="absolute"
        style={{
          width: '1603px',
          height: '1140px',
          left: '-51.23px',
          top: '0px',
          backgroundImage: `url(${bgGameOver})`,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Stat 8 */}
      <div 
        className="absolute"
        style={{
          width: '677px',
          height: '241px',
          left: '393.77px',
          top: '433px',
          background: 'rgba(193, 179, 179, 0.4)',
          borderRadius: '8px',
        }}
      >
        {/* Lời nhắn linh hoạt từ code */}
        <div
          className="absolute"
          style={{
            width: '544px',
            height: '99px',
            left: '69px',
            top: '71px',
            fontFamily: '"Ga Maamli", sans-serif',
            fontStyle: 'normal',
            fontWeight: 400,
            fontSize: '32px',
            lineHeight: '40px',
            display: 'flex',
            alignItems: 'center',
            textAlign: 'center',
            color: '#B34B4B',
          }}
        >
          {message}
        </div>
      </div>

      {/* game_over 1 */}
      <div 
        className="absolute"
        style={{
          width: '592px',
          height: '421px',
          left: '423.77px',
          top: '149px',
          backgroundImage: `url(${game_over_title})`,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          zIndex: 10
        }}
      />

      {/* button_gameover 1 */}
      <div 
        className="absolute cursor-pointer hover:scale-105 transition-transform"
        onClick={onReset}
        style={{
          width: '375px',
          height: '194px',
          left: '562.77px',
          top: '606px',
        }}
      >
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${buttonGameOver})`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat'
          }}
        />
        {/* CHƠI LẠI */}
        <div 
          className="absolute flex items-center justify-center text-center select-none"
          style={{
            width: '202px',
            height: '53px',
            left: '87px', // 649.77 - 562.77
            top: '68px',  // 674 - 606
            fontFamily: '"Bungee Inline", sans-serif',
            fontStyle: 'normal',
            fontWeight: 400,
            fontSize: '40px',
            lineHeight: '30px',
            color: '#C5B6B6',
          }}
        >
          CHƠI LẠI
        </div>
      </div>
    </div>
  );
};

export default GameOver;
