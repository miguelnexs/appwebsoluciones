import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Zap, Package, TrendingUp } from "lucide-react";

const News = () => {
  const news = [
    {
      icon: Zap,
      title: "Temporada de Rayos 2024",
      description: "Análisis de la actividad de rayos en Colombia y recomendaciones para la protección de instalaciones críticas durante la temporada alta.",
      date: "15 Mar 2024",
      category: "Seguridad",
      badge: "Importante"
    },
    {
      icon: Package,
      title: "Nuevos Productos DPS",
      description: "Lanzamiento de la nueva línea de dispositivos de protección contra sobretensiones con tecnología avanzada y certificación UL.",
      date: "10 Mar 2024",
      category: "Productos",
      badge: "Nuevo"
    },
    {
      icon: TrendingUp,
      title: "Normativa RETIE Actualizada",
      description: "Cambios importantes en la normativa RETIE que afectan las instalaciones eléctricas. Conoce todo lo que necesitas saber.",
      date: "05 Mar 2024",
      category: "Normativas",
      badge: "Actualización"
    },
    {
      icon: Zap,
      title: "Casos de Éxito",
      description: "Instalación exitosa de sistema integral de protección en complejo industrial. Reducción del 95% en incidentes eléctricos.",
      date: "28 Feb 2024",
      category: "Casos",
      badge: "Destacado"
    }
  ];

  return (
    <section id="noticias" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Noticias y Actualidad
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Mantente informado sobre las últimas tendencias en protección eléctrica
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {news.map((article, index) => (
            <Card key={index} className="shadow-medium hover:shadow-large transition-all duration-300 hover:-translate-y-2 group">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <article.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <Badge 
                    className={`${
                      article.badge === "Importante" ? "bg-destructive" :
                      article.badge === "Nuevo" ? "bg-accent" :
                      article.badge === "Actualización" ? "bg-primary" :
                      "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {article.badge}
                  </Badge>
                </div>
                
                <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{article.date}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {article.category}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <CardDescription className="mb-4 line-clamp-3">
                  {article.description}
                </CardDescription>
                <Button variant="outline" size="sm" className="w-full">
                  Leer Más
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" className="bg-gradient-primary">
            Ver Todas las Noticias
          </Button>
        </div>
      </div>
    </section>
  );
};

export default News;