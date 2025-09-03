import React from 'react';
import { Box } from '@mui/material';

const ColorLoadingSkeleton = () => {
  return (
    <Box 
      display="flex" 
      gap={0.5} 
      flexWrap="wrap"
      sx={{
        '& > *': {
          animation: 'pulse 1.5s ease-in-out infinite'
        },
        '@keyframes pulse': {
          '0%, 100%': {
            opacity: 1
          },
          '50%': {
            opacity: 0.5
          }
        }
      }}
    >
      {/* Skeleton para 3 colores */}
      {[1, 2, 3].map((index) => (
        <Box
          key={index}
          sx={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: '#e5e7eb',
            border: '1px solid #d1d5db'
          }}
        />
      ))}
    </Box>
  );
};

export default ColorLoadingSkeleton; 
