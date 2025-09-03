import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CategoriasList from '../components/categorias/CategoriasList';
import CategoriaProductosTable from '../components/categorias/CategoriaProductosTable';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CategoriesPage = () => {
  const { slug } = useParams();
  const [categoria, setCategoria] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productosVinculados, setProductosVinculados] = useState([]);

  useEffect(() => {
    setCategoria(null);
    setProductosVinculados([]);
    if (slug) {
      setLoading(true);
      window.electronAPI.categorias.obtener(slug)
        .then(res => {
          setCategoria(res);
          setProductosVinculados(Array.isArray(res?.productos_vinculados) ? res.productos_vinculados : []);
        })
        .catch(() => {
          setCategoria(null);
          setProductosVinculados([]);
        })
        .finally(() => setLoading(false));
    } else {
      setCategoria(null);
      setProductosVinculados([]);
    }
  }, [slug]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      {slug ? (
        <CategoriaProductosTable
          categoriaSlug={slug}
          productosVinculados={productosVinculados}
        />
      ) : (
        <CategoriasList />
      )}
    </>
  );
};

export default CategoriesPage;
