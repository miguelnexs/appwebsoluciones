import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Box, 
  ShoppingCart, 
  Users, 
  Settings,
  BarChart2,
  HelpCircle,
  Menu, 
  X,
  ChevronLeft,
  ChevronRight,
  Package
} from 'lucide-react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useOrderNotifications } from '../../contexts/OrderNotificationsContext';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onToggle }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { newOrders } = useOrderNotifications();
  const { user, logout } = useAuth();

  // Cerrar sidebar en móvil al navegar
  useEffect(() => {
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [location.pathname, isMobile]);

  const menuItems = [
    {
      path: '/',
      icon: Home,
      label: 'Dashboard',
      exact: true
    },
    {
      path: '/products',
      icon: Box,
      label: 'Productos'
    },
    {
      path: '/categories',
      icon: Package,
      label: 'Categorías'
    },
    {
      path: '/orders',
      icon: ShoppingCart,
      label: 'Pedidos',
      badge: newOrders?.length || 0
    },
    {
      path: '/customers',
      icon: Users,
      label: 'Clientes'
    },
    {
      path: '/quick-sales',
      icon: BarChart2,
      label: 'Ventas Rápidas'
    },
    {
      path: '/settings',
      icon: Settings,
      label: 'Configuración'
    },
    {
      path: '/help',
      icon: HelpCircle,
      label: 'Ayuda'
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-theme-surface border-r border-theme-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-theme-border">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-theme-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-semibold text-theme-text">Localix</span>
          </div>
        )}
        {!isMobile && (
          <button
            onClick={onToggle}
            className="p-1 rounded-md text-theme-text-secondary hover:text-theme-text hover:bg-theme-background"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        )}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded-md text-theme-text-secondary hover:text-theme-text"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact 
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-theme-primary text-white' 
                  : 'text-theme-text-secondary hover:text-theme-text hover:bg-theme-background'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <Icon size={20} />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      {!collapsed && (
        <div className="p-4 border-t border-theme-border">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-theme-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-theme-text truncate">
                {user?.name || 'Usuario'}
              </p>
              <p className="text-xs text-theme-text-secondary truncate">
                {user?.email || 'usuario@ejemplo.com'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm text-theme-text-secondary hover:text-theme-text hover:bg-theme-background rounded-lg transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-theme-surface border border-theme-border rounded-lg shadow-lg lg:hidden"
        >
          <Menu size={20} className="text-theme-text" />
        </button>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setMobileOpen(false)} />
            <div className="fixed left-0 top-0 h-full w-64 z-50">
              {sidebarContent}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className={`fixed left-0 top-0 h-full z-30 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      {sidebarContent}
    </div>
  );
};

export default Sidebar;
