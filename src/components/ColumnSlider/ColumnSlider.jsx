import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import './ColumnSlider.css';

const ColumnSlider = ({ children }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalColumns, setTotalColumns] = useState(0);
  const columnsRef = useRef(null);
  const columnsPerView = 2;

  useLayoutEffect(() => {
    const updateColumnCount = () => {
      const columns = columnsRef.current?.querySelectorAll('.column');
      if (columns) {
        setTotalColumns(columns.length);
      }
    };

    // Mettre à jour au montage
    updateColumnCount();

    // Observer les changements de DOM
    const observer = new MutationObserver(updateColumnCount);
    observer.observe(columnsRef.current, {
      childList: true,
      subtree: true
    });

    // Nettoyer l'observateur
    return () => {
      observer.disconnect();
    };
  }, [columnsPerView]);

  const handleLeftArrow = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleRightArrow = () => {
    if (currentIndex < totalColumns - columnsPerView) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  useEffect(() => {
    const offset = -(100 / columnsPerView) * currentIndex;
    if (columnsRef.current) {
      columnsRef.current.style.transform = `translateX(${offset}%)`;
    }
  }, [currentIndex]);

  return (
    <div className="column-slider">
      <button
        className="arrow left-arrow"
        onClick={handleLeftArrow}
        style={{ display: currentIndex > 0 ? 'block' : 'none' }}
        aria-label="Précédent"
      >
        <span className="visually-hidden">Précédent</span>
        <span aria-hidden="true">&larr;</span>
      </button>
      <div 
        className="columns" 
        ref={columnsRef}
      >
        {children}
      </div>
      <button
        className="arrow right-arrow"
        onClick={handleRightArrow}
        style={{ display: currentIndex < totalColumns - columnsPerView ? 'block' : 'none' }}
        aria-label="Suivant"
      >
        <span className="visually-hidden">Suivant</span>
        <span aria-hidden="true">&rarr;</span>
      </button>
    </div>
  );
};

ColumnSlider.propTypes = {
  children: PropTypes.node.isRequired
};

export default ColumnSlider;
