import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Inventory as InventoryIcon } from '@mui/icons-material';

const EmptyState = ({ icon, title, description, action }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 4,
        gap: 2
      }}
    >
      {icon && React.cloneElement(icon, {
        sx: {
          fontSize: 80,
          color: 'text.disabled',
          mb: 2,
          ...icon.props.sx
        }
      })}
      
      <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      
      {description && (
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '400px' }}>
          {description}
        </Typography>
      )}
      
      {action && (
        <Box sx={{ mt: 3 }}>
          {React.cloneElement(action, {
            variant: 'contained',
            sx: {
              textTransform: 'none',
              borderRadius: '8px',
              px: 3,
              py: 1,
              fontWeight: 600,
              letterSpacing: '0.5px',
              ...action.props.sx
            }
          })}
        </Box>
      )}
    </Box>
  );
};

export default EmptyState;
