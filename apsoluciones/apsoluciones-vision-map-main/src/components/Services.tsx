import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Wrench, FileCheck, Building2, Target, Zap, CheckCircle, Users, Award, Settings, Phone, Mail, MapPin, Droplets, Battery, Flame, Sun } from "lucide-react";

const Services = () => {
  const mainServices = [
    {
      icon: Zap,
      title: "Protección contra Sobretensiones (DPS)",
      description: "Distribuidores exclusivos de MCG Surge Protection (EE.UU.) con garantía de 20 años y tecnología Micro-Z de ultra baja impedancia",
      features: [
        "Equipos MCG Surge Protection con garantía de 20 años",
        "Tecnología Micro-Z de ultra baja impedancia",
        "Equipos Telebahn con garantía de 5 años",
        "Protección para redes AC, DC, datos y energía solar",
        "Evitan daños por rayos y sobretensiones",
        "Protección de equipos eléctricos y electrónicos críticos"
      ],
      benefits: [
        "Máxima protección contra sobretensiones",
        "Garantías extendidas hasta 20 años",
        "Tecnología de vanguardia estadounidense",
        "Protección integral de equipos críticos"
      ],
      link: "#dps"
    },
    {
      icon: Settings,
      title: "Sistemas de Puesta a Tierra (SPT)",
      description: "Diseño, construcción y mantenimiento de SPT para garantizar la seguridad de las personas y la correcta operación de los equipos de protección",
      features: [
        "Diseño y construcción de SPT personalizados",
        "Mantenimiento preventivo y correctivo",
        "Mediciones con equipos Telurómetro Metrel",
        "Verificación de cumplimiento del RETIE",
        "Sistemas de alta tecnología",
        "Certificación técnica especializada"
      ],
      benefits: [
        "Seguridad garantizada del personal",
        "Operación correcta de equipos de protección",
        "Cumplimiento normativo RETIE",
        "Tecnología de medición avanzada"
      ],
      link: "#spt"
    },
    {
      icon: FileCheck,
      title: "Estudios de Calidad de Energía",
      description: "Diagnóstico de su red eléctrica para detectar problemas como armónicos, huecos de tensión (sags), sobretensiones y fluctuaciones",
      features: [
        "Diagnóstico completo de redes eléctricas",
        "Detección de armónicos y distorsiones",
        "Análisis de huecos de tensión (sags)",
        "Identificación de sobretensiones y fluctuaciones",
        "Análisis de causas de gastos innecesarios",
        "Propuestas de soluciones correctivas"
      ],
      benefits: [
        "Identificación de problemas eléctricos",
        "Reducción de gastos innecesarios",
        "Prevención de daños en equipos",
        "Eliminación de paros productivos"
      ],
      link: "#calidad-energia"
    },
    {
      icon: Flame,
      title: "Sistemas Contra Incendios Focalizados (Firetrace)",
      description: "Sistema automático de detección y extinción que actúa en menos de 10 segundos utilizando agente limpio Novec 1230™ (3M)",
      features: [
        "Detección y extinción automática en <10 segundos",
        "Agente limpio Novec 1230™ (3M)",
        "No daña equipos electrónicos",
        "No es conductor de electricidad",
        "Ideal para gabinetes eléctricos",
        "Perfecto para centros de datos, UPS y comunicaciones"
      ],
      benefits: [
        "Respuesta ultra rápida ante incendios",
        "Protección sin daños colaterales",
        "Seguridad para equipos electrónicos",
        "Tecnología limpia y segura"
      ],
      link: "#firetrace"
    },
    {
      icon: Battery,
      title: "Sistemas de Alimentación Ininterrumpida (UPS)",
      description: "Venta, instalación y mantenimiento de UPS para garantizar un respaldo de energía confiable y estable",
      features: [
        "Venta de UPS de alta calidad",
        "Instalación profesional especializada",
        "Mantenimiento preventivo y correctivo",
        "Respaldo de energía confiable y estable",
        "Protección contra interrupciones",
        "Protección contra fallas eléctricas"
      ],
      benefits: [
        "Continuidad operativa garantizada",
        "Protección de equipos críticos",
        "Energía estable y confiable",
        "Servicio técnico especializado"
      ],
      link: "#ups"
    },
    {
      icon: Droplets,
      title: "Soluciones Hídricas Sostenibles",
      description: "Generadores atmosféricos de agua y plantas de tratamiento con energía solar para producción de agua purificada",
      features: [
        "Generadores atmosféricos: hasta 1000 litros/día",
        "Extracción de humedad del aire",
        "Plantas con energía solar portátiles",
        "Purificación de agua de pozos, ríos o mar",
        "Sin infraestructura eléctrica convencional",
        "Capacidades hasta 40,000 litros/día"
      ],
      benefits: [
        "Agua purificada de alta calidad",
        "Tecnología sostenible y ecológica",
        "Independencia de redes eléctricas",
        "Soluciones de alto rendimiento"
      ],
      link: "#soluciones-hidricas"
    }
  ];

  return (
    <section id="servicios" className="py-20 bg-gradient-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            AP Soluciones Integradas S.A.S.
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Empresa líder certificada bajo la norma ISO 9001:2008, dedicada al diseño, suministro, instalación y mantenimiento de sistemas de alta tecnología
          </p>
        </div>

        {/* Quiénes Somos */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-primary mb-4">¿Quiénes Somos?</h3>
            <div className="max-w-4xl mx-auto bg-white rounded-lg p-8 shadow-medium border-l-4 border-l-blue-500">
              <div className="flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-blue-500 mr-2" />
                <span className="text-lg font-semibold text-blue-600">Empresa Líder en Protección Eléctrica</span>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                AP Soluciones Integradas S.A.S. es una empresa líder dedicada al diseño, suministro, instalación 
                y mantenimiento de sistemas de alta tecnología. Nuestra misión es proteger la infraestructura crítica, 
                los equipos y a las personas, mitigando riesgos mediante soluciones confiables y de vanguardia.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Nos guía un alto sentido de responsabilidad, compromiso y respeto, orientando todos nuestros esfuerzos 
                a brindar la mejor solución para su compañía u hogar.
              </p>
            </div>
          </div>
        </div>

        {/* Servicios Principales */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-primary mb-4">Nuestros Servicios y Soluciones</h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Ofrecemos un portafolio integral para garantizar la continuidad operativa y la seguridad de su inversión
            </p>
          </div>
        </div>

        <div className="space-y-12">
          {mainServices.map((service, index) => (
            <Card key={index} className="shadow-large hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <service.icon className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl md:text-3xl mb-3">{service.title}</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground">
                      {service.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Características */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Settings className="h-5 w-5 text-primary" />
                      Características del Servicio
                    </h4>
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Beneficios */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Beneficios
                    </h4>
                    <ul className="space-y-2">
                      {service.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Equipo técnico especializado</span>
                    </div>
                    <Button className="bg-primary hover:bg-primary/90">
                      Solicitar Cotización
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Información Adicional */}
        <div className="mt-16 bg-white rounded-lg p-8 shadow-medium">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-primary mb-4">¿Por Qué Elegirnos?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Somos líderes en tecnología de protección con certificaciones internacionales y alianzas estratégicas
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">Calidad Garantizada</h4>
              <p className="text-sm text-muted-foreground">Procesos certificados y estándares internacionales</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">Tecnología de Punta</h4>
              <p className="text-sm text-muted-foreground">Equipos de marcas líderes como Metrel y MCG</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2">Expertos Certificados</h4>
              <p className="text-sm text-muted-foreground">Personal altamente capacitado y con experiencia</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-orange-600" />
              </div>
              <h4 className="font-semibold mb-2">Soluciones Integrales</h4>
              <p className="text-sm text-muted-foreground">Desde diagnóstico hasta instalación y mantenimiento</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-red-600" />
              </div>
              <h4 className="font-semibold mb-2">Alianzas Estratégicas</h4>
              <p className="text-sm text-muted-foreground">Distribuidores exclusivos para Colombia y Panamá</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-teal-600" />
              </div>
              <h4 className="font-semibold mb-2">Cumplimiento Normativo</h4>
              <p className="text-sm text-muted-foreground">RETIE, IEC, UL, CE - Estándares internacionales</p>
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="mt-16 bg-primary text-primary-foreground rounded-lg p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Contacto</h3>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">
              ¡Permítanos proteger lo que más le importa!
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="h-6 w-6" />
              </div>
              <h4 className="font-semibold mb-2">Ubicación</h4>
              <p className="text-sm text-primary-foreground/80">
                Centro Comercial Pasarela, Local 33<br />
                Calle 16 No. 6-34 – Piso 2<br />
                Pereira, Risaralda - Colombia
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Phone className="h-6 w-6" />
              </div>
              <h4 className="font-semibold mb-2">Teléfonos</h4>
              <p className="text-sm text-primary-foreground/80">
                (+57) 6 317 1805<br />
                311 331 1431<br />
                300 558 2156
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="h-6 w-6" />
              </div>
              <h4 className="font-semibold mb-2">Email</h4>
              <p className="text-sm text-primary-foreground/80">
                gerencia@apsolucionesintegradas.com
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building2 className="h-6 w-6" />
              </div>
              <h4 className="font-semibold mb-2">Sitio Web</h4>
              <p className="text-sm text-primary-foreground/80">
                www.apsolucionesintegradas.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;