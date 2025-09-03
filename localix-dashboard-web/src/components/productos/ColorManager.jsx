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
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  DragIndicator as DragIndicatorIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';
import { ChromePicker } from 'react-color';
import { RESOURCE_URL } from '../../api/apiConfig';

function getImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return RESOURCE_URL(url);
  return url;
}

const ColorManager = ({ productoId, onColorsChange }) => {
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

  // Cargar colores del producto
  const cargarColores = async () => {
    setLoading(true);
    try {
      const response = await window.productosAPI.obtenerColores(productoId);
      if (response.success) {
        setColores(response.data);
      } else {
        setError('Error al cargar los colores');
      }
    } catch (error) {
      setError('Error de conexión');
      console.error('Error cargando colores:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar imágenes de un color
  const cargarImagenes = async (colorId) => {
    try {
      const response = await window.productosAPI.obtenerImagenes(colorId);
      if (response.success) {
        setImagenes(response.data);
      }
    } catch (error) {
      console.error('Error cargando imágenes:', error);
    }
  };

  useEffect(() => {
    if (productoId) {
      cargarColores();
    }
  }, [productoId]);

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
        activo: color.activo
      });
    } else {
      setEditingColor(null);
      setColorForm({
        nombre: '',
        hex_code: '#000000',
        activo: true
      });
    }
    setOpenColorDialog(true);
  };

  // Guardar color
  const handleSaveColor = async () => {
    try {
      let response;
      if (editingColor) {
        response = await window.productosAPI.actualizarColor(productoId, editingColor.id, colorForm);
      } else {
        response = await window.productosAPI.crearColor(productoId, colorForm);
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
      console.error('Error guardando color:', error);
    }
  };

  // Eliminar color
  const handleDeleteColor = async (colorId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este color?')) {
      return;
    }

    try {
      const response = await window.productosAPI.eliminarColor(productoId, colorId);
      if (response.success) {
        setSuccess('Color eliminado correctamente');
        cargarColores();
        if (onColorsChange) onColorsChange();
      } else {
        setError(response.error || 'Error al eliminar el color');
      }
    } catch (error) {
      setError('Error de conexión');
      console.error('Error eliminando color:', error);
    }
  };

  // Abrir diálogo de imágenes
  const handleOpenImageDialog = async (color) => {
    setSelectedColor(color);
    setOpenImageDialog(true);
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
      const formData = new FormData();
      formData.append('imagen', file);
      formData.append('orden', imagenes.length);

      const response = await window.productosAPI.subirImagen(selectedColor.id, formData);
      if (response.success) {
        setSuccess('Imagen subida correctamente');
        await cargarImagenes(selectedColor.id);
      } else {
        setError(response.error || 'Error al subir la imagen');
      }
    } catch (error) {
      setError('Error de conexión');
      console.error('Error subiendo imagen:', error);
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
      const response = await window.productosAPI.eliminarImagen(selectedColor.id, imagenId);
      if (response.success) {
        setSuccess('Imagen eliminada correctamente');
        await cargarImagenes(selectedColor.id);
      } else {
        setError(response.error || 'Error al eliminar la imagen');
      }
    } catch (error) {
      setError('Error de conexión');
      console.error('Error eliminando imagen:', error);
    }
  };

  // Establecer imagen principal
  const handleSetMainImage = async (imagenId) => {
    try {
      const response = await window.productosAPI.establecerImagenPrincipal(selectedColor.id, imagenId);
      if (response.success) {
        setSuccess('Imagen principal establecida correctamente');
        await cargarImagenes(selectedColor.id);
      } else {
        setError(response.error || 'Error al establecer imagen principal');
      }
    } catch (error) {
      setError('Error de conexión');
      console.error('Error estableciendo imagen principal:', error);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="h2">
          Colores del Producto
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenColorDialog()}
        >
          Agregar Color
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {colores.map((color) => (
            <Grid item xs={12} sm={6} md={4} key={color.id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box
                      width={40}
                      height={40}
                      borderRadius="50%"
                      bgcolor={color.hex_code}
                      border="2px solid #ddd"
                      mr={2}
                    />
                    <Box flex={1}>
                      <Typography variant="h6">{color.nombre}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {color.cantidad_imagenes} imagen(es)
                      </Typography>
                    </Box>
                    <Chip
                      label={color.activo ? 'Activo' : 'Inactivo'}
                      color={color.activo ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>

                  <Box display="flex" justifyContent="space-between">
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenColorDialog(color)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="small"
                      startIcon={<PhotoCameraIcon />}
                      onClick={() => handleOpenImageDialog(color)}
                    >
                      Imágenes
                    </Button>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteColor(color.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
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
            
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Color
              </Typography>
              <ChromePicker
                color={colorForm.hex_code}
                onChange={(color) => handleColorFormChange('hex_code', color.hex)}
              />
            </Box>
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1">
                Imágenes ({imagenes.length}/4)
              </Typography>
              <Button
                variant="contained"
                component="label"
                disabled={imagenes.length >= 4 || uploadingImage}
                startIcon={<PhotoCameraIcon />}
              >
                {uploadingImage ? 'Subiendo...' : 'Subir Imagen'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleUploadImage}
                />
              </Button>
            </Box>

            <Grid container spacing={2}>
              {imagenes.map((imagen) => (
                <Grid item xs={12} sm={6} md={4} key={imagen.id}>
                  <Card>
                    <Box position="relative">
                      <img
                        src={getImageUrl(imagen.url_imagen)}
                        alt={`Imagen ${imagen.orden}`}
                        style={{
                          width: '100%',
                          height: 200,
                          objectFit: 'cover'
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
              ))}
            </Grid>
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

export default ColorManager; 
