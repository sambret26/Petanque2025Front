import React from 'react';

const NumberInput = (props) => {
  const handleKeyDown = (e) => {
    // Empêche l'incrémentation avec les touches haut/bas
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
    }
  };

  return (
    <input
      type="number"
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
};

export default NumberInput;
