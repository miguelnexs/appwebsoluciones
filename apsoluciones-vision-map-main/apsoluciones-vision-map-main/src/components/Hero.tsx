import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Zap, Award, Users, Clock, CheckCircle, Star, Phone, Mail } from "lucide-react";

const Hero = () => {
  return (
    <section id="inicio" className="relative min-h-[120vh] overflow-hidden">
      {/* Background Video - Solo parte superior */}
      <div className="absolute top-0 left-0 right-0 h-3/5">
        <video
          autoPlay
          muted
          loop
          playsInline
          controls={false}
          className="w-full h-full object-cover"
          onContextMenu={(e) => e.preventDefault()}
        >
          <source src="/video/video.mp4" type="video/mp4" />
          Tu navegador no soporta la reproducción de video.
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/60 to-primary/80"></div>
      </div>
      
      {/* Background inferior con gradiente */}
      <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-b from-primary to-primary-glow"></div>

      {/* Video Controls Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={(e) => {
            const video = document.querySelector('video');
            if (video) {
              video.controls = !video.controls;
            }
          }}
          className="bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-md text-sm transition-colors"
          aria-label="Mostrar/ocultar controles de video"
        >
          Controles
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[120vh] pt-32">
        <div className="container mx-auto px-4 text-center text-white animate-fade-in">
        <div className="max-w-4xl mx-auto mt-20">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-slide-up">
            Protección Eléctrica
            <span className="block text-accent animate-pulse-slow">Profesional</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed animate-slide-up animation-delay-200">
            Especialistas en sistemas de protección contra rayos, 
            apantallamientos y soluciones integrales de seguridad eléctrica
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-up animation-delay-400">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all" asChild>
              <Link to="/productos">Ver Productos</Link>
            </Button>
            <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-primary bg-white/10 backdrop-blur-sm px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all font-semibold"
                asChild
              >
                <Link to="/contacto">Cotización Gratuita</Link>
              </Button>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 bg-black/20 backdrop-blur-sm rounded-2xl p-8 animate-slide-up animation-delay-600 hover:bg-black/30 transition-all duration-500">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">15+</div>
              <div className="text-white/80 text-sm md:text-base">Años de Experiencia</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">500+</div>
              <div className="text-white/80 text-sm md:text-base">Proyectos Completados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">24/7</div>
              <div className="text-white/80 text-sm md:text-base">Soporte Técnico</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">100%</div>
              <div className="text-white/80 text-sm md:text-base">Satisfacción</div>
            </div>
          </div>

          {/* Features Mejoradas */}
          <div className="grid md:grid-cols-3 gap-4 mb-12 animate-slide-up animation-delay-800">
            <div className="flex flex-col items-center space-y-2 bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/15 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Protección Total</h3>
              <p className="text-white/80 text-center text-sm leading-relaxed">
                Sistemas DPS y apantallamientos de última tecnología para máxima seguridad
              </p>
              <div className="flex items-center space-x-1 text-accent">
                <CheckCircle className="h-3 w-3" />
                <span className="text-xs">Certificado RETIE</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-2 bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/15 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center shadow-lg">
                <Zap className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Innovación</h3>
              <p className="text-white/80 text-center text-sm leading-relaxed">
                Tecnología avanzada en prevención y extinción de incendios con IoT
              </p>
              <div className="flex items-center space-x-1 text-accent">
                <Clock className="h-3 w-3" />
                <span className="text-xs">Respuesta 24/7</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-2 bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/15 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center shadow-lg">
                <Award className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Certificaciones</h3>
              <p className="text-white/80 text-center text-sm leading-relaxed">
                Certificaciones internacionales UL, KEMA y cumplimiento RETIE
              </p>
              <div className="flex items-center space-x-1 text-accent">
                <Star className="h-3 w-3" />
                <span className="text-xs">Calidad Premium</span>
              </div>
            </div>
          </div>

          {/* Testimonios */}
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 mb-12 mt-64 animate-slide-up animation-delay-1000">
            <h3 className="text-2xl font-bold text-center mb-8">Lo que dicen nuestros clientes</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-accent">
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                  </div>
                </div>
                <p className="text-white/90 mb-4 italic">
                  "Excelente servicio y productos de alta calidad. La instalación fue perfecta y el soporte técnico es excepcional."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center mr-3">
                    <Users className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold">Carlos Mendoza</div>
                    <div className="text-white/70 text-sm">Gerente de Infraestructura</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-accent">
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                  </div>
                </div>
                <p className="text-white/90 mb-4 italic">
                  "Profesionales altamente capacitados. Nos ayudaron a cumplir con todas las normativas RETIE de manera eficiente."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center mr-3">
                    <Users className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold">Ana Rodríguez</div>
                    <div className="text-white/70 text-sm">Directora de Operaciones</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Llamada a la acción final */}
          <div className="text-center animate-slide-up animation-delay-1200 mb-20">
            <div className="bg-gradient-to-r from-primary/30 to-primary-glow/30 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl">
              <h3 className="text-2xl font-bold mb-4 text-white">¿Necesitas una cotización personalizada?</h3>
              <p className="text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                Nuestros expertos están listos para evaluar tus necesidades y ofrecerte la mejor solución en protección eléctrica.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all border-0" asChild>
                  <a href="tel:+573001234567">
                    <Phone className="h-5 w-5 mr-2" />
                    Llamar Ahora
                  </a>
                </Button>
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all border-0" asChild>
                  <a href="mailto:info@apsoluciones.com">
                    <Mail className="h-5 w-5 mr-2" />
                    Enviar Email
                  </a>
                </Button>
              </div>
            </div>
           </div>
         </div>
       </div>
     </div>
   </section>
  );
};

export default Hero;