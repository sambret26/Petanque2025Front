// Imports librairie
import { useEffect } from "react";

// Désactive le geste de retour arrière avec le trackpad
const useDisableSwipeBack = () => {
  useEffect(() => {
    
    const handleWheel = (e) => {
      // Détecte un défilement horizontal avec le trackpad
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        return false;
      }
      return true;
    };

    // Ajoute l'écouteur d'événement wheel avec l'option passive:false
    document.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);
};

export { useDisableSwipeBack };