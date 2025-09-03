import React from 'react';
import ProductForm from '../components/productos/ProductForm';

export default function ProductPage() {
  return (
    <div className="page-container p-4">
      <h1 className="text-2xl font-bold mb-4">Gestionar Producto</h1>
      <ProductForm />
    </div>
  );
}
