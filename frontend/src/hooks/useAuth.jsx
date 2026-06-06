import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('access'));

    useEffect(() => {
    const listener = () => {
      setIsAuth(!!localStorage.getItem('access'));
    };

    window.addEventListener('storage', listener);
    window.addEventListener('auth-changed', listener);
    return () => {
      window.removeEventListener('storage', listener);
      window.removeEventListener('auth-changed', listener);
    };
  }, []);

  return { isAuth };
};
