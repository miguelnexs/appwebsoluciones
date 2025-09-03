import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ProductInfoTab from './ProductInfoTab';
import ProductGalleryTab from './ProductGalleryTab';
import ProductColorsTab from '../ProductColorsTab';
import ProductForm from '../ProductForm';
import { Dialog } from '@mui/material';

const ProductDialog = ({ open, product, mode='view', onClose, onUpdateSuccess }) => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (!product) return null;

  // Render modo edición
  if (mode === 'edit') {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth scroll="paper">
        <ProductForm
          productToEdit={product}
          onSuccess={() => {
            if (onUpdateSuccess) onUpdateSuccess();
            onClose();
            navigate('/products');
          }}
          onCancel={onClose}
        />
      </Dialog>
    );
  }

  // Render modo visualización
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={false}
      scroll="paper"
      className="backdrop-blur-sm"
    >
      {/* Contenido del diálogo */}
      <div className="bg-theme-surface rounded-lg shadow-xl flex flex-col w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-theme-border">
          <h3 className="text-lg font-semibold text-theme-text truncate">{product.nombre}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-theme-border transition-colors"
            aria-label="Cerrar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-theme-textSecondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 sm:px-6 border-b border-theme-border">
          <div className="flex">
            <button
              onClick={() => handleTabChange(null, 0)}
              className={`py-3 px-4 font-medium text-sm focus:outline-none transition-colors ${
                tabValue === 0
                  ? 'text-theme-text border-b-2 border-gray-800 font-semibold'
                  : 'text-theme-textSecondary hover:text-theme-text'
              }`}
            >
              Información
            </button>
            <button
              onClick={() => handleTabChange(null, 1)}
              className={`flex items-center gap-2 py-3 px-4 font-medium text-sm focus:outline-none transition-colors ${
                tabValue === 1
                  ? 'text-theme-text border-b-2 border-gray-800 font-semibold'
                  : 'text-theme-textSecondary hover:text-theme-text'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
              Colores
            </button>
            <button
              onClick={() => handleTabChange(null, 2)}
              disabled={!product.imagen_principal_url}
              className={`flex items-center gap-2 py-3 px-4 font-medium text-sm focus:outline-none transition-colors ${
                tabValue === 2
                  ? 'text-theme-text border-b-2 border-gray-800 font-semibold'
                  : 'text-theme-textSecondary hover:text-theme-text'
              } ${!product.imagen_principal_url && 'opacity-50 cursor-not-allowed'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Galería
            </button>
          </div>
        </div>

        {/* Swipeable Views */}
        <div>
          {tabValue === 0 && (
            <div className="p-4 md:p-6 overflow-y-auto max-h-[60vh]">
              <ProductInfoTab product={product} />
            </div>
          )}
          {tabValue === 1 && (
            <div className="p-4 md:p-6 overflow-y-auto max-h-[60vh]">
              <ProductColorsTab 
                product={product} 
                onColorsChange={() => {
                  if (onUpdateSuccess) onUpdateSuccess();
                }}
              />
            </div>
          )}
          {tabValue === 2 && (
            <div className="p-4 md:p-6 overflow-y-auto max-h-[60vh]">
              <ProductGalleryTab product={product} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-theme-background rounded-b-lg border-t border-theme-border">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-theme-border hover:bg-gray-300 text-theme-textSecondary rounded-md transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default ProductDialog;
