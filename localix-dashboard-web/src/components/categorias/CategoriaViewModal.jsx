import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Box,
  Typography,
  Chip,
  Divider
} from '@mui/material';
import { FiImage, FiX } from 'react-icons/fi';
import { Eye, Package, Calendar, Hash, ToggleLeft, ToggleRight } from 'lucide-react';

const CategoriaViewModal = ({ open, onClose, categoria }) => {
  if (!categoria) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-theme-surface rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header con diseño visual mejorado */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Visualizar Categoría
                </h3>
                <p className="text-blue-100 text-sm">
                  Información detallada de la categoría
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido del modal */}
        <div className="p-6">
          {/* Imagen y nombre principal */}
          <div className="flex items-start gap-6 mb-6">
            <div className="flex-shrink-0">
              {categoria.imagen_url ? (
                <img
                  src={categoria.imagen_url}
                  alt={categoria.nombre}
                  className="w-24 h-24 rounded-xl object-cover border-2 border-theme-border shadow-md"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border-2 border-theme-border">
                  <Package className="w-10 h-10 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-theme-text mb-2">
                {categoria.nombre}
              </h2>
              <p className="text-theme-textSecondary text-base leading-relaxed">
                {categoria.descripcion || 'Sin descripción disponible'}
              </p>
            </div>
          </div>

          <Divider sx={{ my: 3 }} />

          {/* Información detallada en tarjetas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Estado */}
            <div className="bg-theme-secondary rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {categoria.activa ? (
                  <ToggleRight className="w-5 h-5 text-green-500" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-red-500" />
                )}
                <span className="font-medium text-theme-text">Estado</span>
              </div>
              <Chip
                label={categoria.activa ? 'Activa' : 'Inactiva'}
                color={categoria.activa ? 'success' : 'error'}
                variant="filled"
                size="small"
              />
            </div>

            {/* Slug */}
            <div className="bg-theme-secondary rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-5 h-5 text-theme-accent" />
                <span className="font-medium text-theme-text">Identificador</span>
              </div>
              <code className="text-sm bg-theme-surface px-2 py-1 rounded border font-mono text-theme-accent">
                {categoria.slug}
              </code>
            </div>

            {/* Orden */}
            <div className="bg-theme-secondary rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-theme-accent" />
                <span className="font-medium text-theme-text">Orden de visualización</span>
              </div>
              <span className="text-lg font-semibold text-theme-text">
                {categoria.orden || 0}
              </span>
            </div>

            {/* Cantidad de Productos */}
            <div className="bg-theme-secondary rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-theme-text">Cantidad de productos</span>
              </div>
              <span className="text-lg font-semibold text-theme-text">
                {categoria.cantidad_productos || 0} productos
              </span>
            </div>
          </div>

          {/* Información de inventario */}
          <div className="bg-theme-secondary rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-5 h-5 text-green-500" />
              <span className="font-medium text-theme-text">Información de inventario</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-theme-textSecondary text-sm">Stock total:</span>
                <p className="text-theme-text font-semibold text-lg">
                  {categoria.stock_total_categoria || 0} unidades
                </p>
              </div>
              <div>
                <span className="text-theme-textSecondary text-sm">Promedio por producto:</span>
                <p className="text-theme-text font-semibold text-lg">
                  {categoria.cantidad_productos > 0 
                    ? Math.round((categoria.stock_total_categoria || 0) / categoria.cantidad_productos)
                    : 0} unidades
                </p>
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="bg-theme-secondary rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-theme-accent" />
              <span className="font-medium text-theme-text">Información temporal</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-theme-textSecondary">Creada:</span>
                <p className="text-theme-text font-medium">
                  {formatDate(categoria.created_at)}
                </p>
              </div>
              <div>
                <span className="text-theme-textSecondary">Última modificación:</span>
                <p className="text-theme-text font-medium">
                  {formatDate(categoria.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-theme-border bg-theme-secondary rounded-b-xl">
          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
              '&:hover': {
                background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
              }
            }}
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CategoriaViewModal;
