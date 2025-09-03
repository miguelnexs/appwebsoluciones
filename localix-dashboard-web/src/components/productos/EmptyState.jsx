import React from 'react';

const EmptyState = ({ 
  icon, 
  title, 
  description, 
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 ${className}`}>
      {/* Icono */}
      {icon && (
        <div className="mb-4 text-theme-textSecondary">
          {typeof icon === 'string' ? (
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path d={icon} />
            </svg>
          ) : (
            <div className="w-16 h-16 mx-auto">
              {icon}
            </div>
          )}
        </div>
      )}

      {/* Título */}
      {title && (
        <h3 className="text-lg font-semibold text-theme-text mb-2">
          {title}
        </h3>
      )}

      {/* Descripción */}
      {description && (
        <p className="text-theme-textSecondary max-w-md mb-4">
          {description}
        </p>
      )}

      {/* Acción (opcional) */}
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
