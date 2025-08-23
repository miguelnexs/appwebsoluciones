import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Settings,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';

const ProductFormCaracteristicas = ({ productId, onCaracteristicasChange }) => {
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para el diálogo de característica
  const [openCaracteristicaDialog, setOpenCaracteristicaDialog] = useState(false);
  const [editingCaracteristica, setEditingCaracteristica] = useState(null);
  const [caracteristicaForm, setCaracteristicaForm] = useState({
    nombre: '',
    valor: '',
    orden: 0,
    activo: true
  });

  // Cargar características del producto
  const cargarCaracteristicas = async () => {
    if (!productId) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await window.electronAPI.productos.obtenerCaracteristicas(productId);
      
      if (response.success) {
        const caracteristicasData = Array.isArray(response.data) ? response.data : [];
        setCaracteristicas(caracteristicasData);
        
        if (onCaracteristicasChange) {
          onCaracteristicasChange(caracteristicasData);
        }
      } else {
        setError('Error al cargar las características');
        setCaracteristicas([]);
      }
    } catch (error) {
      console.error('Error al cargar características:', error);
      setError('Error de conexión');
      setCaracteristicas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      cargarCaracteristicas();
    }
  }, [productId]);

  // Auto-hide alerts
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Manejar cambios en el formulario de característica
  const handleCaracteristicaFormChange = (field, value) => {
    setCaracteristicaForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Abrir diálogo para crear/editar característica
  const handleOpenCaracteristicaDialog = (caracteristica = null) => {
    if (caracteristica) {
      setEditingCaracteristica(caracteristica);
      setCaracteristicaForm({
        nombre: caracteristica.nombre,
        valor: caracteristica.valor,
        orden: caracteristica.orden || 0,
        activo: caracteristica.activo
      });
    } else {
      setEditingCaracteristica(null);
      setCaracteristicaForm({
        nombre: '',
        valor: '',
        orden: 0,
        activo: true
      });
    }
    setOpenCaracteristicaDialog(true);
  };

  // Cerrar diálogo de característica
  const handleCloseCaracteristicaDialog = () => {
    setOpenCaracteristicaDialog(false);
    setEditingCaracteristica(null);
    setCaracteristicaForm({
      nombre: '',
      valor: '',
      orden: 0,
      activo: true
    });
  };

  // Guardar característica
  const handleSaveCaracteristica = async () => {
    if (!caracteristicaForm.nombre.trim() || !caracteristicaForm.valor.trim()) {
      setError('El nombre y valor de la característica son obligatorios');
      return;
    }

    try {
      let response;
      
      if (editingCaracteristica) {
        // Actualizar característica existente
        response = await window.electronAPI.productos.actualizarCaracteristica(
          productId,
          editingCaracteristica.id,
          caracteristicaForm
        );
      } else {
        // Crear nueva característica
        response = await window.electronAPI.productos.crearCaracteristica(
          productId,
          caracteristicaForm
        );
      }

      if (response.success) {
        setSuccess(editingCaracteristica ? 'Característica actualizada correctamente' : 'Característica creada correctamente');
        handleCloseCaracteristicaDialog();
        await cargarCaracteristicas();
      } else {
        setError(response.message || 'Error al guardar la característica');
      }
    } catch (error) {
      console.error('Error al guardar característica:', error);
      setError('Error de conexión al guardar la característica');
    }
  };

  // Eliminar característica
  const handleDeleteCaracteristica = async (caracteristicaId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta característica?')) {
      return;
    }

    try {
      const response = await window.electronAPI.productos.eliminarCaracteristica(productId, caracteristicaId);
      
      if (response.success) {
        setSuccess('Característica eliminada correctamente');
        await cargarCaracteristicas();
      } else {
        setError(response.message || 'Error al eliminar la característica');
      }
    } catch (error) {
      console.error('Error al eliminar característica:', error);
      setError('Error de conexión al eliminar la característica');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-theme-text flex items-center gap-2">
          <Settings className="h-5 w-5 text-theme-primary" />
          Características del Producto
        </h3>
        <button
          onClick={() => handleOpenCaracteristicaDialog()}
          disabled={!productId}
          className="inline-flex items-center px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Característica
        </button>
      </div>

      {/* Alertas */}
      {!productId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-blue-800">Guarda el producto primero para poder agregar características</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800">{success}</span>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader className="h-6 w-6 animate-spin text-theme-primary" />
        </div>
      ) : (
        /* Tabla de características */
        <div className="bg-theme-surface border border-theme-border rounded-xl overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-theme-background">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-theme-textSecondary uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-theme-textSecondary uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-theme-textSecondary uppercase tracking-wider">
                  Orden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-theme-textSecondary uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-theme-textSecondary uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-theme-surface divide-y divide-theme-border">
              {caracteristicas.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-theme-textSecondary">
                    No hay características configuradas
                  </td>
                </tr>
              ) : (
                caracteristicas.map((caracteristica) => (
                  <tr key={caracteristica.id} className="hover:bg-theme-background transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-theme-text">
                        {caracteristica.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-theme-text">
                        {caracteristica.valor}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-theme-text">
                        {caracteristica.orden}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        caracteristica.activo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {caracteristica.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleOpenCaracteristicaDialog(caracteristica)}
                          className="text-theme-primary hover:text-theme-primary hover:opacity-80 transition-colors"
                          title="Editar característica"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCaracteristica(caracteristica.id)}
                          className="text-theme-error hover:text-theme-error hover:opacity-80 transition-colors"
                          title="Eliminar característica"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Diálogo de característica */}
      {openCaracteristicaDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-theme-surface rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-theme-border">
              <h3 className="text-lg font-semibold text-theme-text">
                {editingCaracteristica ? 'Editar Característica' : 'Nueva Característica'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-theme-textSecondary mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={caracteristicaForm.nombre}
                  onChange={(e) => handleCaracteristicaFormChange('nombre', e.target.value)}
                  className="w-full px-3 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-theme-accent transition-colors"
                  placeholder="Ej: Material, Tamaño, Peso..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-theme-textSecondary mb-2">
                  Valor *
                </label>
                <input
                  type="text"
                  value={caracteristicaForm.valor}
                  onChange={(e) => handleCaracteristicaFormChange('valor', e.target.value)}
                  className="w-full px-3 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-theme-accent transition-colors"
                  placeholder="Ej: Algodón, XL, 500g..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-theme-textSecondary mb-2">
                  Orden
                </label>
                <input
                  type="number"
                  value={caracteristicaForm.orden}
                  onChange={(e) => handleCaracteristicaFormChange('orden', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-theme-accent transition-colors"
                  min="0"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="activo"
                  checked={caracteristicaForm.activo}
                  onChange={(e) => handleCaracteristicaFormChange('activo', e.target.checked)}
                  className="h-4 w-4 text-theme-primary focus:ring-theme-accent border-theme-border rounded"
                />
                <label htmlFor="activo" className="ml-2 block text-sm text-theme-text">
                  Característica activa
                </label>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-theme-border flex justify-end space-x-3">
              <button
                onClick={handleCloseCaracteristicaDialog}
                className="px-4 py-2 text-theme-textSecondary hover:text-theme-text transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCaracteristica}
                className="px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary hover:opacity-90 transition-colors"
              >
                {editingCaracteristica ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default ProductFormCaracteristicas;