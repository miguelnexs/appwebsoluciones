import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Tabs,
  Tab,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';
import { ChromePicker } from 'react-color';
import { RESOURCE_URL } from '../../api/apiConfig';

const ProductFormColors = ({ productId, onColorsChange }) => {
  const [colores, setColores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para el diálogo de color
  const [openColorDialog, setOpenColorDialog] = useState(false);
  const [editingColor, setEditingColor] = useState(null);
  const [colorForm, setColorForm] = useState({
    nombre: '',
    hex_code: '#000000',
    activo: true
  });
  
  // Estados para el diálogo de imágenes
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [imagenes, setImagenes] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageTabValue, setImageTabValue] = useState(0);

  // Debug: Log del productId cuando cambia
  useEffect(() => {
  }, [productId]);

  // Cargar colores del producto
  const cargarColores = async () => {
    
    if (!productId) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await window.electronAPI.productos.obtenerColores(productId);
      
      if (response.success) {
        // Asegurar que response.data sea un array
        const coloresData = Array.isArray(response.data) ? response.data : [];
        
        setColores(coloresData);
        
      } else {
        setError('Error al cargar los colores');
        setColores([]);
      }
    } catch (error) {
      setError('Error de conexión');
      setColores([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar imágenes de un color
  const cargarImagenes = async (colorId) => {
    try {
      const response = await window.electronAPI.productos.obtenerImagenes(colorId);
      
      if (response.success) {
        // Asegurar que response.data sea un array
        const imagenesData = Array.isArray(response.data) ? response.data : [];
        
        setImagenes(imagenesData);
      } else {
        setImagenes([]);
      }
    } catch (error) {
      setImagenes([]);
    }
  };

  useEffect(() => {
    if (productId) {
      cargarColores();
    }
  }, [productId]);

  // Manejar cambios en el formulario de color
  const handleColorFormChange = (field, value) => {
    setColorForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Abrir diálogo para crear/editar color
  const handleOpenColorDialog = (color = null) => {
    if (color) {
      setEditingColor(color);
      setColorForm({
        nombre: color.nombre,
        hex_code: color.hex_code,
        stock: color.stock || 0,
        activo: color.activo
      });
    } else {
      setEditingColor(null);
      setColorForm({
        nombre: '',
        hex_code: '#000000',
        stock: 0,
        activo: true
      });
    }
    setOpenColorDialog(true);
  };

  // Guardar color
  const handleSaveColor = async () => {
    try {
      
      // Preparar datos en el formato que espera el backend
      const colorData = {
        nombre: colorForm.nombre,
        hex_code: colorForm.hex_code,
        stock: colorForm.stock || 0,
        orden: 1, // Valor por defecto
        activo: colorForm.activo
      };
      
      let response;
      if (editingColor) {
        response = await window.electronAPI.productos.actualizarColor(productId, editingColor.id, colorData);
      } else {
        response = await window.electronAPI.productos.crearColor(productId, colorData);
      }

      if (response.success) {
        setSuccess(editingColor ? 'Color actualizado correctamente' : 'Color creado correctamente');
        setOpenColorDialog(false);
        cargarColores();
        if (onColorsChange) onColorsChange();
      } else {
        setError(response.error || 'Error al guardar el color');
      }
    } catch (error) {
      setError('Error de conexión');
    }
  };

  // Eliminar color
  const handleDeleteColor = async (colorId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este color?')) {
      return;
    }

    try {
      const response = await window.electronAPI.productos.eliminarColor(productId, colorId);
      if (response.success) {
        setSuccess('Color eliminado correctamente');
        cargarColores();
        if (onColorsChange) onColorsChange();
      } else {
        setError(response.error || 'Error al eliminar el color');
      }
    } catch (error) {
      setError('Error de conexión');
    }
  };

  // Abrir diálogo de imágenes
  const handleOpenImageDialog = async (color) => {
    setSelectedColor(color);
    setOpenImageDialog(true);
    setImageTabValue(0);
    await cargarImagenes(color.id);
  };

  // Subir imagen
  const handleUploadImage = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (imagenes.length >= 4) {
      setError('No se pueden agregar más de 4 imágenes por color');
      return;
    }

    setUploadingImage(true);
    try {
      // Leer el archivo como ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Preparar datos en el formato que espera el handler
      const imageData = {
        imagen: {
          name: file.name,
          type: file.type,
          size: file.size,
          data: Array.from(uint8Array) // Convertir a array normal para serialización
        },
        orden: imagenes.length
      };

      const response = await window.electronAPI.productos.subirImagen(selectedColor.id, imageData);
      if (response.success) {
        setSuccess('Imagen subida correctamente');
        await cargarImagenes(selectedColor.id);
      } else {
        setError(response.error || 'Error al subir la imagen');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setUploadingImage(false);
    }
  };

  // Eliminar imagen
  const handleDeleteImage = async (imagenId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      return;
    }

    try {
      const response = await window.electronAPI.productos.eliminarImagen(selectedColor.id, imagenId);
      if (response.success) {
        setSuccess('Imagen eliminada correctamente');
        await cargarImagenes(selectedColor.id);
      } else {
        setError(response.error || 'Error al eliminar la imagen');
      }
    } catch (error) {
      setError('Error de conexión');
    }
  };

  // Establecer imagen principal
  const handleSetMainImage = async (imagenId) => {
    try {
      const response = await window.electronAPI.productos.establecerImagenPrincipal(selectedColor.id, imagenId);
      if (response.success) {
        setSuccess('Imagen principal establecida correctamente');
        await cargarImagenes(selectedColor.id);
      } else {
        setError(response.error || 'Error al establecer imagen principal');
      }
    } catch (error) {
      setError('Error de conexión');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="h2">
          Colores del Producto
        </Typography>
        <IconButton
          color="primary"
          onClick={() => handleOpenColorDialog()}
          disabled={!productId}
          size="medium"
          sx={{
            borderRadius: '50%',
            background: '#1976d2',
            color: '#fff',
            boxShadow: 2,
            width: 40,
            height: 40,
            transition: 'background 0.2s, transform 0.15s',
            '&:hover': {
              background: '#1565c0',
              transform: 'scale(1.12)'
            },
            '& .MuiSvgIcon-root': {
              fontSize: 22
            }
          }}
          title="Agregar color"
        >
          <AddIcon />
        </IconButton>
      </Box>

      {!productId && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Guarda el producto primero para poder agregar colores
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <Box mt={2}>
          <table className="min-w-full bg-theme-surface border border-theme-border rounded-xl overflow-hidden">
            <thead className="bg-theme-background">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-theme-textSecondary">Color</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-theme-textSecondary">Stock</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-theme-textSecondary">Estado</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-theme-textSecondary">Imágenes</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-theme-textSecondary">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(colores || []).map((color) => (
                <tr key={color.id} className="border-b border-gray-100 hover:bg-theme-background transition-colors">
                  <td className="px-4 py-2 flex items-center gap-3">
                    <span className="inline-block w-6 h-6 rounded-full border border-theme-border" style={{ backgroundColor: color.hex_code || '#ccc' }}></span>
                    <span className="font-medium text-theme-text">{color.nombre}</span>
                  </td>
                  <td className="px-4 py-2">{color.stock || 0}</td>
                  <td className="px-4 py-2">
                    <Chip
                      label={color.activo ? 'Activo' : 'Inactivo'}
                      color={color.activo ? 'success' : 'default'}
                      size="small"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">{color.cantidad_imagenes || 0}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenColorDialog(color)}
                      title="Editar color"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="default"
                      onClick={() => handleOpenImageDialog(color)}
                      title="Imágenes del color"
                    >
                      <PhotoCameraIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteColor(color.id)}
                      title="Eliminar color"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </td>
                </tr>
              ))}
              {colores.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-theme-textSecondary">No hay colores registrados para este producto.</td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>
      )}

      {/* Diálogo para crear/editar color */}
      <Dialog open={openColorDialog} onClose={() => setOpenColorDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingColor ? 'Editar Color' : 'Nuevo Color'}
        </DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              fullWidth
              label="Nombre del color"
              value={colorForm.nombre}
              onChange={(e) => handleColorFormChange('nombre', e.target.value)}
              margin="normal"
            />
            
            <TextField
              fullWidth
              label="Stock del color"
              type="number"
              value={colorForm.stock}
              onChange={(e) => handleColorFormChange('stock', parseInt(e.target.value) || 0)}
              margin="normal"
              inputProps={{ min: 0 }}
              helperText="Cantidad disponible para este color"
            />
            
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Color
              </Typography>
              <ChromePicker
                color={colorForm.hex_code}
                onChange={(color) => handleColorFormChange('hex_code', color.hex)}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={colorForm.activo}
                  onChange={(e) => handleColorFormChange('activo', e.target.checked)}
                />
              }
              label="Color activo"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenColorDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSaveColor} variant="contained">
            {editingColor ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para gestionar imágenes */}
      <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Imágenes - {selectedColor?.nombre}
        </DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <Tabs value={imageTabValue} onChange={(e, newValue) => setImageTabValue(newValue)}>
              <Tab label="Galería" />
              <Tab label="Subir Imagen" />
            </Tabs>
            
            <Box mt={2}>
              {imageTabValue === 0 && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1">
                      Imágenes ({imagenes.length}/4)
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    {(imagenes || []).map((imagen) => {
                      
                      // Construir URL completa para la imagen
                      // ✅ Usar imagen.imagen que ya tiene la URL completa
                      const imageUrl = imagen.imagen || 
                        (imagen.url_imagen ? RESOURCE_URL(imagen.url_imagen) : '');
                      
                      return (
                        <Grid item xs={12} sm={6} md={4} key={imagen.id}>
                          <Card>
                            <Box position="relative">
                              <img
                                src={imageUrl}
                                alt={`Imagen ${imagen.orden}`}
                                style={{
                                  width: '100%',
                                  height: 200,
                                  objectFit: 'cover'
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                                onLoad={() => {
                                }}
                              />
                              <Box
                                position="absolute"
                                top={8}
                                right={8}
                                display="flex"
                                gap={1}
                              >
                                <IconButton
                                  size="small"
                                  color={imagen.es_principal ? 'warning' : 'default'}
                                  onClick={() => handleSetMainImage(imagen.id)}
                                >
                                  {imagen.es_principal ? <StarIcon /> : <StarBorderIcon />}
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteImage(imagen.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </Box>
                            <CardContent>
                              <Typography variant="body2" textAlign="center">
                                Imagen {imagen.orden + 1}
                                {imagen.es_principal && ' (Principal)'}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              )}
              
              {imageTabValue === 1 && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Subir Nueva Imagen
                  </Typography>
                  <Box
                    sx={{
                      border: '2px dashed #90caf9',
                      borderRadius: 2,
                      p: 3,
                      textAlign: 'center',
                      background: '#f5faff',
                      cursor: uploadingImage || imagenes.length >= 4 ? 'not-allowed' : 'pointer',
                      position: 'relative',
                      transition: 'border-color 0.2s',
                      ':hover': { borderColor: '#1976d2' }
                    }}
                    onClick={() => {
                      if (!uploadingImage && imagenes.length < 4) {
                        document.getElementById('color-image-upload-input').click();
                      }
                    }}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      if (!uploadingImage && imagenes.length < 4 && e.dataTransfer.files.length > 0) {
                        handleUploadImage({ target: { files: e.dataTransfer.files } });
                      }
                    }}
                  >
                    <input
                      id="color-image-upload-input"
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleUploadImage}
                      disabled={imagenes.length >= 4 || uploadingImage}
                    />
                    <PhotoCameraIcon sx={{ fontSize: 48, color: '#90caf9', mb: 1 }} />
                    <Typography variant="body1" color="textSecondary">
                      {uploadingImage ? 'Subiendo imagen...' : 'Arrastra una imagen aquí o haz clic para seleccionar'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" mt={1}>
                      Máximo 4 imágenes por color. Formatos: JPG, PNG, WEBP
                    </Typography>
                    {/* Vista previa de la imagen seleccionada (opcional, si quieres mostrarla antes de subir) */}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImageDialog(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars para mensajes */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert onClose={() => setSuccess('')} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductFormColors; 
