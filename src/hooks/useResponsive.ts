import { throttle } from 'es-toolkit';
import { useEffect, useState } from 'react';

export const useResponsiveIsGreaterThan = (breakpoint: number) => {
  const [isGreaterThan, setIsGreaterThan] = useState<boolean | null>(null);
  useEffect(() => {
    const onResize = throttle(() => setIsGreaterThan(window.innerWidth >= breakpoint), 80);
    onResize();

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return isGreaterThan;
};
