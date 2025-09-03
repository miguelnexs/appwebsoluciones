// src/components/productos/SmartProductSearch.jsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Filter, X, Tag, Package, DollarSign, Calendar, ChevronDown } from 'lucide-react';
import { useLoadingState } from '../ui/LoadingComponents';

// Hook para debounce
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const SmartProductSearch = ({ 
  onSearch, 
  onFilterChange, 
  initialFilters = {},
  suggestions = [],
  showAdvancedFilters = true 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    categoria: '',
    estado: 'todos', // todos, publicado, borrador, descontinuado
    stock: 'todos', // todos, disponible, bajo, agotado
    precioMin: '',
    precioMax: '',
    fechaDesde: '',
    fechaHasta: '',
    ...initialFilters
  });

  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { isLoading, startLoading, stopLoading } = useLoadingState('product-search');

  // Opciones para filtros
  const estadoOptions = [
    { value: 'todos', label: 'Todos los estados' },
    { value: 'publicado', label: 'Publicados' },
    { value: 'borrador', label: 'Borradores' },
    { value: 'descontinuado', label: 'Descontinuados' }
  ];

  const stockOptions = [
    { value: 'todos', label: 'Todos los stocks' },
    { value: 'disponible', label: 'Con stock' },
    { value: 'bajo', label: 'Stock bajo' },
    { value: 'agotado', label: 'Agotados' }
  ];

  // Filtros activos
  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'estado' || key === 'stock') return value !== 'todos';
      return value !== '' && value !== null;
    }).length;
  }, [filters]);

  // Ejecutar búsqueda cuando cambie el término con debounce
  useEffect(() => {
    if (onSearch) {
      startLoading({ message: 'Buscando productos...', blocking: false });
      onSearch(debouncedSearchTerm);
      // Simular tiempo de respuesta mínimo para mostrar loading
      setTimeout(() => stopLoading(), 200);
    }
  }, [debouncedSearchTerm, onSearch, startLoading, stopLoading]);

  // Notificar cambios en filtros
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters, onFilterChange]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(value.length > 2 && suggestions.length > 0);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.nombre);
    setShowSuggestions(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearSearch = () => {
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    setFilters({
      categoria: '',
      estado: 'todos',
      stock: 'todos',
      precioMin: '',
      precioMax: '',
      fechaDesde: '',
      fechaHasta: ''
    });
  };

  const clearAllFilters = () => {
    clearSearch();
    clearFilters();
  };

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda principal */}
      <div className="relative" ref={searchRef}>
        <div className="relative flex items-center">
          <div className="absolute left-3 z-10">
            {isLoading ? (
                             <div className="w-4 h-4 border-2 border-theme-border border-t-theme-accent rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4 text-theme-textSecondary" />
            )}
          </div>
          
          <input
            type="text"
            placeholder="Buscar productos por nombre, descripción, SKU..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setShowSuggestions(searchTerm.length > 2 && suggestions.length > 0)}
                         className="w-full pl-10 pr-12 py-3 border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-theme-accent outline-none transition-all bg-theme-background text-theme-text"
          />
          
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 p-1 text-theme-textSecondary hover:text-theme-textSecondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sugerencias automáticas */}
        {showSuggestions && (
          <div 
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 bg-theme-surface border border-theme-border rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto"
          >
            {suggestions.slice(0, 5).map((suggestion, index) => (
              <button
                key={suggestion.id || index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-3 hover:bg-theme-background flex items-center gap-3 border-b border-theme-border last:border-0"
              >
                <Package className="w-4 h-4 text-theme-textSecondary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-theme-text truncate">{suggestion.nombre}</p>
                  {suggestion.categoria && (
                    <p className="text-sm text-theme-textSecondary truncate">{suggestion.categoria}</p>
                  )}
                </div>
                {suggestion.precio && (
                                     <span className="text-sm font-medium text-theme-text">
                     €{suggestion.precio}
                   </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Controles de filtros */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showAdvancedFilters && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors
                ${showFilters 
                  ? 'bg-theme-success/20 border-theme-success/30 text-theme-success' 
                  : 'bg-theme-surface border-theme-border text-theme-textSecondary hover:bg-theme-background'
                }
              `}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filtros</span>
              {activeFiltersCount > 0 && (
                                 <span className="bg-theme-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                   {activeFiltersCount}
                 </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          )}

          {(searchTerm || activeFiltersCount > 0) && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-theme-textSecondary hover:text-red-600 transition-colors"
            >
              Limpiar todo
            </button>
          )}
        </div>

        {/* Contador de resultados */}
        <div className="text-sm text-theme-textSecondary">
          {isLoading ? 'Buscando...' : ''}
        </div>
      </div>

      {/* Panel de filtros avanzados */}
      {showFilters && showAdvancedFilters && (
        <div className="bg-theme-background rounded-lg p-4 border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro por estado */}
            <div>
              <label className="block text-sm font-medium text-theme-textSecondary mb-2">
                <Package className="w-4 h-4 inline mr-1" />
                Estado
              </label>
              <select
                value={filters.estado}
                onChange={(e) => handleFilterChange('estado', e.target.value)}
                className="w-full px-3 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-theme-accent bg-theme-background text-theme-text"
              >
                {estadoOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por stock */}
            <div>
              <label className="block text-sm font-medium text-theme-textSecondary mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Stock
              </label>
              <select
                value={filters.stock}
                onChange={(e) => handleFilterChange('stock', e.target.value)}
                className="w-full px-3 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-theme-accent bg-theme-background text-theme-text"
              >
                {stockOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por rango de precio */}
            <div>
              <label className="block text-sm font-medium text-theme-textSecondary mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Precio
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.precioMin}
                  onChange={(e) => handleFilterChange('precioMin', e.target.value)}
                  className="w-full px-2 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-theme-accent text-sm bg-theme-background text-theme-text"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.precioMax}
                  onChange={(e) => handleFilterChange('precioMax', e.target.value)}
                  className="w-full px-2 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-theme-accent text-sm bg-theme-background text-theme-text"
                />
              </div>
            </div>

            {/* Filtro por fecha */}
            <div>
              <label className="block text-sm font-medium text-theme-textSecondary mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Fecha creación
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={filters.fechaDesde}
                  onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
                  className="w-full px-2 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-theme-accent text-sm bg-theme-background text-theme-text"
                />
                <input
                  type="date"
                  value={filters.fechaHasta}
                  onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
                  className="w-full px-2 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-theme-accent text-sm bg-theme-background text-theme-text"
                />
              </div>
            </div>
          </div>

          {/* Botón limpiar filtros */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-theme-textSecondary hover:text-red-600 transition-colors"
              >
                Limpiar filtros ({activeFiltersCount})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartProductSearch; 
