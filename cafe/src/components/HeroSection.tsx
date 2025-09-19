import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import heroBanner from '@/assets/hero-banner.jpg';

export function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBanner})` }}
      >
        <div className="absolute inset-0 gradient-hero opacity-75"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
          El mejor café
          <span className="block text-accent text-4xl md:text-6xl mt-2">
            directo a tu taza
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto animate-slide-in-left">
          Descubre nuestra selección premium de cafés artesanales, 
          tostados con pasión y entregados con amor.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
          <Button 
            asChild 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-6 text-lg hover-lift"
          >
            <Link to="/productos">Explorar Cafés</Link>
          </Button>
          
          <Button 
            asChild
            variant="outline" 
            size="lg" 
            className="border-white text-white bg-black/20 hover:bg-white hover:text-primary font-semibold px-8 py-6 text-lg hover-lift transition-all duration-300 backdrop-blur-sm"
          >
            <Link to="/nosotros">Nuestra Historia</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto animate-fade-in-up">
          <div className="text-center">
            <div className="text-3xl font-bold">100+</div>
            <div className="text-white/80 text-sm">Variedades</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">15k+</div>
            <div className="text-white/80 text-sm">Clientes Felices</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">5★</div>
            <div className="text-white/80 text-sm">Calificación</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 coffee-steam"></div>
        </div>
      </div>
    </section>
  );
}