import React, { useState, useEffect } from 'react';
import { ExternalLink, Shield, Zap, FileText, AlertTriangle, Grid3X3 } from 'lucide-react';
import { apiService, Categoria } from '@/services/api';

interface ProductSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

const Products: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('categorias');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  const sections: ProductSection[] = [
    {
      id: 'categorias',
      title: 'Categorías',
      icon: <Grid3X3 className="w-6 h-6" />,
      description: 'Explora nuestras categorías de productos'
    },
    {
      id: 'mcg',
      title: 'Productos MCG',
      icon: <Zap className="w-6 h-6" />,
      description: 'Catálogo de surge extraído del sitio web de MCG'
    },
    {
      id: 'dps',
      title: 'Productos DPS',
      icon: <Shield className="w-6 h-6" />,
      description: 'Catálogo de surge AP extraído del sitio web de Telebahn Español'
    },
    {
      id: 'shielding',
      title: 'Apantallamientos',
      icon: <FileText className="w-6 h-6" />,
      description: 'Catálogos GL Apantallador y Fluidor de Descarga'
    },
    {
      id: 'fire',
      title: 'Equipos de Detección y Extinción de Incendios',
      icon: <AlertTriangle className="w-6 h-6" />,
      description: 'Sistemas de protección contra incendios'
    }
  ];

  // Cargar categorías activas al montar el componente
  useEffect(() => {
    const loadCategorias = async () => {
      try {
        setLoadingCategorias(true);
        const categoriasActivas = await apiService.getCategorias();
        setCategorias(categoriasActivas);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      } finally {
        setLoadingCategorias(false);
      }
    };

    loadCategorias();
  }, []);

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'categorias':
        return <CategoriasSection categorias={categorias} loading={loadingCategorias} />;
      case 'mcg':
        return <MCGSection />;
      case 'dps':
        return <DPSSection />;
      case 'shielding':
        return <ShieldingSection />;
      case 'fire':
        return <FireSection />;
      default:
        return <CategoriasSection categorias={categorias} loading={loadingCategorias} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Catálogo de Productos
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre nuestra amplia gama de productos de protección eléctrica y sistemas de seguridad
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ${
                    activeSection === section.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {section.icon}
                  <span>{section.title}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Section Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {renderSectionContent()}
        </div>
      </div>
    </div>
  );
};

// MCG Section Component
const MCGSection: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Productos MCG</h2>
        <p className="text-lg text-gray-600 mb-8">
          Catálogo completo de protectores contra sobretensiones MCG - Líderes mundiales en tecnología de protección eléctrica
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-blue-600">Protectores de Sobretensión MCG</h3>

          </div>
          <p className="text-gray-600 mb-6">
            Sistemas de protección contra sobretensiones de la marca MCG, líderes mundiales en tecnología de protección eléctrica con más de 30 años de experiencia.
          </p>
          
          {/* Catálogo de Productos MCG */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4 text-gray-800">Catálogo de Surge MCG</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-blue-800">MCG Clase I (Tipo 1)</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Protección primaria contra rayos directos e indirectos</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Corriente de descarga: 25-100 kA</li>
                  <li>• Tensión nominal: 230-400V</li>
                  <li>• Aplicación: Acometidas principales</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-green-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-green-800">MCG Clase II (Tipo 2)</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Protección secundaria para cuadros de distribución</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Corriente de descarga: 5-40 kA</li>
                  <li>• Tensión nominal: 230-400V</li>
                  <li>• Aplicación: Subcuadros eléctricos</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-purple-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-purple-800">MCG Clase III (Tipo 3)</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Protección final para equipos electrónicos sensibles</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Corriente de descarga: 1.5-10 kA</li>
                  <li>• Tensión nominal: 230V</li>
                  <li>• Aplicación: Equipos terminales</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-orange-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-orange-800">MCG Combinados</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Protección combinada Tipo 1+2</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Corriente de descarga: 12.5-50 kA</li>
                  <li>• Tensión nominal: 230-400V</li>
                  <li>• Aplicación: Instalaciones compactas</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-red-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-red-800">MCG Fotovoltaico</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Protección específica para instalaciones solares</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Tensión DC: 600-1000V</li>
                  <li>• Corriente de descarga: 20-40 kA</li>
                  <li>• Aplicación: Sistemas fotovoltaicos</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-teal-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-teal-800">MCG Telecomunicaciones</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Protección para líneas de datos y comunicaciones</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Frecuencia: DC-3GHz</li>
                  <li>• Conectores: RJ45, Coaxial, LSA</li>
                  <li>• Aplicación: Redes de datos</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Catálogo de Protectores Especializados */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4 text-gray-800">Catálogo de Protectores Especializados - Sistemas Avanzados</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Protector para Sistemas Fotovoltaicos (BT Y PVM ... RM) */}
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-yellow-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-yellow-800">Protector Sistemas Fotovoltaicos (BT Y PVM ... RM)</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Diseñado para sistemas fotovoltaicos con tensiones máximas de hasta 1000V DC. Protege generadores fotovoltaicos e inversores. Cumple con IEC 61643-1 / GB 18802.1.</p>
                <div className="mb-3">
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Características:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Alta capacidad de descarga, respuesta rápida</li>
                    <li>• Circuito en Y resistente a fallos con tres varistores</li>
                    <li>• Doble dispositivo de desconexión térmica</li>
                    <li>• Indicador visual (verde/rojo) y alarma remota</li>
                  </ul>
                </div>
                <div>
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Modelos disponibles:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• BT Y PVM 150RM: ≤150V, 10kA, ≤0.8kV</li>
                    <li>• BT Y PVM 600RM: ≤600V, 12.5kA, ≤2.5kV</li>
                    <li>• BT Y PVM 1000RM: ≤1000V, 12.5kA, ≤4kV</li>
                  </ul>
                </div>
              </div>

              {/* Protector para Turbinas Eólicas (BT WSM ... RM) */}
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-blue-800">Protector Turbinas Eólicas (BT WSM ... RM)</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Para sistemas de turbinas eólicas con tensiones continuas hasta 750V DC. Diseñado según IEC 61643-1 / GB 18802.1.</p>
                <div className="mb-3">
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Características:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Alta capacidad de descarga, baja tensión residual</li>
                    <li>• Terminales dobles para conexión en paralelo o serie</li>
                    <li>• Indicador de estado y alarma remota</li>
                  </ul>
                </div>
                <div>
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Modelos disponibles:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• BT WSM 600 RM: 600V, 20kA, ≤3kV</li>
                    <li>• BT WSM 750 RM: 750V, 15kA, ≤3kV</li>
                  </ul>
                </div>
              </div>

              {/* Protector Combinado para Turbinas Eólicas (BT WSM 750 RM/3P) */}
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-green-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-green-800">Protector Combinado Turbinas Eólicas (BT WSM 750 RM/3P)</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">DPS combinado para sistemas eólicos con varistor de 750V AC. Ideal para protección robusta en entornos críticos.</p>
                <div className="mb-3">
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Características:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Protección trifásica integrada</li>
                    <li>• Conexión multifuncional para conductores y barrajes</li>
                    <li>• Indicador visual y alarma remota</li>
                  </ul>
                </div>
                <div>
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Especificaciones:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Voltaje nominal: 750V AC</li>
                    <li>• Corriente de descarga: 15kA (8/20)</li>
                    <li>• Nivel de protección: ≤3kV</li>
                    <li>• Montaje: Riel DIN 35mm</li>
                  </ul>
                </div>
              </div>

              {/* Protectores para Sistemas DC (BT P DCM ... RM) */}
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-purple-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-purple-800">Protectores Sistemas DC (BT P DCM ... RM)</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Para instalación en ZPR 0B-1 o superior. Protege sistemas de alimentación DC. Clase II (C), enchufable.</p>
                <div className="mb-3">
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Características:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Módulo enchufable, fácil mantenimiento</li>
                    <li>• Doble desconexión térmica</li>
                    <li>• Indicador de fallo y alarma remota</li>
                  </ul>
                </div>
                <div>
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Modelos disponibles:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• BT P DCM 24 RM: 24V, 10kA, ≤0.3kV</li>
                    <li>• BT P DCM 48 RM: 48V, 15kA, ≤0.4kV</li>
                    <li>• BT P DCM 110 RM: 110V, 20kA, ≤1kV</li>
                    <li>• BT P DCM 220 RM: 220V, 20kA, ≤1.5kV</li>
                  </ul>
                </div>
              </div>

              {/* Protectores para Sistemas AC Clase III (BT D ... RM) */}
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-orange-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-orange-800">Protectores AC Clase III (BT D ... RM)</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Para equipos electrónicos en ZPR 1-2 o superior. Clase III (D), monofásico.</p>
                <div className="mb-3">
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Características:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Alta capacidad de descarga</li>
                    <li>• Indicador LED verde/rojo</li>
                    <li>• Conector de alarma remota</li>
                  </ul>
                </div>
                <div>
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Modelos disponibles:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• BT D 24 RM: 24V AC, 16A, ≤0.2kV</li>
                    <li>• BT D 48 RM: 48V AC, 16A, ≤0.35kV</li>
                    <li>• BT D 60 RM: 60V AC, 16A, ≤0.5kV</li>
                    <li>• BT D 120 RM: 120V AC, 16A, ≤0.7kV</li>
                    <li>• BT D 230 RM: 230V AC, 16A, ≤1.15kV</li>
                  </ul>
                </div>
              </div>

              {/* Protectores para Sistemas PV DC (BT B PVM ... RM) */}
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-red-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-red-800">Protectores PV DC (BT B PVM ... RM)</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Para sistemas fotovoltaicos con tensiones de hasta 1500V DC. Incluye tecnología de interrupción de cortocircuito (SCI).</p>
                <div className="mb-3">
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Características:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Protección para inversores y paneles</li>
                    <li>• Compatible con POE y redes industriales</li>
                    <li>• Carcasa IP67 resistente al agua (modelos específicos)</li>
                  </ul>
                </div>
                <div>
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Modelos disponibles:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• BT B PVM 150 RM: ≤150V, 20kA, ≤1.0kV</li>
                    <li>• BT B PVM 600 RM: ≤600V, 20kA, ≤2.5kV</li>
                    <li>• BT B PVM 1000 RM: ≤1000V, 20kA, ≤4.8kV</li>
                    <li>• BT B PVM 1500 RM: ≤1500V, 20kA, ≤6.0kV</li>
                  </ul>
                </div>
              </div>

              {/* Protectores para Redes y Datos (BT ELP 48 WP) */}
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-teal-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-teal-800">Protector Redes y Datos (BT ELP 48 WP)</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Para redes Gigabit, POE y sistemas industriales. Carcasa IP67, montaje en riel DIN.</p>
                <div className="mb-3">
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Características:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Protección para Ethernet 10M/100M/1G</li>
                    <li>• Compatible con POE</li>
                    <li>• Fácil instalación con conectores RJ45</li>
                  </ul>
                </div>
                <div>
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Especificaciones:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Voltaje nominal: 48V</li>
                    <li>• Velocidad de transmisión: 1000 Mbps</li>
                    <li>• Ancho de banda: 500 MHz</li>
                    <li>• Temperatura: -40°C a +80°C</li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
          
          {/* Características Técnicas */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-3 text-gray-800">Características Destacadas MCG</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Certificación IEC 61643-11</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Indicador visual de estado</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Contacto auxiliar remoto</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Tecnología MOV + GDT</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Official Link */}
      <div className="text-center pt-8 border-t border-gray-200">
        <a
          href="https://www.mcg.es"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ExternalLink className="w-5 h-5" />
          <span>Visitar Sitio Oficial de MCG</span>
        </a>
      </div>
    </div>
  );
};

// DPS Section Component
const DPSSection: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Productos DPS</h2>
        <p className="text-lg text-gray-600 mb-8">
          Catálogo de surge AP extraído del sitio web de Telebahn Español
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-green-600">Sistemas DPS AP Soluciones</h3>

          </div>
          <p className="text-gray-600 mb-6">
            Dispositivos de Protección contra Sobretensiones de última generación, distribuidos por Telebahn Español y comercializados por AP Soluciones para instalaciones críticas y especializadas.
          </p>
          
          {/* Catálogo de Productos DPS AP */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4 text-gray-800">Catálogo Surge AP - Telebahn Español</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-green-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-green-800">AP-DPS Residencial</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Protección integral para viviendas y pequeños comercios</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Corriente nominal: 5-20 kA</li>
                  <li>• Tensión: 230/400V AC</li>
                  <li>• Montaje: Carril DIN</li>
                  <li>• Indicador LED de estado</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-blue-800">AP-DPS Industrial</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Soluciones robustas para aplicaciones industriales</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Corriente nominal: 25-65 kA</li>
                  <li>• Tensión: 400/690V AC</li>
                  <li>• Clase I+II combinado</li>
                  <li>• Contacto auxiliar NC/NO</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-purple-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-purple-800">AP-DPS Telecomunicaciones</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Protección especializada para líneas de datos y comunicaciones</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Frecuencia: DC-2GHz</li>
                  <li>• Conectores: RJ11/RJ45</li>
                  <li>• Impedancia: 50/75/100 Ohm</li>
                  <li>• Pérdida inserción: &lt;0.2dB</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-orange-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-orange-800">AP-DPS Fotovoltaico</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Protección específica para instalaciones solares DC</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Tensión DC: 600-1500V</li>
                  <li>• Corriente nominal: 20-40 kA</li>
                  <li>• Temperatura: -40&deg;C a +85&deg;C</li>
                  <li>• Certificación TÜV/CE</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-red-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-red-800">AP-DPS Coaxial</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Protección para sistemas de antenas y RF</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Frecuencia: DC-3GHz</li>
                  <li>• Conectores: N, SMA, BNC</li>
                  <li>• Potencia máx: 200W</li>
                  <li>• VSWR: &lt;1.25:1</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-teal-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-teal-800">AP-DPS Inteligente</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Sistemas con monitoreo remoto y diagnóstico</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Comunicación: Modbus RTU</li>
                  <li>• Monitoreo 24/7</li>
                  <li>• Registro de eventos</li>
                  <li>• Interfaz web integrada</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Catálogo de Protectores contra Sobretensiones */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4 text-gray-800">Catálogo de Protectores contra Sobretensiones - AP Soluciones Integradas</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Protector RJ45 (BS RJ45) */}
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-blue-800">Protector RJ45 (BS RJ45)</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Dispositivo de protección para equipos de red contra picos de tensión. Interfaz RJ45 con cuatro pares protegidos.</p>
                <div className="mb-3">
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Características:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Protección para sistemas de transmisión de datos</li>
                    <li>• Alta capacidad de descarga, bajo nivel de protección</li>
                    <li>• Respuesta rápida, alta velocidad de transmisión</li>
                    <li>• Conexión metálica RJ45, fácil instalación</li>
                    <li>• Opción de montaje en riel DIN</li>
                  </ul>
                </div>
                <div>
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Especificaciones:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Voltaje nominal: 5V / 24V</li>
                    <li>• Corriente de descarga: hasta 5kA</li>
                    <li>• Ancho de banda: 165MHz</li>
                    <li>• Temperatura: -40°C a +80°C</li>
                    <li>• Normas: IEC 61643-21, GB 18802.21</li>
                  </ul>
                </div>
              </div>

              {/* Protector para Líneas de Control (BS LC Series) */}
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-green-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-green-800">Protector Líneas de Control (BS LC Series)</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Protección para interfaces no balanceadas (0-20mA, 4-20mA). Ideal para LPZ 0A-2. Incluye base y módulo reemplazable.</p>
                <div className="mb-3">
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Características:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Módulo reemplazable en caliente</li>
                    <li>• Alta capacidad de descarga</li>
                    <li>• Diseño compacto para riel DIN</li>
                    <li>• Sin interrupción de la señal</li>
                  </ul>
                </div>
                <div>
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Especificaciones:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Voltajes: 5V, 12V, 24V, 48V, 60V, 110V</li>
                    <li>• Corriente nominal: hasta 1.5A</li>
                    <li>• Material: Termoplástico naranja UL94-V0</li>
                  </ul>
                </div>
              </div>

              {/* Protector BNC (BS BNC 5V / BS V BNC) */}
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-purple-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-purple-800">Protector BNC (BS BNC 5V / BS V BNC)</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Protección para cables coaxiales y señales de video. Conexión BNC metálica.</p>
                <div className="mb-3">
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Características:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Buena capacidad de descarga</li>
                    <li>• Respuesta ultrarrápida (≤1ns)</li>
                    <li>• Montaje en riel DIN opcional</li>
                  </ul>
                </div>
                <div>
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Especificaciones:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Voltaje nominal: 5V / -8V a +1.5V</li>
                    <li>• Ancho de banda: 300MHz</li>
                    <li>• Impedancia: 10Ω / 1Ω</li>
                  </ul>
                </div>
              </div>

              {/* Protector para Datos Serie BS SM LD */}
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-orange-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-orange-800">Protector Datos Serie BS SM LD</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Protector ultradelgado (6mm) para sistemas de control y comunicación (4-20mA, Fieldbus, etc.).</p>
                <div className="mb-3">
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Características:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Diseño compacto ultradelgado</li>
                    <li>• Indicador LED de estado</li>
                    <li>• Conexión push-in para instalación rápida</li>
                  </ul>
                </div>
                <div>
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Modelos disponibles:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• BS SM LD 12: 12V</li>
                    <li>• BS SM LD 24: 24V</li>
                    <li>• BS SM LD 48: 48V</li>
                  </ul>
                </div>
              </div>

              {/* Protector Intrínsecamente Seguro (BS PI SCD 24 M) */}
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-red-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-red-800">Protector Intrínsecamente Seguro (BS PI SCD 24 M)</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Para áreas peligrosas y circuitos de bus. Montaje interno en equipos de control.</p>
                <div className="mb-3">
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Características:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Carcasa de acero inoxidable</li>
                    <li>• Conexión directa a terminales</li>
                    <li>• Certificado para uso en ambientes explosivos</li>
                  </ul>
                </div>
                <div>
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Especificaciones:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Voltaje: 24V</li>
                    <li>• Corriente nominal: 0.55A</li>
                    <li>• Nivel de protección: ≤5.9V</li>
                  </ul>
                </div>
              </div>

              {/* Protector para Líneas Trenzadas (BS TTY 24) */}
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-teal-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-teal-800">Protector Líneas Trenzadas (BS TTY 24)</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Protección para señales de cuatro hilos. Montaje en riel DIN.</p>
                <div className="mb-3">
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Características:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Respuesta rápida</li>
                    <li>• Nivel de protección bajo</li>
                    <li>• Tierra de blindaje directa o indirecta</li>
                  </ul>
                </div>
              </div>

              {/* Protector BNC para Video (BS BNC G / GA) */}
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-indigo-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-indigo-800">Protector BNC Video (BS BNC G / GA)</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Para sistemas de video y CCTV. Conexión BNC.</p>
                <div className="mb-3">
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Características:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Buen rendimiento en alta frecuencia</li>
                    <li>• Fácil instalación</li>
                  </ul>
                </div>
                <div>
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Especificaciones:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Voltaje: 90V</li>
                    <li>• Impedancia: 50Ω</li>
                    <li>• Frecuencia: 0-30Hz</li>
                  </ul>
                </div>
              </div>

              {/* Protector RJ45 IP67 (BS ELP 48 WP) */}
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-cyan-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-cyan-800">Protector RJ45 IP67 (BS ELP 48 WP)</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Protector para redes Gigabit y PoE con carcasa IP67 resistente al agua.</p>
                <div className="mb-3">
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Características:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Para Ethernet 10M/100M/1G</li>
                    <li>• Compatible con PoE</li>
                    <li>• Montaje en riel DIN</li>
                    <li>• Protección IP67</li>
                  </ul>
                </div>
                <div>
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Especificaciones:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Voltaje: 48V</li>
                    <li>• Velocidad: 1000 Mbps</li>
                    <li>• Temperatura: -40°C a +80°C</li>
                  </ul>
                </div>
              </div>

              {/* Protector RJ11 (BS RJ11 110) */}
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-yellow-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-yellow-800">Protector RJ11 (BS RJ11 110)</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Para líneas telefónicas, ADSL y RDSI. Interfaz RJ11.</p>
                <div className="mb-3">
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Características:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Metálico, fácil instalación</li>
                    <li>• Opción de riel DIN</li>
                  </ul>
                </div>
                <div>
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Especificaciones:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Voltaje: 110V</li>
                    <li>• Corriente: 0.5A</li>
                    <li>• Ancho de banda: 16MHz</li>
                  </ul>
                </div>
              </div>

              {/* Protector HDMI (AP-9-5V) */}
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-pink-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-pink-800">Protector HDMI (AP-9-5V)</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Protección para dispositivos HDMI contra ESD y rayos.</p>
                <div className="mb-3">
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Características:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Cumple con HDMI 1.4 y HDCP</li>
                    <li>• Protección en todos los canales TMDS</li>
                  </ul>
                </div>
                <div>
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Especificaciones:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Normas: IEC 61000-4-2,4-4,4-5</li>
                    <li>• Temperatura: 0°C a 40°C</li>
                    <li>• Peso: 25g</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Características Técnicas */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-3 text-gray-800">Ventajas AP Soluciones - Telebahn</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Distribución oficial Telebahn España</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Soporte técnico especializado</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Garantía extendida 5 años</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Certificaciones internacionales</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Stock permanente en España</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Formación técnica incluida</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Official Link */}
      <div className="text-center pt-8 border-t border-gray-200">
        <a
          href="https://www.apsoluciones.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          <ExternalLink className="w-5 h-5" />
          <span>Visitar AP Soluciones</span>
        </a>
      </div>
    </div>
  );
};

// Shielding Section Component
const ShieldingSection: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Apantallamientos</h2>
        <p className="text-lg text-gray-600 mb-8">
          Catálogos especializados en sistemas de apantallamiento y descarga
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-6 text-purple-600">Sistemas de Apantallamiento Electromagnético</h3>
          <p className="text-gray-600 mb-6">
            Soluciones completas de apantallamiento electromagnético para protección de instalaciones críticas contra interferencias y pulsos electromagnéticos.
          </p>
          
          {/* Catálogo GL Apantallador */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              Catálogo GL Apantallador
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-purple-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-purple-800">GL-Mesh Copper</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Malla de cobre electrolítico para apantallamiento general</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Material: Cobre electrolítico 99.9%</li>
                  <li>• Apertura: 0.5-2.0 mm</li>
                  <li>• Espesor: 0.1-0.3 mm</li>
                  <li>• Atenuación: &gt;60 dB (1-1000 MHz)</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-blue-800">GL-Shield Cable</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Cables apantallados para instalaciones críticas</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Apantallamiento: Trenza + Lámina</li>
                  <li>• Cobertura: &gt;95%</li>
                  <li>• Impedancia: 50/75/100 Ohm</li>
                  <li>• Temperatura: -40&deg;C a +85&deg;C</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-green-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-green-800">GL-Room Shield</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Blindaje completo para salas críticas</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Atenuación: &gt;80 dB</li>
                  <li>• Frecuencia: 10 kHz - 18 GHz</li>
                  <li>• Instalación: Modular</li>
                  <li>• Certificación: MIL-STD-188-125</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-orange-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-orange-800">GL-Gasket EMI</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Juntas conductivas para continuidad eléctrica</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Material: Berilio-Cobre</li>
                  <li>• Resistencia: &lt;5 mΩ</li>
                  <li>• Compresión: 15-40%</li>
                  <li>• Durabilidad: &gt;1M ciclos</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Catálogo Fluidor de Descarga */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              Catálogo Fluidor de Descarga
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-yellow-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-yellow-800">FD-Spark Gap</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Descargadores de chispa para alta corriente</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Corriente máx: 100 kA (8/20μs)</li>
                  <li>• Tensión cebado: 230-3000V</li>
                  <li>• Tiempo respuesta: &lt;100 ns</li>
                  <li>• Vida útil: &gt;1000 descargas</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-red-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-red-800">FD-Gas Tube</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Tubos de gas para protección fina</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Corriente máx: 20 kA (8/20μs)</li>
                  <li>• Tensión cebado: 75-600V</li>
                  <li>• Capacidad: &lt;1 pF</li>
                  <li>• Aplicación: Telecomunicaciones</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-indigo-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-indigo-800">FD-Hybrid</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Descargadores híbridos multietapa</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Tecnología: GDT + MOV</li>
                  <li>• Corriente máx: 40 kA</li>
                  <li>• Tensión residual: &lt;1.5 kV</li>
                  <li>• Tiempo respuesta: &lt;25 ns</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-teal-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-teal-800">FD-Crowbar</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Sistemas crowbar para protección total</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Activación: &lt;1 μs</li>
                  <li>• Corriente sostenida: 1000A</li>
                  <li>• Control: Tiristor SCR</li>
                  <li>• Reset: Automático/Manual</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Catálogo Protección Externa Contra Rayos */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              Protección Externa Contra Rayos
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-blue-800">Fluidor de Cargas Electroestáticas (FCE)</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Protección externa contra rayos, incluidas descargas inducidas ascendentes</p>
                <div className="mb-3">
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Características:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Resistencia mecánica alta (intemperie y atmósferas corrosivas)</li>
                    <li>• Fabricado en nylon y aluminio</li>
                    <li>• Radio de protección: hasta 100 metros</li>
                    <li>• No contiene elementos eléctricos ni radioactivos</li>
                  </ul>
                </div>
                <div className="mb-3">
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Aplicaciones:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Torres de comunicaciones</li>
                    <li>• Estructuras metálicas de gran altura</li>
                    <li>• Tanques, grúas, aerogeneradores</li>
                  </ul>
                </div>
                <div>
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Ventajas:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• No atrae descargas</li>
                    <li>• Protege equipos garantizando continuidad de servicio</li>
                    <li>• Producto carbono neutro</li>
                  </ul>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-green-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-green-800">Apantallador Contra Rayos (ACR)</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Dispositivo de protección externa contra rayos</p>
                <div className="mb-3">
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Características:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Materiales: Acero inoxidable y caucho</li>
                    <li>• Resistencia mecánica alta (intemperie y ambientes corrosivos)</li>
                    <li>• Radio de protección: hasta 60 metros</li>
                    <li>• No contiene elementos eléctricos ni radioactivos</li>
                  </ul>
                </div>
                <div className="mb-3">
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Aplicaciones:</h6>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Postes con transformadores</li>
                    <li>• Bodegas, casetas, terrazas de edificios</li>
                    <li>• Silos, contenedores, estaciones de servicio</li>
                    <li>• Hoteles y estructuras comerciales</li>
                  </ul>
                </div>
                <div>
                  <h6 className="text-xs font-semibold text-gray-700 mb-1">Funcionamiento:</h6>
                  <p className="text-xs text-gray-500">Almacena cargas eléctricas de la atmósfera y las lleva a tierra, evitando la formación de rayos y protegiendo estructuras.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Características Técnicas */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-3 text-gray-800">Ventajas de Nuestros Sistemas de Apantallamiento</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Protección 360° contra EMI/EMP</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Instalación modular y escalable</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Certificaciones militares y civiles</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Mantenimiento mínimo requerido</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Compatibilidad con normativas IEC</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Soporte técnico especializado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Fire Section Component
const FireSection: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Equipos de Detección y Extinción de Incendios</h2>
        <p className="text-lg text-gray-600 mb-8">
          Sistemas completos de protección contra incendios
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-6 text-red-600">Equipos de Detección y Extinción de Incendios</h3>
          <p className="text-gray-600 mb-6">
            Sistemas avanzados para la detección temprana y extinción eficaz de incendios en instalaciones críticas, centros de datos, salas eléctricas y espacios industriales.
          </p>
          
          {/* Sistemas de Detección */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              Sistemas de Detección de Incendios
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-red-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-red-800">Detectores de Humo VESDA</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Detección por aspiración de muy alta sensibilidad</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Sensibilidad: 0.005-20% obs/m</li>
                  <li>• Cobertura: hasta 2000 m²</li>
                  <li>• Tiempo respuesta: &lt;60 segundos</li>
                  <li>• Aplicación: Centros de datos</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-orange-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-orange-800">Detectores Térmicos</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Detección por temperatura fija y diferencial</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Temperatura: 57°C, 68°C, 88°C</li>
                  <li>• Tipo: Fija y diferencial</li>
                  <li>• Certificación: EN54-5</li>
                  <li>• Aplicación: Cocinas, garajes</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-blue-800">Detectores de Llama UV/IR</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Detección óptica de llamas por espectro</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Espectro: UV + IR combinado</li>
                  <li>• Alcance: hasta 65 metros</li>
                  <li>• Tiempo respuesta: &lt;3 segundos</li>
                  <li>• Aplicación: Industria petroquímica</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-purple-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-purple-800">Detectores de Gas</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Detección de gases combustibles y tóxicos</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Gases: CO, CO₂, H₂S, CH₄</li>
                  <li>• Rango: 0-100% LEL</li>
                  <li>• Salida: 4-20mA, Relé</li>
                  <li>• Certificación: ATEX</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Sistemas de Extinción */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              Sistemas de Extinción de Incendios
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-blue-800">Sistemas FM-200</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Extinción por gas limpio para espacios ocupados</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Agente: Heptafluoropropano</li>
                  <li>• Concentración: 7-9%</li>
                  <li>• Descarga: &lt;10 segundos</li>
                  <li>• Seguro para personas</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-green-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-green-800">Sistemas CO₂</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Extinción por inertización para espacios no ocupados</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Agente: Dióxido de carbono</li>
                  <li>• Concentración: 34-75%</li>
                  <li>• Aplicación: Salas eléctricas</li>
                  <li>• Residuo: Cero</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-cyan-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-cyan-800">Sistemas de Agua Nebulizada</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Extinción por micro-gotas de agua a alta presión</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Presión: 80-200 bar</li>
                  <li>• Tamaño gota: &lt;100 micrones</li>
                  <li>• Consumo agua: 90% menos</li>
                  <li>• Aplicación: Turbinas, transformadores</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-yellow-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-yellow-800">Sistemas de Espuma</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Extinción por espuma para líquidos inflamables</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Tipo: AFFF, AR-AFFF</li>
                  <li>• Expansión: 3:1 a 1000:1</li>
                  <li>• Aplicación: Hangares, tanques</li>
                  <li>• Certificación: UL, FM</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Centrales y Control */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Centrales de Control y Monitoreo
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-green-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-green-800">Centrales Analógicas</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Control inteligente con protocolo analógico</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Lazos: 1-8 lazos</li>
                  <li>• Dispositivos: hasta 250/lazo</li>
                  <li>• Protocolo: Propietario</li>
                  <li>• Pantalla: LCD gráfica</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-indigo-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-indigo-800">Sistemas de Gestión</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Software de gestión y monitoreo remoto</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Interfaz: Web HTML5</li>
                  <li>• Comunicación: TCP/IP, BACnet</li>
                  <li>• Mapas: Gráficos interactivos</li>
                  <li>• Reportes: Automáticos</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-pink-50 p-3 rounded-lg mb-3">
                  <h5 className="font-semibold text-pink-800">Módulos de Control</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">Módulos de entrada/salida y control de equipos</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• E/S: Digitales y analógicas</li>
                  <li>• Relés: 5A, 10A contactos</li>
                  <li>• Supervisión: Líneas monitoreadas</li>
                  <li>• Montaje: Carril DIN</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Características Técnicas */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-3 text-gray-800">Ventajas de Nuestros Sistemas de Protección contra Incendios</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">Detección ultra-temprana VESDA</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">Extinción sin daños colaterales</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">Certificaciones internacionales</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">Integración con sistemas BMS</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">Mantenimiento predictivo</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">Soporte 24/7 especializado</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Servicios Complementarios</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">Instalación</h4>
              <p className="text-sm text-gray-600">Montaje profesional de sistemas</p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">Mantenimiento</h4>
              <p className="text-sm text-gray-600">Servicio técnico especializado</p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">Certificación</h4>
              <p className="text-sm text-gray-600">Cumplimiento normativo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Categorias Section Component
interface CategoriasSectionProps {
  categorias: Categoria[];
  loading: boolean;
}

const CategoriasSection: React.FC<CategoriasSectionProps> = ({ categorias, loading }) => {
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Categorías de Productos</h2>
          <p className="text-lg text-gray-600 mb-8">
            Cargando categorías...
          </p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
        </div>
      </div>
    );
  }

  if (categorias.length === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Categorías de Productos</h2>
          <p className="text-lg text-gray-600 mb-8">
            No hay categorías activas disponibles en este momento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Categorías de Productos</h2>
        <p className="text-lg text-gray-600 mb-8">
          Explora nuestras categorías de productos organizadas para facilitar tu búsqueda
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categorias.map((categoria) => (
          <div
            key={categoria.id}
            className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow p-6"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                <Grid3X3 className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{categoria.nombre}</h3>
                <span className="text-sm text-gray-500 font-medium">Activa</span>
              </div>
            </div>
            
            {categoria.descripcion && (
              <p className="text-gray-600 mb-4 line-clamp-3">
                {categoria.descripcion}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Slug: {categoria.slug}
              </div>
              <button className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium">
                Ver Productos
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <p className="text-gray-600">
          {categorias.length} categoría{categorias.length !== 1 ? 's' : ''} activa{categorias.length !== 1 ? 's' : ''} encontrada{categorias.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};

export default Products;