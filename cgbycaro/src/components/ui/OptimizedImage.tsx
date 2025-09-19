import React, { useState, useEffect } from 'react';
import { getImageUrlWithFallback } from '../../config/api';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;
  loading?: 'lazy' | 'eager';
  placeholder?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc = '/placeholder-image.jpg',
  onError,
  onLoad,
  loading = 'lazy',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YWFhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg=='
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    if (!src) {
      setImageSrc(fallbackSrc);
      setIsLoading(false);
      return;
    }

    const loadImage = async () => {
      setIsLoading(true);
      setHasError(false);
      
      try {
        // Procesar la URL con optimizaciones
        const processedUrl = getImageUrlWithFallback(src, fallbackSrc);
        setImageSrc(processedUrl);
        
        // Crear una imagen para verificar que carga correctamente
        const img = new Image();
        
        img.onload = () => {
          setIsLoading(false);
          onLoad?.();
        };
        
        img.onerror = () => {
          console.warn(`Error cargando imagen: ${processedUrl}`);
          
          if (retryCount < maxRetries) {
            // Reintentar con un delay
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              loadImage();
            }, 1000 * (retryCount + 1));
          } else {
            // Usar fallback después de todos los intentos
            setImageSrc(fallbackSrc);
            setIsLoading(false);
            setHasError(true);
            onError?.();
          }
        };
        
        img.src = processedUrl;
        
      } catch (error) {
        console.error('Error procesando imagen:', error);
        setImageSrc(fallbackSrc);
        setIsLoading(false);
        setHasError(true);
        onError?.();
      }
    };

    loadImage();
  }, [src, fallbackSrc, retryCount, onLoad, onError]);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Cargando...</div>
        </div>
      )}
      
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading={loading}
        onError={() => {
          if (!hasError) {
            setImageSrc(fallbackSrc);
            setHasError(true);
            onError?.();
          }
        }}
      />
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-xs text-center">
            <div>Error al cargar imagen</div>
            <button 
              onClick={() => {
                setRetryCount(0);
                setHasError(false);
              }}
              className="mt-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
