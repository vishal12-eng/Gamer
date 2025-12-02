import { useState, useEffect, useRef } from 'react';

interface UseImageLoadOptions {
  lowQualityPlaceholder?: string;
}

export function useImageLoad(src: string, options: UseImageLoadOptions = {}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setIsLoaded(false);
    setIsError(false);

    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      setIsError(true);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { imgRef, isLoaded, isError };
}

export default useImageLoad;
