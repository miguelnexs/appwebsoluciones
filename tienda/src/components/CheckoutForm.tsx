
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Truck, Store, MapPin, User, Mail, Phone, Lock, Calendar, Check, AlertCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useVentaRapida } from '@/hooks/useVentaRapida';

const TIPO_DOCUMENTO_OPTIONS = [
  { value: 'dni', label: 'DNI' },
  { value: 'ruc', label: 'RUC' },
  { value: 'ce', label: 'Carné de Extranjería' },
  { value: 'pasaporte', label: 'Pasaporte' },
];

const CheckoutForm = () => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [deliveryMethod, setDeliveryMethod] = useState('home');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    tipoDocumento: 'dni',
    numeroDocumento: '',
    address: '',
    city: '',
    postalCode: '',
    deliveryNotes: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });
  const [errors, setErrors] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    deliveryNotes: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [clienteId, setClienteId] = useState<string | null>(null);
  
  const { items, getTotalPrice } = useCart();
  const { crearVentaRapida, isLoading } = useVentaRapida();
  
  const subtotal = getTotalPrice();
  const deliveryCost = deliveryMethod === 'home' ? (subtotal >= 300 ? 0 : 15) : 0;
  const total = subtotal + deliveryCost;

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Email inválido';
      case 'phone':
        return /^[0-9]{10,}$/.test(value.replace(/\s/g, '')) ? '' : 'Teléfono inválido';
      case 'cardNumber':
        return /^[0-9]{16}$/.test(value.replace(/\s/g, '')) ? '' : 'Número de tarjeta inválido';
      case 'expiryDate':
        return /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(value) ? '' : 'Formato MM/AA';
      case 'cvv':
        return /^[0-9]{3,4}$/.test(value) ? '' : 'CVV inválido';
      default:
        return value.trim() ? '' : 'Campo requerido';
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiryDate = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos requeridos
    const requiredFields = ['fullName', 'phone', 'email', 'numeroDocumento', 'address'];
    const newErrors = { ...errors };
    let hasErrors = false;

    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData].trim()) {
        newErrors[field as keyof typeof errors] = 'Campo requerido';
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsProcessing(true);
      
      // Crear venta rápida usando el hook
      await crearVentaRapida({
        ...formData,
        paymentMethod: paymentMethod || 'efectivo',
        deliveryMethod
      });

      // También enviar por WhatsApp como respaldo
      const numeroTienda = "573248283866";
      const rawMessage =
        '¡Hola! Se ha procesado una nueva venta rápida\n\n' +
        'Datos del cliente:\n' +
        `- Nombre: ${formData.fullName}\n` +
        `- Teléfono: ${formData.phone}\n` +
        `- Email: ${formData.email}\n` +
        `- Dirección: ${formData.address}\n\n` +
        'Productos:\n' +
        items.map(item =>
          `- ${item.name} (${item.color}) x${item.quantity} - €${(item.priceNumber * item.quantity).toFixed(2)}`
        ).join('\n') +
        `\n\nTotal: €${total.toFixed(2)}\n` +
        `Método de entrega: ${deliveryMethod === 'home' ? 'Domicilio' : 'Recogida en tienda'}`;

      const encodedMessage = encodeURIComponent(rawMessage);
      const url = `https://wa.me/${numeroTienda}?text=${encodedMessage}`;
      window.open(url, "_blank");

    } catch (error) {
      console.error('Error al procesar venta:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-10">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extralight text-neutral-800 mb-2 tracking-wide">Venta Rápida</h1>
        <div className="w-16 h-px bg-neutral-400 mx-auto mb-3"></div>
        <p className="text-neutral-500 text-sm font-light">Complete la información necesaria</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Principal - Formulario */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Información de Contacto */}
            <Card className="border border-neutral-200 bg-white">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-2 text-lg font-light text-neutral-700">
                  <User className="w-4 h-4 text-neutral-500" />
                  Información del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Input 
                      placeholder="Nombre completo" 
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className={`h-11 ${errors.fullName ? 'border-red-400' : 'border-neutral-300'} focus:border-neutral-600 focus:ring-0`}
                      required 
                    />
                    {errors.fullName && <p className="text-red-400 text-xs mt-1 font-light">{errors.fullName}</p>}
                  </div>
                  
                  <div>
                    <Input 
                      placeholder="Teléfono" 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`h-11 ${errors.phone ? 'border-red-400' : 'border-neutral-300'} focus:border-neutral-600 focus:ring-0`}
                      required 
                    />
                    {errors.phone && <p className="text-red-400 text-xs mt-1 font-light">{errors.phone}</p>}
                  </div>
                </div>
                
                <div>
                  <Input 
                    placeholder="Correo electrónico" 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`h-11 ${errors.email ? 'border-red-400' : 'border-neutral-300'} focus:border-neutral-600 focus:ring-0`}
                    required 
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1 font-light">{errors.email}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs text-neutral-600 mb-2 font-light">Tipo de documento</label>
                    <select
                      value={formData.tipoDocumento}
                      onChange={e => handleInputChange('tipoDocumento', e.target.value)}
                      className="w-full h-11 border border-neutral-300 rounded-md px-3 focus:border-neutral-600 focus:outline-none text-sm"
                      required
                    >
                      {TIPO_DOCUMENTO_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Input
                      placeholder="Número de documento"
                      value={formData.numeroDocumento}
                      onChange={e => handleInputChange('numeroDocumento', e.target.value)}
                      className="h-11 border-neutral-300 focus:border-neutral-600 focus:ring-0"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Input
                    placeholder="Dirección completa"
                    value={formData.address}
                    onChange={e => handleInputChange('address', e.target.value)}
                    className="h-11 border-neutral-300 focus:border-neutral-600 focus:ring-0"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Método de Entrega */}
            <Card className="border border-neutral-200 bg-white">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-2 text-lg font-light text-neutral-700">
                  <Truck className="w-4 h-4 text-neutral-500" />
                  Método de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod} className="space-y-3">
                  <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer ${
                    deliveryMethod === 'home' 
                      ? 'border-neutral-400 bg-neutral-50' 
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}>
                    <RadioGroupItem value="home" id="home" />
                    <label htmlFor="home" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Truck className="w-4 h-4 text-neutral-500" />
                        <div>
                          <p className="font-medium text-sm">Envío a domicilio</p>
                          <p className="text-xs text-neutral-500">
                            {subtotal >= 300 ? (
                              <span className="text-green-600">Gratis</span>
                            ) : (
                              <span>€15</span>
                            )} - Entrega en 24-48h
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                  
                  <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer ${
                    deliveryMethod === 'pickup' 
                      ? 'border-neutral-400 bg-neutral-50' 
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}>
                    <RadioGroupItem value="pickup" id="pickup" />
                    <label htmlFor="pickup" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Store className="w-4 h-4 text-neutral-500" />
                        <div>
                          <p className="font-medium text-sm">Recogida en tienda</p>
                          <p className="text-xs text-green-600">Gratis - Pereira, Carrera 7 #17-45</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </RadioGroup>


              </CardContent>
            </Card>

            {/* Método de Pago */}
            
          </div>

          {/* Resumen del Pedido - Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-6 border border-neutral-200 bg-white">
              <CardHeader className="pb-4 border-b border-neutral-100">
                <CardTitle className="text-lg font-light text-neutral-700">Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.color}`} className="flex items-center gap-3 p-2 rounded border-b border-neutral-100 last:border-b-0">
                      <div className="relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="absolute -top-1 -right-1 bg-neutral-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs text-neutral-800 truncate">{item.name}</p>
                        <p className="text-xs text-neutral-500">{item.color}</p>
                        <p className="text-sm font-medium text-neutral-700">€{(item.priceNumber * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Subtotal:</span>
                    <span className="font-medium">€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Envío:</span>
                    <span className={`font-medium ${deliveryCost === 0 ? 'text-green-600' : ''}`}>{deliveryCost === 0 ? 'Gratis' : `€${deliveryCost.toFixed(2)}`}</span>
                  </div>
                  {subtotal >= 300 && deliveryMethod === 'home' && (
                    <div className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200">
                      Envío gratuito aplicado
                    </div>
                  )}
                  <div className="flex justify-between font-medium text-base border-t pt-3 text-neutral-800">
                    <span>Total:</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || isProcessing}
                  className="w-full bg-neutral-800 hover:bg-neutral-700 text-white h-12 text-sm font-light rounded-md disabled:opacity-50"
                >
                  {(isLoading || isProcessing) ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-white/20 border-t-white rounded-full animate-spin"></div>
                      Procesando venta...
                    </div>
                  ) : (
                    'Confirmar Pedido'
                  )}
                </Button>

                <div className="text-xs text-neutral-400 text-center space-y-1 mt-3">
                  <div className="flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Información segura</span>
                  </div>
                  <p>Soporte disponible</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;
