import React, { useState, useEffect } from 'react';
import { productService, CaracteristicaProducto } from '../services/productService';

interface ProductSpecificationsProps {
  productoId: number;
}

const ProductSpecifications: React.FC<ProductSpecificationsProps> = ({ productoId }) => {
  const [caracteristicas, setCaracteristicas] = useState<CaracteristicaProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCaracteristicas = async () => {
      try {
        setLoading(true);
        const data = await productService.obtenerCaracteristicas(productoId);
        setCaracteristicas(data);
      } catch (err) {
        setError('Error al cargar las características del producto');
        console.error('Error fetching characteristics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCaracteristicas();
  }, [productoId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-neutral-900">Características</h3>
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-neutral-200 rounded w-3/4"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-neutral-900">Características</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (caracteristicas.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-neutral-900">Características</h3>
      
      <ul className="space-y-3">
        {caracteristicas.map((caracteristica) => (
          <li key={caracteristica.id} className="flex items-start">
            <span className="text-neutral-400 mr-3 mt-0.5">•</span>
            <div className="flex-1">
              <span className="text-neutral-600 font-medium">{caracteristica.nombre}: </span>
              <span className="text-neutral-900">{caracteristica.valor}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductSpecifications;