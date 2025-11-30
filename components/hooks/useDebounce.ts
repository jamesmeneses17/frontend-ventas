import { useState, useEffect } from 'react';

/**
 * Hook personalizado para aplicar 'debounce' a un valor.
 * Retrasa la actualización del valor hasta que el usuario deja de modificarlo
 * por un período de tiempo especificado. Esto es crucial para optimizar la
 * funcionalidad de búsqueda y reducir las llamadas a la API o el filtrado
 * intensivo en CPU.
 *
 * @param value El valor a 'deboucear' (generalmente un término de búsqueda).
 * @param delay El tiempo de espera en milisegundos (ms) antes de actualizar el valor final.
 * @returns El valor final 'debounced'.
 */
function useDebounce<T>(value: T, delay: number): T {
  // Estado para almacenar el valor 'debounced'
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Configura un temporizador para actualizar debouncedValue después del 'delay'
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Función de limpieza:
    // Se ejecuta si 'value' cambia (el usuario sigue escribiendo) o si el componente
    // se desmonta. Esto cancela el temporizador anterior.
    return () => {
      clearTimeout(handler);
    };
    // El efecto se re-ejecuta si 'value' o 'delay' cambian
  }, [value, delay]); 

  return debouncedValue;
}

export default useDebounce;