import { useCategorias } from "../hooks/useCategorias";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TodasCategorias = () => {
  const { categorias, loading, error } = useCategorias();

  return (
    <div className="min-h-screen bg-neutral-50 py-16">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-light text-neutral-900 tracking-wide mb-4">
            Todas las Categorías
          </h2>
          <div className="w-24 h-px bg-neutral-300 mx-auto mb-6"></div>
          <Link to="/">
            <Button className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-3 text-sm font-medium tracking-wider rounded-sm">
              Volver al inicio
            </Button>
          </Link>
        </div>
        {loading && <div className="text-center text-neutral-500 py-8">Cargando categorías...</div>}
        {error && <div className="text-center text-red-500 py-8">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categorias.map((cat) => (
            <Link key={cat.slug} to={`/categoria/${cat.slug}`}>
              <div className="relative h-80 rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                {cat.imagen_url && (
                  <img
                    src={cat.imagen_url}
                    alt={cat.nombre}
                    className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300">
                  <div className="absolute bottom-6 left-6">
                    <h3 className="text-2xl font-medium text-white tracking-wide mb-2">
                      {cat.nombre}
                    </h3>
                    <span className="inline-block bg-white/90 text-neutral-900 px-4 py-1 text-sm font-medium tracking-wider rounded-sm">
                      VER COLECCIÓN
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TodasCategorias; 