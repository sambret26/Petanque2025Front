import { useEffect } from 'react';
import PropTypes from 'prop-types';

const KeyHandler = ({ onLeftArrow, onRightArrow, onEnter }) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.keyCode) {
        case 37: // Flèche gauche
          if (onLeftArrow) onLeftArrow();
          break;
        case 39: // Flèche droite
          if (onRightArrow) onRightArrow();
          break;
        case 13: // Touche Entrée
          if (onEnter) onEnter();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onLeftArrow, onRightArrow, onEnter]);

  return null;
};

KeyHandler.propTypes = {
  onLeftArrow: PropTypes.func,
  onRightArrow: PropTypes.func,
  onEnter: PropTypes.func
};

export default KeyHandler;
