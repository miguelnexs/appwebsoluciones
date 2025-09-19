import { Coffee, Heart, Award, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const About = () => {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Nuestra Historia
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Desde 2015, hemos estado comprometidos con traerte el mejor café artesanal del mundo. 
            Cada grano cuenta una historia de pasión, tradición y excelencia.
          </p>
        </div>

        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">
              Todo Comenzó con una Pasión
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              En 2015, dos amigos amantes del café, María y Carlos, decidieron embarcarse en una 
              misión: hacer que el café excepcional fuera accesible para todos. Lo que comenzó 
              como una pequeña tostadora en el garaje de Carlos, se ha convertido en una empresa 
              que conecta a productores de café de todo el mundo con los verdaderos apreciadores 
              del buen café.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Cada grano que seleccionamos pasa por un riguroso proceso de evaluación. Trabajamos 
              directamente con agricultores, garantizando precios justos y prácticas sostenibles. 
              Nuestro compromiso va más allá del sabor: creemos en el impacto positivo que el café 
              puede tener en las comunidades productoras.
            </p>
          </div>
          
          <div className="bg-gradient-coffee rounded-lg h-80 flex items-center justify-center">
            <Coffee className="h-24 w-24 text-white coffee-steam" />
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Nuestros Valores
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover-lift">
              <CardContent className="p-6">
                <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Pasión</h3>
                <p className="text-sm text-muted-foreground">
                  Cada taza refleja nuestro amor incondicional por el café de calidad
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover-lift">
              <CardContent className="p-6">
                <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Calidad</h3>
                <p className="text-sm text-muted-foreground">
                  Solo los mejores granos llegan a tu taza, sin excepción
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover-lift">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Comunidad</h3>
                <p className="text-sm text-muted-foreground">
                  Apoyamos a productores y construimos relaciones duraderas
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover-lift">
              <CardContent className="p-6">
                <Coffee className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Tradición</h3>
                <p className="text-sm text-muted-foreground">
                  Honramos los métodos artesanales de tostado y preparación
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Nuestro Equipo
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="text-center hover-lift">
              <CardContent className="p-8">
                <div className="w-24 h-24 bg-gradient-coffee rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">M</span>
                </div>
                <h3 className="font-semibold text-xl mb-2">María González</h3>
                <p className="text-primary font-medium mb-3">Cofundadora & Master Taster</p>
                <p className="text-sm text-muted-foreground">
                  Con más de 15 años de experiencia en catación, María es responsable de 
                  seleccionar cada grano que llega a nuestros clientes.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover-lift">
              <CardContent className="p-8">
                <div className="w-24 h-24 bg-gradient-coffee rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">C</span>
                </div>
                <h3 className="font-semibold text-xl mb-2">Carlos Ramírez</h3>
                <p className="text-primary font-medium mb-3">Cofundador & Head Roaster</p>
                <p className="text-sm text-muted-foreground">
                  Maestro tostador certificado, Carlos perfecciona cada perfil de tostado 
                  para resaltar las características únicas de cada origen.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats */}
        <div className="gradient-warm rounded-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Nuestros Logros
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">9+</div>
              <div className="text-sm text-muted-foreground">Años de experiencia</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-sm text-muted-foreground">Orígenes únicos</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">15k+</div>
              <div className="text-sm text-muted-foreground">Clientes satisfechos</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">100k+</div>
              <div className="text-sm text-muted-foreground">Tazas servidas</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;