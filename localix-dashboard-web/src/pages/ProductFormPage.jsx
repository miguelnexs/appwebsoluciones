import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import ProductForm from '../components/productos/ProductForm';
import { toast, ToastContainer } from 'react-toastify';
import { useNotifications } from '../hooks/useNotifications.jsx';
import 'react-toastify/dist/ReactToastify.css';

export default function ProductFormPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { showProductSaved, showProductError } = useNotifications();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  // Removido: estado saving ya no necesario

  useEffect(() => {
    const loadProduct = async () => {
      if (slug) {
        try {
          setLoading(true);
          const productData = await window.electronAPI.productos.obtener(slug);
          setProduct(productData);
        } catch (error) {
          console.error('Error cargando producto:', error);
          showProductError('Error al cargar el producto');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadProduct();
    // eslint-disable-next-line
  }, [slug]);

  const handleSuccess = (isNew = false) => {
    showProductSaved(isNew);
    navigate('/products');
  };

  const handleCancel = () => {
    navigate('/products');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-theme-textSecondary">Cargando producto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-background">
      {/* Header */}
      <div className="bg-theme-surface shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/products')}
                className="p-2 rounded-lg hover:bg-theme-secondary transition-colors"
                title="Volver a productos"
              >
                <ArrowLeft className="h-5 w-5 text-theme-textSecondary" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-theme-text">
                  {slug ? 'Editar Producto' : 'Crear Nuevo Producto'}
                </h1>
                <p className="text-sm text-theme-textSecondary">
                  {slug ? 'Modifica la información del producto' : 'Completa la información del nuevo producto'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-theme-textSecondary bg-theme-surface border border-theme-border rounded-lg hover:bg-theme-background focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-theme-surface rounded-lg shadow-sm border">
          <ProductForm
            productToEdit={product}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            compact={false}
          />
        </div>
      </div>

      {/* Toast Container con configuración mejorada */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastClassName="rounded-lg shadow-lg"
        bodyClassName="font-medium"
        progressClassName="bg-theme-surface"
      />
    </div>
  );
} 
