import React from 'react';
import { Image } from '@mui/icons-material';
import PropTypes from 'prop-types';

const defaultProduct = { imagen_principal_url: '' };
const ProductGalleryTab = ({ product = defaultProduct }) => {
  // Función segura para obtener imágenes
  const getImages = () => {
    try {
      // Solo mostrar imagen principal del producto
      if (product?.imagen_principal_url) {
        return [{
          imagen: product.imagen_principal_url,
          descripcion: 'Imagen principal del producto',
          es_principal: true
        }];
      }
    } catch (error) {
      console.error('Error al procesar imágenes:', error);
    }
    
    return [];
  };

  const images = getImages();

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="mb-6">
        <h2 className="text-2xl font-semibold text-theme-text">
          Galería de imágenes
        </h2>
      </header>

      <section className="mb-8">
        {images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image, index) => (
              <article
                key={`${image.id || index}`}
                className="group bg-theme-surface rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-3 flex flex-col h-full border border-gray-100"
              >
                <div className="relative aspect-square overflow-hidden rounded-lg bg-theme-background">
                  <img
                    src={image.imagen || image.imagen_url || ''}
                    alt={image.descripcion || `Imagen ${index + 1} del producto`}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading={index > 2 ? "lazy" : "eager"}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/path-to-fallback-image.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                {(image.descripcion || image.es_principal) && (
                  <footer className="mt-3 flex justify-between items-center text-xs text-theme-textSecondary">
                    <span className="truncate">{image.descripcion || ''}</span>
                    {image.es_principal && (
                      <span className="shrink-0 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-300">
                        Principal
                      </span>
                    )}
                  </footer>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center bg-theme-background rounded-xl p-8 h-[300px] border-2 border-dashed border-theme-border">
            <Image sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
            <p className="text-theme-textSecondary text-center">
              No hay imágenes disponibles
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

ProductGalleryTab.propTypes = {
  product: PropTypes.shape({
    imagen_principal_url: PropTypes.string,
  }),
};

export default ProductGalleryTab;
