/**
 * Debounce utility - delays function execution
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in ms
 */
export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
