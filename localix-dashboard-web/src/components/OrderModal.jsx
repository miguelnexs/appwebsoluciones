import React, { useState } from 'react';
import { X, Search, Plus, Minus } from 'lucide-react';

const OrderModal = ({ isOpen, onClose, order }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [customer, setCustomer] = useState('');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  // Datos de ejemplo de productos
  const products = [
    { id: 1, name: 'Zapatillas Running Pro', price: 89.99, stock: 45 },
    { id: 2, name: 'Camiseta Algodón Orgánico', price: 24.99, stock: 32 },
    { id: 3, name: 'Smartwatch X200', price: 199.99, stock: 12 },
    { id: 4, name: 'Mochila Impermeable', price: 49.99, stock: 8 },
    { id: 5, name: 'Auriculares Inalámbricos', price: 79.99, stock: 23 }
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = (product) => {
    const existingItem = selectedProducts.find(item => item.id === product.id);
    if (existingItem) {
      setSelectedProducts(selectedProducts.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(item => item.id !== productId));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setSelectedProducts(selectedProducts.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const calculateTotal = () => {
    return (selectedProducts.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0) / 100).toFixed(2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-theme-surface rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-semibold">
            {order ? `Editar Pedido ${order.id}` : 'Nuevo Pedido'}
          </h3>
          <button onClick={onClose} className="text-theme-textSecondary hover:text-theme-textSecondary">
            <X size={20} />
          </button>
        </div>
        
        {/* Contenido */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sección de Cliente */}
            <div className="space-y-4">
              <h4 className="font-medium text-theme-textSecondary">Información del Cliente</h4>
              
              <div>
                <label className="block text-sm text-theme-textSecondary mb-1">Nombre del Cliente</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  placeholder="Nombre del cliente"
                />
              </div>
              
              <div>
                <label className="block text-sm text-theme-textSecondary mb-1">Método de Envío</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={shippingMethod}
                  onChange={(e) => setShippingMethod(e.target.value)}
                >
                  <option value="standard">Estándar (3-5 días)</option>
                  <option value="express">Express (1-2 días)</option>
                  <option value="pickup">Recoger en tienda</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-theme-textSecondary mb-1">Método de Pago</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="cash">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>
            </div>
            
            {/* Sección de Productos */}
            <div>
              <h4 className="font-medium text-theme-textSecondary mb-4">Productos</h4>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-theme-textSecondary" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                {filteredProducts.map(product => (
                  <div key={product.id} className="flex justify-between items-center p-3 border-b hover:bg-theme-background">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-theme-textSecondary">${(product.price / 100).toFixed(2)} | Stock: {product.stock}</p>
                    </div>
                    <button
                      onClick={() => handleAddProduct(product)}
                      className="p-1 text-blue-500 hover:text-blue-700"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Lista de Productos Seleccionados */}
          <div className="mt-6">
            <h4 className="font-medium text-theme-textSecondary mb-2">Productos Seleccionados</h4>
            
            {selectedProducts.length === 0 ? (
              <p className="text-sm text-theme-textSecondary italic">No hay productos seleccionados</p>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                {selectedProducts.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 border-b">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-theme-textSecondary">${(item.price / 100).toFixed(2)} c/u</p>
                    </div>
                    
                    <div className="flex items-center">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="p-1 text-theme-textSecondary hover:text-theme-textSecondary"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="mx-2 w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="p-1 text-theme-textSecondary hover:text-theme-textSecondary"
                      >
                        <Plus size={16} />
                      </button>
                      
                      <span className="mx-4 font-medium w-20 text-right">
                        ${((item.price * item.quantity) / 100).toFixed(2)}
                      </span>
                      
                      <button
                        onClick={() => handleRemoveProduct(item.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="p-3 bg-theme-background flex justify-between items-center">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-lg">${calculateTotal()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-theme-textSecondary hover:bg-theme-background"
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            onClick={() => {
              console.log('Pedido guardado:', {
                customer,
                shippingMethod,
                paymentMethod,
                products: selectedProducts,
                total: calculateTotal()
              });
              onClose();
            }}
          >
            {order ? 'Actualizar Pedido' : 'Crear Pedido'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;