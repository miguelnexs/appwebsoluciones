import React from "react";

const COOKIES_KEY = "cookies_accepted";

const CookiesNotice = () => {
  const [visible, setVisible] = React.useState(() => {
    return !localStorage.getItem(COOKIES_KEY);
  });

  const acceptCookies = () => {
    localStorage.setItem(COOKIES_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white border border-neutral-300 shadow-lg rounded-lg px-6 py-4 flex flex-col md:flex-row items-center gap-4 max-w-lg w-full">
      <span className="text-sm text-neutral-700">
        Utilizamos cookies para mejorar tu experiencia y guardar tu carrito de compras. Al continuar, aceptas nuestra <a href="/politicas-privacidad" className="underline hover:text-neutral-900">Política de Privacidad</a>.
      </span>
      <button
        onClick={acceptCookies}
        className="bg-neutral-900 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-neutral-800 transition-colors"
      >
        Aceptar
      </button>
    </div>
  );
};

export default CookiesNotice; 