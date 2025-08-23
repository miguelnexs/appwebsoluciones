import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Avatar,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  useTheme,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  OutlinedInput,
  Checkbox,
  ListItemText
} from '@mui/material';
import { FiX, FiImage, FiEdit2, FiTrash2 } from 'react-icons/fi';
import CategoriaProductosTable from './CategoriaProductosTable';

const CategoriaForm = ({ open, onClose, categoria, onCreateSuccess, onUpdateSuccess }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    imagen: null,
    activa: true,
    orden: 0,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Al cargar la categoría, setear productos asociados
  useEffect(() => {
    console.log('CategoriaForm: useEffect con categoria:', categoria);
    if (categoria) {
      console.log('CategoriaForm: Configurando formulario para editar:', categoria);
      setFormData({
        nombre: categoria.nombre || '',
        descripcion: categoria.descripcion || '',
        imagen: null,
        activa: categoria.activa ?? true,
        orden: categoria.orden ?? 0,
      });
      setImagePreview(categoria.imagen_url || null);
    } else {
      console.log('CategoriaForm: Configurando formulario para crear nueva categoría');
      resetForm();
    }
  }, [categoria]);

  const resetForm = () => {
    console.log('CategoriaForm: Reseteando formulario');
    setFormData({
      nombre: '',
      descripcion: '',
      imagen: null,
      activa: true,
      orden: 0,
    });
    setImagePreview(null);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`CategoriaForm: handleInputChange - ${name}: "${value}"`);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setError(`Solo se permiten archivos de imagen (JPG, PNG, WebP, GIF, SVG). Seleccionaste: ${file.type || file.name}`);
      e.target.value = '';
      return;
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen es demasiado grande. Máximo 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      setFormData(prev => ({
        ...prev,
        imagen: {
          file: file, // Guardar el archivo original para HTTP
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
          data: e.target.result.split(',')[1] // base64 puro para IPC
        }
      }));
      setError(null);
    };
    reader.onerror = () => {
      setError('Error al leer el archivo. Intenta con otra imagen.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    console.log('=== INICIANDO GUARDADO DE CATEGORÍA ===');
    console.log('Iniciando handleSubmit con formData:', formData);

    // Validación manual simple
    const nombreTrim = (formData.nombre || '').trim();
    console.log('Nombre después de trim:', nombreTrim);

    if (!nombreTrim) {
      console.log('Error: nombre vacío después de trim');
      setError('El nombre de la categoría es requerido');
      return;
    }

    console.log('✅ Validación de nombre pasada, continuando...');
    setLoading(true);
    setError(null);

    try {
      // Verificar si el usuario está autenticado para usar HTTP directo o IPC
      const token = localStorage.getItem('access_token');
      const isAuthenticated = !!token;
      

      
      let response;
      if (isAuthenticated) {
        // Usar llamadas HTTP directas
        if (categoria) {
          // Para actualización, usar FormData si hay imagen
          if (formData.imagen) {
            const formDataToSend = new FormData();
            formDataToSend.append('nombre', nombreTrim);
            formDataToSend.append('descripcion', (formData.descripcion || '').trim());
            formDataToSend.append('activa', formData.activa);
            // Removido el campo 'orden' para evitar conflictos con drag-and-drop
            // formDataToSend.append('orden', formData.orden || 0);
            formDataToSend.append('imagen', formData.imagen.file); // Usar el archivo original
            

            
            const apiResponse = await api.put(`categorias/${categoria.slug}/`, formDataToSend);
            response = apiResponse.data;
          } else {
            // Sin imagen, usar JSON
            const categoriaData = {
              nombre: nombreTrim,
              descripcion: (formData.descripcion || '').trim(),
              activa: !!formData.activa,
              // Removido el campo 'orden' para evitar conflictos con drag-and-drop
            };
            const apiResponse = await api.put(`categorias/${categoria.slug}/`, categoriaData);
            response = apiResponse.data;
          }
          onUpdateSuccess(response);
        } else {
          // Para creación, usar FormData si hay imagen
          if (formData.imagen) {
            const formDataToSend = new FormData();
            formDataToSend.append('nombre', nombreTrim);
            formDataToSend.append('descripcion', (formData.descripcion || '').trim());
            formDataToSend.append('activa', formData.activa);
            // Removido el campo 'orden' para evitar conflictos con drag-and-drop
            // formDataToSend.append('orden', formData.orden || 0);
            formDataToSend.append('imagen', formData.imagen.file); // Usar el archivo original
            

            
            const apiResponse = await api.post('categorias/', formDataToSend);
            response = apiResponse.data;
          } else {
            // Sin imagen, usar JSON
            const categoriaData = {
              nombre: nombreTrim,
              descripcion: (formData.descripcion || '').trim(),
              activa: !!formData.activa,
              // Removido el campo 'orden' para evitar conflictos con drag-and-drop
            };
            const apiResponse = await api.post('categorias/', categoriaData);
            response = apiResponse.data;
          }
          onCreateSuccess(response);
        }
      } else {
        // Usar IPC si no está autenticado
        const categoriaData = {
          nombre: nombreTrim,
          descripcion: (formData.descripcion || '').trim(),
          activa: !!formData.activa,
          orden: parseInt(formData.orden) || 0,
          imagen: formData.imagen ? {
            name: formData.imagen.name,
            type: formData.imagen.type,
            size: formData.imagen.size,
            lastModified: formData.imagen.lastModified,
            data: formData.imagen.data // base64 puro
          } : undefined
        };
        
        if (categoria) {
          response = await window.electronAPI.categorias.actualizar({
            slug: categoria.slug,
            data: categoriaData
          });
          onUpdateSuccess(response);
        } else {
          response = await window.electronAPI.categorias.crear(categoriaData);
          onCreateSuccess(response);
        }
      }
      onClose();
    } catch (err) {
      console.error('=== ERROR AL GUARDAR ===');
      console.error('Error saving category:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
        response: err.response?.data
      });
      
      let errorMessage = 'Error al guardar la categoría';
      
      // Verificar si hay respuesta del servidor con detalles específicos
      if (err.response?.data) {
        console.log('Respuesta del servidor:', err.response.data);
        
        // Manejar errores específicos del backend
        if (err.response.data.nombre) {
          errorMessage = err.response.data.nombre[0] || 'Error en el nombre de la categoría';
        } else if (err.response.data.descripcion) {
          errorMessage = err.response.data.descripcion[0] || 'Error en la descripción';
        } else if (err.response.data.imagen) {
          errorMessage = err.response.data.imagen[0] || 'Error en la imagen';
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        console.log('Mensaje de error original:', err.message);
        
        // Manejar errores genéricos
        if (err.message.includes('Category name is required') || 
            err.message.includes('required') ||
            err.message.includes('nombre') ||
            err.message.includes('blanco')) {
          errorMessage = 'El nombre de la categoría es requerido';
        } else if (err.message.includes('Ya existe') || 
                   err.message.includes('already exists')) {
          errorMessage = 'Ya existe una categoría con este nombre';
        } else if (err.message.includes('Network Error') ||
                   err.message.includes('timeout')) {
          errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
        } else if (err.message.includes('401')) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log('=== FINALIZANDO GUARDADO ===');
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, imagen: null }));
  };

  const styles = {
    dialogHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid',
      borderColor: 'divider',
      py: 2,
      px: 3
    },
    avatarContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      mb: 2
    },
    avatar: {
      width: 100,
      height: 100,
      mb: 1,
      position: 'relative'
    },
    removeImageBtn: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: theme.palette.error.main,
      color: 'white',
      '&:hover': {
        backgroundColor: theme.palette.error.dark
      }
    },
    imageActions: {
      display: 'flex',
      gap: 1,
      justifyContent: 'center'
    },
    errorAlert: {
      backgroundColor: theme.palette.error.light,
      color: theme.palette.error.dark,
      p: 2,
      borderRadius: 1,
      mb: 2
    }
  };

  return (
    <div className="w-full">
      {error && (
        <Box sx={styles.errorAlert}>
          <Typography variant="body2">{error}</Typography>
        </Box>
      )}

      <Box sx={styles.avatarContainer}>
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={imagePreview}
            alt="Preview"
            sx={styles.avatar}
            variant="rounded"
          >
            <FiImage size={40} />
          </Avatar>
          {imagePreview && (
            <IconButton
              sx={styles.removeImageBtn}
              onClick={handleRemoveImage}
              size="small"
              disabled={loading}
            >
              <FiX size={16} />
            </IconButton>
          )}
        </Box>
        
        <input
          accept=".jpg,.jpeg,.png,.webp,.gif,.svg"
          id="categoria-image-upload"
          type="file"
          style={{ display: 'none' }}
          onChange={handleImageChange}
          disabled={loading}
        />
        <label htmlFor="categoria-image-upload">
          <Button
            component="span"
            variant="outlined"
            startIcon={<FiImage />}
            size="small"
            disabled={loading}
          >
            {imagePreview ? 'Cambiar Imagen' : 'Subir Imagen'}
          </Button>
        </label>
        <Typography variant="caption" sx={{ mt: 1, textAlign: 'center', color: 'var(--color-textSecondary)' }}>
          Formatos: JPG, PNG, GIF, WebP, SVG • Máximo 10MB
        </Typography>
      </Box>

      {/* Campo de nombre simplificado */}
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="nombre-categoria" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--color-text)' }}>
          Nombre *
        </label>
        <input
          id="nombre-categoria"
          type="text"
          value={formData.nombre}
          onChange={(e) => handleInputChange(e)}
          name="nombre"
          className="w-full px-4 py-3 bg-theme-surface border border-theme-border text-theme-text rounded-lg focus:ring-2 focus:ring-theme-primary focus:border-theme-primary transition-colors"
          disabled={loading}
        />
      </div>

      {/* Campo de descripción simplificado */}
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="descripcion-categoria" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--color-text)' }}>
          Descripción
        </label>
        <textarea
          id="descripcion-categoria"
          value={formData.descripcion}
          onChange={(e) => handleInputChange(e)}
          name="descripcion"
          rows={3}
          className="w-full px-4 py-3 bg-theme-surface border border-theme-border text-theme-text rounded-lg focus:ring-2 focus:ring-theme-primary focus:border-theme-primary transition-colors resize-vertical"
          disabled={loading}
        />
      </div>

      {/* Campo de orden - Oculto porque se maneja con drag-and-drop */}
      {/* 
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="orden-categoria" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--color-text)' }}>
          Orden de visualización
        </label>
        <input
          id="orden-categoria"
          type="number"
          value={formData.orden}
          onChange={(e) => handleInputChange(e)}
          name="orden"
          min="0"
          className="w-full px-4 py-3 bg-theme-surface border border-theme-border text-theme-text rounded-lg focus:ring-2 focus:ring-theme-primary focus:border-theme-primary transition-colors"
          disabled={loading}
          placeholder="0 = primera posición"
        />
      </div>
      */}

      {/* Switch de activa */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
        <input
          type="checkbox"
          id="activa-categoria"
          checked={formData.activa ?? true}
          onChange={(e) => setFormData(prev => ({ ...prev, activa: e.target.checked }))}
          disabled={loading}
          className="w-5 h-5 text-theme-primary border-theme-border rounded focus:ring-theme-primary mr-3"
        />
        <label htmlFor="activa-categoria" style={{ fontWeight: 'bold', color: 'var(--color-text)' }}>
          Activa
        </label>
      </div>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          sx={{ ml: 1 }}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </Box>
    </div>
  );
};

export default CategoriaForm;