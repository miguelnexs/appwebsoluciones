import React from 'react';
import { Category, Info } from '@mui/icons-material';
import { formatPrice } from '../../../utils/formatters';

// Componentes reutilizables
import ProductStatusChip from '../ProductStatusChip';
import ProductVariantItem from './ProductVariantItem';
import { RESOURCE_URL } from '../../../api/apiConfig';

// Traducciones básicas
const translations = {
  es: {
    loading: 'Cargando...',
    noImage: 'Sin imagen disponible',
    noColors: 'No hay colores especificados',
    noCategories: 'General',
    variants: 'Variantes',
    sku: 'SKU',
    price: 'Precio',
    comparePrice: 'Precio Comparación',
    stock: 'Stock',
    minStock: 'Mínimo:',
    description: 'Descripción',
    unavailable: '-',
  },
};

function getImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return RESOURCE_URL(url);
  return url;
}

const ProductInfoTab = ({ product, loading = false }) => {
  const safeProduct = product || {};
  const categories = safeProduct.categoria ? [safeProduct.categoria] : []; // Corregido aquí
  const variants = safeProduct.variantes || [];

  const hasCategories = categories.length > 0;
  const hasVariants = variants.length > 0;

  const renderSkeleton = (w = 'w-full', h = 'h-10') => (
    <div className={`animate-pulse bg-gray-300 rounded ${w} ${h}`} />
  );

  return (
    <div className="py-6 space-y-8">
      {/* Contenedor principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Imagen Principal */}
        <div>
          {loading ? (
            renderSkeleton('w-full', 'h-[420px]')
          ) : (
            <div className="rounded-2xl shadow-lg overflow-hidden bg-theme-surface transition-transform duration-300 hover:shadow-xl">
              <div className="h-[420px] flex items-center justify-center bg-theme-background">
                {safeProduct.imagen_principal_url ? (
                  <img
                    src={getImageUrl(safeProduct.imagen_principal_url)}
                    alt={safeProduct.nombre ? `Imagen de ${safeProduct.nombre}` : 'Imagen del producto'}
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                ) : (
                  <div className="text-center text-theme-textSecondary p-4" aria-label="Sin imagen disponible">
                    <Info fontSize="large" role="img" aria-label="Información sin imagen" />
                    <p className="text-sm">{translations.es.noImage}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div>
          <div className="bg-theme-surface rounded-2xl shadow-md p-6 transition-shadow hover:shadow-lg">
            {loading ? (
              <>
                {renderSkeleton('w-3/4')}
                {renderSkeleton('w-1/2', 'h-6')}
                <div className="mt-4 space-y-2">
                  {renderSkeleton()}
                  {renderSkeleton()}
                  {renderSkeleton()}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-2 truncate" title={safeProduct.nombre}>
                  {safeProduct.nombre || 'Nombre no disponible'}
                </h2>

                <div className="mb-3">
                  <ProductStatusChip status={safeProduct.estado} />
                </div>

                <p className="text-theme-textSecondary mb-4 line-clamp-3">
                  {safeProduct.descripcion_larga || 'No hay descripción disponible'}
                </p>

                <hr className="my-4" />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-theme-textSecondary flex items-center gap-1">
                      <Info fontSize="small" /> {translations.es.sku}
                    </span>
                    <p>{safeProduct.sku || translations.es.unavailable}</p>
                  </div>

                  <div>
                    <span className="text-theme-textSecondary">{translations.es.price}</span>
                    <p className="font-medium">
                      {formatPrice(safeProduct.precio)}
                    </p>
                  </div>

                  <div>
                    <span className="text-theme-textSecondary">{translations.es.comparePrice}</span>
                    <p className="text-theme-textSecondary">
                      {safeProduct.precio_comparacion
                        ? formatPrice(safeProduct.precio_comparacion)
                        : '-'}
                    </p>
                  </div>

                  <div>
                    <span className="text-theme-textSecondary">{translations.es.stock}</span>
                    <p className="font-medium">
                      {safeProduct.gestion_stock ? safeProduct.stock : 'N/A'}
                    </p>
                    {safeProduct.gestion_stock && safeProduct.stock_minimo && (
                      <span className="text-xs text-theme-textSecondary">
                        ({translations.es.minStock} {safeProduct.stock_minimo})
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>



          {/* Categorías */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-theme-textSecondary flex items-center gap-1">
              <Category fontSize="small" /> Categorías
            </h4>
            {loading ? (
              <div className="flex gap-2 mt-2">
                {[1, 2].map((i) => (
                  <div key={i} className="w-24 h-8 rounded bg-gray-300 animate-pulse" />
                ))}
              </div>
            ) : hasCategories ? (
              <div className="flex gap-2 flex-wrap mt-2">
                {categories.map((categoria) => (
                  <span
                    key={categoria.id}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full border border-blue-300"
                  >
                    {categoria.nombre}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-theme-textSecondary mt-2">{translations.es.noCategories}</p>
            )}
          </div>
        </div>
      </div>

      {/* Variantes del producto */}
      {hasVariants && (
        <div className="mt-10">
          <hr className="my-6" />
          <h3 className="text-xl font-semibold mb-4">{translations.es.variants}</h3>
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 bg-gray-300 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {variants.map((variant) => (
                <ProductVariantItem key={variant.id} variant={variant} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(ProductInfoTab);