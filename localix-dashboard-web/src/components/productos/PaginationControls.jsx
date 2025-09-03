import React from 'react';
import {
  ChevronFirst, ChevronLast, ChevronLeft, ChevronRight
} from 'lucide-react';

const PaginationControls = ({
  currentPage,
  totalPages,
  startItem,
  endItem,
  totalItems,
  onPageChange,
  pageSizeOptions = [5, 10, 25, 50],
  pageSize,
  onPageSizeChange,
  compact = false
}) => {
  const handleFirstPage = () => onPageChange(1);
  const handleLastPage = () => onPageChange(totalPages);
  const handleNextPage = () => onPageChange(currentPage + 1);
  const handlePreviousPage = () => onPageChange(currentPage - 1);

  // Calcular elementos mostrados si no se proporcionan
  const itemsPerPage = pageSize || 10;
  const calculatedStartItem = (currentPage - 1) * itemsPerPage + 1;
  const calculatedEndItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  const displayStartItem = startItem || calculatedStartItem;
  const displayEndItem = endItem || calculatedEndItem;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-theme-background border-t border-theme-border">
      {/* Información de elementos mostrados */}
      <div className="text-sm text-theme-textSecondary">
        Mostrando <span className="font-semibold">{displayStartItem}-{displayEndItem}</span> de <span className="font-semibold">{totalItems}</span> elementos
      </div>

      <div className="flex items-center gap-2">
        {/* Selector de elementos por página */}
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-theme-textSecondary">Por página:</label>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-theme-border rounded-md bg-theme-surface focus:ring-2 focus:ring-gray-500 focus:border-theme-border"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Controles de paginación */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleFirstPage}
            disabled={currentPage === 1}
            className={`p-1 rounded-md transition-colors ${
              currentPage === 1 
                ? 'text-theme-textSecondary cursor-not-allowed' 
                : 'text-theme-textSecondary hover:text-theme-text hover:bg-theme-border'
            }`}
            title="Primera página"
          >
            <ChevronFirst size={16} />
          </button>

          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`p-1 rounded-md transition-colors ${
              currentPage === 1 
                ? 'text-theme-textSecondary cursor-not-allowed' 
                : 'text-theme-textSecondary hover:text-theme-text hover:bg-theme-border'
            }`}
            title="Página anterior"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Información de página actual */}
          <span className="px-3 py-1 text-sm text-theme-textSecondary">
            Página <span className="font-semibold">{currentPage}</span> de <span className="font-semibold">{totalPages}</span>
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className={`p-1 rounded-md transition-colors ${
              currentPage >= totalPages 
                ? 'text-theme-textSecondary cursor-not-allowed' 
                : 'text-theme-textSecondary hover:text-theme-text hover:bg-theme-border'
            }`}
            title="Siguiente página"
          >
            <ChevronRight size={16} />
          </button>

          <button
            onClick={handleLastPage}
            disabled={currentPage >= totalPages}
            className={`p-1 rounded-md transition-colors ${
              currentPage >= totalPages 
                ? 'text-theme-textSecondary cursor-not-allowed' 
                : 'text-theme-textSecondary hover:text-theme-text hover:bg-theme-border'
            }`}
            title="Última página"
          >
            <ChevronLast size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PaginationControls);
