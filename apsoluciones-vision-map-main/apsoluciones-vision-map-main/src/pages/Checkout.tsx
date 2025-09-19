import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Truck, Shield, CheckCircle, ShoppingBag } from 'lucide-react';

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  ndi: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
}

interface FormErrors {
  email?: string;
  firstName?: string;
  lastName?: string;
  ndi?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  phone?: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { state, clearCart } = useCart();
  const items = state.items;
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    firstName: '',
    lastName: '',
    ndi: '',
    address: '',
    city: '',
    postalCode: '',
    phone: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validación de email
    if (!formData.email) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingrese un email válido';
    }

    // Validación de nombre
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es obligatorio';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'El nombre debe tener al menos 2 caracteres';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.firstName.trim())) {
      newErrors.firstName = 'El nombre solo puede contener letras';
    }

    // Validación de apellido
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es obligatorio';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'El apellido debe tener al menos 2 caracteres';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.lastName.trim())) {
      newErrors.lastName = 'El apellido solo puede contener letras';
    }

    // Validación de NDI con algoritmo de Luhn básico
    if (!formData.ndi.trim()) {
      newErrors.ndi = 'El número de identificación es obligatorio';
    } else if (!/^\d{6,12}$/.test(formData.ndi.trim())) {
      newErrors.ndi = 'El NDI debe contener entre 6 y 12 dígitos';
    }

    // Validación de dirección
    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es obligatoria';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'La dirección debe ser más específica (mínimo 10 caracteres)';
    }

    // Validación de ciudad
    if (!formData.city.trim()) {
      newErrors.city = 'La ciudad es obligatoria';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.city.trim())) {
      newErrors.city = 'La ciudad solo puede contener letras';
    }

    // Validación de código postal
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'El código postal es obligatorio';
    } else if (!/^\d{5,6}$/.test(formData.postalCode.trim())) {
      newErrors.postalCode = 'Ingrese un código postal válido (5-6 dígitos)';
    }

    // Validación de teléfono
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (!/^[\d\s\-\+\(\)]{10,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Ingrese un número de teléfono válido (10-15 dígitos)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const generateWhatsAppMessage = () => {
    const customerInfo = `
*🛒 NUEVO PEDIDO - AP SOLUCIONES*

*👤 INFORMACIÓN DEL CLIENTE:*
• Nombre: ${formData.firstName} ${formData.lastName}
• Email: ${formData.email}
• Teléfono: ${formData.phone}
• NDI: ${formData.ndi}
• Dirección: ${formData.address}
• Ciudad: ${formData.city}
• Código Postal: ${formData.postalCode}

*📦 PRODUCTOS SOLICITADOS:*`;

    const productsInfo = items.map(item => {
      let productDetails = `• *${item.nombre}*`;
      
      // Agregar color si está seleccionado
      if (item.selectedColor) {
        productDetails += ` (Color: ${item.selectedColor})`;
      }
      
      productDetails += `
  - Cantidad: ${item.quantity}
  - Precio unitario: ${formatPrice(item.precio)}
  - Subtotal: ${formatPrice(item.precio * item.quantity)}`;
      
      // Agregar imagen si está disponible
      if (item.imagen_principal_url) {
        productDetails += `
  - Imagen: ${item.imagen_principal_url}`;
      }
      
      return productDetails;
    }).join('\n\n');

    const totalsInfo = `

*💰 RESUMEN DEL PEDIDO:*
• Subtotal: ${formatPrice(subtotal)}
• Envío: ${formatPrice(shipping)}
• *TOTAL: ${formatPrice(total)}*

🎯 *¡Gracias por confiar en AP Soluciones Integradas!*
📞 Nos pondremos en contacto contigo pronto para confirmar tu pedido.`;

    return encodeURIComponent(customerInfo + '\n' + productsInfo + totalsInfo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulario antes de procesar
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Simular procesamiento breve
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generar mensaje de WhatsApp
      const whatsappMessage = generateWhatsAppMessage();
      
      // Detectar si es dispositivo móvil
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Usar URL apropiada según el dispositivo
      const whatsappUrl = isMobile 
        ? `https://wa.me/573044272565?text=${whatsappMessage}`
        : `https://web.whatsapp.com/send?phone=573044272565&text=${whatsappMessage}`;
      
      // Abrir WhatsApp en nueva ventana
      window.open(whatsappUrl, '_blank');
      
      setIsProcessing(false);
      setOrderCompleted(true);
      clearCart();

      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate('/productos');
      }, 3000);
    } catch (error) {
      setIsProcessing(false);
      // Manejar errores de procesamiento
      console.error('Error procesando el pedido:', error);
    }
  };

  if (items.length === 0 && !orderCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h2>
          <p className="text-gray-600 mb-6">Agrega algunos productos antes de proceder al checkout</p>
          <Button onClick={() => navigate('/productos')}>
            Ver Productos
          </Button>
        </div>
      </div>
    );
  }

  if (orderCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Pedido Enviado!</h2>
              <p className="text-gray-600 mb-4">
                Tu pedido ha sido enviado por WhatsApp a nuestro equipo de ventas. 
                Te contactaremos pronto para confirmar los detalles y coordinar la entrega.
              </p>
              <p className="text-sm text-gray-500">
                Redirigiendo a productos en unos segundos...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subtotal = state.total;
  const shipping = 15000; // Costo fijo de envío
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Información de Envío
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="ndi">Número de Identificación</Label>
                  <Input
                    id="ndi"
                    name="ndi"
                    value={formData.ndi}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.ndi && (
                    <p className="text-sm text-red-600 mt-1">{errors.ndi}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.address && (
                    <p className="text-sm text-red-600 mt-1">{errors.address}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.city && (
                      <p className="text-sm text-red-600 mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Código Postal</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.postalCode && (
                      <p className="text-sm text-red-600 mt-1">{errors.postalCode}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                  )}
                </div>
              </CardContent>
            </Card>


          </div>

          {/* Resumen del Pedido */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Productos */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.selectedColor}`} className="flex items-center space-x-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Color: {item.selectedColor} • Cantidad: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totales */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Envío</span>
                    <span>{formatPrice(shipping)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Garantías */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="w-4 h-4 mr-2" />
                    Compra 100% segura
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Truck className="w-4 h-4 mr-2" />
                    Envío gratis en pedidos superiores a $100.000
                  </div>
                </div>

                {/* Botón de Pedido */}
                <form onSubmit={handleSubmit}>
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Procesando Pedido...
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Confirmar Pedido - {formatPrice(total)}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;