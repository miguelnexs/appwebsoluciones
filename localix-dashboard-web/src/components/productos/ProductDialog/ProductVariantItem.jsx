import React from 'react';
import {
  Paper, Grid, Box, Typography, Chip, Avatar
} from '@mui/material';
import { Image } from '@mui/icons-material';
import ProductStatusChip from '../ProductStatusChip';
import { RESOURCE_URL } from '../../../api/apiConfig';

function getImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return RESOURCE_URL(url);
  return url;
}

const ProductVariantItem = ({ variant }) => {
  return (
    <Grid item xs={12}>
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {/* Variant Image */}
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              position: 'relative', 
              height: '250px',
              width: '100%',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              {variant.imagen_principal_url ? (
                <Box
                  component="img"
                  src={getImageUrl(variant.imagen_principal_url)}
                  alt={`Imagen de ${variant.nombre}`}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: 'grey.100'
                  }}
                >
                  <Image sx={{ fontSize: 60, color: 'grey.400' }} />
                </Box>
              )}
            </Box>
          </Grid>

          {/* Variant Information */}
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              {variant.nombre}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4}>
                <Typography variant="subtitle2">SKU</Typography>
                <Typography>{variant.sku || '-'}</Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="subtitle2">Precio</Typography>
                <Typography>${variant.precio || '0.00'}</Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="subtitle2">Stock</Typography>
                <Typography>
                  {variant.gestion_stock ? variant.stock : 'N/A'}
                  {variant.gestion_stock && variant.stock_minimo && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      (Mín: {variant.stock_minimo})
                    </Typography>
                  )}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="subtitle2">Estado</Typography>
                <ProductStatusChip status={variant.estado} />
              </Grid>

              {variant.material && (
                <Grid item xs={6} sm={4}>
                  <Typography variant="subtitle2">Material</Typography>
                  <Typography>{variant.material}</Typography>
                </Grid>
              )}
              {variant.talla && (
                <Grid item xs={6} sm={4}>
                  <Typography variant="subtitle2">Talla</Typography>
                  <Typography>{variant.talla}</Typography>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
};

export default ProductVariantItem;
