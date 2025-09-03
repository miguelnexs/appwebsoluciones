import React from 'react';
import {
  CheckCircle, Edit, XCircle, AlertTriangle, HelpCircle
} from 'lucide-react';

const ProductStatusChip = ({ status, size = 'medium', showIcon = true, className = '' }) => {
  const getStatusConfig = () => {
    const config = {
      publicado: {
        label: 'Publicado',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-200',
        icon: <CheckCircle size={size === 'small' ? 12 : 14} className="text-green-600" />,
        tooltip: 'El producto está visible y disponible para compra'
      },
      borrador: {
        label: 'Borrador',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-200',
        icon: <Edit size={size === 'small' ? 12 : 14} className="text-yellow-600" />,
        tooltip: 'El producto no está visible al público'
      },
      agotado: {
        label: 'Agotado',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-200',
        icon: <AlertTriangle size={size === 'small' ? 12 : 14} className="text-red-600" />,
        tooltip: 'El producto está temporalmente sin stock'
      },
      descontinuado: {
        label: 'Descontinuado',
        bgColor: 'bg-theme-secondary',
        textColor: 'text-theme-text',
        borderColor: 'border-theme-border',
        icon: <XCircle size={size === 'small' ? 12 : 14} className="text-theme-textSecondary" />,
        tooltip: 'El producto ya no está disponible'
      }
    };

    return config[status] || {
      label: status || 'Desconocido',
      bgColor: 'bg-theme-secondary',
      textColor: 'text-theme-text',
      borderColor: 'border-theme-border',
      icon: <HelpCircle size={size === 'small' ? 12 : 14} className="text-theme-textSecondary" />,
      tooltip: 'Estado desconocido del producto'
    };
  };

  const { label, bgColor, textColor, borderColor, icon, tooltip } = getStatusConfig();

  const sizeClasses = size === 'small' 
    ? 'px-2 py-1 text-xs' 
    : 'px-3 py-1.5 text-sm';

  return (
    <div 
      className={`inline-flex items-center gap-1.5 ${bgColor} ${textColor} ${borderColor} border rounded-full ${sizeClasses} font-medium ${className}`}
      title={tooltip}
    >
      {showIcon && icon}
      <span>{label}</span>
    </div>
  );
};

export default React.memo(ProductStatusChip);
