import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';

const TypographyDemo = () => {
  const { currentTheme, settings } = useSettings();

  return (
    <div className="p-6 space-y-6">
      <div className="bg-theme-surface rounded-lg p-6 border border-theme-border">
        <h2 className="text-2xl font-bold text-theme-text mb-4">
          Demostración de Tipografía Adaptativa
        </h2>
        
        <div className="mb-6 p-4 bg-theme-secondary rounded-lg">
          <h3 className="text-lg font-semibold text-theme-text mb-2">
            Tema Actual: {currentTheme.name}
          </h3>
          <p className="text-theme-textSecondary">
            Los colores de texto se ajustan automáticamente según el tema seleccionado
          </p>
        </div>

        {/* Jerarquía de Tipografía */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-theme-text mb-4">Jerarquía de Tipografía</h3>
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-theme-text">Título Principal (H1)</h1>
              <h2 className="text-3xl font-semibold text-theme-text">Título Secundario (H2)</h2>
              <h3 className="text-2xl font-medium text-theme-text">Título Terciario (H3)</h3>
              <h4 className="text-xl font-medium text-theme-text">Título Cuaternario (H4)</h4>
              <h5 className="text-lg font-medium text-theme-text">Título Quinario (H5)</h5>
              <h6 className="text-base font-medium text-theme-text">Título Senario (H6)</h6>
            </div>
          </div>

          {/* Texto de Párrafo */}
          <div>
            <h3 className="text-lg font-semibold text-theme-text mb-4">Texto de Párrafo</h3>
            <div className="space-y-3">
              <p className="text-base text-theme-text leading-relaxed">
                Este es un párrafo de texto normal. El color se adapta automáticamente según el tema.
                En temas oscuros será blanco, en temas claros será negro.
              </p>
              <p className="text-sm text-theme-textSecondary leading-relaxed">
                Este es texto secundario con un color más suave. Se usa para información menos importante
                o texto de apoyo.
              </p>
              <p className="text-xs text-theme-textMuted leading-relaxed">
                Este es texto muted, aún más suave que el secundario. Ideal para metadatos, fechas,
                o información de menor relevancia.
              </p>
            </div>
          </div>

          {/* Estados de Texto */}
          <div>
            <h3 className="text-lg font-semibold text-theme-text mb-4">Estados de Texto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-theme-text font-medium">Texto Normal</p>
                <p className="text-theme-textSecondary">Texto Secundario</p>
                <p className="text-theme-textMuted">Texto Muted</p>
                <p className="text-theme-textInverse bg-theme-primary px-2 py-1 rounded">
                  Texto Inverso
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-theme-success font-medium">Texto de Éxito</p>
                <p className="text-theme-warning font-medium">Texto de Advertencia</p>
                <p className="text-theme-error font-medium">Texto de Error</p>
                <p className="text-theme-accent font-medium">Texto de Acento</p>
              </div>
            </div>
          </div>

          {/* Ejemplos de Uso */}
          <div>
            <h3 className="text-lg font-semibold text-theme-text mb-4">Ejemplos de Uso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tarjeta de Producto */}
              <div className="bg-theme-background rounded-lg p-4 border border-theme-border">
                <h4 className="text-lg font-semibold text-theme-text mb-2">Tarjeta de Producto</h4>
                <p className="text-theme-textSecondary text-sm mb-2">Categoría: Electrónicos</p>
                <p className="text-theme-text text-base mb-2">
                  Laptop Gaming Pro - Modelo 2024
                </p>
                <p className="text-theme-textMuted text-sm mb-3">
                  Potente laptop para gaming y trabajo profesional
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-theme-success font-bold text-lg">$1,299</span>
                  <span className="text-theme-textSecondary text-sm">En stock</span>
                </div>
              </div>

              {/* Notificación */}
              <div className="bg-theme-secondary rounded-lg p-4 border border-theme-border">
                <h4 className="text-lg font-semibold text-theme-text mb-2">Notificación</h4>
                <p className="text-theme-text text-sm mb-2">
                  Nuevo pedido recibido #ORD-2024-001
                </p>
                <p className="text-theme-textSecondary text-xs mb-3">
                  Hace 5 minutos • Cliente: Juan Pérez
                </p>
                <div className="flex gap-2">
                  <span className="text-theme-success text-xs px-2 py-1 bg-theme-success/20 rounded">
                    Urgente
                  </span>
                  <span className="text-theme-accent text-xs px-2 py-1 bg-theme-accent/20 rounded">
                    Nuevo
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Información Técnica */}
          <div className="mt-8 p-4 bg-theme-secondary rounded-lg border border-theme-border">
            <h4 className="font-semibold text-theme-text mb-3">Información Técnica</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-theme-text mb-2">🎨 Colores de Texto</h5>
                <ul className="text-theme-textSecondary space-y-1">
                  <li>• <code className="text-theme-accent">text-theme-text</code>: Color principal</li>
                  <li>• <code className="text-theme-accent">text-theme-textSecondary</code>: Color secundario</li>
                  <li>• <code className="text-theme-accent">text-theme-textMuted</code>: Color muted</li>
                  <li>• <code className="text-theme-accent">text-theme-textInverse</code>: Color inverso</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-theme-text mb-2">🔧 Adaptación Automática</h5>
                <ul className="text-theme-textSecondary space-y-1">
                  <li>• <strong>Temas Oscuros</strong>: Texto blanco</li>
                  <li>• <strong>Temas Claros</strong>: Texto negro</li>
                  <li>• <strong>Contraste</strong>: Optimizado automáticamente</li>
                  <li>• <strong>Legibilidad</strong>: Garantizada en todos los temas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypographyDemo;
