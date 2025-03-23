import { useState, useEffect } from 'react';

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is defined (not server-side rendering)
    if (typeof window !== 'undefined') {
      // Initial check
      const checkIsMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      // Set initial value
      checkIsMobile();
      
      // Add event listener for window resize
      window.addEventListener('resize', checkIsMobile);
      
      // Cleanup on unmount
      return () => window.removeEventListener('resize', checkIsMobile);
    }
  }, []);

  return isMobile;
}
