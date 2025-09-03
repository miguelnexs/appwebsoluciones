import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const ImageUpload = ({ 
  currentImage, 
  onImageChange, 
  onImageRemove, 
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB por defecto
  className = "",
  placeholder = "Subir imagen"
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    setError('');
    
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido');
      return false;
    }
    
    if (file.size > maxSize) {
      setError(`El archivo es demasiado grande. Máximo ${Math.round(maxSize / 1024 / 1024)}MB`);
      return false;
    }
    
    return true;
  };

  const handleFile = (file) => {
    if (!validateFile(file)) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      onImageChange(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    onImageRemove();
    setError('');
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Área de subida */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer
          ${dragActive 
            ? 'border-theme-accent bg-theme-accent/5' 
            : 'border-theme-border hover:border-theme-accent hover:bg-theme-accent/5'
          }
          ${currentImage ? 'bg-theme-secondary' : 'bg-theme-surface'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        
        {currentImage ? (
          <div className="space-y-3">
            <div className="relative inline-block">
              <img
                src={currentImage}
                alt="Logo"
                className="w-20 h-20 object-cover rounded-lg shadow-md"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
            <p className="text-sm text-theme-textSecondary">
              Click para cambiar la imagen
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 bg-theme-accent/10 rounded-full flex items-center justify-center">
              <Upload size={24} className="text-theme-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-theme-text">
                {placeholder}
              </p>
              <p className="text-xs text-theme-textSecondary mt-1">
                Arrastra una imagen aquí o click para seleccionar
              </p>
              <p className="text-xs text-theme-textSecondary">
                Máximo {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Información adicional */}
      {!currentImage && (
        <div className="text-xs text-theme-textSecondary bg-theme-secondary p-2 rounded-lg">
          <p>Formatos soportados: JPG, PNG, GIF, SVG</p>
          <p>Tamaño recomendado: 200x200px o superior</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 
