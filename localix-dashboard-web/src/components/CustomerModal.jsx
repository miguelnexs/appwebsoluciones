// src/components/CustomerModal.jsx
import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Calendar, CreditCard } from 'lucide-react';
import { toast } from 'react-toastify';

const CustomerModal = ({ isOpen, onClose, onSave, customer }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    tipo_documento: 'dni',
    numero_documento: '',
    direccion: '',
    activo: true
  });

  const [loading, setLoading] = useState(false);

  // Actualizar formData cuando cambie el customer (para edición)
  useEffect(() => {
    if (customer) {
      setFormData({
        nombre: customer.nombre || '',
        email: customer.email || '',
        telefono: customer.telefono || '',
        tipo_documento: customer.tipo_documento || 'dni',
        numero_documento: customer.numero_documento || '',
        direccion: customer.direccion || '',
        activo: customer.activo !== undefined ? customer.activo : true
      });
    } else {
      // Reset form para nuevo cliente
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        tipo_documento: 'dni',
        numero_documento: '',
        direccion: '',
        activo: true
      });
    }
  }, [customer]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Customer object:', customer);
      console.log('Form data:', formData);
      
      // Validar datos del formulario
      if (!formData.nombre?.trim()) {
        toast.error('El nombre es obligatorio');
        setLoading(false);
        return;
      }
      
      // Verificar que la API esté disponible
      if (!window.clientesAPI) {
        console.error('❌ window.clientesAPI no está disponible');
        toast.error('Error: API de clientes no disponible. Por favor, reinicia la aplicación.');
        setLoading(false);
        return;
      }
      
      // Verificar que el método crear esté disponible
      if (typeof window.clientesAPI.crear !== 'function') {
        console.error('❌ window.clientesAPI.crear no es una función');
        console.log('🔍 Métodos disponibles:', Object.keys(window.clientesAPI));
        toast.error('Error: Método de creación no disponible. Por favor, reinicia la aplicación.');
        setLoading(false);
        return;
      }
      
      let response;
      
      if (customer && customer.id) {
        // Editar cliente existente
        console.log('Actualizando cliente con ID:', customer.id);
        response = await window.clientesAPI.actualizar(customer.id, formData);
      } else {
        // Crear nuevo cliente
        console.log('Creando nuevo cliente...');
        response = await window.clientesAPI.crear(formData);
      }
      
      console.log('Respuesta de la API:', response);
      
      if (response && response.success) {
        onSave(response.data);
        toast.success(`Cliente ${customer ? 'actualizado' : 'creado'} exitosamente`);
      } else {
        const errorMessage = response?.error || 'Error desconocido';
        console.error('Error en la respuesta:', errorMessage);
        toast.error(`Error al ${customer ? 'actualizar' : 'crear'} cliente: ${errorMessage}`);
      }
    } catch (error) {
      console.error(`Error ${customer ? 'actualizando' : 'creando'} cliente:`, error);
      
      // Proporcionar información más específica sobre el error
      let errorMessage = 'Error desconocido';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.toString) {
        errorMessage = error.toString();
      }
      
      console.log('🔍 Información adicional del error:');
      console.log('  - Tipo de error:', error.constructor.name);
      console.log('  - Stack trace:', error.stack);
      console.log('  - window.clientesAPI disponible:', !!window.clientesAPI);
      console.log('  - window.clientesAPI.crear disponible:', !!(window.clientesAPI && window.clientesAPI.crear));
      
      toast.error(`Error al ${customer ? 'actualizar' : 'crear'} cliente: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-theme-surface rounded-lg shadow-lg w-full max-w-2xl">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-theme-border p-6">
          <h3 className="text-lg font-semibold text-theme-text">
            {customer ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h3>
          <button onClick={onClose} className="text-theme-textSecondary hover:text-theme-textSecondary transition-colors">
            <X size={20} />
          </button>
        </div>
        
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <h4 className="font-medium text-theme-text flex items-center">
                <User className="mr-2" size={16} />
                Información Básica
              </h4>
              
              <div>
                <label className="block text-sm text-theme-textSecondary mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-theme-surface border border-theme-border text-theme-text rounded-lg focus:ring-2 focus:ring-theme-primary focus:border-theme-primary transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-theme-textSecondary mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-theme-surface border border-theme-border text-theme-text rounded-lg focus:ring-2 focus:ring-theme-primary focus:border-theme-primary transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-theme-textSecondary mb-1">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-theme-surface border border-theme-border text-theme-text rounded-lg focus:ring-2 focus:ring-theme-primary focus:border-theme-primary transition-colors"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                  className="w-5 h-5 text-theme-primary border-theme-border rounded focus:ring-theme-primary"
                />
                <label className="ml-2 block text-sm text-theme-textSecondary">
                  Cliente activo
                </label>
              </div>
            </div>
            
            {/* Información Adicional */}
            <div className="space-y-4">
              <h4 className="font-medium text-theme-text flex items-center">
                <CreditCard className="mr-2" size={16} />
                Información Adicional
              </h4>
              
              <div>
                <label className="block text-sm text-theme-textSecondary mb-1">Tipo de Documento</label>
                <select
                  name="tipo_documento"
                  value={formData.tipo_documento}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-theme-surface border border-theme-border text-theme-text rounded-lg focus:ring-2 focus:ring-theme-primary focus:border-theme-primary transition-colors"
                >
                  <option value="dni">DNI</option>
                  <option value="ce">Carné de Extranjería</option>
                  <option value="pasaporte">Pasaporte</option>
                  <option value="ruc">RUC</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-theme-textSecondary mb-1">Número de Documento</label>
                <input
                  type="text"
                  name="numero_documento"
                  value={formData.numero_documento}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-theme-surface border border-theme-border text-theme-text rounded-lg focus:ring-2 focus:ring-theme-primary focus:border-theme-primary transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm text-theme-textSecondary mb-1">Dirección</label>
                <textarea
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-theme-surface border border-theme-border text-theme-text rounded-lg focus:ring-2 focus:ring-theme-primary focus:border-theme-primary transition-colors resize-vertical"
                  placeholder="Dirección completa del cliente..."
                />
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-theme-border flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-theme-border rounded-lg text-theme-textSecondary hover:bg-theme-background transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white bg-theme-primary rounded-lg hover:bg-theme-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {customer ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                customer ? 'Actualizar Cliente' : 'Crear Cliente'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;
