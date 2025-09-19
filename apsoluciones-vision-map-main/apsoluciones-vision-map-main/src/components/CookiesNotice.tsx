import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Cookie, X } from 'lucide-react';

const CookiesNotice = () => {
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    const cookiesAccepted = localStorage.getItem('apsoluciones_cookies_accepted');
    if (!cookiesAccepted) {
      setShowNotice(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('apsoluciones_cookies_accepted', 'true');
    setShowNotice(false);
  };

  const rejectCookies = () => {
    localStorage.setItem('apsoluciones_cookies_accepted', 'false');
    setShowNotice(false);
  };

  if (!showNotice) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="mx-auto max-w-4xl bg-white border-2 border-primary shadow-xl">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Cookie className="h-8 w-8 text-primary" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Uso de Cookies
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                En <strong>AP Soluciones Integradas</strong> utilizamos cookies para mejorar tu experiencia de navegación, 
                personalizar contenido, analizar el tráfico del sitio y recordar tus preferencias. 
                Al continuar navegando, aceptas nuestro uso de cookies de acuerdo con nuestra política de privacidad.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={acceptCookies}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-2"
                >
                  Aceptar Cookies
                </Button>
                <Button 
                  onClick={rejectCookies}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2"
                >
                  Rechazar
                </Button>
                <Button 
                  variant="ghost"
                  className="text-primary hover:text-primary/80 text-sm"
                  onClick={() => window.open('/politica-privacidad', '_blank')}
                >
                  Más información
                </Button>
              </div>
            </div>
            
            <button
              onClick={rejectCookies}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar aviso de cookies"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CookiesNotice;