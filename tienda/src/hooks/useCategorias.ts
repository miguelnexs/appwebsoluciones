import * as React from "react";
import { API_CONFIG } from '../config/api';
import { useAuth } from '../contexts/AuthContext';

export interface Categoria {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string;
  imagen_url: string | null;
  productos_vinculados: any[];
}

export function useCategorias() {
  const { tokens } = useAuth();
  const [categorias, setCategorias] = React.useState<Categoria[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchCategorias() {
      setLoading(true);
      setError(null);
      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        // Agregar token de autenticación si está disponible
        if (tokens?.access) {
          headers['Authorization'] = `Bearer ${tokens.access}`;
        }
        
        const res = await fetch(`${API_CONFIG.API_URL}/categorias/?activa=true`, {
          headers,
        });
        if (!res.ok) throw new Error("Error al obtener categorías");
        const data = await res.json();
        const catsRaw = Array.isArray(data) ? data : data.results;
        if (!Array.isArray(catsRaw)) throw new Error("La respuesta de la API no es un array de categorías");
        setCategorias(catsRaw);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCategorias();
  }, [tokens]);

  return { categorias, loading, error };
}