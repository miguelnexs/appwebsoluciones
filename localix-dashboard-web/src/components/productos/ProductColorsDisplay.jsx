import React, { useMemo } from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import useProductColors from '../../hooks/useProductColors';
import ColorLoadingSkeleton from '../ui/ColorLoadingSkeleton';

const ProductColorsDisplay = React.memo(({ productId }) => {
  const { colores, loading, error } = useProductColors(productId);

  // Optimizar renderizado con useMemo
  const coloresRenderizados = useMemo(() => {
    if (!colores.length) return null;
    
    const coloresMostrados = colores.slice(0, 3);
    const coloresRestantes = colores.length - 3;
    
    return (
      <Box display="flex" gap={0.5} flexWrap="wrap">
        {coloresMostrados.map((color) => (
          <Tooltip
            key={color.id}
            title={`${color.nombre} (${color.cantidad_imagenes || 0} imagen${(color.cantidad_imagenes || 0) !== 1 ? 'es' : ''})`}
            arrow
          >
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: color.hex_code || '#ccc',
                border: '1px solid #ddd',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.2)'
                }
              }}
            />
          </Tooltip>
        ))}
        {coloresRestantes > 0 && (
          <Tooltip title={`Y ${coloresRestantes} color${coloresRestantes !== 1 ? 'es' : ''} más`} arrow>
            <Chip
              label={`+${coloresRestantes}`}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                backgroundColor: '#f0f0f0',
                color: '#666'
              }}
            />
          </Tooltip>
        )}
      </Box>
    );
  }, [colores]);

  if (loading) {
    return <ColorLoadingSkeleton />;
  }

  if (error) {
    return null;
  }

  return coloresRenderizados;
});

export default ProductColorsDisplay; 
