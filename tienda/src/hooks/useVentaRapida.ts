import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { ventaService, VentaRapidaData } from '@/services/ventaService';
import { useToast } from '@/hooks/use-toast';

export const useVentaRapida = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { items, clearCart } = useCart();
  const { toast } = useToast();

  const crearVentaRapida = async (formData: any) => {
    try {
      setIsLoading(true);

      const ventaData: VentaRapidaData = {
        cliente: {
          nombre: formData.fullName,
          telefono: formData.phone,
          email: formData.email,
          tipo_documento: formData.tipoDocumento,
          numero_documento: formData.numeroDocumento,
          direccion: formData.address,
        },
        items: items.map(item => ({
          producto: item.id,
          cantidad: item.quantity,
          color: item.color,
        })),
        metodo_pago: formData.paymentMethod || 'efectivo',
        observaciones: formData.deliveryNotes,
      };

      const response = await ventaService.crearVentaRapida(ventaData);
      
      toast({
        title: '¡Venta realizada con éxito!',
        description: `Número de venta: ${response.numero_venta}`,
      });

      clearCart();
      return response;
    } catch (error: any) {
      toast({
        title: 'Error al procesar la venta',
        description: error.response?.data?.message || 'Ocurrió un error al procesar la venta',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    crearVentaRapida,
    isLoading,
  };
};