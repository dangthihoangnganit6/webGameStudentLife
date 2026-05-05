import { useEffect, useState } from 'react';

const useKeyboard = () => {
  const [keys, setKeys] = useState({});

  useEffect(() => {
    const GAME_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Spacebar'];

    const handleKeyDown = (e) => {
      const tag = e.target.tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable;

      // Khi đang nhập liệu (Login/SignUp form), hoàn toàn bỏ qua – không set game key state
      if (isTyping) return;

      if (GAME_KEYS.includes(e.key)) {
        e.preventDefault();
      }
      setKeys((prev) => ({ ...prev, [e.key]: true }));
    };
    const handleKeyUp = (e) => {
      const tag = e.target.tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable;

      if (isTyping) return;

      if (GAME_KEYS.includes(e.key)) {
        e.preventDefault();
      }
      setKeys((prev) => ({ ...prev, [e.key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keys;
};

export default useKeyboard;
