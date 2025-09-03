import React from 'react';

const statusColors = {
  completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completado' },
  processing: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En proceso' },
  shipped: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Enviado' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' }
};

const OrderStatusBadge = ({ status }) => {
  const { bg, text, label } = statusColors[status] || { bg: 'bg-theme-secondary', text: 'text-theme-text', label: 'Desconocido' };
  
  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${bg} ${text}`}>
      {label}
    </span>
  );
};

export default OrderStatusBadge;
