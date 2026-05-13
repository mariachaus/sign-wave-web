import { useState, useEffect } from 'react';
import API_BASE_URL from '../../config/api';

export const API = API_BASE_URL;
export const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
