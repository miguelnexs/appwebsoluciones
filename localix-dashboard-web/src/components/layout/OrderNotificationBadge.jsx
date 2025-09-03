import React, { useEffect, useState } from 'react';
import { Bell, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OrderNotificationBadge = ({ count = 0, animate = true, size = "default" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [previousCount, setPreviousCount] = useState(0);

  // Animar cuando cambie el contador
  useEffect(() => {
    if (count > previousCount && count > 0) {
      setIsVisible(true);
      // Pulse effect cuando hay nuevas notificaciones
      if (animate) {
        const timer = setTimeout(() => setIsVisible(false), 2000);
        return () => clearTimeout(timer);
      }
    }
    setPreviousCount(count);
  }, [count, previousCount, animate]);

  if (count === 0) return null;

  const sizeClasses = {
    small: "w-4 h-4 text-xs",
    default: "w-5 h-5 text-xs", 
    large: "w-6 h-6 text-sm"
  };

  const displayCount = count > 99 ? '99+' : count.toString();

  if (animate) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            ...(isVisible ? {
              scale: [1, 1.2, 1],
              transition: { duration: 0.3, repeat: 2 }
            } : {})
          }}
          exit={{ scale: 0, opacity: 0 }}
          className={`
            absolute -top-1 -right-1 bg-red-500 text-white font-bold rounded-full 
            flex items-center justify-center animate-pulse
            ${sizeClasses[size]}
          `}
        >
          {displayCount}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <span className={`
      absolute -top-1 -right-1 bg-red-500 text-white font-bold rounded-full 
      flex items-center justify-center animate-pulse
      ${sizeClasses[size]}
    `}>
      {displayCount}
    </span>
  );
};

export default OrderNotificationBadge; 
