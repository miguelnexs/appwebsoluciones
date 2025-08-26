import React, { createContext, useContext, useState, useEffect } from 'react';

const OrderNotificationsContext = createContext();

export const useOrderNotifications = () => {
  const context = useContext(OrderNotificationsContext);
  if (!context) {
    throw new Error('useOrderNotifications must be used within OrderNotificationsProvider');
  }
  return context;
};

export const OrderNotificationsProvider = ({ children }) => {
  const [newOrders, setNewOrders] = useState([]);

  // Cargar notificaciones pendientes del localStorage al iniciar
  useEffect(() => {
    const savedNotifications = localStorage.getItem('orderNotifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        // Filtrar notificaciones muy antiguas (más de 24 horas)
        const now = new Date();
        const validNotifications = parsed.filter(notification => {
          const notificationTime = new Date(notification.timestamp);
          const hoursDiff = (now - notificationTime) / (1000 * 60 * 60);
          return hoursDiff < 24; // Mantener solo las últimas 24 horas
        });
        setNewOrders(validNotifications);
        
        // Si se filtraron notificaciones, actualizar localStorage
        if (validNotifications.length !== parsed.length) {
          localStorage.setItem('orderNotifications', JSON.stringify(validNotifications));
        }
      } catch (error) {
        console.error('Error loading saved order notifications:', error);
        localStorage.removeItem('orderNotifications');
      }
    }
  }, []);

  // Guardar notificaciones en localStorage cuando cambien
  useEffect(() => {
    if (newOrders.length > 0) {
      localStorage.setItem('orderNotifications', JSON.stringify(newOrders));
    } else {
      localStorage.removeItem('orderNotifications');
    }
  }, [newOrders]);

  // Agregar nueva notificación de pedido con información completa
  const addOrderNotification = (orderData) => {
    const notification = {
      id: orderData.id || Date.now(),
      numero_venta: orderData.numero_venta || orderData.numero_pedido,
      numero_pedido: orderData.numero_pedido || orderData.numero_venta,
      total: Number(orderData.total) || 0,
      cliente: orderData.cliente_nombre || orderData.cliente?.nombre || 'Cliente anónimo',
      timestamp: new Date().toISOString(),
      items_count: orderData.items?.length || 0,
      // Información adicional para el modal
      items: orderData.items || [],
      metodo_pago: orderData.metodo_pago || 'No especificado',
      tipo_venta: orderData.tipo_venta || 'fisica',
      estado: orderData.estado || 'pendiente',
      observaciones: orderData.observaciones || '',
      precio_envio: orderData.precio_envio || 0,
      vendedor: orderData.vendedor || 'Sistema',
      // Información del cliente si está disponible
      cliente_info: {
        nombre: orderData.cliente_nombre || orderData.cliente?.nombre || 'Cliente anónimo',
        email: orderData.cliente?.email || null,
        telefono: orderData.cliente?.telefono || null,
        direccion: orderData.cliente?.direccion || null
      }
    };

    setNewOrders(prev => {
      // Evitar duplicados basándose en el número de venta
      const exists = prev.some(order => 
        order.numero_venta === notification.numero_venta ||
        order.id === notification.id
      );
      
      if (!exists) {
        // Mantener solo los últimos 15 pedidos para no saturar
        const updated = [notification, ...prev].slice(0, 15);
        
        // Opcional: Mostrar toast notification
        if (typeof window !== 'undefined' && window.showOrderToast) {
          window.showOrderToast(notification);
        }
        
        // Log para debugging
        console.log('📦 Nueva notificación de pedido agregada:', {
          numero_venta: notification.numero_venta,
          cliente: notification.cliente,
          total: notification.total,
          items: notification.items_count
        });
        
        return updated;
      }
      return prev;
    });
  };

  // Limpiar todas las notificaciones (cuando se visita la página de pedidos)
  const clearOrderNotifications = () => {
    console.log('✅ Limpiando notificaciones de pedidos del sidebar');
    setNewOrders([]);
  };

  // Eliminar una notificación específica
  const removeOrderNotification = (orderId) => {
    setNewOrders(prev => {
      const updated = prev.filter(order => 
        order.id !== orderId && 
        order.numero_venta !== orderId
      );
      console.log(`🗑️ Notificación eliminada: ${orderId}`);
      return updated;
    });
  };

  // Obtener resumen de notificaciones con más detalles
  const getNotificationsSummary = () => {
    const now = new Date();
    const recentOrders = newOrders.filter(order => {
      const orderTime = new Date(order.timestamp);
      const hoursDiff = (now - orderTime) / (1000 * 60 * 60);
      return hoursDiff < 1; // Pedidos de la última hora
    });

    return {
      count: newOrders.length,
      recentCount: recentOrders.length,
      totalAmount: newOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0),
      averageAmount: newOrders.length > 0 ? 
        (newOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0) / newOrders.length) : 0,
      latestOrder: newOrders[0] || null,
      oldestOrder: newOrders[newOrders.length - 1] || null
    };
  };

  // Marcar una notificación como vista (opcional)
  const markOrderAsViewed = (orderId) => {
    setNewOrders(prev => 
      prev.map(order => 
        (order.id === orderId || order.numero_venta === orderId) 
          ? { ...order, viewed: true, viewedAt: new Date().toISOString() }
          : order
      )
    );
  };

  // Obtener notificación específica por ID
  const getOrderNotification = (orderId) => {
    return newOrders.find(order => 
      order.id === orderId || 
      order.numero_venta === orderId
    );
  };

  // Limpiar notificaciones antiguas automáticamente
  const cleanOldNotifications = () => {
    const now = new Date();
    const validNotifications = newOrders.filter(notification => {
      const notificationTime = new Date(notification.timestamp);
      const hoursDiff = (now - notificationTime) / (1000 * 60 * 60);
      return hoursDiff < 24; // Mantener solo las últimas 24 horas
    });
    
    if (validNotifications.length !== newOrders.length) {
      setNewOrders(validNotifications);
      console.log(`🧹 Limpiadas ${newOrders.length - validNotifications.length} notificaciones antiguas`);
    }
  };

  const value = {
    newOrders,
    addOrderNotification,
    clearOrderNotifications,
    removeOrderNotification,
    getNotificationsSummary,
    markOrderAsViewed,
    getOrderNotification,
    cleanOldNotifications
  };

  return (
    <OrderNotificationsContext.Provider value={value}>
      {children}
    </OrderNotificationsContext.Provider>
  );
};

export default OrderNotificationsContext;